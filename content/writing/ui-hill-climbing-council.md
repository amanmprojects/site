---
title: "Hill climbing UI with a council of models"
date: "2026-11-16"
excerpt: "Agents used to be bad at UI. Ask several of them for their opinion and keep climbing, and it turns out they aren't."
---

UI is the thing people actually see, and it's the thing agents have always been worst at.

Theo has a video on this, [Agents Sucked At UI (Until Today)](https://www.youtube.com/watch?v=xq0eB8vxeqk). His idea is to turn UI into a hill climb. Take screenshots, have a council of different models score them, make changes, and keep going until the reviewers agree it's good.

So I ran my own UI hill climbing thread in T3 Code, and it worked great. If you really make the agents climb, and ask different AIs for their opinion instead of trusting one, the UI gets genuinely good.

I pointed it at the app I work on in my internship: six main screens, in light and dark mode. Two council members scored every round, Claude Opus and Gemini. Round 1 is the app as it is today, before any change.

| Round | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|
| Claude Opus | 6.0 | 7.3 | 7.5 | 8.3 | 7.8 | 7.9 | – | 8.3 | **8.5** |
| Gemini | 6.3 | 8.0 | 7.9 | 8.2 | 8.7 | 8.5 | 8.6 | 8.7 | **8.9** |

Scores don't rise every round. Each round the reviewers look at new screens and find new problems. But over nine rounds Opus went from 6.0 to 8.5 and Gemini from 6.3 to 8.9.

Here's what that looks like. Before on the left, after on the right, all demo data:

![Dashboard screen, before and after the hill climb](/images/ui-hill-climbing/page-3.png)

![Calls screen, before and after the hill climb](/images/ui-hill-climbing/page-4.png)

![Chats screen, before and after the hill climb](/images/ui-hill-climbing/page-5.png)

The part I've fallen in love with is the council itself, through the council skill Theo made. Whatever change or feature I'm working on, putting it in front of a council of models makes it so much better. It's not only for UI. I use it for everything now.
