---
title: "Training a fill-in-the-middle code model for $16"
date: "2026-09-02"
excerpt: "113M parameters, 1.4B tokens of 2024-or-newer code, 4.6 hours on four L4s — and two headline results that shrank when I measured them properly."
---

Every code model you use was trained on a corpus with a cutoff, and the code it saw most of
was written years before the code you are writing now. So: if you trained one on *nothing but*
fresh code — no file older than 2024-01-01 — would it measurably prefer recent code? Not
"would it be good". It would not be good. Would the freshness show up in the numbers at all?

The result is [fimcoder-113m](https://github.com/aman-mehtar/fim-coder) — 113.3M parameters,
1.406B tokens of 2024-or-newer code across 198 languages, 4.60 hours on four L4s, **$16.40**.
Validation loss **1.3159** (perplexity 3.73). Weights are
[GitHub Release assets](https://github.com/aman-mehtar/fim-coder/releases/latest); the
`q8_0` GGUF is 116 MB and runs on a CPU.

The answer is yes, and smaller than it first looked. On byte-identical held-out documents it
predicts 2024+ code **15.6%** better than pre-2023 code — but Qwen2.5-Coder-0.5B manages
**11.0%** on the same bytes, so most of that gap is a property of the corpus rather than of my
data cutoff. The part actually attributable to training on fresh code is **+4.6 percentage
points**. That number moved three times before it settled, which turned out to be the more
useful lesson.

First the honest part: it is a small model and it behaves like one. 2.4% exact match on
held-out fill-in-the-middle, about **11% first-line exact match** — right roughly one time in
nine. It writes syntactically valid, language-appropriate code with balanced brackets, and
`def fib(n)` gets completed with `return n`, not `return fib(n-1) + fib(n-2)`.

## It is exactly as good as 7.4e17 FLOPs allows

That is not an excuse, it is arithmetic. Here is the training compute next to models you might
otherwise compare it to:

| model | params | tokens | training compute | vs this model |
|---|---|---|---|---|
| **fimcoder-113m** | 88M non-emb | **1.41B** | 7.4e17 | 1x |
| GPT-2 small (2019) | 124M | 10B | 7.4e18 | **10x** |
| Qwen2.5-Coder-0.5B | 494M | 5.5T | 1.6e22 | **21,900x** |
| Qwen2.5-Coder-1.5B | 1.5B | 5.5T | 5.0e22 | **66,600x** |
| StarCoder2-3B | 3B | 3.3T | 5.9e22 | **79,900x** |

The smallest model anyone would actually use for autocomplete had **22,000 times** this one's
training compute. Not 22 times. Any complaint about the model's intelligence is a complaint
about that column.

Two things forced the size. The Modal workspace could not launch H100, A100 or L40S without a
payment method on file — the card was declined mid-project — leaving T4, L4 and A10. And an L4
delivers **76 dense bf16 TFLOP/s per dollar against an H100's 250**, so the same money bought
3.3x less compute.

Given four L4s for 4.6 hours, though, 113M parameters on 1.4B tokens is roughly
Chinchilla-optimal. A 214M model on the same budget would have landed at D/N ≈ 4.8 and been
measurably *worse*. The size is a consequence of the budget, not a mistake sitting in the
config waiting to be fixed.

## NVIDIA's TFLOPS number for an L4 is a sparsity number

Worth its own section because it silently doubles whatever compute your plan thinks it has.

NVIDIA quotes **121** bf16 TFLOP/s for the L4. The dense figure is **60.6** — 58 SMs × 512
bf16 FLOP/SM/clock × 2.04 GHz. The quoted number assumes 2:1 structured sparsity, which
training never uses. Same correction applies to the L40S (362 quoted, **183** dense) and the
A10 (125, **62.5**). The datacenter SXM parts are already quoted dense and need no adjustment:
H100 989, A100 312.

I report 31.3% MFU against the dense peak. Against the marketing number the same run reads
15.7% and looks broken, which is how I found this — an MFU tracker firing a "too slow" warning
at a run that was performing fine.

## Freshness is real, and a third the size it first looked

Bits per byte rather than perplexity, because the two models have different vocabularies and
perplexity is not comparable across tokenizers. Byte-identical documents, 1500 per condition,
5.4 MB and 5.1 MB, 56 languages, same corpus, same filters, same code path, 1024-token
windows. Lower is better.

| model | fresh (2024+) | pre-2023 | gap | relative |
|---|---|---|---|---|
| **fimcoder-113m** | 0.5413 | 0.6412 | +0.0999 | **+15.6%** |
| Qwen2.5-Coder-0.5B | 0.3550 | 0.3989 | +0.0439 | **+11.0%** |

Both models find 2024+ code more predictable. Newer code is more framework-shaped, more
boilerplate-heavy, more repetitive — so **most of the effect belongs to the corpus, not to the
cutoff.** The excess preference attributable to training only on fresh code is **+0.056
bits/byte, or +4.6 points relative**. Real, and a third of what my own gap suggests if you read
it without a baseline.

The methodology is the part I would actually pass on. This number moved three times as the
sample grew:

| documents per condition | measured excess gap |
|---|---|
| 40 | −0.001 |
| 320 | +0.058, against a baseline that looked flat |
| **1500** | **+0.056, against a baseline that is clearly not flat** |

At 320 documents I had a baseline gap near zero and wrote the result up as "34x a flat
baseline". The baseline was not flat; it was undersampled. A difference-of-differences between
two models needs far more data than either measurement alone, because you are subtracting two
noisy quantities and the noise does not cancel. The final number is close to the 320-document
one by coincidence — the framing around it was wrong, not the magnitude.

In absolute terms the model is **52% worse** than Qwen2.5-Coder-0.5B on fresh code, 0.5413
against 0.3550. That is what 22,000x less compute buys.

## The other result that did not survive a bigger sample

29% of the training mix is repo-level FIM: several files from one repository concatenated, so
the model sees cross-file context. At 300 eval examples, multi-file beat single-file on exact
match — 1.9% against 0.7% — and I reported that as evidence the repo-level share had paid off.

At 1400 examples it reverses.

| set | n | exact match | EM (stripped) | edit similarity |
|---|---|---|---|---|
| all | 1400 | 2.4% | 2.6% | 26.2% |
| single-file FIM | 744 | 2.6% | 2.8% | 26.0% |
| multi-file FIM | 656 | 2.1% | 2.3% | 26.3% |

Edit similarity is a dead heat. The honest conclusion is **no measurable difference**. That is
two for two on headline findings that dissolved under more data, both of them 300-sample binary
metrics sitting at a 2% base rate, where a handful of examples swings the number by more than
the effect I claimed to be measuring.

Best and worst languages by edit similarity, of the 74 with at least 6 examples:

```
HTTP 45.6   Hack 44.9   Vue 43.2   CSS 42.0   Blade 41.9   PHP 38.6   JSON 37.8
...
Svelte 15.2   SCSS 14.6   Batchfile 14.2   Jinja 12.6   TeX 12.0   RPM Spec 10.2
```

Markup and config-shaped languages win because they are the most predictable. The languages
anyone cares about sit mid-table.

## The freshness filter rewrites your language mix

Filtering a corpus to 2024-and-newer is not a neutral operation on language proportions. **C++
is 15.2% of `stack-v3` but 3.1% of its 2024+ code. C# is 2.0% overall and 12.8% fresh.** Any
per-language budget you compute from a corpus's published statistics is therefore wrong before
you start; you have to measure the distribution *after* the freshness filter.

I wanted every language represented — TypeScript and Python first, but not to the exclusion of
the rest, including for the tokenizer. Getting the built corpus to 5.6% total-variation
distance from that target took three builds; the first two came in 23.9% and 14.0% off.

| language | in corpus | target |
|---|---|---|
| Python | 15.6% | 14.6% |
| TypeScript | 9.4% | 8.9% |
| JavaScript | 8.8% | 8.3% |
| Java | 5.3% | 5.0% |
| C++ | 5.1% | 4.8% |
| Go | 3.5% | 3.2% |
| Rust | 2.4% | 2.8% |
| Swift | 1.4% | 1.4% |

The other thing worth stealing from the data pipeline is the packing. Streaming documents into
fixed-length records with online best-fit packing gave **60.5% fill** — a stream of ~1100-token
documents pairs with nothing at sequence length 2048, so 40% of every record was padding, which
is 40% of the compute. Buffering ~6000 documents and packing largest-first — best-fit
*decreasing* — took it to **99.9%**. A 1.65x effective speedup with no effect on quality, and
the single cheapest thing I did all night.

FIM spans are cut at random **character** positions rather than token boundaries, because real
cursors sit mid-token. The final mix is 41% single-file FIM, 29% repo-level FIM, 16%
single-file plain and 14% repo-level plain.

## Being tiny is good for exactly one thing

Latency, and it is a real advantage.

| where | cold (full prefill) | warm (cached prefix) |
|---|---|---|
| L4 GPU | 95–103 ms | — |
| 4× Neoverse-N1 CPU, `q8_0`, 2627-token window | 5100 ms | **28 ms** |

Cold versus warm is the whole story for how an autocomplete feels. Warm is llama.cpp reusing
the cached prefix, which is what happens on every keystroke after the first one inside a
buffer. 28 ms on four ARM cores is comfortably inside the budget for something that fires as
you type, on hardware with no GPU at all.

The other editor-relevant thing it learned is **when to stop**: it emits `<|endoftext|>` after
a few tokens instead of rambling to fill the budget, so raising `max_tokens` costs nothing.
That matters more for feel than it sounds. It runs in Neovim behind
[minuet-ai.nvim](https://github.com/milanglacier/minuet-ai.nvim), using PSM order with its own
sentinels:

```
<|fim_prefix|>{before_cursor}<|fim_suffix|>{after_cursor}<|fim_middle|>
```

## The run itself

```
architecture   LlamaForCausalLM, d_model 768, 14 layers, 12 heads / 4 KV (GQA), d_ff 2048
               RMSNorm, SwiGLU, RoPE theta 50k, tied embeddings, 113.3M params
tokenizer      32,768 byte-level BPE trained on a language-balanced sample
               3.327 bytes/token — 1.0% behind StarCoder2 at 12.5M fewer embedding params
context        2048 for the first 75% of steps, then 4096 for the WSD decay leg
optimiser      AdamW, peak lr 2.4e-3, WSD (2.5% warmup, 1-sqrt decay over the last 15%)
batch          524,288 tokens/step, 4x L4 with one flat all-reduce per step
result         2685 steps, 1.406B tokens, 4.60h, 31.3% MFU, val loss 1.3159 (ppl 3.73)
```

Training at 2048 for most of the run and switching to 4096 only for the decay leg is how a
4096-context model fits in this budget — attention at 4096 costs more than twice what it costs
at 2048, and the long-context behaviour is mostly set during decay.

## What I would do differently

In descending order of value per dollar:

1. **Don't train from scratch.** Continue-pretraining Qwen2.5-Coder-0.5B on the same fresh
   corpus starts from 5.5T tokens and already has FIM sentinels. The same $16 would buy
   something genuinely useful in an editor. From-scratch was a choice I made on purpose, not a
   requirement of the question.
2. **Sort out GPU access before planning the budget.** 250 dense TFLOP/s per dollar against 76
   is the difference between 1.4B tokens and roughly 4.6B.
3. **Overtrain instead of widening.** D/N here is 16; the small models people actually deploy
   sit at 100–1000. For a model whose job is to run inside an editor, inference speed is worth
   more than width.

What would *not* help is more hyperparameter search. Nothing in the schedule, the optimiser or
the architecture is leaving significant quality on the table — the ceiling here is the FLOPs.

## The ledger

The whole project came to **$25.66 of the $30**, of which the training run was $16.40 and
$1.39 was an out-of-memory attempt that died 24 minutes in.

Modal has no billing CLI, so the ledger is a local script computed from published per-second
rates and actual container-seconds. It ran **47% low** until I calibrated it against the
dashboard mid-project, for two reasons worth knowing before you trust your own estimate:
container *lifetime* is what gets billed rather than the wall-clock of the loop running inside
it, and preempted containers are billed again when they restart. On a credit that expires,
being 47% optimistic about spend is the difference between finishing and not.

The previous model in this series was [a 101M general-purpose LM trained on a laptop
GPU](/writing/minillm-101m-laptop). This one swapped the domain for code and the laptop for
rented L4s, and the thing I will actually carry forward from it is neither: it is that both of
my interesting findings were sampling noise the first time I measured them.
