---
title: "Checkpoint: half the team is in Ladakh"
date: "2026-11-08"
excerpt: "A big remote machine, a stack of Claude accounts, fewer access blockers, and an internship that is starting to feel worth it again."
---

Another check-in. A few days ago about half my team left for a trip to Ladakh, and that half includes most of the team's biggest token burners. So for now I have two or three Claude Max 20x accounts to burn through myself. I also got a Google AI Ultra 5x plan for my council skill.

## Working on a machine that isn't mine

All of this runs on a work VM, not my laptop. It's a big machine: 128 GB of memory and 32 cores, and it already hosts a lot of the company's internal tooling. When the machine is that big, everything runs fast. Pair that with billions of tokens and it's a very good place to work.

I can start jobs at night and wake up to them finished. I can work from home too, and since no data lives on my laptop, that's safe.

After this, I can't recommend local development to anyone.

The one bad part is SSH. The server is in the US and I'm in India, and running a terminal UI over that link feels like cloud gaming: every scroll goes to the server and waits for it to send back the new screen. It's like GeForce Now. It works, but it's never quite the same.

## T3 Code

So I stopped doing that and use [T3 Code](https://github.com/pingdotgg/t3code) instead, and it's the icing on the cake. Because the agents run asynchronously on the server and only the app runs on my machine, there's no lag between me and what I'm reading. I forget the work isn't happening on my machine.

But fixing SSH is the least of it. The whole app is built for long-running, asynchronous agent work, which is exactly how I work now:

- **Threads that settle.** A thread is one task. When it's done it settles out of the way onto a shelf, and you can pin, snooze, or drag threads between sections. With a dozen agents running, the sidebar is the difference between managing them and losing track of them.
- **The composer.** Rich Markdown as you type, up to 100 attachments per message, and huge pastes turn into file attachments instead of flooding the model's context.
- **Git built in.** New threads can get their own worktree and branch. Each turn's diff shows only that turn's own work, you can step through commits one at a time, and pull requests open right inside the app. It works with GitHub, GitLab and a bunch of other hosts.
- **Secrets.** Credentials can stay in 1Password with T3 Code saving only a reference, and when an agent needs a secret it asks for it in a private card instead of in the chat.
- **Multiple environments.** My laptop, the work VM, and anything else running the T3 Code server all show up in one app, and a thread can start on whichever machine has the project. Moving between them is so seamless it's unbelievable.
- **Any harness.** It drives Claude Code, Codex, Cursor, OpenCode, Grok Build, Antigravity and more, with your existing subscriptions.

And then there's Orchestrator V2, which is unbelievably good. T3 Code exposes its orchestration as an MCP server, so an agent in one thread can spin up sub-agents on any provider, wait for their results, start and message other threads, and schedule recurring work. Claude can hand a review to Codex and get the answer back in the same turn. Agents outside T3 Code can connect to it too.

A few months ago I would have called T3 Code yet another UI, a Codex clone. Now the Codex app doesn't come close to what T3 Code does. I won't pretend I never doubted it, but I was wrong, and I appreciate the work that went into it. To put it lightly, it has taste, really good taste, and that's what matters.

I'd recommend it to anyone doing any kind of agentic work, whether that's in Claude Code, Codex, Antigravity, or even Muse Code or OpenCode for those people.

I genuinely struggle to find even one problem with the workflow. What Theo Browne and his team, especially Julius Marminge, have built is unbelievably good. I'd love to make a video about it, but I have neither the time nor any content creation experience.

## Access, and agents waiting on you

I'm new, so with half the team away, the person holding most of the access is a teammate who has been really chill about it, and we get along well now. I've been given a lot more access: GitLab, servers, the things I kept getting blocked on.

That matters more than it sounds. I do most of my work through agents, and the biggest inefficiency in agentic work isn't knowledge or confidence. It's your agents waiting for you. An access blocker is the worst version of that, because it makes you second-guess yourself before starting anything ambitious.

And ambitious is where these models are at their best. Using Claude for small changes (change this file, tweak this feature, try this, try that) gets annoying fast. The best experience I've had is handing it tasks so large that someone outside this world would say it's too big for AI and will obviously fail. It doesn't. Opus 5.5 will blow you away.

So try things you believe it can't do. If you actually find one, kudos, whatever you're working on is wild.

## Starting to feel worth it

Early on I was starting to regret joining. It's starting to feel worth it again.

Yesterday I also had a great conversation with a friend who is really good with girls. And I mean REALLY good with girls. iykyk. I'd been looking for a long time for someone who moves in those circles. What I learned from him felt like discovering a new world. An insane amount of alpha, and I really appreciate him sharing it. Thanks.

My most ambitious runs so far happened today. More on those next time, once I've reviewed them.
