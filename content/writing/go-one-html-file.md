---
title: "Go in one HTML file"
date: "2026-10-01"
excerpt: "I pointed an agent at Go to see what it could do. It built a game I actually play — then proved the rules in Lean. Mostly."
---

I was free and wanted to put my agent to work, so I asked Claude Code to build a playable game of Go, Chinese rules. The model was Bunny Alpha, the stealth one on OpenRouter — people are speculating it's Minimax, whatever. It is really good. Especially at UI.

What came out is `go.html`: one file, ~41KB, no dependencies, no build step. And the thing is fully playable — Chinese area scoring with komi, suicide and ko and superko handled, handicap stones, an MCTS bot with three levels, SGF export. I genuinely could not find bugs in the UI, and the UI itself is very good. It is something I could showcase, and I do actually play on it in my free time. I have since used the same setup to fix the UI of my older projects. For UI work I trust it completely now.

The bot is Monte-Carlo tree search with a small hand-scored playout table, sampling a few candidate moves at each step and taking the best. It plays real-enough Go that games feel normal. The README carries the honest limits: no measured strength, it passes too early sometimes, handicap stones don't change its style.

Then the obvious follow-up: a game seems like the perfect place for Lean, so can you prove the engine consistent? The Lean pass was done by a different, weaker model in my setup (mimo v2.6-flash), and honestly it showed — slower, needed more hand-holding. But it got there: `lean/` proves the scoring partition invariant, restates the test positions as theorems, and proves the 5×5 scores structurally. No `sorry`.

Here is the part I am still unsure about, and I want to be straight about it: the game you play still runs the HTML file. I don't fully understand what the Lean proof covers — whether it says anything about the JavaScript in `go.html`, or whether it is a separate proof standing next to it. The 112-assertion test suite runs against the real shipping code, so that part I trust. The Lean part I am still making my mind up about.

Overall though: great experience. I pointed an agent at a game for fun and ended up with something I play, something tested, and something proved — in that order.

**Play it: [go-mcts.vercel.app](https://go-mcts.vercel.app)** — code at
[amanmprojects/go-mcts](https://github.com/amanmprojects/go-mcts).
