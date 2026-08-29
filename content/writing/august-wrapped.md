---
title: "August, wrapped"
date: "2026-08-30"
excerpt: "154 commits, 15 new repos, 3 models trained from scratch, and one number I'm not proud of."
---

I built a lot in August. Rather than list it, I want to write down what it actually taught me,
including the parts that did not work.

The raw shape of the month: **154 commits across 17 of my own repos, 15 of which did not exist on
August 1st.** Three language models trained from scratch. Two contributions to other people's
code. One 8-hour training run that produced a number I'll come back to at the end.

## Three models, one lesson

I trained [miniLLM](/writing/minillm-101m-laptop) (101M params, 12.4 hours, one 8GB laptop GPU),
[chessLLM](/writing/chessllm-world-model) (94M, learned to track a chessboard from move text
alone), and [chess-bot](/writing/chess-two-ways) (5.58M, handed the board directly).

The comparison between the last two is the single most useful thing I learned all month. chessLLM
at 94.4M parameters builds an internal board — I proved it with a linear probe reading the
position out of layer 10 at 85.6% against a 64.5% baseline. chess-bot at 5.58M parameters skips
that entirely, gets the board as input, and reaches **the same playing strength with 6% of the
parameters.**

At small scale, representation beats capacity. Every result I got in August came from a decision
about what the model gets to *see* — a 32k vocab instead of GPT-2's 50k, 40 characters instead of
32k, a `uint8[64]` board instead of a move list — and not one came from making the model bigger.
That's not a subtle preference. Seventeen times the parameters bought nothing that a 64-byte
array didn't provide for free.

The other half of that lesson: the model that plays *worse* is the one with something interesting
inside it. There is nothing to discover about chess-bot's board representation, because the board
is the input. If you want a bot, hand it the board. If you want to learn something about
representation learning, don't.

## 23 experiments, 12 of them failures

I ran Karpathy's [autoresearch](https://github.com/karpathy/autoresearch) setup — an agent that
edits a training script, trains for a fixed 5 minutes, keeps the change if validation improved,
discards it if not, and repeats overnight.

Twenty-three experiments. **Eleven keeps, twelve discards.** Validation bits-per-byte went from
1.606 to 1.167:

| change | val_bpb | verdict |
|---|---|---|
| baseline (batch size fit to 8GB) | 1.606 | — |
| 4x more optimizer steps in the same budget | 1.281 | keep |
| depth 8 → 6 (26M params, +80% throughput) | 1.271 | keep |
| depth 6 → 4 | 1.277 | **discard** |
| batch 2^15, no accumulation (1549 steps) | 1.177 | keep |
| matrix LR 0.03 → 0.02 → 0.017 | 1.167 | keep |
| embedding LR 0.6 → 0.4 → 0.25 | 1.169 | keep |
| embedding LR → 0.15 | 1.177 | **discard** (overshot) |

Then an 8-hour run on the tuned config: 50.3M params, 2.5B tokens, 38,130 steps, **val_bpb
0.9758**.

The keeps are boring — more optimizer steps, right-size the model, tune two learning rates. The
discards are where the information is. Depth 6 → 4 got *2.3x more tokens* through the same budget
and still lost, which says capacity mattered more than data at that scale. Embedding LR 0.25 →
0.15 overshooting is how I know 0.25 was actually optimal rather than just the last thing I tried.

A ledger of things that didn't work is more useful than a list of things that did, and it costs
nothing extra to keep.

## The number I'm not proud of

That 8-hour run reported **2.12% MFU.**

Model FLOPs utilization is the fraction of your GPU's theoretical arithmetic throughput you
actually use. 2.12% means roughly **98% of the GPU's capability went nowhere.** For contrast, a
well-tuned run on the same class of hardware should land somewhere in the 20–40% range. I burned
eight hours to do what a properly-configured run does in well under one.

I did not notice this during the run, because validation loss was going down and that felt like
success. It was in the final summary the whole time.

The lesson isn't "I should have optimized more." It's that **I was watching the wrong number.** A
loss curve tells you whether training is working. It tells you nothing about whether it's
*efficient*, and those are completely different questions. Every long run from here gets a
throughput sanity check in the first five minutes, before the schedule is committed.

Related, from the same month: on chess-bot I trained 22 epochs and the model started overfitting
around epoch 10. Steps 24,000 → 40,000 cost 90 minutes of GPU time and bought +0.66pp top-1
accuracy while cross-entropy got *worse*. The final checkpoint was the worst of four saved. Only
`best_acc` gating saved the good weights.

Two projects, the same mistake in different clothes: I let a run continue because it was running,
not because it was still learning.

## Untested paths fail at the worst possible moment

The single most expensive bug of my August had nothing to do with machine learning.

A chess-bot run trained for three hours, finished, and lost everything. Three bugs compounding: a
`NameError` in the final eval that only triggered if training ended off an eval-step boundary;
weights being saved *after* that eval, so the crash discarded them; and a supervisor that grepped
the whole accumulated log for a `[done]` line, so a *previous* run's success masked the new
failure. Train 3h → crash → resume → `step == total_steps` → loop body never runs → crash again →
20 attempts → exit.

