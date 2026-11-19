export const site = {
  name: "Aman Mehtar",
  title: "Aman Mehtar",
  url: "https://aman-on-bits.vercel.app",
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
    instagram: "https://www.instagram.com/amanm123_",
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
      links: [{ label: "dsa", href: "https://github.com/amanmprojects/dsa" }],
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
  // Writing posts live in content/writing/*.md, projects in src/lib/projects.ts
  footerNote: "(yes, I still ship side projects)",
};

export type StoryItem = {
  text: string;
  links?: { label: string; href: string }[];
};

