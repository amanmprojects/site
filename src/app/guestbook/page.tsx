"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Content, SectionHeading } from "@/components/Content";
import { site } from "@/lib/site";

type Entry = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};

const STORAGE_KEY = "aman-portfolio-guestbook";

const seed: Entry[] = [
  {
    id: "seed-1",
    name: "Alex",
    message: "Clean site. Love the paper aesthetic.",
    createdAt: "2026-03-12T10:00:00.000Z",
  },
  {
    id: "seed-2",
    name: "Priya",
    message: "Ship more writing — looking forward to it.",
    createdAt: "2026-02-28T14:30:00.000Z",
  },
];

export default function GuestbookPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setEntries(JSON.parse(raw) as Entry[]);
      } else {
        setEntries(seed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      }
    } catch {
      setEntries(seed);
    }
    setReady(true);
  }, []);

  function persist(next: Entry[]) {
    setEntries(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore quota errors
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedMessage = message.trim();
    if (!trimmedName || !trimmedMessage) return;

    const entry: Entry = {
      id: `${Date.now()}`,
      name: trimmedName.slice(0, 40),
      message: trimmedMessage.slice(0, 280),
      createdAt: new Date().toISOString(),
    };

    persist([entry, ...entries]);
    setName("");
    setMessage("");
  }

  return (
    <Content>
      <p className="font-medium text-mute">{site.name}</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
        Guestbook
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-mute">
        Leave a note. Say hi, share feedback, or just mark that you were here.
      </p>

      <section className="mt-10">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium text-mute"
            >
              Name
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              placeholder="Your name"
              className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-ink outline-none transition placeholder:text-mute/70 focus:border-blue focus:ring-2 focus:ring-blue/15"
              required
            />
          </div>
          <div>
            <label
              htmlFor="message"
              className="mb-1.5 block text-sm font-medium text-mute"
            >
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={280}
              rows={3}
              placeholder="Write something nice…"
              className="w-full resize-y rounded-lg border border-line bg-white px-3 py-2.5 text-ink outline-none transition placeholder:text-mute/70 focus:border-blue focus:ring-2 focus:ring-blue/15"
              required
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center rounded-lg bg-blue px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2558e0] active:scale-[0.98]"
          >
            Sign guestbook
          </button>
        </form>
        <p className="mt-3 text-xs text-mute">
          Messages are stored in your browser for this demo. Hook up a database
          for a real guestbook.
        </p>
      </section>

      <section className="mt-14">
        <SectionHeading>Recent notes</SectionHeading>
        {!ready ? (
          <p className="mt-4 text-sm text-mute">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="mt-4 text-sm text-mute">No notes yet. Be the first.</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="rounded-xl border border-line bg-white/60 px-4 py-3.5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="font-medium text-ink">{entry.name}</span>
                  <time className="text-xs text-mute">
                    {new Date(entry.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                </div>
                <p className="mt-1.5 leading-relaxed text-ink/90">
                  {entry.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="mt-14 text-sm text-mute">
        <Link href="/" className="u">
          ← back home
        </Link>
      </footer>
    </Content>
  );
}
