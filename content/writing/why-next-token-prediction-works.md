---
title: "Why does next-token prediction work so well?"
date: "2026-11-22"
excerpt: "A sentence from Dario Amodei's interview with Dwarkesh Patel made next-token prediction click for me."
---

I was wondering, and I think we all wonder: how can something as simple as next-token prediction get us here? Companies claim these models have already reached human-level intelligence. These systems are supposedly going to run the world and change the entire meta.

And some people don't believe this. Some people doubt it and think AI is overhyped. Genuinely, it's annoying, because people don't understand how important and how powerful these models are. I am genuinely concerned for many people in this world. Forget about LLMs, they don't even know how a computer works. To them LLMs are basically alien technology, and with how powerful these models are becoming, they are going to rule the world.

None of this is secret. It's all very public. But to summarize: this technology is going to change the world so fundamentally, and in such an unimaginable way, that it will be extremely hard to imagine life as it was before this era.

## I was part of that group

Now, for the people who have doubts, which included me for a very long time, I'll accept that.

Even one or two years ago, models used to output complete slop when the difficulty went up even slightly. So it's natural that many people don't accept that these models can reach such a high threshold. They believe there's a wall, a very hard limit on how much intelligence we can get out of these models. I was part of this group.

Earlier this year the Fable models were introduced. Slightly before that, companies like Anthropic and OpenAI were all still very doomer. They said a lot about AI safety, especially around Mythos. Anthropic said it wasn't going to release the model publicly because it was too unsafe, and did [Project Glasswing](https://www.anthropic.com/glasswing) instead.

I'm ashamed to say this, but at some point I believed this was hype. This was marketing. I didn't understand LLMs at that point. This is hard for me to accept, and I don't know if it's the right thing to do, but I think setting up the context and admitting I was part of this group before patronizing others is the right thing to do.

So yeah, I used to think it was hype and nobody should fucking care about it. They don't want to release it for whatever reason. Maybe it's too expensive. Maybe the model is not as good as it seems, so they want to hide it from people. Or with Project Glasswing they're just trying to get into more companies, to get companies that previously resisted AI to start using it out of fear. Increase their market share, or increase the size of their market.

I was 50% this person. By then I had started to believe it, because Theo Browne, the T3.gg guy, made videos saying this is not hype. The people at these companies are genuinely serious about safety. He didn't think it was hype or snake oil. So I did believe in Anthropic at that point, but not that strongly.

I don't want to put myself in any group, because I never discussed this with anyone. But I also believed that maybe it was overhyped, that the models have a limit or whatever.

Then some insane shit happened. And over time I learned things that led me to believe, very recently to be honest, that these models are superhuman.

## The sentence that made it click

