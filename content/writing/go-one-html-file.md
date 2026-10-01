---
title: "Go in one HTML file"
date: "2026-10-01"
excerpt: "A complete Chinese-rules Go game and an MCTS bot in a single dependency-free file — tested headless against the shipping code, shipped, then proved in Lean."
---

The prompt was: "Create a complete playable game of Go. Chinese variant I think."

One session later it was `go.html`: ~41KB, zero dependencies, no build step. Open it in a browser and play.

## What it implements

Chinese area scoring (komi 5.5 on 9×9, 7.5 above), suicide forbidden, simple ko and positional superko, handicap stones on the real star points for each board size, seki counted for both sides, click-to-mark dead stones during scoring, and SGF export.

The part I'm happiest with is the testing. `harness.js` stubs the ~15 DOM calls the page needs and loads the actual `go.html` through `vm`, so `test.js` runs 112 assertions against the shipping code rather than a copy. Every scoring case also checks the invariant `stones + territory + neutral = N²`.

The tests earned their keep: territory was being counted |R|² times (a 24-point region scored 576), the SGF root node was missing its closing bracket, undo crashed on an empty history, and the move list was off by one so the first move displayed as "pass".

## The bot

Monte-Carlo tree search with UCT, and playouts scored by a small hand table: filling your own eye −400, playing inside your own area −260, self-atari −200, captures +40 plus 15 per stone, saving a group in atari +440. Each step samples 4 empty points and takes the best; below −120 it passes instead, which is how playouts end on settled positions. The search is time-sliced with `setTimeout` rather than `requestAnimationFrame`, because rAF stalls in background tabs. One playout costs 0.26ms on 9×9, which buys three levels from 0.7s to 6s a move.

My favourite failure: with the default 7.5 komi on a 9×9, the bot opened D5, D6, pass, pass — game over in three moves. Komi is 5.5 on 9×9 now.

Honest limits, carried over from the README: the bot has no measured strength, it occasionally passes too early on 13×13, and handicap stones don't change its style.

## Then came the proof

The session's last message was: "Can you prove the consistency of our engine using Lean?" That became `lean/`: the rules engine re-modelled in Lean 4 with the partition invariant proved as `scoreOn_partition`, the test positions restated as theorems, and the two 5×5 scores proved structurally instead of by evaluation. No `sorry`.

**Play it: [go-mcts.vercel.app](https://go-mcts.vercel.app)** — code at
[amanmprojects/go-mcts](https://github.com/amanmprojects/go-mcts).
