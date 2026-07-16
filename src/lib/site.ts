export const site = {
  name: "Aman Mehtar",
  title: "Aman Mehtar",
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
    twitter: null as string | null,
    linkedin: null as string | null,
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
      text: "Shipped a real-time chat app with rooms, DMs, OAuth, and presence.",
      links: [
        {
          label: "chat-app",
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
      text: "58+ public repos and counting — always shipping something.",
      links: [
        {
          label: "GitHub",
          href: "https://github.com/amanmprojects",
        },
      ],
    },
  ] as StoryItem[],
  // Add posts here when you're ready:
  // { title: "...", date: "Mon YYYY", href: "/writing/slug", excerpt: "..." }
  writing: [] as WritingPost[],
  projects: [
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

export type WritingPost = {
  title: string;
  date: string;
  href: string;
  excerpt: string;
};

export type Project = (typeof site.projects)[number];
