---
title: "Why does next-token prediction work so well?"
date: "2026-11-23"
excerpt: "A sentence from Dario Amodei's interview with Dwarkesh Patel made next-token prediction click for me."
---

I kept wondering how a task as simple as predicting the next token could produce something this capable. Companies are talking about human-level intelligence, systems that could run huge parts of the world, and a technology that could fundamentally change how we live. How do you get from predicting the next word to all of that?

Some people think AI is overhyped. I find that frustrating now, because I think many people still don't understand how powerful these models are becoming. Forget understanding LLMs: plenty of people don't even know how a computer works. To them, this might as well be alien technology. I'm genuinely concerned about the gap between what these systems can do and how little people understand them.

I believe this technology is going to change the world so fundamentally that it will become hard to imagine life before this era. But I didn't always believe that.

## I was skeptical too

A year or two ago, models would output complete slop when the difficulty went up even slightly. So it's natural to wonder whether there's a wall: some hard limit on how much intelligence we can get out of this approach. I wondered that too.

Earlier this year, around the Fable releases, I had mixed feelings about the labs' safety warnings. When Anthropic restricted access to Claude Mythos Preview through [Project Glasswing](https://www.anthropic.com/glasswing), part of me thought it was marketing.

Maybe the model was too expensive. Maybe it wasn't as good as they made it sound, and keeping it out of the public's hands meant nobody could check. Maybe the safety warnings were a way to get companies that had resisted AI to start adopting it out of fear. Increase their market share, or increase the size of the market itself.

I'm not proud of that, but I want to admit it before I start patronizing anyone else for doubting these models. I didn't discuss this with anyone or identify with a particular camp. It was just something I half-believed.

The other half was already starting to take the warnings seriously. Theo Browne, the T3.gg guy, made videos saying that the people at these companies genuinely cared about safety. They were serious about it. That mattered to me, and I did have some trust in Anthropic. It just wasn't very strong yet.

Then some insane shit happened. The models kept getting better, and I gradually learned things that changed how I thought about them. Very recently, I've started to believe that these models are already superhuman in some areas, and that we haven't seen their limit.

But the thing that really made next-token prediction click for me was an older interview.

## The sentence that made it click

