---
title: "A week of my Claude Code sessions in Grafana"
date: "2026-11-10"
excerpt: "15 billion tokens, 46 swear words, and grep as Claude's favorite command: what a week of agent logs looks like on a dashboard."
---

Claude Code keeps every session as a log on disk. I collected all of them from the work VM, stored them in ClickHouse, and built two Grafana dashboards on top: one for usage, and one that reads the conversations themselves.

The VM was mostly a teammate's until November 3rd, when I got access, so everything here starts from that day. It's a week of me.

## Usage

![Tokens processed 15.4 billion, output tokens 55.4 million, cache hit rate 97.0%, 177 sessions, 64.8K requests to Claude](/images/claude-code-dashboard/usage-stats.png)

15.4 billion tokens in a week, but only 55.4 million of them are output. Almost everything else is cache reads, the same context read back on every turn, which is why the cache hit rate sits at 97%.

![Tokens per day by model from November 4 to November 8, almost all Opus 5.5, with two days above 5 billion](/images/claude-code-dashboard/tokens-per-day.png)

Almost all of it is Opus 5.5. Two days crossed 5 billion.

![Most-used tools: Bash 60.8K, Read 2.86K, Write 1.76K, Edit 343, then T3 Code's tools for background waits, thread reads and sends, pull request watches and delegated tasks](/images/claude-code-dashboard/tools.png)

Claude's most-used tool by far is Bash, at 60.8K calls, against 2.9K reads and 343 edits. Right below them are T3 Code's tools: waiting on background work, reading and messaging other threads, watching pull requests, and 109 delegated tasks. Sub-agents alone used 7 of the 15 billion tokens.

![Messages per day, typed by me versus sent by agents. Agents send most of the messages, and on November 8 almost all of them](/images/claude-code-dashboard/messages-per-day.png)

On the busiest day, agents sent almost three times as many messages as I typed. On November 8 I typed about 20 and they sent nearly 300.

## Insights

The second dashboard has Haiku read each session and label it: what kind of work it was, whether it got done, how frustrated I was, and a short summary.

![Sessions analysed 166, got it done 74%, average frustration 1.6 out of 10, swear words 46, stops you hit 28, command errors 1.3%](/images/claude-code-dashboard/insights-stats.png)

74% of sessions got the job done, and my average frustration is 1.6 out of 10. Then there are the swear words. Across two months of everyone's sessions on this VM, the dashboard counted 48. 46 of them are mine, from one week.

![Heatmap of when I typed messages, by hour and weekday, busiest in the afternoon and evening, and a chart of frustration by day](/images/claude-code-dashboard/when-and-mood.png)

Nothing between 3 and 9 in the morning. The busiest hour of the week was 9 PM on Saturday.

![Commands Claude runs most: grep 12.8K, sed 11.8K, cat 7.9K, python3 6.62K, git 4.71K](/images/claude-code-dashboard/commands.png)

Inside Bash, Claude reaches for grep and sed more than anything else. It works the way a person in a terminal does.

The journal of session summaries has its moments. This one made me laugh:

![Session journal: a council test where Claude named itself Claude Opus 5.5 although the session metadata says Haiku 5.5](/images/claude-code-dashboard/journal.png)

A session running on Haiku 5.5 was asked for its model name and said Opus 5.5. The dashboard caught it and flagged the mismatch.

## What's next

The Haiku analysis stopped after November 7th and isn't running on new sessions. I still have to decide whether to keep using Haiku on the subscription for it or move to something else.
