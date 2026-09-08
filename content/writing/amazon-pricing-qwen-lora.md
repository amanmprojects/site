---
title: "Turning Qwen into a price predictor on an 8GB laptop GPU"
date: "2026-09-08"
excerpt: "A text-only Qwen3.5-2B, 4-bit LoRA and a nine-quantile regression head took Amazon product pricing from a 68.83 SMAPE baseline to 44.11 in two laptop-sized epochs."
---

The Amazon ML Challenge 2025 was already a year old when I found it, which made it ideal: no
leaderboard pressure, no reason to optimize for anything except learning something. The task is
to predict a product's price from its catalog listing and image. There are 75,000 labelled
products, another 75,000 test products, and the metric is SMAPE — symmetric mean absolute
percentage error, lower is better.

I ignored the images and trained a text-only model on one RTX 4060 Laptop GPU with 8GB of VRAM.
The result is a 4-bit **Qwen3.5-2B-Base** with rank-32 LoRA adapters and a custom monotone
nine-quantile regression head. It does not generate a price as text. It reads the listing once,
predicts nine continuous price quantiles, and collapses them into one SMAPE-aware point
estimate.

Final validation SMAPE: **44.112**, down from a best hand-built baseline of **68.83**. The first
full pass over the data reached 45.700; a second pass reached 44.112. Each epoch took about 3
hours 49 minutes, peaked around 5.9GB of VRAM and adapted 33.66M parameters while the 2B base
stayed frozen.

| run | rows seen per epoch | val SMAPE |
|---|---:|---:|
| constant median | — | 71.66 |
| unit × quantity-bucket median | — | 68.83 |
| Qwen3.5-2B, 12k subset, one epoch | 12,000 | 55.78 |
| Qwen3.5-2B, full split, epoch 1 | 69,011 | 45.70 |
| **Qwen3.5-2B, full split, epoch 2** | **69,011** | **44.11** |

The competition's reported winning score was 39.70. That number is not directly comparable to
mine — it came from the hidden 75k test set while 44.11 is on my grouped 5,989-row validation
split — but it is useful scale. Notes from participants also put a DistilBERT text-only system
around 49.6. A two-billion-parameter decoder repurposed as a regressor did what I wanted it to
do: beat the obvious text baseline decisively without touching an image.

## First, establish what “doing nothing” scores

A model number is meaningless until there is a ladder below it. I made a zero-GPU baseline
script before training anything and evaluated every rule on the same grouped validation split.

| predictor | val SMAPE |
|---|---:|
| always predict training mean | 78.82 |
| always predict training median | 71.66 |
| best single constant for SMAPE | 71.68 |
| median price given normalized unit | 70.85 |
| median given unit × value bucket | **68.83** |
| median unit-price × quantity | 96.07 |

The last row is the useful one. The apparently sensible decomposition — estimate a price per
ounce, count or millilitre, then multiply by quantity — is catastrophically bad. A 24-pack is
not priced as 24 independent one-packs; brands, category, packaging and bulk discounts dominate.
Hard-coding linear quantity scaling scores **worse than predicting the same median for every
product**.

The best hand-feature baseline buckets the parsed `Value` into ranges and looks up the median
price for that `(unit, value bucket)` pair, falling back to the unit median and then the global
median. It gets 68.83. That is the ceiling for “read the two easy fields and ignore what the
product actually is.” The gap above it has to come from language.

## The input is structured text pretending to be prose

`catalog_content` arrives as one field, but it follows a template:

```text
Item Name: ...
Bullet Point 1: ...
Bullet Point 2: ...
Value: 12
Unit: Fl Oz
```

I parse the title, bullets, value and unit, normalize 99 dirty unit spellings, and convert units
inside comparable families: pounds to ounces, litres to fluid ounces, metres to inches. The
model receives the original quantity and, where possible, the canonical conversion.

The order matters more than it sounds. `Value` and `Unit` appear at the end of the raw field,
while 13% of listings hit my 288-token limit. Naively right-truncating the original string
silently deletes one of the strongest features. I serialize **title, then quantity, then
bullets**, so marketing copy absorbs the truncation instead:

```text
Premium shampoo refill pouch
qty: 32 fl_oz, = 32 floz
features: sulfate free | two pack | ...
```

Mean length is 133 tokens, p95 is exactly the 288-token cap. This is a small data-pipeline
choice, but it is the kind that can erase several points while leaving the training loss looking
normal.

The split is grouped by a normalized product-title identity. Exact duplicates are rare, but a
random row split can still put near-identical listings on both sides and flatter any retrieval
or memorization component. The grouped split leaves **69,011 train and 5,989 validation rows**.

## Qwen is the feature extractor, not the output format

The model is not prompted with “what does this cost?” and it never generates `$14.99`. I discard
the language-model head and use Qwen through `AutoModelForSequenceClassification`. One forward
pass turns the product text into a pooled hidden representation; a small linear head maps that
representation to nine real numbers.

