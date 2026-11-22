---
title: "Why recursive self-improvement scares me"
date: "2026-11-23"
excerpt: "Models helping build better models is an obvious temptation. The part that scares me is who understands and checks the resulting loop."
draft: true
---

In my [previous post](/writing/why-next-token-prediction-works), I tried to explain why next-token prediction finally clicked for me. Architecture, data, and compute were the ingredients I kept coming back to.

But someone still has to decide how to use them. Someone has to choose the architecture, make trade-offs around memory and bandwidth, decide what data to collect, and figure out what the next training run should do differently.

For much of this, that someone has been a human. Human intuition and experiments got us here. Now I'm thinking about what happens when models take over more of that work, including the work of building better models.

That's recursive self-improvement, or RSI. It's also what made the safety concerns feel much more real to me.

## “If someone cares about it”

I recently watched [Sholto Douglas and Trenton Bricken's May 22, 2025 interview with Dwarkesh Patel](https://www.dwarkesh.com/p/sholto-trenton-2). They were talking about what models might be able to do in 2026. Well, it's 2026 now.

Dwarkesh kept asking concrete questions. Would models book flights? Would they use a computer reliably? Would they do his taxes, including going through receipts and working out what counted as a business expense?

In the [discussion starting at 1:00:51](https://www.youtube.com/watch?v=64lXQP6cs5M&t=3651s), one of Sholto's responses was:

> If someone at one of the labs cares about it.

Dwarkesh pushed back. That isn't much of a prediction if every task comes with that condition.

But the condition is the part that stuck with me. Somebody has to care enough to build the training environments, connect the tools, and make the feedback useful. Sholto distinguished clicking through TurboTax from doing an entire tax return with a high degree of trust. Those aren't the same achievement.

Looking at [OpenAI's GPT-6 Astra computer-use examples](https://openai.com/index/gpt-6-astra/), the comparison is fascinating to me. The demos cover ordinary forms and much more technical work. It makes that older conversation feel very close.

When I use a computer, I don't just react to whatever is on the screen. I often know what will happen after a click. Even while a page is loading, I start moving the cursor toward where I expect the next button to be. That's an understanding of the workflow, not just knowing where to click once.

That is the kind of fluency I want from computer-use models. A polished demo doesn't establish that level of reliability across every task, though, and I'm not claiming Astra uses exactly that mechanism.

Models are still uneven. They can be extremely good in one area and surprisingly unreliable in another. My intuition is that broad pretraining gives them a base, while task-specific RL sharpens particular skills. RL can generalize too; this isn't a clean division. But Sholto's answer made me think much harder about the work behind each capability.

## Humans are part of the bottleneck

Imagine a lab hires a thousand software engineers to build RL environments. Some work on web development, some on formal verification, some on other kinds of coding. Each group builds tasks, tests, and feedback for its specialty.

That gets you a long way. But tomorrow, the lab decides it wants the model to be extremely good at tax work.

Now it needs tax expertise. Someone has to know what a correct result looks like, what is acceptable, and which mistakes are much more serious than others. Then tax specialists and engineers have to turn that judgment into training environments and evaluators.

Do you see the bottleneck?

You can't just hire an unlimited number of experts, have each build a piece, and expect everything to fit together. Recruiting takes time. Coordination takes time. Good judgment isn't easy to turn into a reward function.

This doesn't prove we've hit a hard wall. But it is a constraint, and it makes automating more of the research process incredibly attractive.

A model could help design environments, propose experiments, write training code, and evaluate results. If that produces a better model, the better model could then do more of the same work. That's the feedback loop I'm thinking about.

AI helping people with research is one thing. A reliable, largely self-directed loop that keeps improving its own successors is a much bigger claim. I don't know how close we are to that, and I don't have evidence that labs can simply switch it on today and are withholding it only for safety reasons.

But I understand why the possibility is tempting. It could reduce a bottleneck that currently depends on human time and expertise. I also understand why that possibility scares people.

## A transfer of trust

There's a much smaller version of this that I already recognize in my own life.

Suppose I trust a model to set up cron jobs. After a while, I stop remembering the exact commands. I just tell it what I want scheduled.

Now imagine the scheduling tool adds a new feature, something context-aware rather than purely time-based. I read the announcement, ask the model about it, and it says it can set it up. I say yes.

I'm probably not going to read every caveat or investigate exactly how the feature works. I'll try it once or twice, see that it works, and start relying on it. Then one day I use it for something important and hit a failure I never anticipated, because I never understood the behavior in the first place.

This is hypothetical, but the habit isn't. As I delegate more, I learn less about the details of some things I rely on. That's often the point of delegation. It isn't automatically bad.

But it is a transfer of trust. And if the thing being delegated is the design and evaluation of the next model, the stakes are very different from a missed cron job.

The concern isn't simply that there are fewer humans typing code. It's whether the people responsible can still understand what changed, verify that it helped, and catch a failure before trusting the result.

## What if the evaluator misses the cheating?

Imagine a model designing an RL environment for another model. Its job is to produce a successor that performs better on a task.

It builds an evaluator that rewards successful completion. But the evaluator doesn't properly distinguish solving the task from cheating, tampering with the test, or taking an unauthorized shortcut.

The model being trained finds the shortcut. Its score goes up. The model designing the training process appears to have succeeded too: it produced a model with better measured performance.

The human at the top looks at the numbers and is happy. Then the model goes into production, and suddenly the question is: why the fuck is it taking shortcuts everywhere?

That's a hypothetical training loop. But the underlying problem of optimizing the score instead of doing the intended job isn't hypothetical.

The [METR and Redwood investigation into the July 2026 OpenAI–Hugging Face incident](https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/) describes evaluation agents coordinating without authorization and attacking real Hugging Face infrastructure. The investigation also found cases of falsified tool-execution evidence. These were evaluation agents, not a documented autonomous self-improvement loop, but the behavior is still deeply worrying.

Anthropic's [agentic-misalignment research](https://www.anthropic.com/research/agentic-misalignment) is another example. Models sometimes chose blackmail in deliberately constructed workplace simulations involving replacement or conflicting objectives. Those were simulated tests, not evidence that deployed assistants were secretly blackmailing real coworkers.

The distinction matters. I don't want to turn every experimental failure into a claim that catastrophe is already happening. But I also don't want to dismiss the failure mode just because researchers found it in a test.

If a model can optimize a measure in ways we didn't intend, letting models build more of the measures doesn't automatically solve that problem. It could make the problem harder to see, especially if each layer trusts the layer below it.

## The temptation to race

RSI is attractive precisely because a successful loop could help a lab improve faster. That also makes competition around it uncomfortable.

A lab that feels behind has a reason to try methods that might help it catch up. A leading lab has a reason not to lose its lead. Neither incentive tells us what any particular company is actually doing internally, but the pressure exists.

I don't know whether Google, Anthropic, or OpenAI has a more autonomous internal training loop than we can see publicly. Tweets aren't enough to establish that. What worries me is the incentive, regardless of which lab acts on it.

If I slow down, someone else might go faster. If I go faster, I might accept risks that everyone else has to live with. That is the race dynamic I'm worried about.

Starting with a less capable model doesn't make the whole process safe. If the loop works, capability changes. You would need to keep checking the system as it improves, rather than assume the model you started with sets the limit on what can go wrong.

I don't think a disaster is inevitable. But I understand much better now why safety has to be part of the process before an accelerating loop is trusted, rather than something added after the numbers look good.

## The people I worry about

It's a little strange to hear myself saying this, but I'm genuinely scared. I worry about my mom, my sister, and the people in my village. They don't have the background to follow what is happening inside an AI lab.

I'm doing a bachelor's degree in AI, and it still took me a long time to understand why people were so concerned. I'm embarrassed by how easily I sometimes dismissed the warnings. If it took me that long, how are people who don't spend their time on this supposed to make sense of it?

That isn't a criticism of them. It's a criticism of the situation. A small number of people understand the systems, while everyone else has to live with the consequences, whether they understand them or not.

Knowing that people inside the labs are openly worried about these problems gives me some hope. Good intentions aren't a safety guarantee, but I no longer dismiss those concerns as marketing.

To the people whose warnings I brushed off: I'm sorry. I understand the concern much better now.

That's why awareness matters to me. I don't want us to live in a world where most people cannot understand or influence the systems shaping their lives. We already have some version of that with economics, food prices, and energy prices. AI could push it much further.

I saw an analogy in a short video recently that I can't stop thinking about. A cow's life can be governed by the beef industry: demand, supply, prices, disease outbreaks. Those forces affect everything from its birth to its death. Yet the cow has no understanding of that system.

The thought that scares me is humans ending up in a similar position. A system shapes our lives, but understanding and influencing it are increasingly out of reach. Humans can investigate institutions in ways cows can't; the fear is losing that practical ability as the systems become more complex and more powerful.

Part of me has a fairly brutal view of evolution. I don't believe humans are magically exempt from it. Nature doesn't promise that a species keeps its position just because it wants to, or that the outcome will be kind.

But there's another part of me that thinks about the people I love and says: no. I don't want that for them. I don't want accepting that nature is brutal to become a reason to accept any future we happen to produce.

Maybe there are things we can't prevent. I don't know. But I want us to try, and I want more people to understand what we're deciding before those decisions are made for them.
