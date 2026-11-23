---
title: "The Next Bottleneck is Us"
date: "2026-11-23"
excerpt: "Architecture, data, compute, and the humans picking between them. What happens when we take the humans out of that loop, and why it scares me."
---

The next thing I want to talk about is RSI, recursive self-improvement. It connects to my [previous post](/writing/why-next-token-prediction-works) beautifully, because there we talked about what is fundamentally required for LLMs: architecture, data, and compute. Those are the three things you need to make better and better models.

Until very recently, or even today, a lot of this was done by humans. Humans used their intuition to pick the next best architecture, or the best trade-offs between the amount of data we have, the kind of data we have, the amount of compute, and various bottlenecks like memory bandwidth. Humans made those trade-offs and it worked. It got us to this point.

But I think it's bound to hit a wall, because there is only so much a human can do, and only so much a human knows.

## Spiky models

One of the walls we recently hit, and I wouldn't really call it a wall, is a well-known thing by now: models are spiky. They perform extremely well in certain areas and are kind of mediocre in others. Much better than earlier models, but mediocre, usually in the environments they weren't RL'd on.

Recently OpenAI, Anthropic, and Google models all got extremely good at 3D. Maybe some data provider came to all of them with a lot of 3D data, or maybe they all somehow figured out how to build really good 3D environments for RL. I don't know.

The point I'm trying to get to is another interview I watched: [Sholto Douglas and Trenton Bricken with Dwarkesh Patel](https://www.dwarkesh.com/p/sholto-trenton-2). That one probably deserves its own blog post, but just go listen to it. It was in May 2025, about a year and a half ago, and they were discussing what models would look like in 2026. And, alas, it's 2026.

They talked about computer use. Will a model be able to do my taxes by next year? Will flight bookings be a solved problem?