The base being a language model still matters. It already represents product categories,
brands, materials, quality terms, package descriptions and the relationships among them. LoRA
then changes what every layer pays attention to: quantity lines become unusually important,
“refill” differs from “bottle”, and a brand name becomes useful insofar as it predicts price.
The output interface happens to be regression rather than next-token prediction.

This is also why I used **Qwen3.5-2B-Base**, not the instruct checkpoint. Chat post-training buys
nothing when the LM head is gone, and the base checkpoint is text-only. The similarly named
Qwen3.5-2B instruct model additionally carries a vision tower, which is compute I did not want
for this experiment.

Only the LoRA adapters and the head train:

| component | parameters | status |
|---|---:|---|
| Qwen3.5-2B trunk | about 2B | frozen, 4-bit NF4 |
| rank-32 LoRA adapters | about 33.6M | trained in fp32 |
| 2048 → 9 regression head | about 18k plus bias | trained in fp32 |
| **total trainable** | **33.66M** | **about 1.7% of base** |

The base weights remain a compressed read-only prior. LoRA inserts low-rank updates into the
linear transformations throughout the decoder, so this is more capable than freezing Qwen and
training only a head, but much cheaper than updating two billion parameters.

## Predict a distribution, then choose the price

Prices are positive, heavily right-skewed and spread across orders of magnitude. I train against
`log1p(price)`, which makes a multiplicative miss look more like a multiplicative miss instead
of letting expensive outliers own the loss.

A scalar head would force me to decide up front whether it should learn a mean, median or
something else. SMAPE wants none of those exactly. For actual price `a` and prediction `p`,

```text
SMAPE(a, p) = 2 |p - a| / (|a| + |p|)
```

The error depends on the ratio `p/a` and is symmetric under replacing that ratio with its
reciprocal. Log space is therefore the natural geometry, and the optimum is a weighted
median-like statistic rather than an ordinary mean.

Instead of guessing the statistic, the head predicts the 5th, 10th, 25th, 40th, 50th, 60th,
75th, 90th and 95th percentiles of `log1p(price)`. Pinball loss trains all nine simultaneously.
The quantiles cannot cross because monotonicity is built into the parameterization:

```text
q[0] = raw[0]
q[k] = q[k-1] + softplus(raw[k])
```

Every increment is non-negative. At inference I convert the fan back into dollars, treat it as a
discrete distribution, and test the quantiles and their midpoints as candidate predictions. The
candidate with minimum expected SMAPE wins. Finally, I fit one global multiplier on validation
to correct any remaining scale bias from optimizing pinball loss instead of SMAPE directly.

This machinery was most useful early. At step 100 of the first epoch the raw point scored 66.35
and calibration recovered it to 60.52. By the end, the fan had learned its own scale: median,
SMAPE-selected point and calibrated point differed by less than 0.2. The elaborate estimator
became nearly redundant, which is exactly what a well-trained probabilistic head should do.

## Making a 2B hybrid model fit in 8GB

The eventual run used 5.7–5.9GB of VRAM: 4-bit NF4 base weights, bf16 compute, fp32 trainable
parameters, gradient checkpointing, 288-token context, and batches capped at 5,120 padded
tokens and 20 rows. Three microbatches accumulate into one optimizer step. One epoch is 3,554
microbatches and **1,184 optimizer steps**.

Three implementation details were the difference between training and immediately running out
of memory.

**The model has to be put in train mode before the loop.** `from_pretrained` returns it in eval
mode, and this transformers path gates gradient checkpointing on `self.training`. Forgetting
`model.train()` silently disables checkpointing and the first real batch exceeds 8GB. There is
no helpful “checkpointing is off” error; there is only CUDA OOM.

**I skipped `prepare_model_for_kbit_training`.** PEFT's helper upcasts every non-quantized
parameter to fp32. Qwen3.5 has a roughly 248k-token vocabulary, so its embedding is close to half
a billion parameters. Turning that one matrix from bf16 into fp32 costs about 1GB for no benefit
on a frozen embedding. I do the two parts I need by hand — input gradients for checkpointing and
cache disabling — and explicitly cast only trainable parameters to fp32.

**Qwen3.5 is not Llama-shaped.** It is a hybrid architecture. Most layers use gated delta-rule
linear attention with names such as `in_proj_a`, `in_proj_b`, `in_proj_qkv`, `in_proj_z` and
`out_proj`; only a minority expose ordinary `q_proj`, `k_proj`, `v_proj`, `o_proj`. Some MLPs are
`linear_fc1/2`, others are gate/up/down projections. The usual copied LoRA target list silently
adapts only part of the network. I walk the loaded module tree and select every eligible linear
inside decoder layers instead. That produces the 33.66M trainable parameters above.

The token cache is equally practical. All 75k strings are tokenized once into a ragged int32
array. Batches are built by padded-token budget rather than fixed row count, with local
length-sorting inside shuffled pools. Sequence lengths span roughly 30 to 288; fixed row batches
would have to be sized for the worst case and waste most of the card on padding.