**The model was fine. The exit path destroyed it.**

Then the morning after the successful rerun, the holdout eval crashed on
`value cannot be converted to type c10::Half without overflow` — masking illegal moves with
`-1e9` under `torch.autocast`, where float16 caps at 65504. `train.py` already cast to float
first. `play.py` never got the same fix, and `--mode eval` was the one path never exercised before
the overnight run.

I had audited the AMP masking. I audited it in one file and didn't carry the check across. Every
untested path queues up to fail at the end of a long run, which is exactly when failure costs the
most.

## The rest of it

Things I built that aren't models:

**[wispr-flow](https://github.com/amanmprojects/wispr-flow)** — hold Ctrl+Win, speak, release,
and the transcript lands in whatever app has focus. whisper.cpp with CUDA on the laptop's 4060.
The interesting part is that X11's `XGrabKey` doesn't work under Wayland, so it reads raw evdev
keyboard events from `/dev/input/event*` and injects the paste through its own `/dev/uinput`
virtual keyboard. It rescans for hotplugged keyboards and initializes modifier state from the
kernel via `EVIOCGKEY`, so no keypress is ever missed. Written in C.

**[explorer](https://github.com/amanmprojects/explorer)** — a native Linux file explorer in
TypeScript, compiled ahead-of-time to a 23MB binary with no browser, no WebView, and no JS
runtime. Model/Msg/update architecture where the pure core never touches `fs`; all IO goes
through generated typed service clients.

**[site3d](https://github.com/amanmprojects/site3d)** — pilot a spaceship between planets, each
planet is a project. React Three Fiber. 48 commits, the most of any single project this month,
which tells you something about how much fiddling a 3D scene absorbs.

**[skiller](https://github.com/amanmprojects/skiller)** — a floating fuzzy picker that searches
skills.sh as you type, previews the SKILL.md, and installs into whatever directory you're
standing in. One keybinding.

**[quick-gateway](https://github.com/amanmprojects/quick-gateway)** — codex speaks only the
OpenAI Responses API, Claude Code speaks only Anthropic Messages, and several models I wanted
speak only chat-completions. This translates between all three over one local endpoint, tool calls
included.

**[llm-bench](https://github.com/amanmprojects/llm-endpoint-bench)** — measures how an endpoint
*feels*: time-to-first-token, throughput, prompt caching, and tool-call session TTFT, which is the
latency you actually notice in agent loops.

**[lunaeye](https://github.com/amanmprojects/lunaeye)** — gives a text-only model vision by
having a second model describe images back to it as text.

Plus a [browser chess engine](https://github.com/amanmprojects/chess) in vanilla JS — 0x88 board,
perft-verified move generation, negamax with alpha-beta and null-move pruning in a Web Worker.
The perft verification is why I trusted it enough to build everything else on top.

And two contributions outside my own repos: a universal ACP WebSocket daemon PR to
[vercel-labs/fx](https://github.com/vercel-labs/fx) (closed unmerged), and a bug report on
[voxtype](https://github.com/peteonrails/voxtype) where `setup model --set` silently rewrote
`engine = "whisper"` regardless of the model passed, producing a self-contradictory config that
crash-looped the daemon. That one got fixed.

## Then I deleted the Python server

The last thing I shipped was making the chess model playable by strangers. It ran as a local
PyTorch process with the UI calling it over HTTP — fine on my machine, impossible on Vercel, which
has no persistent Python runtime.

So I ported the transformer forward pass to JavaScript. The 67MB checkpoint became an 11.2MB fp16
blob plus a JSON manifest of tensor offsets; the forward pass runs in a Web Worker so the UI never
blocks; the whole deployment is static files with no server and no runtime cost.

The part that made this safe rather than terrifying was **golden-file parity testing**: run the
real torch model, record its outputs, then assert the JS port reproduces every legal move's policy
slot and agrees on the chosen move, value, and centipawn conversion. 56 tests.

Without that, "I reimplemented a transformer in another language" is a claim nobody can check.
Silent numerical drift in a chess engine looks *exactly* like a slightly worse chess engine, which
is the hardest class of bug to notice.

[Play it here.](https://chess-bot-vercel.vercel.app)

## What I'd do differently

**Fifteen new repos in 31 days is not obviously a good thing.** Some of those are finished and
used daily. Others are a README and a weekend. My `tries/` directory has fifteen more
directories that never became repos at all — an autoencoder, an image-gen experiment, an RL
project with a research brief and almost no code. Starting is cheap and I am good at it. Finishing
is the constraint.

**Only three of these got written up.** The chess and LLM work has real measured results in it,
and until this week all of that lived in READMEs nobody would find. The autoresearch ledger — 23
experiments with honest keeps and discards — is arguably the most useful artifact of the month and
it exists as a `results.tsv` in an untracked directory.

**I measured the wrong things twice.** 2.12% MFU and 22 epochs of overfitting are the same
mistake: watching whether a number was moving instead of whether the work was worth doing.

For September: fewer starts, more finishes, and a throughput check in the first five minutes of
every long run.
