---
title: "Training a 101M language model on a laptop GPU"
date: "2026-08-06"
excerpt: "12 hours, 8GB of VRAM, 1.2B tokens of FineWeb-Edu, and a measured 2.7x win from swapping the optimizer."
---

I wanted to know what a language model I trained entirely myself would feel like — not
fine-tuned, not LoRA'd, trained from random initialization. The constraint was an RTX 4060
Laptop with 8GB of VRAM, which sounds absurd until you do the arithmetic: at 100M parameters,
weights plus optimizer state fit in about 1.6GB, and everything else is activations you can
trade against batch size.

The result is [miniLLM](https://github.com/amanmprojects/llm) — 100.7M parameters (75.5M
non-embedding), trained for 12.44 hours on 1.20B tokens of FineWeb-Edu. Final validation loss
**3.2840**, perplexity **26.7**. Weights are on the
[Hub](https://huggingface.co/amanm10000/minillm).

It is a base model. It continues text, it does not answer questions, and it invents facts
confidently. That is what 100M parameters buys you, and it is the honest starting point for
everything below.

## The architecture is boring on purpose

Llama-3-shaped dense transformer: 12 layers, d=768, 12 query heads / 4 KV heads with grouped
query attention, SwiGLU feed-forward at 2048 hidden, RMSNorm pre-norm, RoPE, no biases, tied
embeddings, 1024-token context.

The one non-obvious choice is QK-norm — RMSNorm applied to queries and keys before attention.
It bounds the attention logits, which is what lets the model tolerate an aggressively high
learning rate without the loss spiking. At this scale you want a hot LR because you only get
one pass over the data.

The other deliberate choice was **a custom 32,768-token BPE tokenizer instead of GPT-2's
50,257**. At 100M parameters the embedding table is not a rounding error:

| vocab | embedding params | share of model |
|---|---|---|
| 50,257 (GPT-2) | 38.6M | 38% |
| 32,768 (mine) | 25.2M | 25% |

Thirteen million parameters recovered and moved into the layers, where they do work. Training
the BPE on the actual target corpus also compresses it better, so each token carries slightly
more text. Free on both axes.

## Muon beat AdamW by 2.7x, and I measured it

The interesting result of the whole project. Muon is a second-order-ish optimizer that applies
Newton-Schulz orthogonalization to the 2-D hidden matrices, with AdamW retained for
embeddings, the head, and norms.

I ran a controlled A/B — identical 200-step, 13.1M-token budget, same WSD schedule, same model:

| config | val loss | val ppl |
|---|---|---|
| AdamW, lr 1.5e-3 | 6.0712 | 433.2 |
| **Muon, lr 0.02** | **5.0917** | **162.7** |
| Muon, lr 0.035 | 5.1077 | 165.3 |

**0.98 nats — a 2.7x reduction in perplexity — for a 2% throughput cost** (25.9k vs 26.5k
tokens/sec). That is not a marginal tuning win, it is the single highest-leverage decision in
the run, and it cost nothing but the willingness to try. Reproduce it with `./ab_test.sh`.

Worth noting what this implies about the priority order at small scale. The levers that
actually moved loss, ranked: token count, then data quality, then LR schedule, then optimizer,
then architecture. Architecture is *last*. Dense-Llama is already near the practical ceiling
sub-1B, which is why I skipped every DeepSeek-style feature — MLA compresses a KV cache that
is 6MB here, MoE spends VRAM to save FLOPs when I was VRAM-bound not FLOP-bound, and sparse
attention optimizes the 8% of FLOPs that attention consumes at 1024 context.

## The decay tail does most of the work

I used a WSD schedule — warmup, stable, decay. Validation loss by step: 3.83 at 1.7k, 3.69 at
3.4k, 3.63 at 5.4k, 3.60 at 7.4k, then **3.28** at 9.1k.

The final leg is the decay phase, and it produced most of the total improvement. Stopping the
run early — even at 80% of the budget — would have left roughly 0.3 nats on the table. If you
are training on a wall-clock budget, the schedule has to be sized so decay *completes*. A run
that gets cut off before its decay finishes is not "mostly trained", it is materially worse
than a shorter run that was scheduled honestly.

This is also why the LR schedule is stored inside the checkpoint. Resuming re-derives the curve
the run was actually on, rather than whatever arguments you happen to pass on the command line.

## Knowing a fact and saying it are different things

The finding I did not expect. Using `eval_facts.py` on 40 common-knowledge cloze pairs, the
model **ranks the true fact above the plausible false one 95% of the time** (chance is 50%).
But at my original sampling defaults — temperature 0.8, no repetition penalty — free generation
produced the correct fact only **30%** of the time.

A 65-point gap between what the model knows and what it says. Not missing knowledge, just
sampling noise destroying it on the way out.

| temperature | rep. penalty | fact% | worst repeated 4-gram |
|---|---|---|---|
| 0.8 | 1.0 | 30–50% | ~74% |
| 0.3 | 1.25 | 67% | 5% |
| 0.0 | 1.35 | 80% | 2% |
| 0.0 | 1.50 | 80% | 0% |

So the defaults changed. The repetition penalty is what kills the
`"the National Park of Pakistan became the National Park of Pakistan"` failure mode; below
about 1.25 this model loops badly, above about 1.4 it starts avoiding words it legitimately
needs and pads with enumerations.

Factual accuracy also climbed *monotonically through the entire run* — 77.5% at step 1,713 to
95.0% at step 9,144, still rising at the end with no plateau. Validation loss hides this
completely: during the constant-LR phase it looks nearly flat at −0.020 nats per 1k steps while
knowledge is visibly accumulating. One number is not enough to tell you whether a run is done.

## Reclaiming vocabulary slots that cannot exist

For phase two I wanted a Llama-3 chat template, but the v1 tokenizer had one special token, so
spelling `<|start_header_id|>` in ordinary text cost 10 tokens. Growing the vocabulary means
resizing a tied, already-trained 32768×768 embedding table.

Instead I reclaimed dead slots. A byte-level BPE seeds its vocabulary with all 256 byte
characters, and 49 of them never appeared in 1.995B tokens of FineWeb-Edu. But "never occurred"
is not "cannot occur" — and for control tokens you need the stronger guarantee. Only bytes that
are **structurally impossible in valid UTF-8** are safe:

```
0xC0, 0xC1    overlong 2-byte encodings, forbidden by the spec
0xF5 - 0xFF   would encode a codepoint beyond U+10FFFF
```

That is 13 provably unreachable slots. Six used, seven reserved. Same vocabulary size, same
parameter count, same checkpoint, and every existing token bin stays byte-identical because ids
are preserved.

The trap is subtle: the *ids* are unreachable from real text, but the *names* are not.
Registering them in `added_tokens` makes the tokenizer match the literal string `<unk>`
anywhere it appears — and shard 6 of FineWeb-Edu contains a machine-translation tutorial with
`<unk>` in an example sentence. Left alone, that one document would have forged a turn boundary
mid-prose. One document in 2.27B tokens. Both data scripts now hard-fail if a control id
survives into a bin, because a corpus that can forge turn boundaries is a corpus that can teach
the model to ignore them.

## Two things that cost me real time

**Suspend kills a run.** A laptop that sleeps takes the CUDA context with it, and the process
dies with no traceback. This ended my second run at step 1,750 of 7,535 — hours of compute,
gone, with nothing in the log explaining why. Wrap long runs:

```bash
systemd-inhibit --what=sleep --why="training" python train.py --preset base --hours 10
```

No sudo required. Confirm it took with `systemd-inhibit --list`.

**Resuming a finished run silently wastes the whole night.** Phase 1 decayed its LR to
approximately zero. A plain `--resume auto` on that checkpoint trains at zero LR until the
budget runs out and reports success. The trainer now refuses to start in that state and demands
an explicit `--fresh-schedule`, which keeps the weights and optimizer state but restarts step
accounting and re-warms. Failing loudly beats twelve hours of no-op.

## What it is worth

A 100M model at 11.9 tokens per parameter is below Chinchilla-optimal — that was a wall-clock
budget, not a compute-optimal one. It writes fluent English and gets the *form* of the language
right while getting the *content* of the world frequently wrong, because the world does not fit
in 100M parameters.

Which is the observation that led directly to the next project: pick a domain where the world
*does* fit. [That model learned to track a chessboard it was never shown](/writing/chessllm-world-model).