The full run sustained about **704 tokens/s**, substantially better than the small 12k pilot
because the larger corpus gives the length-bucketing scheme more homogeneous batches to choose
from.

## The training curve made the second epoch an easy decision

I first trained on 12,000 rows to prove the system. It took 69 minutes and reached 55.78. That
was a 13-point win over the baseline, and the independent prediction path reproduced the
in-training evaluation within 0.02, so I moved to the full split.

Epoch 1 used LoRA learning rate `1e-4`, head learning rate `3e-4`, 6% warmup and cosine decay to
5% of peak. Its periodic 1,200-row validation curve was:

| step | calibrated SMAPE |
|---:|---:|
| 100 | 60.52 |
| 300 | 54.59 |
| 500 | 49.53 |
| 800 | 47.70 |
| 1000 | 46.65 |
| 1184 | 45.99 |
| **full validation** | **45.70** |

The run took 229.5 minutes. The curve was still improving at the end, but the cosine had reduced
the learning rate to nearly zero. Continuing the same optimizer state would have been a
four-hour no-op, so epoch 2 loaded the epoch-1 adapter into a fresh optimizer and fresh schedule,
with half the peak rates: `5e-5` for LoRA, `1.5e-4` for the head, 3% warmup.

That resume path got a smoke test before the long run. My first attempt mismatched the saved
score-head keys; the second accidentally double-wrapped the model in PEFT. Four minutes spent
loading and updating a 1,500-row subset found both. Only then did I launch the full epoch.

Epoch 2 initially looked worse, which is a useful reminder that a warm restart disturbs a good
solution before it improves it:

| step | calibrated SMAPE |
|---:|---:|
| 100 | 46.92 |
| 300 | 47.39 |
| 600 | 46.05 |
| 800 | 45.44 |
| 1000 | 45.03 |
| 1184 | 44.55 |
| **full validation** | **44.11** |

Again the decay tail did the work. At step 600 the second epoch was still worse than the
45.70 checkpoint it started from. The last half recovered almost two points and finished **1.59
better** than epoch 1. Had I stopped the run when the midpoint looked disappointing, I would
have drawn exactly the wrong conclusion.

The second full epoch took 229.3 minutes. Final test inference processed 75,000 rows in 55.3
minutes, wrote one continuous positive price per `sample_id`, and validated row count, columns,
NaNs and positivity before promoting the file. Epoch 1's adapter and predictions remained in
separate directories throughout; the orchestration only promoted epoch 2 after its full
validation score beat 45.70.

## What the result says, and what it does not

The useful comparison is internal: 68.83 for quantity-aware medians, 55.78 for a 12k-row pilot,
45.70 after one full pass, **44.11 after two**. Most of the gain came from understanding the
listing rather than extracting increasingly elaborate tabular features. Most of the remaining
gain came from simply letting the same model see all the data twice under an honest decay
schedule.

It is still text-only. The dataset includes product-image URLs, and a multimodal model could
read packaging, count visible items and recover attributes missing from the text. But doing that
properly means downloading and validating up to 150,000 aging URLs, handling dead images, adding
an image processor, controlling visual-token count and fitting a vision tower beside the text
model in 8GB. It is possible; it is also a different project.

A third text epoch would be easier. My guess is another 0.4–0.9 SMAPE rather than epoch 2's 1.59,
with a growing chance of fitting the 69k training listings more closely without improving
unseen product groups. That might be enough to cross an arbitrary 43-point target, but there is
no live competition and no reason to spend four more hours chasing a leaderboard position from
a year ago.

So I stopped at 44.11. Not because the model is converged in an absolute sense, but because the
next useful experiment should change the information or the model — images, a larger base, an
ensemble — rather than repeat the same pass and hope diminishing returns stay generous.

## What I would keep from this project

1. **Build the dumb ladder first.** It exposed that per-unit pricing was actively harmful and
   gave every model score a meaningful denominator.
2. **Match the head to the metric.** A continuous quantile fan on log-price is a cleaner fit for
   SMAPE than either price buckets or text generation.
3. **Put important fields before the truncation boundary.** A model cannot use quantity if the
   tokenizer never sees it.
4. **Inspect the actual module tree before choosing LoRA targets.** Architecture names are an
   implementation detail until a copied target list silently leaves half the network frozen.
5. **Do not trust convenience helpers on a tight VRAM budget.** A harmless-looking fp32 upcast
   of a giant frozen embedding cost almost one eighth of the entire GPU.
6. **Let decay finish.** Both full epochs looked much less useful at their midpoint than at their
   end.
7. **Smoke-test resume code.** Checkpoint loading is not validated by the fact that a fresh run
   works, and a four-minute failure is better than discovering it four hours later.

The part I like most is that the final system is conceptually simple despite the implementation
edges: Qwen reads a product, LoRA teaches it which semantics matter for price, nine constrained
numbers describe the plausible price distribution, and arithmetic picks the one number the
metric wants. No prompt engineering, no generated JSON, no parsing a dollar sign — just a
language model used for what its hidden states already know.