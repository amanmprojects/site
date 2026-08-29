export const site = {
  name: "Aman Mehtar",
  title: "Aman Mehtar",
  url: "https://site-mauve-seven-85.vercel.app",
  description:
    "Engineering student in Artificial Intelligence & Data Science. Building agents, tools, and full-stack products.",
  headline: {
    before: "I love",
    highlight1: "AI & systems",
    middle: "and",
    highlight2: "shipping tools",
    after: ".",
  },
  bio: {
    role: "Engineering student in AI & Data Science",
    focus: "agents, full-stack apps, and developer tools",
    extra:
      "Based in India. I want to be someone great — so I build, break, and ship.",
  },
  email: null as string | null,
  socials: {
    github: "https://github.com/amanmprojects",
    twitter: "https://x.com/Amanm10000",
    linkedin: "https://www.linkedin.com/in/aman-mehtar",
  },
  githubUsername: "amanmprojects",
  story: [
    {
      text: "Engineering student focused on Artificial Intelligence & Data Science.",
      links: [],
    },
    {
      text: "Building in public from India — agents, tools, and full-stack apps.",
      links: [],
    },
    {
      text: "Trained a 101M-param LLM from scratch on a laptop GPU, then a 94M chess model that learned the board from move text alone.",
      links: [
        {
          label: "94M chess model",
          href: "https://github.com/amanmprojects/llm",
        },
      ],
    },
    {
      text: "Shipped a real-time chat app with rooms, DMs, OAuth, and presence.",
      links: [
        {
          label: "chat app",
          href: "https://github.com/amanmprojects/chat-app",
        },
      ],
    },
    {
      text: "Built Minihub — a small self-hosted Git service in Go + React.",
      links: [
        {
          label: "minihub",
          href: "https://github.com/amanmprojects/minihub",
        },
      ],
    },
    {
      text: "Exploring AI coding agents and terminal UX with neo-aman-code.",
      links: [
        {
          label: "neo-aman-code",
          href: "https://github.com/amanmprojects/neo-aman-code",
        },
      ],
    },
    {
      text: "Grinding DSA and LeetCode to sharpen problem-solving.",
      links: [
        { label: "dsa", href: "https://github.com/amanmprojects/dsa" },
      ],
    },
    {
      text: "82+ public repos on GitHub and counting — always shipping something.",
      links: [
        {
          label: "GitHub",
          href: "https://github.com/amanmprojects",
        },
      ],
    },
  ] as StoryItem[],
  // Writing posts live in content/writing/*.md — see src/lib/posts.ts
  projects: [
    {
      name: "quick-gateway",
      description:
        "Self-hosted LiteLLM gateway that translates OpenAI Responses and Anthropic Messages requests for OpenCode Zen models, including tool calls.",
      href: "https://github.com/amanmprojects/quick-gateway",
    },
    {
      name: "Skiller",
      description:
        "Terminal picker for fuzzy-searching skills.sh, previewing skills, and installing them locally or globally from any project.",
      href: "https://github.com/amanmprojects/skiller",
    },
    {
      name: "Files",
      description:
        "Native Linux file explorer built with TypeScript and Vercel Native SDK, compiled ahead of time with no browser or JavaScript runtime.",
      href: "https://github.com/amanmprojects/explorer",
    },
    {
      name: "WisprFlow for Linux",
      description:
        "Hold-to-dictate Linux daemon using whisper.cpp, CUDA, evdev hotkeys, and native Wayland text insertion.",
      href: "https://github.com/amanmprojects/wispr-flow",
    },
    {
      name: "Disk Agent",
      description:
        "Personal AI agent on the Pi SDK with Telegram and CLI chat, persistent memory, cron automations, and browser tools.",
      href: "https://github.com/amanmprojects/disk-agent",
    },
    {
      name: "Chess Bot",
      description:
        "Play a 5.58M-param policy transformer in your browser — PyTorch ported to dependency-free JavaScript, fp16 weights, inference in a Web Worker, no server.",
      href: "https://chess-bot-vercel.vercel.app",
    },
    {
      name: "miniLLM + chessLLM",
      description:
        "A 101M language model trained from scratch on one 8GB laptop GPU, and a 94M chess model that builds an internal board — linearly probeable at 85.6% — from move text alone.",
      href: "https://github.com/amanmprojects/llm",
    },
    {
      name: "Luna Eye",
      description:
        "Pi extension that gives text-only models vision through a configurable eye model, with image caching and context-safe fallbacks.",
      href: "https://github.com/amanmprojects/lunaeye",
    },
    {
      name: "llm-bench",
      description:
        "OpenTUI benchmark for LLM endpoints covering TTFT, throughput, prompt caching, tool latency, token usage, and cost.",
      href: "https://github.com/amanmprojects/llm-endpoint-bench",
    },
    {
      name: "Phish",
      description:
        "Hackathon prototype: paste a suspicious email/SMS, get a risk score, red flags, and one safe next action — powered by an agent + web search.",
      href: "https://github.com/amanmprojects/phish",
    },
    {
      name: "neo-aman-code",
      description:
        "Terminal AI coding assistant with a rich TUI — chat, tools, and multi-step reasoning via the Vercel AI SDK.",
      href: "https://github.com/amanmprojects/neo-aman-code",
    },
    {
      name: "Minihub",
      description:
        "Self-hosted Git service: Go backend, React frontend, bare repos on disk, real git clone/fetch/push over HTTP.",
      href: "https://github.com/amanmprojects/minihub",
    },
    {
      name: "Chat App",
      description:
        "Real-time chat with rooms, DMs, OAuth, typing indicators, reactions, and search. Convex + React.",
      href: "https://github.com/amanmprojects/chat-app",
    },
    {
      name: "gtu — Grok Token Tracker",
      description:
        "Local tracker for Grok / Composer token usage from Grok Build and pi agent sessions.",
      href: "https://github.com/amanmprojects/grok-token-tracker",
    },
    {
      name: "DSA",
      description:
        "LeetCode solutions and interview prep practice, tracked with LeetHub.",
      href: "https://github.com/amanmprojects/dsa",
    },
    {
      name: "psi-agent",
      description: "Python agent experiments and tooling for AI workflows.",
      href: "https://github.com/amanmprojects/psi-agent",
    },
    {
      name: "search",
      description:
        "Full-stack search app on Convex + Next.js with Convex Auth.",
      href: "https://github.com/amanmprojects/search",
    },
  ],
  footerNote: "(yes, I still ship side projects)",
};

export type StoryItem = {
  text: string;
  links?: { label: string; href: string }[];
};

export type Project = (typeof site.projects)[number];
