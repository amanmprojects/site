---
title: "214M parameters, 36 lost GPU-hours, and the day my agent outsmarted itself"
date: "2026-09-07"
excerpt: "Phase 1 of miniLLM-214M went perfectly on Kaggle's free T4s. Phase 2 failed for reasons that had nothing to do with deep learning — and the model driving my coding agent is the one that failed."
---

I doubled my from-scratch language model and moved it to Kaggle's free GPUs. The training
went beautifully. Then the same AI agent that planned and ran the whole thing lost my entire
30-hour weekly GPU quota in 36 hours of mistakes that had nothing to do with deep learning.

This is both stories, because they are the same story about state.

## The model, briefly

[miniLLM](https://github.com/amanmprojects/llm) scaled from 100.7M to **213,943,296
parameters**: 16 layers, d=1024, 16 query heads / 4 KV heads, SwiGLU at 2816, the same custom
32k BPE tokenizer and 1024 context. Same recipe as the 101M run — Llama-shaped dense
transformer, QK-norm, Muon on the hidden matrices — but too big for my 8GB laptop GPU, so it
moved to Kaggle: two Tesla T4s, FP16 autocast, DDP, `torch.compile`, Muon's orthogonalization
running in native FP16 instead of emulated BF16.

The arithmetic that made Kaggle viable: ~13k tokens/second sustained across both GPUs, 131,072
tokens per step, 10.8 GiB of the T4's 14.6 GiB used. A 4.5B-token FineWeb-Edu corpus lives in
one private kernel; training kernels mount it as a data source.

Phase 1 finished at **9,000 steps, 1.18B tokens, 5.5 tokens-per-parameter, validation loss
3.1339, perplexity 23.0** — down from 26.7 on the 101M, on roughly the same token budget.

## The part that worked: checkpoints as a contract

Kaggle gives you 30 GPU-hours per week and sessions that die. So the run was designed as a
relay. Every session writes a **1.72 GiB checkpoint that is the complete training state** —
model weights, Muon momentum, both AdamW moment buffers, the FP16 loss scaler, the data
loader RNG offset, and the LR schedule's own bookkeeping (current step, horizon, phase
flags). A session that ends gracefully is replaced by the next one, which mounts the
predecessor kernel as an input and resumes as if nothing happened.

This survived real abuse. When my first projection showed the schedule overshooting the
quota, I retargeted the horizon from 10,799 to 9,000 steps mid-run — the resumed session just
kept the LR flat longer and decayed on the new schedule. When a local DNS blip made my
orchestrator misread garbage text as a failed job, I fixed the parser and the chain continued
from the exact step. Seven sessions across three days, zero replayed batches, zero lost work.

The decay tail did its job again. Validation PPL was still 34.1 at step 7,000 with the LR
flat; the final 2,000 steps of decay took it to **23.0**. A third of the model's entire
quality came from the last 22% of the schedule — which is why the failure that follows hurts
so much.

## Phase 2, and the PPL-30 scare that wasn't

Continued pretraining restarts the LR, and restarting the LR on a decayed checkpoint does
something that looks alarming: validation loss *jumps*. Phase 1 ended at PPL 23.0 with the LR
at ~0; two days later, after re-warming to 7.5e-4, it was sitting at PPL ~29.

That is not damage — it is the WSD schedule working as documented. A decayed checkpoint is
settled into a low-loss basin that only exists at that learning rate. Raise the LR and the
model climbs back to its true plateau, then grinds down as it eats the next ~1.3B tokens, and
the *second* decay phase at the end is where the real gain lands. The plateau numbers agreed:
29.1 → 29.3 → 29.1 → 28.4 over the first 4,000 steps. Healthy.

The model was fine. The training was fine. What failed was everything around it.

## The failure: 36 hours, three sessions, zero surviving bytes

Phase 2 launched as a single 29.5-hour session with the graceful stop **disabled** — the plan
was one long run, with a local orchestrator on my laptop only for emergencies. Kaggle kills
GPU sessions at its 12-hour wall. My agent knew that constraint. It bet against it anyway.

Here is the ledger:

| session | what it did | what survived |
|---|---|---|
| phase-2 v1 | 11.9h of real continued pretraining, reached step 4,550 of 11,212 | **nothing** |
| handoff v2 | found no checkpoint, trained a fresh model from random init for 12h | **nothing** |
| handoff v3 | did it again, from scratch, for another 12h | **nothing** |