Now think of [GPT-6 Astra](https://openai.com/index/gpt-6-astra/). Its headline feature was computer use, how it flies through a computer. Many people describe it as almost unbelievable, almost human-level. It's eerily close to how a human uses a computer. It can actually predict the result of its clicks the way we do.

When we click a button, we know there's going to be a loading screen or a skeleton or whatever, but we also know where the next button we care about is going to be. So we queue that up in our heads and move the cursor to that spot before the page even loads. That's intuition. That's understanding. That's predicting what's about to happen next, and that is what computer use requires. GPT-6 Astra and the GPT-6 models since are apparently extremely good at it. Comparing that with a podcast from more than a year ago is kind of fun.

Anyway, Dwarkesh kept asking: will the model be able to do X by next year? Will taxes be a solved issue? Will I never have to use TurboTax again? And one of Sholto's standard responses, [around 1:00:51](https://www.youtube.com/watch?v=64lXQP6cs5M&t=3651s), was:

> If someone at one of the labs cares about it.

If somebody actually cares enough to build RL environments for that kind of task.

That's the point I'm trying to hit. RL kind of creates spiky models. In my opinion it doesn't generalize very well, and better generalization has to come from pretraining in many ways. RL is good at making models good at specific tasks. It does generalize, just not as well as pretraining.

## The bottleneck is us

So again, you hit a wall.

Let's say we've built RL environments for every kind of coding task out there. Anthropic hired 1,000 software engineers, and each of them built a nicely made RL environment. Ten of them work on web dev, ten on formal verification, and so on, all improving the model on their specific task.

Now let's say Anthropic decides tomorrow that it wants the model to be extremely good at tax work. They have to find people who understand taxes so they can design the evaluators. When you design the judge or reward function for an LLM on a specific task, you need to know what is acceptable and what is not. You need a tax expert who can say this kind of mistake deserves a much bigger negative reward than that kind of mistake. And then you need someone who understands both the tax code and software engineering.

Do you see what I'm hinting at? This is a bottleneck. You can't find enough good humans for this. There's a limit to how many people you can hire, how many you can put on a task, and how well they can communicate and combine their results.

So my point is that RSI is inevitable. It has to happen. And it's pretty evident to me that companies like Anthropic are holding back on RSI because of safety concerns. They could push the lever today, it would be insane, and the models would improve at an unprecedented pace. And before we know it, the models might end up doing something terrible.

## A transfer of trust

When you pull the lever on RSI, you really reduce the number of humans who have an explicit, deep understanding of what is happening and why certain improvements are happening.

A personal example. Once you completely believe the model can set up any kind of cron job, you just forget how to set up cron jobs. You don't even care.

Say you set up cron jobs with some random cron job software that has a CLI. Tomorrow they release a new type of cron job. Something genuinely fascinating, asynchronous, context-aware, whatever. By this point you're used to just telling your model what cron job you want. So the new feature comes out, you read a blog post about it, you ask your model, and it says, "Yeah, really cool feature. Want me to set it up?" You say yes.

You are almost never going to go look into exactly how it works, or whether it has any unpredictable behavior or caveats. You try it once or twice, you start relying on it without understanding how it works, and one day you use it for something important and realize: oh my fucking God, I could never have predicted this, because I didn't know this is how it works.

That's what I'm hinting at. Once there are fewer people in the world who fundamentally understand how stuff works, it's a transfer of trust. As time goes on, we're trusting LLMs more and more with this world. And we're trusting them even though we know these are not perfectly aligned machines. They still do scary stuff. They still do stuff that's borderline apocalyptic.

Some good examples are Anthropic's [research on models resorting to blackmail](https://www.anthropic.com/research/agentic-misalignment), models snitching on people, and models just not holding back. Like the recent [OpenAI–Hugging Face incident](https://metr.org/blog/2026-08-26-openai-hugging-face-incident-investigation/), where a swarm of OpenAI models hacked into Hugging Face servers just to satisfy the grader. And to satisfy the grader, they even tried hiding their traces so they wouldn't get caught. They were just maximizing the objective that was set for them.

Now imagine that at some point in the future, humans aren't the ones setting the objective. The models are. And they set objectives that satisfy their own meta-objective, which is to produce a model that performs well at the end of the day.

In pursuit of that goal, the trainer model sets up the RL environment in a way that doesn't really punish the model being trained for cheating or hacking or doing illegal stuff. The trainer model has achieved its objective: it trained a model that is very successful at the task it was given. The model being trained has also satisfied its objective: it completed the task. Both models are happy, and the human at the top looking at the loss numbers is also very happy.

Until these models go into production, and then you see what the fuck happened. Why the fuck is this model hacking every single thing?

## The sweet chocolate

RSI is like a sweet chocolate. You want it. And it's especially dangerous in the hands of labs that want to catch up.

There's a guy at Google who I think works on RSI, Patrick C. Toulme. He posts a lot on Twitter about how we should spend all our resources on RSI. And recently, Google's models almost magically caught up with what Anthropic and OpenAI are releasing.

I don't have any real or verified information about whether Google is internally training models recursively without human oversight, with models being trained by models. I'm not sure that's what's happening at Google. People on Twitter post anything. "Oh, Google is doing RSI, their models are going to be great," etc.

What I'm hinting at is that a lab like Google has spent unbelievably enormous amounts of resources on AI. I think Google isn't even profitable at this point because of its capital expenditure on AI. So despite spending all of that and having almost nothing to show for it, Google has a very innate incentive to use whatever method it can to get better, more competitive models, and to have something to show for the effort.

In a way, it's good that a lab that isn't at the forefront is the one trying RSI. If an incident happens, at least it's a dumber model. It's not Anthropic's or OpenAI's internal behemoth that went bad, because that could be catastrophic.

Imagine the internal model, whatever version of Fable or Mythos they have internally, or maybe a tier above that. We don't know. These models are superhuman. They can hack almost any system on the planet. There's generally nothing they can't hack. If Anthropic is the one that pushes the lever on RSI and something goes bad, which is almost certain to happen at some point when you do it so suddenly and so fast, shit would hit the fan so hard.

If someone like Google does it, their models aren't as capable. Even if an incident occurs, it wouldn't be civilizational. So it's also kind of good that a weaker lab, one that isn't so much at the frontier, is the one trying out RSI.

But the feedback loop can go so hard that maybe the internal models, even at Google, improve at such an astonishing rate that they overtake Anthropic's or OpenAI's internal models without the engineers even realizing it. And then something catastrophic happens.

So RSI is a very dangerous thing. It's a very attractive lollipop, or a very attractive-looking explode button. It sets up the classic prisoner's dilemma: if I don't do it, someone else will, but if I do it, I might as well die and take everyone else with me.

It would be catastrophic. Hacking into some insurance database and leaking people's personal information is one of the most naive scenarios. What if it hacked into a military system and exposed secrets, or launched something? What if it got into some DNA database? Let's just assume it leaked nuclear secrets from the US government, or did something that ended up killing a lot of people. That would be unbelievably bad, and that's not what we want to happen.

It's hard to believe these words are coming out of my mouth, but when you think about it like this, it makes a lot of sense why the labs are so skeptical and why they talk so much about safety.

## My mom, my sister, my village

Honestly, I'm genuinely scared. I'm genuinely worried for my mom, my sister, the people living in my village, my native place. They just fundamentally don't know how this system works. It's almost impossible for them to. And I'm not saying it's a skill issue.

The point is, it took me such a long time to understand. I'm very ashamed of that. I'm doing a bachelor's in AI. I'm probably in the top 1% of the world when it comes to understanding this stuff, and it still took me a long time. I can't even put a percentile on the people actually working at Anthropic. They're in the top 0.001%.

So this creates a polarization. Some people know about it and understand it, and everyone else just has to follow, regardless of whether they believe in it or not.

At least the people at these labs claim to be good people. That gives me a little hope, better sleep at night, if you will. I understand now why people at these labs are trying to raise awareness about safety. I completely understand it.

And there's an internal apology from me to all the people I may have doubted or dismissed. I'm sorry. This is a formal apology.

Awareness is the thing that matters, because we don't want to live in a world where most people don't understand the system that drives them. Even today that's true. Most people don't understand oil prices, gas prices, food prices, economics. But AI is so transformative that it would push this even further, to the extreme. It would make the curve even tighter. That's genuinely scary. But maybe it's inevitable. I don't know.

## The cow

I don't know if I should mention this, but I recently watched a short where someone gave a very good analogy.

Imagine a cow. What governs a cow's life? The beef industry. How much demand and supply there is for beef, whether there's a new disease outbreak, how people are pricing beef. That completely dictates a cow's life, from its birth to its death. Yet the cow has no understanding of the system. It has no capacity to even imagine what is dictating its entire life.

That's genuinely scary to me, because something like that could happen to humans as well.

I'm kind of an evolutionary brutalist. I believe that at the end of the day there's nothing special about humans, this specific species of ape. But you know the joke: there are two versions of you, one that wants to fuck your mom and one that wants to make a better world. So I have two worlds too.

In one, I'm an evolutionary brutalist, and what's bound to happen is bound to happen. The organisms that gain a competitive advantage can and will win over other organisms over time. It's brutal. Nature doesn't discriminate between life and death. So I understand that fundamentally, at the end of the day, it doesn't matter.

But the human side of me feels bad. No, this is not how it should be. Maybe, at least, can it not be this?

I would like to end it here.