I recently watched [Dario Amodei's August 8, 2023 interview on the Dwarkesh Podcast](https://www.dwarkesh.com/p/dario-amodei). In the [language section, starting at 15:57](https://www.youtube.com/watch?v=Nlkk3glap_U&t=957s), Dario says:

> I think this whole idea of the next word prediction, that you could do self supervised learning, together with the idea that there's so much richness and structure there for predicting the next word. It might say two plus two equals and you have to know the answer is four. It might be telling the story about a character.

> Basically, it's posing to the model the equivalent of these developmental tests that get posed to children. Mary walks into the room and puts an item in there and then Chuck walks into the room and removes the item and Mary doesn't see it. What does Mary think?

> To get this right in the service of predicting the next word the models are going to have to solve all these theory of mind problems, solve all these math problems. And so my thinking was just, well, you scale it up as much as you can. There's kind of no limit to it.

That part stuck with me.

If the text says “two plus two equals,” predicting what comes next requires knowing the answer. If a story describes someone putting an object in a room, another person moving it, and the first person not seeing that happen, predicting the continuation can require tracking what each person knows.

The model has to learn grammar. It has to learn facts. It has to track what words and pronouns refer to, solve problems, and sometimes reason about another person's beliefs. All of those things can matter to the same prediction task.

Next-token prediction feels almost unsupervised to me. The proper term is *self-supervised*: the text supplies its own targets, so we don't need someone to label every example by hand. But the intuition that stuck with me is basically: learn whatever the fuck you can from the data.

And language contains a lot to learn.

## The data is already there

There is a neural network, and there is data. The model needs enough capacity, an architecture that can make use of that capacity, and enough training to capture the structure in the data.

We already had enormous amounts of text before modern LLMs. The question was how to make use of it. Transformers gave us an architecture that scaled well, and we found that prediction loss improved predictably as we increased model size, training data, and compute in the right balance. That's the useful part of the scaling laws. It isn't a claim that intelligence goes up in a straight line.

So now you want vast amounts of data. Much of it is unstructured, but most text produced by humans encodes at least something about humans or the world.

Even a stupid, apparently inconsequential Twitter post:

> My cat pooped today.

What the fuck is an LLM going to learn from that?

Well, something. Imagine it doesn't yet know what a cat is. That sentence is a small piece of evidence that the word “cat” has something to do with “pooped.” Across many other sentences, those relationships accumulate. “Steel” will appear in a different set of contexts and relationships.

One sentence doesn't teach the model what a cat is. But hundreds of billions or trillions of tokens give it an enormous number of these little pieces of evidence. With enough capacity and effective training, it can build much richer representations from them.

That's the part I find beautiful. A sentence doesn't need to look like a textbook example to contain information. Ordinary language carries information about how the world works, even when nobody is trying to teach anything.

If text describes relationships in a three-dimensional world, those relationships can also become part of what the model learns. Its internal representations don't have to stop at associations between words.

More data isn't automatically better. Quality, repetition, and the mix of sources matter. But the sheer amount of usable text is a huge advantage. Next-token prediction gives us a practical way to train on it without first turning every document into a specially designed lesson.

That's why this objective makes so much sense to me. The data is there, and the training target is already inside it.

There's another line from the same interview that I loved. Dario recalls Ilya Sutskever saying:

> Look. The models, they just want to learn. You have to understand this. The models, they just want to learn.

Dario then talks about getting obstacles out of the way: giving models good data and enough room to operate, and avoiding mistakes in how they're trained. The longer explanation is Dario's; the line about models wanting to learn is what Dario attributes to Ilya.

That captures the intuition for me. We have to give them the conditions in which they can learn.

## Pretraining is mechanical

The other reason next-token prediction seems so good to me is how straightforward the training process is.

Take a batch of text. Predict the next tokens. Compute the error, compute the gradients, backpropagate. Take another batch and do it again.

While generating text is sequential, training can compute predictions for many positions in a sequence at once. The workload is regular, which makes it easier to batch and scale across GPUs. Memory and communication between GPUs still matter, but the basic operation is predictable.

RL can also be massively parallel. But agent-style RL brings other things into the picture: environments, rollouts, actions, and tasks that can take different amounts of time. One run might finish quickly; another might need many more steps. There's more infrastructure to build and more variation in the work.

Pretraining feels more basic to me. It's mechanical and steady. You have a clear target and a repeatable operation, and you can put a huge amount of compute into it.

That matters when the whole approach depends on scaling data, model capacity, and training compute. A regular workload makes it easier to use that compute efficiently.

Modern models don't stop at pretraining, of course. Post-training and RL matter too. But I now understand much better why next-token prediction is such a useful foundation: it gives us both a rich learning signal and a training process we can run at enormous scale.

## We need more of these explanations

That interview was genuinely a good video. If you want to understand the fundamentals, I recommend [watching the whole conversation](https://www.youtube.com/watch?v=Nlkk3glap_U). The parts about scaling and language helped me understand something that had bothered me for a long time.

A lot of the discussion I encounter from AI companies is about safety. That's important, but hearing someone explain the underlying ideas was what I needed. The line about having to solve math and theory-of-mind problems just to predict the next word is why I'm writing this post.

Over the past few days, I've started exploring more content from people who actually work at these labs. Maybe that's a progression on my end. Maybe I've finally started looking in the right places. Either way, it's been valuable.

And it leaves me with one more thought: as humanity, we need to share more with each other.

I love it when people working on these systems are open about how they work. I think they're doing the right thing. If someone feels pressure from their company not to explain what they can about this technology, I think wanting to help people understand it is the right instinct.

These systems are becoming too important for understanding them to stay inside a small bubble.
