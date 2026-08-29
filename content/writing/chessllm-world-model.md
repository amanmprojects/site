---
title: "A 94M chess model that built a board it was never shown"
date: "2026-08-09"
excerpt: "Character-level SAN, no board in the input, and a linear probe that reads the position out of the activations at 85.6%."
---

The [text model I trained](/writing/minillm-101m-laptop) writes fluent English and invents
facts, because the world does not fit in 100M parameters. So the obvious next question: pick a
domain where the world *does* fit, and see whether the model builds an internal model of it.

Chess is that domain. [chessLLM](https://github.com/amanmprojects/llm/blob/main/CHESS.md) is
the same architecture as my text model — 94.4M parameters, retrained on nothing but move text:

```
;<20> e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5
```

**It was never given a board.** No FEN, no piece list, no coordinate grid, no legal-move mask,
no search, no reward. Character-level next-token prediction on 1.01B tokens of Lichess games,
and the only supervision is "which character comes next."

Weights: [`amanm10000/chessllm`](https://huggingface.co/amanm10000/chessllm). Final validation
loss **0.4150**.

## The parameter windfall

The text model spends `32768 × 768 = 25.2M` parameters — a quarter of the entire model — on a
tied embedding table. Chess notation needs 40 tokens: `a`–`h`, `1`–`8`, `KQRBN`, `xO-+#=`, ten
rating buckets, and three control ids. That table costs about 30k parameters.

Twenty-five million parameters, freed. Two ways to spend them, and I took the second:

1. Keep the config → a 75.5M model that trains 25% faster
2. **Grow the transformer** → 12 layers becomes 15, same total footprint

So chessLLM has **94.4M parameters of which 94.4M are non-embedding**. Every parameter is doing
chess rather than storing token identities. The bins are flat `uint8` too — half the memory
traffic of `uint16`, and no BPE step in the pipeline at all.

## The linear probe: 85.6% against a 64.5% baseline

Following [Othello-GPT](https://arxiv.org/abs/2210.13382) and Karvonen's chess-GPT: take the
residual stream at layer 10, freeze the model, and train **one linear layer**
`Linear(768, 64*13)` to classify what occupies each of the 64 squares. No hidden layer, no
fine-tuning.

Linearity is the whole point. A deep probe could *compute* the board from move history, which
would only prove the information is recoverable in principle. A linear probe can only read what
is **already explicitly encoded as a direction in activation space**.

```
collected 34,277 positions (768 dims, layer 10)
train 27,438 / test 6,839   (whole-game split)
per-square accuracy 85.6%   majority-class baseline 64.5%
squares below 50%: 0 / 64
```

Not one of the 64 squares is at chance. The board is linearly decodable from a model that only
ever saw text.

**The methodology point that matters more than the number.** My first run reported 90.8%
against a 56.0% baseline, and I wrote that down as clearing the >90% target I had set myself.
It was an artifact. Successive positions within one game differ by a single piece, so a random
position-level split leaks near-duplicates into the test set — and my split had landed such
that the "test set" was a 45-position tail of one short opening-heavy game.

The tell is the baseline moving 56.0% → 64.5% when I fixed the split to whole-game boundaries.
The honest test set averages ~22.7 pieces on the board instead of ~28, because it includes deep
endgames where the representation has drifted and prediction is genuinely harder.

**85.6% is the real number, and it does not clear the gate I set myself.** Reporting the 90.8%
would have been more impressive and would have been wrong.

## 99.22% legal, and the 0.78% is where the information is

200 self-play games at temperature 0.7: 11,216 moves generated, 87 illegal, mean survival to
first illegal move **55.6 plies** (27.8 full moves).

The breakdown of those 87 failures is the actual finding:

| failure | count | kind |
|---|---|---|
| piece cannot reach that square from where it is | 68 | semantic |
| quiet move onto an occupied square | 11 | semantic |
| capture on an empty square | 1 | semantic |
| malformed SAN (not valid notation) | 7 | syntactic |

**80 of 87 — 92% — are semantic.** The notation is perfectly well-formed and describes a move
that happens to be illegal in that specific position. The model wrote down a real move for a
board that isn't the board.

So syntax is essentially solved at **99.94%** while board-tracking sits at **99.29%**. That gap
is the measurement. SAN is a small, nearly-regular language and its grammar is learnable from
surface statistics. Knowing that `Nf3` is available is not — you have to know where the knight
is. The residual error concentrates almost entirely in the half that requires a board, and its
dominant form ("piece cannot reach that square") is the signature of a state representation
that has drifted, not a grammar that has broken.

**One caveat I want stated plainly:** each game contributes at most one illegal move, because
generation stops there. So the rate is structurally about `1 − 1/mean_length` and the two
numbers are not independent. Mean survival at 55.6 plies is the more honest metric and the one
to compare across configurations.

A related surprise: **greedy decoding is strictly worse.** At temperature 0, 40 of 54 samples
died on an illegal move, every failure identical, and the 54 samples collapsed to roughly 2
distinct games of 39 plies. Deterministic decoding replays the same game and walks into the
same wall every time. Sampling explores around the model's uncertainty and survives 55.6 plies
instead of 39.

## It learned that chess is a game you try to win

Nothing in the objective mentions winning. No reward, no value head, no search, no outcome
label. The input is move text and a rating tag.

It stops playing when it is losing. Adjudicating all 88 self-terminations with Stockfish, and
grading the position at the moment the model emitted the end token:

```
48x  JUSTIFIED (clearly lost)
25x  real terminal position   <- checkmate or draw, genuinely over
13x  ABSURD (winning when it quit)
 9x  PREMATURE (roughly equal)
 9x  DEFENSIBLE (much worse, still playable)
 7x  JUSTIFIED (forced mate against)
 2x  ABSURD (mating attack available)
```

55 justified plus 25 genuinely-over positions; only 15 indefensible.

The control is what makes this a result rather than an anecdote. Compare each stop position
against a randomly chosen earlier ply *from the same game and the same side*:

```
stop positions  n= 88  mean -473.5cp  median -616cp
control         n=113  mean -136.8cp  median  -18cp
```

A median of −616 centipawns at the stop versus −18 at a random earlier ply — 598cp worse. **The
end token is conditioned on the position, not on elapsed length.** If the model were simply
stopping after N plies, that gap would be near zero.

Two behaviours in the same family. It **plays for mate**: during an early sidecar test it
produced `Qxf7#` and then emitted the end token instead of a space, and my code read that as a
resignation and threw the move away. It wasn't resigning, it was saying *"and that's mate."* I
had to fix the server to parse a complete move preceding the end token. It also **offers and
accepts draws** at plausible moments in balanced endgames.

All of this is inherited from the data — millions of games where humans resign when lost and
mate when winning. The model absorbed the *purpose* of the activity from the statistics of how
people behave inside it. And to know it is losing, it has to know what is on the board.

## Where it breaks, which is the interesting part

**Against a real engine it collapses.** 60 games versus Stockfish at approximately 1400:

```
W-D-L 8-5-47   score 17.5%   ->  Elo ~1131 (+/-103 at 95%)
illegal-move forfeits: 24    resignations adjudicated: 12
```

**24 of 60 games — 40% — ended in an illegal move**, from a model that is 99.22% legal in
self-play.

Those numbers are not in tension; they measure different things. Self-play stays inside the
training distribution: human-plausible moves producing human-plausible positions. Stockfish
drags the game somewhere Lichess games rarely go, and the representation — trained only on the
former — degrades fast.

The world model is **distributionally narrow**. It is a model of *positions humans reach*, not
a model of chess. Which means the ~1131 Elo conflates two separate failures: weak play, and
board-tracking collapse under distribution shift. The second dominates, and it is the more
interesting one.

**The rating prompt does not work.** Every training game carried a rating bucket
(`<15>`–`<24>` = 1500–2499), so it is fair to ask whether that became a controllable style
knob. 40 games per bucket against Stockfish:

| prompt | nominal | W-D-L | score | Elo | forfeits |
|---|---|---|---|---|---|
| `<15>` | 1500 | 5-3-32 | 16.2% | ~1115 ±126 | 16 |
| `<20>` | 2000 | 5-3-32 | 16.2% | ~1115 ±126 | 20 |
| `<24>` | 2400 | 3-3-34 | 11.2% | ~1041 ±126 | 17 |

`<15>` and `<20>` are identical and `<24>` is slightly *worse* — all inside the error bars. The
tag shifts surface style at most. Two plausible reasons: the 1800-Elo data floor means the low
buckets were thinly populated and are not really 1500-level play, and strength may simply not
be expressible through a representation this shallow. The slider stays in the UI because
watching it fail is the honest demonstration.

**A null result I'm glad I ran.** Games were packed into the training bins back-to-back with no
document-boundary attention mask, so within a 1024-token window the model can attend across a
newline into the previous game. If it were partly tracking "pieces mentioned recently" rather
than a per-game board, an unrelated complete game sitting in context should degrade it. Sixty
continuations per arm, identical seeds and temperature:

| arm | moves | illegal | legal | mean survival |
|---|---|---|---|---|
| bare prefix | 3,942 | 24 | 99.39% | 65.3 plies |
| preceded by an unrelated game | 3,597 | 31 | 99.14% | 59.4 plies |

The 5.9-ply gap looks like an effect and isn't one: a two-sided permutation test over 200k
resamples gives **p = 0.152**, and the 95% bootstrap CI on the difference is **[−2.1, +13.7]
plies**, comfortably spanning zero. At n=60 per arm this rules out only large effects — a real
degradation of a few plies could hide here.

What it does say is that the start token is doing its job: the representation is scoped to the
current game rather than to whatever happens to sit in the attention window. A model tracking
loose piece-mention statistics would not be indifferent to 60 extra plies of someone else's
game. This cheap null is why I did *not* add document-boundary masking to the pipeline — it
would have been real work to solve a problem I did not have.

## The thing worth taking away

A world model is **cheap**. 94M parameters, 10.3 hours on one laptop GPU, 1B tokens of pure
notation, and no board ever shown. It is not a late-training luxury that emerges at scale — it
shows up early, because predicting the next character *requires* it.

But it is only as wide as the data. Push it off-distribution and it falls apart, and that gap
between 99.22% in-distribution and 60% survival against an engine is the honest summary of what
this model is.

There is a follow-up: [I built a second chess model that gets the
board handed to it directly](/writing/chess-two-ways), which trades the world model away
entirely and plays substantially better as a result.
