---
title: "Chess two ways: a world model vs a board you can see"
date: "2026-08-12"
excerpt: "One model reads move text and builds the board itself. The other gets the board handed to it. Same domain, opposite bets — and the numbers say something uncomfortable."
---

I trained two chess models a few days apart that make opposite bets about representation, and
the comparison turned out more interesting than either model alone.

**[chessLLM](/writing/chessllm-world-model)** reads move text — `e4 e5 Nf3 Nc6` — and never sees
a board. 94.4M parameters, character-level, and it constructs the position internally as a side
effect of predicting the next character. A linear probe reads that position out of its
activations at 85.6%.

**[chess-bot](https://github.com/amanmprojects/chess-bot)** is handed the board directly:
one token per square, AlphaZero-style. 5.58M parameters. It never has to remember anything.

Same game, same data source, same GPU. Seventeen times the parameters on one side. The small
one plays better.

## The two designs

| | chessLLM | chess-bot |
|---|---|---|
| Input | move text, character-level | 64 square tokens + 3 aux tokens |
| Params | 94.4M (all non-embedding) | 5.58M |
| Vocab | 40 characters | 13 piece ids in, 4,672 move slots out |
| Output | next character | policy over move slots + value |
| Legality | must be learned | masked to −∞, structurally impossible to break |
| State | reconstructed from history | given |
| Legal-move rate | 99.22% self-play, ~60% vs Stockfish | **100.0%, by construction** |
| Strength | ~1131 Elo | **~1150–1200 Elo band** |
| Training | 10.3h, 1.01B tokens | a few hours, 2.6M positions |

chess-bot's input is a 69-byte fixed-width record: `pieces uint8[64]` for piece ids,
`aux uint8[2]` for side-to-move / castling / en-passant file, a `uint16` policy slot, and an
`int8` value. Seven pre-norm transformer blocks at d=256, 8 heads. The policy head is a shared
`Linear(d → 73)` applied per square, giving 64 × 73 = 4,672 move slots — 56 queen slides, 8
knight jumps, 9 underpromotions. Castling is a king slide of 2, en passant is a pawn diagonal of
1, queen promotion is an ordinary slide, so none of those need special labels.

Both trained on the same corpus with the same filters: Lichess standard rated, both players
≥1800 Elo, base time ≥180s so no bullet, `Termination == Normal`, 12–250 moves.

## What the comparison actually says

**Giving the model the board is worth about 17x its parameter count.** chess-bot reaches roughly
the same playing strength as chessLLM with 6% of the parameters and a fraction of the training
time. All those parameters chessLLM spends maintaining an internal board are, from a
pure-strength standpoint, wasted — they buy a capability that a `uint8[64]` array provides for
free.

**Legality stops being a metric.** chess-bot's 100.0% legal-move rate is not an achievement, it
is an architectural guarantee: illegal slots are masked to −∞ before the argmax, so an illegal
move cannot be emitted. chessLLM's 99.22% *is* an achievement, and its 40% illegal-move forfeit
rate against Stockfish is a real failure mode. Same underlying game; one design makes an entire
class of error unrepresentable.

**But chess-bot has no world model to probe.** There is nothing to discover about its internal
representation of the board, because the board is the input. The interesting scientific question
— does next-token prediction force a model to build a model of the world? — is only askable of
the design that plays worse.

So: if you want a bot, hand it the board. If you want to learn something about representation
learning, don't. I'm glad I built both, and I would not have understood either one properly
without the other.

## Where chess-bot is weak, and it's a different weakness

**No search.** One forward pass per move, no lookahead. It picks moves the way a club player
picks them *before* calculating — by pattern. Measured against Stockfish at fixed skill levels,
24–30 games each:

| opponent | score | est. Elo | 95% CI |
|---|---|---|---|
| Stockfish ≈1320 | 8.5/30 (28%) | 1159 | 1024–1293 |
| Stockfish ≈1400 | 7.5/30 (25%) | 1209 | 1069–1349 |
| Stockfish ≈1500 | 1.0/30 (3%) | 915 | 610–1220 |

Treat that as a band of roughly 1150–1200, not a rating. The samples are small and the anchors
approximate. The sharp fall-off at 1500 is what a searchless model looks like when the opponent
starts setting two-move traps — it will hang a piece to any tactic it cannot see in one ply.

Pairing this policy with even shallow alpha-beta would be worth more than any amount of
additional training at this scale.

**Imitation, not strength.** The objective is "what would an 1800+ human play here", so it
inherits human habits including the bad ones, and it cannot exceed its data.

**The value head is weak** — MSE 0.75 against ±1 targets. Useful as an eval-bar hint and little
else.

Top-1 move agreement with human play is 43.1% on a held-out 13,000-position split (43.7% on an
independent 3,000-position holdout, cross-entropy 1.957).

## Twenty-two epochs was too many

The most useful thing I learned from chess-bot had nothing to do with chess.

Training ran 22 epochs. From roughly epoch 10 the model overfit: train cross-entropy kept
falling 1.73 → 1.16 while held-out val CE *rose* 1.847 → 2.16.

| checkpoint | step | epoch | CE | top-1 |
|---|---|---|---|---|
| best-24000 | 24,000 | ~9.5 | **1.9005** | 0.4247 |
| best-38000 | 38,000 | ~15 | 1.9675 | 0.4312 |
| **best-40000 (shipped)** | 40,000 | ~16 | 1.9570 | **0.4313** |
| final | 55,572 | 22 | 2.1619 | 0.4152 |

**The final checkpoint is the worst of the four** — 1.6pp below step 40,000. `best_acc` gating
is the only reason the good weights survived at all.

Sharper: steps 24,000 → 40,000 is about 6 epochs and 90 minutes of GPU time, and it bought
+0.66pp top-1 while cross-entropy got 0.057 *worse*. Those epochs were close to wasted.

The lever at this scale is **more unique positions, not more epochs**. 2.6M records is only
about 4.7% of a single month of Lichess. I trained 22 times over 4.7% of the available data
instead of once over more of it.

Two smaller lessons in the same table. Steps 38,000 and 40,000 differ by 0.02pp — 0.0σ, pure
noise — but the 2,048-sample eval used *during* training ranked them 0.4463 vs 0.4443 and made
40,000 look decisive. And that training-time subset is systematically easier than the full
split, which is why I quote ~43% and not ~44.5%. If you are going to gate checkpoints on a
metric, the metric needs to be bigger than its own error bar.

## The bug that nearly ate a 3-hour run

Worth writing down because the failure mode was so much dumber than the model.

An earlier run trained for three hours, finished, and lost everything. Three bugs compounding:

- **A** — the final `evaluate()` call referenced `idx`, which was only bound inside
  `if step % eval_every == 0`. Finish without landing on an eval step, and it raised
  `NameError`.
- **B** — weights were saved *after* the final eval, so the crash in A discarded a completed
  run.
- **C** — the supervisor grepped the whole accumulated log for `[done]`, so a *previous* run's
  success line masked the new failure.

Together: train 3h → final eval crashes → no `[done]` → supervisor resumes → `step ==
total_steps` so the loop body never executes → falls straight to the final eval → crashes again
→ 20 attempts → exit. **The model was fine. The exit path destroyed it.**

Then the morning after the successful run, the holdout eval crashed with:

```
RuntimeError: value cannot be converted to type c10::Half without overflow
```

`play.py` masks illegal moves with `-1e9` but ran the model under `torch.autocast`, so the
logits were float16 and −1e9 exceeds half's max of ~65504. torch raises rather than saturating.
`train.py` already cast to float before masking; `play.py` never got the same fix, and
`--mode eval` was the one path never exercised before the overnight run.

The honest version: my earlier audit verified the AMP masking in `train.py` and did not carry
that check across to `play.py`. So it failed at the end of the pipeline — the same *shape* of
failure as the original bugs, in a file I had already looked at for other reasons. Untested
paths fail at the worst possible moment, and "the end of a long run" is where they all queue up.

What went in afterwards: save before eval, wrap the final eval, a `--deadline` flag so
wall-clock is actually bounded, read-only checkpoint snapshots at each peak (which is what made
the comparison table above possible), and a `compare_checkpoints.py` that scores every
checkpoint on the full split instead of trusting a noisy 2,048-sample number.

## Then I deleted the Python server

The last piece was making it playable. The original setup ran the PyTorch model in a local
Python process with the UI calling it over HTTP — fine locally, impossible on Vercel, which has
no persistent Python runtime.

So I ported the forward pass to JavaScript. `export_weights.py` converts the 67MB checkpoint
(float32 plus AdamW state) into an 11.2MB raw fp16 blob and a JSON manifest of config and tensor
offsets. `src/nn.js` is a dependency-free port of `model.py`: board → features → 7-block
pre-norm transformer → masked policy → best move and value. It runs in a Web Worker so the UI
thread never blocks. One forward pass takes ~0.4s and the model downloads once.

The whole deployment is static files. No server, no build step, no runtime cost.

The part that made this safe rather than terrifying is **golden-file parity testing**.
`make_golden.py` runs the real torch model and records its outputs; `test/nn.test.mjs` replays
that through the JS port and asserts that every legal move's policy slot matches and the chosen
move, value, and centipawn conversion all agree. 56 tests. Numerics mirror the Python exactly —
erf GELU, LayerNorm eps 1e-5, the same centipawn conversion.

Without that, "I reimplemented a transformer in another language" is a claim you cannot check.
Silent numerical drift in a chess engine looks exactly like a slightly worse chess engine, which
is the hardest kind of bug to notice.

**Play it: [chess-bot-vercel.vercel.app](https://chess-bot-vercel.vercel.app)** — pick the
neural net from the level dropdown. Code:
[chess-bot](https://github.com/amanmprojects/chess-bot),
[chess-bot-vercel](https://github.com/amanmprojects/chess-bot-vercel), weights on
[the Hub](https://huggingface.co/amanm10000/chess-policy-net).

## Three models, one conclusion

[miniLLM](/writing/minillm-101m-laptop) at 100M learned the form of English and not the content
of the world, because the world is too big. [chessLLM](/writing/chessllm-world-model) at 94M
learned a world small enough to fit, and I could prove it with a linear probe. chess-bot at
5.58M skipped the world model entirely, was handed the board, and matched chessLLM's playing
strength with 6% of the parameters.

The pattern: at small scale, **representation beats capacity.** Every one of these results came
from a decision about what the model gets to see — 32k vocab instead of 50k, 40 characters
instead of 32k, a board instead of a move list — and not one came from making the model bigger.