I recently watched [Dario Amodei on the Dwarkesh Podcast](https://www.dwarkesh.com/p/dario-amodei), and this is the actual topic of this post. He said one very beautiful thing that made it click for me why next-token prediction works as well as it does. From the [language section, starting at 15:57](https://www.youtube.com/watch?v=Nlkk3glap_U&t=957s):

> I think this whole idea of the next word prediction, that you could do self supervised learning, together with the idea that there's so much richness and structure there for predicting the next word. It might say two plus two equals and you have to know the answer is four. It might be telling the story about a character.

> Basically, it's posing to the model the equivalent of these developmental tests that get posed to children. Mary walks into the room and puts an item in there and then Chuck walks into the room and removes the item and Mary doesn't see it. What does Mary think?

> To get this right in the service of predicting the next word the models are going to have to solve all these theory of mind problems, solve all these math problems. And so my thinking was just, well, you scale it up as much as you can. There's kind of no limit to it.

In the process of predicting the next token, the model has to learn grammar, it has to learn facts, and it has to solve all these problems: anaphora, NLP problems, theory of mind problems.

Next-token prediction is almost like unsupervised learning to me. I know it's technically supervised, or self-supervised, whatever. But it feels unsupervised. It's like: just learn whatever the fuck you can.

And that's why next-token prediction is such a fundamental task. Almost no LLM created to date deviates from it, no matter how big it gets, because it's a very feasible task. It's what is possible.

## Architecture and data

Here's why I think next-token prediction is the optimal thing.

There is a neural network, and there is data. The neural network has to be complex enough to fit the data. Models before LLMs, before GPT or BERT, were underfitting. They simply didn't have enough complexity or the right architecture to capture the underlying representations in the data.

And we had tons upon tons of data. But the model wasn't sophisticated enough, or we didn't train it for long enough, to actually see the emergent capabilities or the scaling laws.

Then at some point we stumbled upon the architecture that works: the transformer. And there is such good scaling of intelligence with respect to the amount of data, the amount of compute, and the number of parameters.

That's why next-token prediction works. You just pick up anything and everything you can find on the internet, because the scaling laws are dictated by the number of parameters, the amount of training, and the amount of data. So you need to collect all the data you can find. More is almost never bad when training an LLM.

You collect vast amounts of unstructured data, which may or may not make sense. But most of the text produced by humans does make sense. It encodes at least something about humans or about the world.

Even a very stupid, inconsequential-feeling Twitter post:

> My cat pooped today.

You might say, what the fuck is it going to learn from this? But somewhere in its latent space, its internal representation, it will learn something. Let's say this is the first sentence the LLM ever sees, and it doesn't know what a cat is yet. It will still learn that the token "cat" has something to do with the token "poop". And the word "steel" usually does not have a lot to do with poop.

That's the anything-and-everything philosophy of training LLMs. It's why the data requirements are what they are, why pretraining is important, and why next-token prediction is important. From hundreds of billions upon hundreds of billions of tokens, if the architecture is complex enough, it will learn pretty much anything that's encoded in the text. If text can sufficiently describe the world in a 3D sense, it will learn the 3D world as well. It doesn't matter what's in the text. As long as the architecture has enough capacity to learn it, it will learn it.

As Ilya Sutskever once said, at least the way Dario recalls it in the same interview:

> Look. The models, they just want to learn. You have to understand this. The models, they just want to learn.

We just have to give them the right tools, the right environment, the right data.

## Pretraining is mechanical

So the data is there. The other thing is training. Next-token prediction is one of the most parallelizable tasks there is.

RL is also very parallelizable, but it requires the model to have a sandbox of its own and do stuff in that sandbox, the RL environment. That isn't parallelizable to the same degree as pretraining. With pretraining you can pick out every single random-ass GPU you have and make sure it's at least contributing a little to the process.

I don't know, pretraining just seems like a more fundamental operation. It feels more basic. It's rigid. There's not a lot of uncertainty in it. In RL, one turn can go longer, another can go shorter. There are no bounding boxes on it, kind of, so it's a little unpredictable.

Pretraining is just mechanical. Pick a million tokens, give them to the LLM, compute the error, compute the gradients, backpropagate. Give it another million random tokens, compute the error, backpropagate. You get the point. Pretraining is very mechanical and steady.

And as the scaling laws dictate, throw as much data, as much compute, and as many parameters as you can at it. Parameters are limited by the GPU, and compute is also limited by the GPU. So pretraining being such a mechanical, understandable task makes it simple, and it makes very efficient use of compute.

That's why I think next-token prediction is really good.

## Watch the whole thing

A lot of what these companies talk about now is safety, safety, safety. But for somebody who wants to understand the fundamentals, [that entire podcast](https://www.youtube.com/watch?v=Nlkk3glap_U) was genuinely gold. I'm not hyping it. It was just a good video. The Ilya quote is from the same video too.

The line about having to solve all these NLP problems and theory of mind problems just to predict the next token stuck with me, and that's why I'm writing this.

Over the past few days I've started exploring more content made by people who actually work at these labs. I don't know if that's a progression on my end, or if people were more open earlier. Maybe I've just started exploring the right bubbles.

But the point I want to drive home, and I don't know how to put it into words, is that as humanity, we need to share more with each other. The people working on these systems: I love that they're very transparent about it. This is how it should be, and they're doing the right thing.

And if anyone feels pressure from their company not to share this stuff, they should know they are in the right. They're on the right side, not the other way around.

That's all.