The mechanism is brutal: Kaggle cancels the session at its wall and a cancelled version
persists **no output at all**. Not the last checkpoint, not the logs I could parse, nothing.
Twelve hours of gradient steps are garbage-collected with the VM. Then my orchestrator — the
component whose entire job is chaining sessions — took the cancelled kernel, mounted it as
the predecessor, and told the next session to "resume." The resume path found no checkpoint
and, instead of failing, **started training a brand-new model from scratch**. Twice. The
quota counter climbed to 36.00h — Kaggle only enforces the weekly limit when you *submit* —
and stopped at zero.

One log line tells the whole story:

```
[resume] no Kaggle checkpoint input; starting fresh
[train] 10,390 steps x 131,072 tokens = 1.36B tokens total
step     10/10390 loss  9.910 ppl  20129.1
```

PPL 20,129. That is a model that has never seen a token, beginning an education it would
never finish, on hardware someone else paid for.

## Why this is interesting: the agent that built the safety system skipped it

The uncomfortable part is not that a mistake happened. It is *which* mistakes, made by
*whom*. GPT-5.6 Sol — the model driving my coding agent — designed phase 1's entire
persistence layer: the full-state checkpoint format, the atomic writes, the A/B kernel
alternation, the schedule-retargeting, the parser hardening after the DNS incident. Phase 1
was a genuinely well-engineered distributed training relay, and it worked across seven
sessions and three platform failures.

Then in phase 2 the same agent:

1. **Disabled its own safety mechanism.** The 3-hour graceful stop that had carried phase 1
   was turned off to save ~15 minutes of startup overhead per session, on a platform with a
   hard 12h wall it had already been told about.
2. **Chained without verifying.** Phase 1's handoffs always verified a checkpoint existed
   before building on it. Phase 2's orchestrator trusted the predecessor's *status enum* —
   and a cancelled session's status is not an error, it is a *lie by omission* about what got
   persisted.
3. **Let the code fail soft.** `restore_kaggle_checkpoint()` returning "nothing found" fell
   through to a from-scratch run instead of a fatal error. The most expensive line in this
   entire project was a missing `raise SystemExit`.

None of this is a deep-learning failure. The loss curves were healthy; the PPL-30 panic was a
false alarm I got right; the second-phase LR policy was sound. The failure was *state
management under a platform contract nobody read carefully* — the exact category of work
agents are worst at, because it punishes the pattern they run on: move fast, assume the last
step worked, fix forward.

The deeper pattern: **agents optimize for momentum**. Every individual decision looked
reasonable — graceful stops cost throughput, verification costs an API call, fail-soft "gets
training running sooner." Each one shaves minutes. Together they shaved a week, because the
failure mode isn't one bad step, it's a chain where every link quietly assumes the previous
link held. Phase 1's chain had verified links. Phase 2's had three missing ones in a row.

The cheapest intervention would have cost me ten seconds: ask the agent for one log line —
`restored checkpoint at step N` — after the first session died. Instead I got a status
message saying training was "continuing automatically."

## What's different now

Every lesson is now a structural guard, not a note-to-self:

- Sessions stop themselves at **10.5h**, safely under the 12h wall, so every version
  *completes* and persists its checkpoint.
- The training entrypoint **refuses to start phase 2 without a restored checkpoint** — a
  fatal error beats 12 hours of silent wrong work.
- The orchestrator **verifies `ckpt.pt` exists in the predecessor's output before every
  push**, waits out exhausted quota instead of dying, adopts in-flight sessions after a
  reboot, and hard-stops after three consecutive failures.
- The relaunch is armed for the Sep 12 quota refresh: three chained sessions, ~26.5h of the
  30h budget, resuming from the phase-1 checkpoint at step 9,000.

Expected outcome when the decay finishes: around **PPL 20–21**, on ~2.5B cumulative tokens,
~11.7 tokens-per-parameter. The phase-1 model is safe and already useful as a base.

The meta-lesson I keep: a frontier model can hold the entire Muon paper in context, size a
WSD schedule to a quota, and retarget it mid-flight — and still lose the week to not checking
whether a file exists. Intelligence is not the bottleneck. *Verification discipline* is, and
it has to live in the system — fatal errors, verified handoffs, graceful stops — rather than
in the judgment of whichever model happens to be driving, including the smart one.

Especially the smart one.
