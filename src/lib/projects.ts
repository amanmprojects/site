/**
 * Projects shown on /stuff and the home page. Each one gets a page at
 * /stuff/<slug> with its stats, screenshots, "How it works" and architecture.
 * Projects with a showcase (src/components/projects/showcases.tsx) also get
 * charts drawn from real training logs and posts.
 *
 * Facts here come from each repo's README, source and reports. Keep every
 * number traceable to one of those.
 */

import type { FlowStage } from "@/components/charts/Pipeline";

export const projectGroups = [
  "Models",
  "Games & graphics",
  "Linux & hardware",
  "Agent tools",
  "Web apps & research",
] as const;

export type ProjectGroup = (typeof projectGroups)[number];

export type ProjectStat = {
  value: string;
  label: string;
};

export type Screenshot = {
  /** Under /public, e.g. /images/stuff/<slug>/name.webp */
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
};

export type Project = {
  slug: string;
  name: string;
  /** One line, shown on cards */
  tagline: string;
  /** A short paragraph, shown at the top of the project page */
  description: string;
  group: ProjectGroup;
  /** Month it started, "YYYY-MM" */
  started: string;
  stack: string[];
  repo?: string;
  live?: string;
  /** Other links, e.g. a training repo next to the app repo */
  links?: { label: string; href: string }[];
  /** Slugs of posts in content/writing about this project */
  posts?: string[];
  /** The first stat is the card's headline number */
  stats?: ProjectStat[];
  screenshots?: Screenshot[];
  /** "How it works", one string per paragraph */
  howItWorks: string[];
  architecture: { caption?: string; stages: FlowStage[] };
  /** Credit for shared work: team projects, forks */
  credit?: string;
  featured?: boolean;
};

export const projects: Project[] = [
  // ── Models ────────────────────────────────────────────────────────────
  {
    slug: "minillm-chessllm",
    name: "miniLLM + chessLLM",
    tagline: "Language models trained from scratch on a laptop GPU.",
    description:
      "A 101M-parameter language model trained from random initialization on one 8 GB laptop GPU, and a 94M chess model that learned to track the board from move text alone. A linear probe reads the board out of it at 85.6%.",
    group: "Models",
    started: "2026-08",
    stack: ["PyTorch", "Muon", "FineWeb-Edu", "Lichess", "Stockfish"],
    repo: "https://github.com/amanmprojects/llm",
    links: [{ label: "sprout, the 32.5M follow-up", href: "https://github.com/amanmprojects/sprout" }],
    posts: [
      "minillm-101m-laptop",
      "chessllm-world-model",
      "chess-two-ways",
      "minillm-214m-quota-postmortem",
    ],
    stats: [
      { value: "85.6%", label: "of squares read back by a linear probe" },
      { value: "101M", label: "parameters, trained in 12.4 hours" },
      { value: "1.2B", label: "tokens on one 8 GB laptop GPU" },
      { value: "2.7×", label: "lower perplexity with Muon than AdamW" },
    ],
    howItWorks: [
      "One model file with presets and one training loop, pointed at two datasets. The model is Llama-shaped: RMSNorm, RoPE, SwiGLU, grouped-query attention with 12 query and 4 key/value heads, QK-norm and tied embeddings. The text model has 12 layers and a 32,768-token vocabulary. The chess model uses a 40-character vocabulary, which frees enough parameters for 15 layers.",
      "Training uses Muon on the weight matrices and AdamW on everything else. The loop takes a wall-clock budget, measures throughput, and sizes a warmup-stable-decay schedule so the run ends on time. It also finds the largest batch that fits and writes atomic checkpoints every 20 minutes.",
      "For chess, I keep Lichess games where both players are rated 1800+ and write moves as plain characters, so any legal move is always in vocabulary. Then I measure three things: how often it plays legal moves, its Elo against Stockfish, and whether a linear probe on layer 10 can read every square of the board from its activations.",
      "Later I trained sprout, a smaller 32.5M story model, the same way: 1.66B tokens of TinyStories in seven hours on the same laptop, best validation loss 1.410.",
    ],
    architecture: {
      stages: [
        {
          nodes: [
            { title: "FineWeb-Edu", detail: "32,768-token BPE" },
            { title: "Lichess games", detail: "1800+ players, 40 characters" },
          ],
        },
        { edge: "token bins", nodes: [{ title: "model.py presets", detail: "GQA, RoPE, QK-norm, SwiGLU" }] },
        {
          edge: "Muon + AdamW, WSD schedule",
          nodes: [{ title: "train.py", detail: "wall-clock budget, auto batch, resume", accent: true }],
        },
        {
          edge: "checkpoints",
          nodes: [
            { title: "miniLLM", detail: "12 layers" },
            { title: "chessLLM", detail: "15 layers" },
          ],
        },
        {
          edge: "evaluate",
          nodes: [
            { title: "Facts + decoding", detail: "fact ranking, sampling sweep" },
            { title: "Chess evals", detail: "legality, Stockfish, board probe" },
          ],
        },
      ],
    },
    featured: true,
  },
  {
    slug: "fim-coder",
    name: "fim-coder",
    tagline: "A 113M code autocomplete model trained for $16.",
    description:
      "A fill-in-the-middle code model trained from scratch on code written in 2024 or later, on four rented L4 GPUs. It runs in Neovim through llama.cpp.",
    group: "Models",
    started: "2026-08",
    stack: ["PyTorch", "Modal", "llama.cpp", "Neovim"],
    repo: "https://github.com/aman-mehtar/fim-coder",
    posts: ["fimcoder-113m"],
    stats: [
      { value: "$16.40", label: "total training cost" },
      { value: "1.4B", label: "tokens in 4.6 hours on 4× L4" },
      { value: "113M", label: "parameters" },
      { value: "11.3%", label: "first-line exact match" },
    ],
    howItWorks: [
      "The data is only code dated 2024-01-01 or later, across 198 languages. I trained a 32,768-token tokenizer with fill-in-the-middle markers, then mixed the training documents: 41% single-file infill, 29% repo-level infill and 30% plain code. Infill spans are cut at character positions, because a real cursor sits in the middle of a token.",
      "The model is a 14-layer Llama-style transformer. It trained on four L4 GPUs on Modal at a 2,048 context for the first 75% of steps and 4,096 for the decay. A $0.25 rehearsal run checked the phase switch, checkpointing, resume and export before I spent the real budget.",
      "It is weak as an autocomplete. The interesting result is that it finds 2024+ code 15.6% more predictable than pre-2023 code, against 11.0% for Qwen2.5-Coder-0.5B, which I attribute to the fresh data.",
    ],
    architecture: {
      stages: [
        { nodes: [{ title: "The Stack v3", detail: "files dated 2024 or later" }] },
        {
          edge: "prepare on Modal",
          nodes: [
            { title: "32k BPE", detail: "infill markers" },
            { title: "Training mix", detail: "41% file, 29% repo, 30% plain" },
          ],
        },
        {
          edge: "4× L4",
          nodes: [{ title: "113M Llama model", detail: "14 layers, 2,048 → 4,096 context", accent: true }],
        },
        {
          edge: "export + evaluate",
          nodes: [
            { title: "GGUF q8_0", detail: "116 MB, llama-server" },
            { title: "Evals", detail: "infill match, fresh vs old code" },
          ],
        },
        { nodes: [{ title: "Neovim", detail: "minuet-ai.nvim" }] },
      ],
    },
    featured: true,
  },
  {
    slug: "chess-bot",
    name: "Chess Bot",
    tagline: "A chess transformer you can play in the browser.",
    description:
      "Two chess transformers trained on Lichess games, ported to plain JavaScript and served as static files. You play them in the browser with no server, next to a classic search engine.",
    group: "Models",
    started: "2026-08",
    stack: ["PyTorch", "Modal", "Stockfish", "JavaScript", "Web Workers"],
    repo: "https://github.com/amanmprojects/chess-bot-vercel",
    live: "https://chess-bot-vercel.vercel.app",
    links: [
      { label: "Training repo", href: "https://github.com/amanmprojects/chess-bot" },
      { label: "Search engine", href: "https://github.com/amanmprojects/chess" },
    ],
    posts: ["chess-two-ways"],
    stats: [
      { value: "100%", label: "legal moves, by construction" },
      { value: "51.1%", label: "top-1 move match, larger model" },
      { value: "~0.4 s", label: "per move, in the browser" },
      { value: "12.5M", label: "positions, labelled by Stockfish" },
    ],
    screenshots: [
      {
        src: "/images/stuff/chess-bot/game.webp",
        alt: "A chess game against the neural net after 1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6, with the move list and evaluation bar",
        width: 1200,
        height: 960,
        caption: "Three moves in against the 5.6M net. It answered the Italian with the Two Knights.",
      },
    ],
    howItWorks: [
      "Each position is 64 squares plus 3 tokens for side to move, castling and en passant, fed through a transformer. The policy head scores 73 move types per square, 4,672 slots in all, and illegal moves are masked out, so it can never play one. A value head scores the position.",
      "The first model, 5.58M parameters on 2.6M positions, reached 43.2% top-1 and started overfitting. For the second I moved data prep to Modal: 12.5M positions from a 150 GB game dump, each labelled by Stockfish. With 9.92M parameters, top-1 rose to 51.1%.",
      "Vercel has no Python, so I ported the network instead of hosting it. Weights are exported as fp16 blobs (11.2 MB and 19.8 MB), and a line-for-line JavaScript forward pass runs in a Web Worker. Golden tests check that the browser picks the same move and value as PyTorch on fixed positions. The other levels use my alpha-beta engine, whose move generator is verified against 7 standard perft positions.",
    ],
    architecture: {
      stages: [
        { nodes: [{ title: "Lichess games", detail: "1800+ players, no bullet" }] },
        {
          edge: "prepare (Modal)",
          nodes: [
            { title: "69-byte records", detail: "squares, move slot, result" },
            { title: "Stockfish labels", detail: "12.57M positions" },
          ],
        },
        {
          edge: "train",
          nodes: [{ title: "ChessNet", detail: "67 tokens → 4,672 moves + value", accent: true }],
        },
        {
          edge: "export fp16",
          nodes: [
            { title: "nn.js", detail: "JS forward pass, parity-tested" },
            { title: "ai.js", detail: "alpha-beta levels" },
          ],
        },
        { edge: "Web Worker", nodes: [{ title: "Browser board", detail: "no server" }] },
      ],
    },
    featured: true,
  },
  {
    slug: "amazon-ml-pricing",
    name: "Amazon ML price prediction",
    tagline: "Qwen turned into a price predictor with 4-bit LoRA.",
    description:
      "Amazon ML Challenge 2025: predict a product's price from its catalog listing. A 4-bit LoRA on Qwen3.5-2B with a nine-quantile head, trained on an 8 GB laptop GPU.",
    group: "Models",
    started: "2026-09",
    stack: ["Qwen3.5-2B", "LoRA", "bitsandbytes", "PyTorch"],
    repo: "https://github.com/amanmprojects/amzn-ml-2025-pricing",
    posts: ["amazon-pricing-qwen-lora"],
    stats: [
      { value: "44.11", label: "validation SMAPE, from a 68.83 baseline" },
      { value: "33.66M", label: "trainable parameters, 1.7% of the model" },
      { value: "~704", label: "tokens per second on 8 GB" },
    ],
    howItWorks: [
      "I parse each listing and normalize its units and quantities, then split train and validation by product title, so near-duplicates can't land on both sides. The best non-ML baseline, a median price per unit and quantity bucket, scores 68.83 SMAPE.",
      "Qwen3.5-2B loads in 4-bit, with its language-model head removed. Its last hidden state goes into a regression head that predicts 9 quantiles of log price, kept in order by building each one as a softplus step above the last. LoRA targets are read from the module tree, since Qwen3.5 mixes linear and softmax attention layers.",
      "At prediction time I pick the point in the quantile fan that minimizes expected SMAPE, then apply one calibration multiplier. One epoch over 69k rows takes about four hours in 5.7–5.9 GB of memory.",
    ],
    architecture: {
      stages: [
        { nodes: [{ title: "Catalog text", detail: "75k listings" }] },
        { edge: "parse", nodes: [{ title: "Units + quantities", detail: "grouped train/val split" }] },
        {
          edge: "tokenize, 288-token cap",
          nodes: [{ title: "Qwen3.5-2B", detail: "4-bit NF4, LoRA r=32", accent: true }],
        },
        { edge: "pooled hidden state", nodes: [{ title: "9-quantile head", detail: "log price, pinball loss" }] },
        { edge: "decode", nodes: [{ title: "SMAPE-optimal price", detail: "× one calibration factor" }] },
      ],
    },
    featured: true,
  },

  // ── Games & graphics ──────────────────────────────────────────────────
  {
    slug: "forge",
    name: "Forge",
    tagline: "A 2D game engine in C++, with five games.",
    description:
      "A C++20 2D game engine whose only system dependencies are SDL3 and OpenGL. It ships ten example programs, and five of them are games that also build to WebAssembly and play in the browser.",
    group: "Games & graphics",
    started: "2026-10",
    stack: ["C++20", "SDL3", "OpenGL", "Emscripten", "miniaudio"],
    repo: "https://github.com/amanmprojects/forge-ge",
    live: "https://amanmprojects.github.io/forge-ge/",
    stats: [
      { value: "10,000", label: "sprites at 144 fps in 2 draw calls" },
      { value: "5", label: "games playable in the browser" },
      { value: "10", label: "example programs" },
      { value: "2", label: "system dependencies" },
    ],
    screenshots: [
      {
        src: "/images/stuff/forge/breakout.webp",
        alt: "Breakout: rows of colored bricks, a ball with a motion trail and the paddle, with score and level at the top",
        width: 1024,
        height: 768,
        caption: "Breakout, captured by the engine's own autopilot recorder.",
      },
      {
        src: "/images/stuff/forge/lantern.webp",
        alt: "Lantern: a dark tilemap lit by glowing blue lanterns, with score and lantern count",
        width: 1280,
        height: 768,
        caption: "Lantern, a small game built to exercise the lighting and tilemap systems.",
      },
      {
        src: "/images/stuff/forge/chess.webp",
        alt: "Forge Chess: two bots mid-game with a move list, evaluation bar and level picker",
        width: 1280,
        height: 800,
        caption: "Forge Chess, bot against bot. It is a C++ port of my JavaScript engine, checked against the same perft counts.",
      },
    ],
    howItWorks: [
      "One static library behind one header. The Engine owns the window, input, timing, sprite batch, audio and assets. The other systems stand on their own: lighting and post-processing, tilemaps with slopes, a physics world with a spatial-hash broadphase and joints, an ECS with JSON save and load, and a small scripting language of my own. The only vendored code is stb and miniaudio.",
      "The sprite batch writes into a preallocated buffer and flushes every 8,192 quads or 16 textures, which draws 10,000 rotating sprites at 144 fps in 2 draw calls.",
      "The games double as tests. With --shot, an autopilot runs a fixed number of 1/60 s steps, renders offscreen, saves a PNG and checks invariants. CI builds on Linux, macOS and Windows, and Emscripten builds the five games for the browser gallery.",
    ],
    architecture: {
      stages: [
        { nodes: [{ title: "Game code", detail: "chess, breakout, snake, lantern…" }] },
        {
          edge: "#include <forge/forge.hpp>",
          nodes: [{ title: "Engine", detail: "loop, window, input, assets", accent: true }],
        },
        {
          nodes: [
            { title: "Graphics", detail: "sprite batch, lights, tilemaps" },
            { title: "Physics + ECS", detail: "spatial hash, sparse sets" },
            { title: "Audio + script", detail: "miniaudio, own interpreter" },
          ],
        },
        {
          nodes: [
            { title: "SDL3 + OpenGL 3.3", detail: "Linux, macOS, Windows" },
            { title: "Emscripten + WebGL2", detail: "browser gallery" },
          ],
        },
      ],
    },
    featured: true,
  },
  {
    slug: "go-mcts",
    name: "Go in one HTML file",
    tagline: "Go with a Monte-Carlo tree search opponent, in one file.",
    description:
      "Go with Chinese rules on 9×9, 13×13 and 19×19 against a Monte-Carlo tree search bot. Everything is one dependency-free HTML file, and the rules are restated and proved in Lean 4.",
    group: "Games & graphics",
    started: "2026-09",
    stack: ["JavaScript", "MCTS", "Lean 4", "Node test harness"],
    repo: "https://github.com/amanmprojects/go-mcts",
    live: "https://go-mcts.vercel.app",
    posts: ["go-one-html-file"],
    stats: [
      { value: "1", label: "HTML file, no dependencies" },
      { value: "112", label: "test assertions on the shipped file" },
      { value: "0.26 ms", label: "per 9×9 playout" },
      { value: "3", label: "board sizes" },
    ],
    screenshots: [
      {
        src: "/images/stuff/go-mcts/self-play.webp",
        alt: "A 9×9 Go board early in a game where the bot plays both sides, with the move list",
        width: 970,
        height: 850,
        caption: "The bot playing both sides on 9×9.",
      },
    ],
    howItWorks: [
      "The rules engine covers captures, the suicide ban, ko and positional superko, area scoring with editable komi, handicap stones, seki and SGF export.",
      "The bot runs a tree search on a time budget of 0.7, 2.2 or 6 seconds and keeps its tree between moves. Purely random playouts are noise, so each playout step samples 4 empty points and scores them: filling your own eye is −400, self-atari −200, saving a group in atari +440. Below −120 it passes, which stops playouts from running to the move cap.",
      "A small harness stubs the DOM and loads the real go.html in Node, so the 112 assertions test the shipped file and not a copy. The Lean version proves that stones, territory and neutral points always add up to the board size.",
    ],
    architecture: {
      stages: [
        { nodes: [{ title: "go.html UI", detail: "9/13/19 boards, review, SGF" }] },
        {
          edge: "bot's turn",
          nodes: [{ title: "Tree search (UCT)", detail: "time budget, tree reused", accent: true }],
        },
        { edge: "from each new leaf", nodes: [{ title: "Playout policy", detail: "best of 4 sampled points" }] },
        { nodes: [{ title: "Rules kernel", detail: "captures, superko, area scoring" }] },
        {
          edge: "checked by",
          nodes: [
            { title: "test.js", detail: "112 assertions in Node" },
            { title: "Lean 4", detail: "rules restated and proved" },
          ],
        },
      ],
    },
    featured: true,
  },
  {
    slug: "site3d",
    name: "Orbital portfolio",
    tagline: "Fly a spaceship between planets to see my projects.",
    description:
      "A 3D portfolio where you pilot a ship through a solar system. Each planet is a project, and flying close opens its panel with its GitHub stats.",
    group: "Games & graphics",
    started: "2026-08",
    stack: ["React Three Fiber", "three.js", "Next.js", "Zustand", "Web Audio"],
    repo: "https://github.com/amanmprojects/site3d",
    live: "https://site3d-six.vercel.app",
    posts: ["august-wrapped"],
    stats: [
      { value: "2.4M", label: "stars in the starfield, at most" },
      { value: "12", label: "project planets" },
      { value: "0", label: "audio files, every sound is synthesized" },
    ],
    screenshots: [
      {
        src: "/images/stuff/site3d/flight.webp",
        alt: "The ship flying towards the sun through a dense starfield, with a radar in the corner",
        width: 1200,
        height: 750,
        caption: "In flight, heading for the sun, with the radar in the top right.",
      },
      {
        src: "/images/stuff/site3d/launch.webp",
        alt: "The launch screen with flight controls and a grid of projects to autopilot to",
        width: 1200,
        height: 750,
      },
    ],
    howItWorks: [
      "Twelve project planets share one model, made different by per-planet tints, atmosphere halos, glow and rings. At build time a script writes each repo's stars, language and last push into a committed JSON file, so a failed GitHub call can't break the build.",
      "The ship flies on mouse, keyboard or a touch stick, with a chase camera and collisions. Autopilot warps you to a planet, steering around the sun and other planets, and holds orbit when it arrives. Bloom, vignette and a speed-scaled warp blur go on top, and every sound is synthesized with Web Audio.",
      "Quality presets are detected and saved, there is a reduced-motion mode, and browsers without WebGL get a plain page listing every project.",
    ],
    architecture: {
      stages: [
        { nodes: [{ title: "fetch-github.mjs", detail: "stars, language, last push at build" }] },
        { edge: "repoData.json", nodes: [{ title: "planets.ts", detail: "12 planets: orbit, palette, link" }] },
        {
          edge: "Zustand store",
          nodes: [
            { title: "R3F scene", detail: "ship, planets, up to 2.4M stars", accent: true },
            { title: "HUD", detail: "radar, info panel, system map" },
          ],
        },
        { nodes: [{ title: "Effects + audio", detail: "bloom, warp blur, synthesized sound" }] },
      ],
    },
    featured: true,
  },

  // ── Linux & hardware ──────────────────────────────────────────────────
  {
    slug: "wisprflow-linux",
    name: "WisprFlow for Linux",
    tagline: "Hold a key, talk, and the text appears where you're typing.",
    description:
      "A dictation daemon for Linux. Hold Ctrl+Win, speak, release, and the transcript is pasted into whatever app has focus. whisper.cpp on CUDA, evdev hotkeys, works on Wayland.",
    group: "Linux & hardware",
    started: "2026-08",
    stack: ["C", "whisper.cpp", "CUDA", "evdev", "uinput", "Qt6"],
    repo: "https://github.com/amanmprojects/wispr-flow",
    posts: ["august-wrapped"],
    stats: [
      { value: "Ctrl+Win", label: "hold, speak, release, and the text is typed for you" },
      { value: "~1.6 GB", label: "Whisper model, run locally on the GPU" },
      { value: "350 ms", label: "of audio kept after release" },
      { value: "~3,360", label: "lines of C and C++" },
    ],
    howItWorks: [
      "X11 key grabs don't work globally under Wayland, so the daemon reads raw keyboard events from /dev/input. It seeds modifier state from the kernel, picks up hotplugged keyboards, and ignores virtual keyboards so its own paste can't trigger it again. The keys still reach your apps.",
      "While the keys are held it records 16 kHz mono audio, and keeps recording for 350 ms after release so the last syllable isn't cut. It trims silence, which cuts down on hallucinated endings, and runs Whisper large-v3-turbo on CUDA.",
      "The text goes on the clipboard and is pasted with Ctrl+V from a virtual keyboard the daemon creates itself. A Qt6 tray app listens on a Unix socket for status, shows popups, and can replay and re-transcribe the last recording.",
    ],
    architecture: {
      stages: [
        { nodes: [{ title: "evdev hotkey", detail: "Ctrl+Win from /dev/input" }] },
        { edge: "while held", nodes: [{ title: "Audio capture", detail: "16 kHz mono, +350 ms tail" }] },
        { edge: "release", nodes: [{ title: "whisper.cpp", detail: "large-v3-turbo on CUDA", accent: true }] },
        {
          edge: "transcript",
          nodes: [
            { title: "Clipboard", detail: "wl-copy, xclip fallback" },
            { title: "uinput Ctrl+V", detail: "its own virtual keyboard" },
          ],
        },
        { edge: "status over a Unix socket", nodes: [{ title: "Qt6 tray app", detail: "popups, replay, re-transcribe" }] },
      ],
    },
    featured: true,
  },
  {
    slug: "jcow411-repeater",
    name: "jcow411-repeater",
    tagline: "A dead JioFiber gateway turned into a 5 GHz range extender.",
    description:
      "Turned a decommissioned JioFiber gateway into a 5 GHz range extender: bridged at Layer 2, one subnet, no double NAT, and it survives reboots.",
    group: "Linux & hardware",
    started: "2026-09",
    stack: ["Shell", "Broadcom wl", "hostapd", "Linux bridges"],
    repo: "https://github.com/amanmprojects/jcow411-repeater",
    posts: ["repurposing-jiofiber-wireless-repeater"],
    stats: [
      { value: "1", label: "subnet for every device, no double NAT" },
      { value: "−7", label: "the error code that fooled the agent" },
      { value: "10 s", label: "between self-heal checks" },
    ],
    howItWorks: [
      "The usual Linux repeater recipe fails on this box because it uses Broadcom's closed driver. Station commands returned −7, which reads as E2BIG in libc. In Broadcom's own codes, −7 means \"not in station mode\": the radio boots as an access point. Switching it out of AP mode and using the driver's built-in supplicant got the 5 GHz radio connected.",
      "Broadcom's WET mode does MAC translation and proxy ARP inside the driver, so the 5 GHz link can join one Linux bridge with the four Ethernet ports and a 2.4 GHz access point. Every device gets its address from the main router.",
      "The installer disables the vendor watchdogs that would undo all this, installs a boot script, and backs it up to flash. A monitor loop runs every 10 seconds to rejoin the uplink, bring the access point back, and turn the front LED green when the link is healthy.",
    ],
    architecture: {
      caption: "What the installer sets up. The diagram below shows the network it produces.",
      stages: [
        { nodes: [{ title: "deploy.py", detail: "telnet in as root, run install.sh" }] },
        {
          edge: "install",
          nodes: [
            { title: "Vendor watchdogs off", detail: "OpenSync, GPON alarm script" },
            { title: "Boot persistence", detail: "init script + flash backup" },
          ],
        },
        {
          edge: "on boot",
          nodes: [
            { title: "5 GHz station + WET", detail: "driver supplicant", accent: true },
            { title: "2.4 GHz AP", detail: "hostapd" },
          ],
        },
        { edge: "brctl addif", nodes: [{ title: "bdg2 bridge", detail: "uplink, AP and eth0–3, one subnet" }] },
        { edge: "every 10 s", nodes: [{ title: "Monitor loop", detail: "rejoin, re-add AP, green LED" }] },
      ],
    },
  },
  {
    slug: "files",
    name: "Files",
    tagline: "A native Linux file explorer, written in TypeScript.",
    description:
      "A native Linux file explorer written in TypeScript and compiled ahead of time with Vercel's Native SDK. No browser, no JavaScript runtime.",
    group: "Linux & hardware",
    started: "2026-08",
    stack: ["TypeScript", "Native SDK", "Zig toolchain"],
    repo: "https://github.com/amanmprojects/explorer",
    posts: ["august-wrapped"],
    stats: [
      { value: "23 MB", label: "native binary, no browser inside" },
      { value: "40", label: "message types in the update loop" },
      { value: "9", label: "filesystem operations" },
    ],
    howItWorks: [
      "Three files hold the app. core.ts has the state: one Model, a Msg type with 40 variants, and a pure update function that is the only place state changes. app.native is the whole UI: split panes, toolbar, breadcrumbs, a table or grid, a details pane and dialogs. app.json declares the window.",
      "The core never touches the disk. Each filesystem operation (list, home, stat, create, rename, delete, preview and places) is a typed service call, and its result comes back as another message.",
      "Every visible string is bytes, so the core has its own helpers for lowercasing, search and path splitting. Selecting a file previews its first 8 KiB.",
    ],
    architecture: {
      stages: [
        { nodes: [{ title: "app.native", detail: "the whole UI, declarative" }] },
        { edge: "Msg", nodes: [{ title: "update (core.ts)", detail: "pure, 40 message types", accent: true }] },
        {
          edge: "commands",
          nodes: [
            { title: "fs services", detail: "9 typed operations" },
            { title: "Clipboard + reveal", detail: "copy path, open in OS" },
          ],
        },
        { edge: "build", nodes: [{ title: "Native binary", detail: "23 MB, no runtime" }] },
      ],
    },
  },
  {
    slug: "omarchy-agents",
    name: "Agents for Omarchy",
    tagline: "Claude usage across every profile, in the bar.",
    description:
      "A fork of Omarchy's Agents bar widget. It counts Claude usage across every profile directory without double-counting copied sessions, and adds OpenCode usage.",
    group: "Linux & hardware",
    started: "2026-10",
    stack: ["Python", "QML", "SQLite", "Omarchy"],
    repo: "https://github.com/amanmprojects/omarchy-agents",
    credit:
      "A fork of Omarchy's own Agents widget. The panel UI started as upstream's; I wrote the usage collectors, the profile support and the tests.",
    howItWorks: [
      "The panel only displays usage records from a state directory, so my changes are in the collectors that write them. An update script runs Omarchy's stock collectors except Claude and OpenCode, then runs my two replacements.",
      "The Claude collector loads Omarchy's own collector and swaps out only its project scan. One scan covers ~/.claude and every ~/.claude-profiles directory, so message and session IDs copied between profiles count once. Each profile is also scanned alone so the panel can show it separately.",
      "The OpenCode collector reads OpenCode's SQLite database from both its old and new message tables and keeps the copy with the most usage per message. The records match Omarchy's format, so the panel needed no provider-specific code.",
    ],
    architecture: {
      stages: [
        { nodes: [{ title: "Update script", detail: "stock updater minus two" }] },
        {
          edge: "runs",
          nodes: [
            { title: "Claude profiles", detail: "every profile, deduplicated", accent: true },
            { title: "OpenCode", detail: "SQLite, both tables" },
            { title: "Stock collectors", detail: "Codex, Grok, Kimi…" },
          ],
        },
        { edge: "JSON records", nodes: [{ title: "Usage state", detail: "~/.local/state/omarchy/agents" }] },
        { edge: "file watch", nodes: [{ title: "Bar panel", detail: "limits, tokens, profile picker" }] },
      ],
    },
  },

  // ── Agent tools ───────────────────────────────────────────────────────
  {
    slug: "disk-agent",
    name: "Disk Agent",
    tagline: "My personal AI agent, on Telegram and the terminal.",
    description:
      "A self-hosted agent on the Pi SDK. I talk to it over Telegram or a local REPL, and it keeps markdown memory, runs cron jobs and can browse the web.",
    group: "Agent tools",
    started: "2026-07",
    stack: ["TypeScript", "Pi SDK", "grammY", "OpenTUI", "croner"],
    repo: "https://github.com/amanmprojects/disk-agent",
    links: [{ label: "npm", href: "https://www.npmjs.com/package/@amanm/disk-agent" }],
    stats: [
      { value: "25", label: "tools added on top of Pi" },
      { value: "128", label: "test cases" },
    ],
    howItWorks: [
      "Everything goes through one Gateway. Telegram and the CLI never call the model directly. Each message joins a queue per person, so one chat's messages run in order while different chats run side by side. The coding tools (read, bash, edit and the rest) come from Pi; I added 25 more for memory, cron, web, the browser, sessions and skills.",
      "Memory is plain markdown: a soul file, a user file, a long-term memory file and a daily log, plus a facts store searched by keyword score instead of a vector database.",
      "A heartbeat job asks the model to reply HEARTBEAT_OK when nothing needs attention; those replies are dropped, and quiet hours are skipped. New Telegram users get a pairing code that has to be approved on the host. Voice notes are transcribed with Whisper.",
    ],
    architecture: {
      stages: [
        {
          nodes: [
            { title: "Telegram", detail: "pairing, voice notes" },
            { title: "CLI", detail: "local REPL" },
            { title: "Cron + heartbeat", detail: "quiet hours" },
          ],
        },
        { edge: "message", nodes: [{ title: "Gateway", detail: "queue per person, commands", accent: true }] },
        { edge: "run turn", nodes: [{ title: "Agent runtime", detail: "Pi session + system prompt" }] },
        {
          edge: "tool calls",
          nodes: [
            { title: "Pi tools", detail: "read, bash, edit, grep…" },
            { title: "25 more tools", detail: "memory, cron, browser, skills" },
          ],
        },
        { edge: "persist", nodes: [{ title: "~/.disk-agent", detail: "memory, facts, sessions" }] },
      ],
    },
  },
  {
    slug: "eve-coder",
    name: "eve-coder",
    tagline: "A local coding agent on eve, with a Pi-style terminal UI.",
    description:
      "A coding agent you run in any directory. It edits your files directly, with no sandbox, through a server built on Vercel's eve framework and a terminal client I wrote on pi-tui.",
    group: "Agent tools",
    started: "2026-08",
    stack: ["TypeScript", "eve", "pi-tui", "AI Gateway"],
    repo: "https://github.com/amanmprojects/eve-coder",
    links: [{ label: "npm", href: "https://www.npmjs.com/package/eve-coder" }],
    stats: [
      { value: "7", label: "local tools" },
      { value: "262K", label: "token context window" },
    ],
    howItWorks: [
      "The CLI finds a free port, starts the eve server on localhost with your current directory as the workspace, opens the terminal client, and shuts the server down when you quit. The client uses an alternate screen with a scroll view, so only the visible part of the transcript is redrawn, and talks to the server through eve's typed client for sessions, resume, compaction and cancel.",
      "The agent has 7 local tools: bash, read, write, edit, glob, grep and ls. Some helpers are ported from Pi's harness and credited in the code: fuzzy-matching edits that keep line endings, output truncation, and a per-file queue so two edits to one file in a turn don't clobber each other.",
      "The model is GLM 5.2 through Vercel's AI Gateway. I set its context window to 262,144 tokens, because the gateway reports 1M but the provider enforces 256K. That makes eve compact the conversation before the real limit.",
    ],
    architecture: {
      stages: [
        { nodes: [{ title: "eve-coder CLI", detail: "free port, spawns the server" }] },
        {
          edge: "localhost",
          nodes: [
            { title: "Terminal client", detail: "pi-tui, /resume, /compact" },
            { title: "eve server", detail: "agent + durable sessions", accent: true },
          ],
        },
        { edge: "tool calls", nodes: [{ title: "7 local tools", detail: "bash, edit, grep… no sandbox" }] },
        { edge: "AI Gateway", nodes: [{ title: "GLM 5.2", detail: "262K context" }] },
      ],
    },
  },
  {
    slug: "quick-gateway",
    name: "quick-gateway",
    tagline: "One local endpoint that lets Codex and Claude Code use any model.",
    description:
      "A self-hosted LiteLLM gateway that lets OpenAI Responses and Anthropic Messages clients, tool calls included, use OpenCode Zen models that only speak chat completions.",
    group: "Agent tools",
    started: "2026-08",
    stack: ["LiteLLM", "Bash", "uv", "systemd", "SSH"],
    repo: "https://github.com/amanmprojects/quick-gateway",
    posts: ["august-wrapped"],
    stats: [
      { value: "18", label: "models routed" },
      { value: "3", label: "client protocols bridged" },
    ],
    howItWorks: [
      "Three protocols that don't meet: many Zen models only speak chat completions, Codex only speaks the Responses API, and Claude Code only speaks Anthropic Messages. The config routes 18 models through chat completions, including for Anthropic requests, because LiteLLM's default path goes Anthropic → Responses → chat and that double hop returned empty content once tools were involved.",
      "The installer needs only curl. It installs everything with uv, pins LiteLLM, writes a hardened systemd unit, and is safe to re-run. The gateway listens on localhost only, with no auth key, so reaching it takes SSH.",
      "On a laptop, one script opens the SSH tunnel and checks it, and another writes a claude-zen command that points Claude Code at the gateway through its --settings flag. Environment variables alone never reached it, because Claude Code's own settings file overrides them.",
    ],
    architecture: {
      stages: [
        {
          nodes: [
            { title: "Codex", detail: "/v1/responses" },
            { title: "Claude Code", detail: "/v1/messages" },
            { title: "OpenAI clients", detail: "/v1/chat/completions" },
          ],
        },
        { edge: "SSH tunnel", nodes: [{ title: "tunnel.sh", detail: "port forward + health check" }] },
        { edge: "localhost:4000", nodes: [{ title: "LiteLLM proxy", detail: "18 models, protocol bridge", accent: true }] },
        { edge: "chat completions", nodes: [{ title: "OpenCode Zen", detail: "GLM, Kimi, DeepSeek and more" }] },
      ],
    },
  },
  {
    slug: "luna-eye",
    name: "Luna Eye",
    tagline: "Lets text-only models see images.",
    description:
      "A one-file Pi extension. When the active model can't read images, a separate vision model, the eye, describes them, and the text-only model gets the description instead.",
    group: "Agent tools",
    started: "2026-08",
    stack: ["TypeScript", "Pi extension API", "pi-tui"],
    repo: "https://github.com/amanmprojects/lunaeye",
    posts: ["august-wrapped"],
    stats: [
      { value: "3", label: "routes from image to text" },
      { value: "96", label: "cached descriptions" },
    ],
    howItWorks: [
      "Images reach a model three ways, so there are three hooks. A see tool lets the model ask to look at a file, and is only offered when the current model can't read images. An input hook catches images you attach and rewrites the prompt as text. A last-resort hook replaces image parts that arrive any other way, like images returned by the read tool, before the request goes out.",
      "The eye call goes through Pi's own model registry, so it reuses Pi's credentials and stores no keys. Descriptions are cached by a hash of the image and the instruction, up to 96 entries, and several images are described in parallel.",
      "/eye opens a fuzzy picker of every vision-capable model across your providers. The choice is saved, and switching clears the cache.",
    ],
    architecture: {
      stages: [
        {
          nodes: [
            { title: "see tool", detail: "the model asks to look" },
            { title: "Input hook", detail: "attached images" },
            { title: "Context hook", detail: "images from tools" },
          ],
        },
        { edge: "model is text-only", nodes: [{ title: "describeImage", detail: "hash cache, 96 entries", accent: true }] },
        { edge: "Pi model registry", nodes: [{ title: "Eye model", detail: "switch with /eye" }] },
        { edge: "description as text", nodes: [{ title: "Text-only model", detail: "never sees pixels" }] },
      ],
    },
  },
  {
    slug: "llm-bench",
    name: "llm-bench",
    tagline: "Measure how fast an LLM endpoint feels.",
    description:
      "A terminal app and headless CLI that measures any OpenAI-compatible or Anthropic endpoint: time to first token, tokens per second, prompt caching, tool-call latency and cost.",
    group: "Agent tools",
    started: "2026-08",
    stack: ["TypeScript", "Bun", "OpenTUI"],
    repo: "https://github.com/amanmprojects/llm-endpoint-bench",
    posts: ["august-wrapped"],
    stats: [
      { value: "4", label: "benchmarks" },
      { value: "0", label: "SDKs, raw streaming clients instead" },
    ],
    howItWorks: [
      "I wrote my own streaming clients for OpenAI and Anthropic instead of using an SDK, so any gateway or proxy works. They read cached-token counts from both APIs, keep reasoning tokens separate from the answer, and retry without temperature when a model rejects it.",
      "There are four benchmarks. Time to first token and throughput are straightforward. The cache test sends a ~3,000-token system prompt twice and compares the cold and warm runs. The tool test forces a calculator call, runs it, and times the reply after the result, which is the delay you feel in agent sessions.",
      "The terminal UI has a dashboard, an endpoint form, results, run history and a live chat with a tokens-per-second sparkline. --headless prints JSON for CI, and a mock server drives the tests.",
    ],
    architecture: {
      stages: [
        {
          nodes: [
            { title: "OpenTUI app", detail: "dashboard, chat, history" },
            { title: "Headless CLI", detail: "JSON for CI" },
          ],
        },
        { edge: "run", nodes: [{ title: "Bench engine", detail: "TTFT, throughput, cache, tools", accent: true }] },
        {
          edge: "stream",
          nodes: [
            { title: "OpenAI client", detail: "/chat/completions" },
            { title: "Anthropic client", detail: "/messages" },
          ],
        },
        { edge: "usage + timings", nodes: [{ title: "Pricing + history", detail: "cost per run, saved locally" }] },
      ],
    },
  },
  {
    slug: "pi-agent-tui",
    name: "pi-agent-tui",
    tagline: "Lets Pi drive full-screen terminal apps.",
    description:
      "A Pi extension that wraps the agent-tui CLI as 10 tools, so a Pi session can start, read and type into programs like htop or vim.",
    group: "Agent tools",
    started: "2026-09",
    stack: ["TypeScript", "Pi extension API", "agent-tui"],
    repo: "https://github.com/amanmprojects/pi-agent-tui",
    stats: [{ value: "10", label: "tools" }],
    howItWorks: [
      "A thin wrapper over agent-tui, which does the terminal emulation. Each tool (run, screenshot, press, type, scroll, wait, resize, sessions, restart, kill) calls agent-tui with JSON output. A shared helper parses the JSON from either output stream and checks for an error object instead of trusting the exit code.",
      "It never lets the CLI prompt, and kill and restart require explicit confirmation. Screenshots keep color codes by default, because a highlighted menu row often differs only by its background.",
      "A bundled skill teaches the model the loop of run, screenshot, act, wait and kill, and warns that a \"stable\" wait only means about 100 ms of quiet, which returns too early on screens that keep ticking.",
    ],
    architecture: {
      stages: [
        { nodes: [{ title: "Pi session", detail: "model + agent-tui skill" }] },
        { edge: "tool call", nodes: [{ title: "10 tui_* tools", detail: "schemas, confirm gates", accent: true }] },
        { edge: "agent-tui --json", nodes: [{ title: "agent-tui", detail: "terminal emulator + daemon" }] },
        { edge: "PTY", nodes: [{ title: "Target app", detail: "htop, vim, installers…" }] },
      ],
    },
  },
  {
    slug: "skiller",
    name: "Skiller",
    tagline: "Search and install agent skills from one keybinding.",
    description:
      "An fzf picker that searches skills.sh as you type, previews each skill, and installs it into the project of the terminal you were focused on.",
    group: "Agent tools",
    started: "2026-08",
    stack: ["Bash", "fzf", "jq", "Hyprland"],
    repo: "https://github.com/amanmprojects/skiller",
    links: [{ label: "npm", href: "https://www.npmjs.com/package/@amanm/skiller" }],
    posts: ["august-wrapped"],
    howItWorks: [
      "fzf runs in a mode where every keystroke reloads results from skills.sh's search API, after a 150 ms debounce. The preview fetches the skill's SKILL.md from GitHub, falling back to a cached tree lookup when the path guess misses. Enter installs it; other keys switch between local and global install, list installed skills for removal, or open the skill's page.",
      "The hard part was knowing which project you're in when it's launched from a keybinding. A launcher resolves the directory before the window opens: from herdr's API for the focused pane, else from Omarchy's terminal helper, else your home directory. The picker shows the directory it chose.",
    ],
    architecture: {
      stages: [
        { nodes: [{ title: "SUPER+I", detail: "Hyprland keybinding" }] },
        { edge: "resolve cwd", nodes: [{ title: "skiller-launcher", detail: "herdr → terminal → $HOME", accent: true }] },
        { edge: "floating terminal", nodes: [{ title: "fzf picker", detail: "reload on every keystroke" }] },
        {
          edge: "search + preview",
          nodes: [
            { title: "skills.sh API", detail: "search" },
            { title: "GitHub", detail: "SKILL.md preview, cached" },
          ],
        },
        { edge: "Enter", nodes: [{ title: "npx skills add", detail: "local or global" }] },
      ],
    },
  },
  {
    slug: "neo-aman-code",
    name: "neo-aman-code",
    tagline: "A terminal coding agent with a React UI.",
    description:
      "A terminal coding assistant whose UI is React rendered by OpenTUI and whose agent is an AI SDK tool loop with file, shell, search, web and task tools.",
    group: "Agent tools",
    started: "2026-04",
    stack: ["TypeScript", "Bun", "OpenTUI + React", "Vercel AI SDK", "Bedrock"],
    repo: "https://github.com/amanmprojects/neo-aman-code",
    stats: [
      { value: "12", label: "agent tools" },
      { value: "100", label: "steps per turn, at most" },
      { value: "15", label: "syntax-highlight grammars" },
    ],
    howItWorks: [
      "The agent is an AI SDK tool loop capped at 100 steps. It swaps in the session's current model on every call, so /model changes models without rebuilding the agent. The UI talks to it in-process through useChat, with no HTTP server in between.",
      "There are 12 tools: list, read, write and edit files, bash, glob, ripgrep, four task tools, and optional web search. Bash blocks dangerous patterns like rm -rf /, mkfs, fork bombs and curl piped to sh, and caps output at 12,000 characters. File reads stop at 256 KB and skip binaries.",
      "Models come from AI Gateway, LiteLLM or Amazon Bedrock, where they're discovered live from the account. Each tool renders as its own React block, and replies are highlighted with Tree-sitter.",
    ],
    architecture: {
      stages: [
        { nodes: [{ title: "OpenTUI + React", detail: "omnibar, palette, tool blocks" }] },
        { edge: "useChat, in-process", nodes: [{ title: "Tool loop agent", detail: "AI SDK, max 100 steps", accent: true }] },
        {
          edge: "model per call",
          nodes: [
            { title: "AI Gateway", detail: "model ids" },
            { title: "LiteLLM", detail: "OpenAI-compatible" },
            { title: "Bedrock", detail: "live discovery" },
          ],
        },
        { edge: "tool calls", nodes: [{ title: "12 tools", detail: "files, bash, rg, tasks, web" }] },
      ],
    },
  },
  {
    slug: "gtu",
    name: "gtu — Grok Token Tracker",
    tagline: "Where my Grok tokens went.",
    description:
      "A CLI that totals Grok and Composer token usage from Grok Build and Pi session logs, as a terminal dashboard, a text summary or JSON.",
    group: "Agent tools",
    started: "2026-07",
    stack: ["TypeScript", "Bun", "OpenTUI"],
    repo: "https://github.com/amanmprojects/grok-token-tracker",
    howItWorks: [
      "There is no database: every run rescans the logs. It reads Grok Build's session folders, including the usage events at the end of each turn, and Pi's session files, keeping only messages from Grok-family models.",
      "It never estimates. Turns without exact usage are counted separately, so you can see how much of the total is exact. Usage is grouped by model, project, day and source, and the dashboard has tabs for each. The whole thing compiles to one binary.",
    ],
    architecture: {
      stages: [
        {
          nodes: [
            { title: "Grok Build sessions", detail: "turn usage events" },
            { title: "Pi sessions", detail: "Grok models only" },
          ],
        },
        { edge: "rescan each run", nodes: [{ title: "scanUsage", detail: "exact counts only", accent: true }] },
        {
          edge: "by model, project, day",
          nodes: [
            { title: "Dashboard", detail: "5 tabs" },
            { title: "Summary / JSON", detail: "for scripts" },
          ],
        },
      ],
    },
  },

  // ── Web apps & research ───────────────────────────────────────────────
  {
    slug: "phishstudy",
    name: "PhishStudy",
    tagline: "Phishing simulations that measure who clicks.",
    description:
      "A self-hosted phishing-simulation platform: run simulated campaigns against a fictional company, track who opens, clicks, submits and reports, and turn that into risk scores and coaching. My team's BE Honours major project.",
    group: "Web apps & research",
    started: "2026-10",
    stack: ["Python", "SQLite", "PBKDF2", "python-docx"],
    repo: "https://github.com/amanmprojects/cybersec",
    credit:
      "A team project with Shetty Vikyath Vishwanath, Singh Yash Anil and Singh Abhishek Shailesh, guided by Dr. Yogita Shelar at VCET.",
    stats: [
      { value: "24", label: "automated tests" },
      { value: "86", label: "page project report, generated" },
      { value: "260,000", label: "PBKDF2 iterations per password" },
    ],
    screenshots: [
      {
        src: "/images/stuff/phishstudy/dashboard.webp",
        alt: "The admin dashboard: phish rate, reporting rate, a campaign funnel, an outcome donut and the highest-risk people",
        width: 1200,
        height: 798,
        caption: "The admin dashboard, on a seeded cohort of 104 fictional employees.",
      },
      {
        src: "/images/stuff/phishstudy/coaching.webp",
        alt: "The coaching page after submitting credentials, listing four red flags in the lure",
        width: 1200,
        height: 798,
        caption: "What a participant sees after falling for a lure: the red flags in that exact message, then a quiz.",
      },
    ],
    howItWorks: [
      "The whole app is standard-library Python: a threaded HTTP server and a 9-table SQLite schema. Every campaign target gets a unique token, and links carrying it record opens, clicks, submissions and reports. A submitted form keeps only the fact that it was submitted and the field names; the values are thrown away.",
      "Analytics builds the funnel, breakdowns by department and difficulty, and a risk score per person that weighs submissions most, clicks next, adds a quiz penalty and subtracts for reporting. Logins use PBKDF2 at 260,000 iterations, sessions and CSRF tokens are per session, and an append-only audit log records activity.",
      "The 86-page report is generated in two passes. The first exports a PDF and reads back where each heading and figure landed; the second fills in the contents and figure lists with those page numbers. Every number in it comes from the seeded database.",
    ],
    architecture: {
      stages: [
        {
          nodes: [
            { title: "Admin console", detail: "campaigns, lures, people" },
            { title: "Participant inbox", detail: "simulated lures" },
          ],
        },
        { edge: "tokenized link", nodes: [{ title: "HTTP server", detail: "CSRF, sessions, throttling" }] },
        {
          edge: "open, click, submit, report",
          nodes: [{ title: "Event log", detail: "SQLite, form values discarded", accent: true }],
        },
        {
          edge: "aggregate",
          nodes: [
            { title: "Analytics", detail: "funnel, departments, risk" },
            { title: "Coaching + quiz", detail: "red flags of that lure" },
          ],
        },
        { edge: "export", nodes: [{ title: "Report", detail: "86 pages, two-pass build" }] },
      ],
    },
  },
  {
    slug: "kairo",
    name: "KAIRO",
    tagline: "A knowledge graph of why code changed.",
    description:
      "A research prototype that turns a repo's GitHub history into a graph of commits, PRs, issues and files, then has an LLM extract the decisions behind them, each with the dates it was true.",
    group: "Web apps & research",
    started: "2026-08",
    stack: ["Python", "Postgres", "pgvector", "GitHub API", "LLMs"],
    repo: "https://github.com/amanmprojects/kairo",
    stats: [
      { value: "56% → 27%", label: "overlap between unrelated queries, after hub suppression" },
      { value: "26 → 186", label: "PR-to-issue links, regex vs timeline API" },
      { value: "4 of 57", label: "candidate pairs judged superseded" },
    ],
    howItWorks: [
      "There are two layers. The first is copied straight from GitHub with no LLM: commits, PRs, issues, files and the links between them. The second is extracted by an LLM: decisions, each with its confidence, the model that extracted it, and the exact quote it came from. Decisions record when they were true and when KAIRO learned them, so you can ask what the team believed on a given date.",
      "Graph walks are recursive SQL. An unrestricted three-hop walk from unrelated files returned 91–99% the same results, because big sweeping commits connect everything. Refusing to expand through nodes with more than 20 links cut the overlap from 56% to 27% on FastAPI.",
      "It is in progress. The graph retrieval and a vector-search baseline over the same data are both built, with a blind LLM judge to compare them, but the questions haven't been reviewed yet, so there are no accuracy numbers.",
    ],
    architecture: {
      stages: [
        { nodes: [{ title: "GitHub API", detail: "REST + timeline, cached" }] },
        { edge: "ingest, no LLM", nodes: [{ title: "Layer 1 graph", detail: "commits, PRs, issues, files" }] },
        {
          edge: "extract + verify quote",
          nodes: [
            { title: "Layer 2 decisions", detail: "dated, quoted, scored" },
            { title: "Supersession", detail: "embeddings → LLM judge" },
          ],
        },
        {
          edge: "retrieve",
          nodes: [
            { title: "Graph retrieval", detail: "recursive SQL, hub limit 20", accent: true },
            { title: "Vector baseline", detail: "same data, same embeddings" },
          ],
        },
        { edge: "score", nodes: [{ title: "Blind LLM judge", detail: "correct, grounded, on time" }] },
      ],
    },
  },
  {
    slug: "minihub",
    name: "Minihub",
    tagline: "A small self-hosted Git server in Go.",
    description:
      "A self-hosted Git service. It serves bare repos over HTTP and SSH, with pull requests, protected branches, webhooks, a simple CI runner and a React frontend.",
    group: "Web apps & research",
    started: "2026-05",
    stack: ["Go", "git", "SSH", "SQLite", "React"],
    repo: "https://github.com/amanmprojects/minihub",
    stats: [
      { value: "2", label: "Git transports: HTTP and SSH" },
      { value: "15", label: "database tables" },
    ],
    howItWorks: [
      "Repos are bare directories on disk. HTTP requests under /git/ go to git http-backend, so the normal git CLI clones and pushes. A separate SSH server runs upload-pack and receive-pack after checking the user's password and their role on the repo.",
      "Merging a pull request never touches a working tree. It computes the merge with git merge-tree, makes the commit with commit-tree, and moves the branch with a compare-and-swap update-ref. A conflict returns HTTP 409 and leaves the branch alone.",
      "Protected branches are enforced inside Git by a pre-receive hook Minihub writes into each repo, which rejects deletes and force pushes. CI checks out a ref and runs .minihub/ci.sh, and PR, release and CI events fire webhooks.",
    ],
    architecture: {
      stages: [
        {
          nodes: [
            { title: "git CLI", detail: "clone, fetch, push" },
            { title: "React UI", detail: "repos, diffs, PRs" },
          ],
        },
        {
          edge: "HTTP / SSH",
          nodes: [
            { title: "minihub", detail: "JSON API + smart HTTP" },
            { title: "minihub-ssh", detail: "passwords, repo roles" },
          ],
        },
        {
          edge: "exec",
          nodes: [
            { title: "git plumbing", detail: "merge-tree, update-ref", accent: true },
            { title: "CI runner", detail: ".minihub/ci.sh" },
          ],
        },
        {
          edge: "store",
          nodes: [
            { title: "Bare repos", detail: "pre-receive guards branches" },
            { title: "SQLite", detail: "15 tables" },
          ],
        },
      ],
    },
  },
  {
    slug: "chat-app",
    name: "Chat App",
    tagline: "Real-time chat with rooms, DMs and search.",
    description:
      "Real-time chat with rooms, direct messages, reactions, image attachments, typing indicators, presence and full-text search, on Convex and React.",
    group: "Web apps & research",
    started: "2026-05",
    stack: ["Convex", "React 19", "Convex Auth", "Tailwind", "shadcn"],
    repo: "https://github.com/amanmprojects/chat-app",
    live: "https://chat-app-black-may.vercel.app",
    stats: [
      { value: "5 s", label: "typing indicator lifetime" },
      { value: "50", label: "messages per page" },
    ],
    howItWorks: [
      "The browser keeps a WebSocket open to Convex, so every live update is a query subscription and Vercel only serves static files. The schema has conversations (rooms or DMs), members with a last-read time, messages with attachments and soft edits, reactions and typing rows.",
      "Typing indicators are rows that expire after 5 seconds. The client sends at most one start every 2 seconds and a stop after 4 idle seconds, and the query takes the current time rounded to 2 seconds, so expired rows drop out without a write.",
      "Search uses a Convex search index on message text, filtered to conversations you belong to. Sign-in is GitHub or Google.",
    ],
    architecture: {
      stages: [
        { nodes: [{ title: "React SPA", detail: "static on Vercel" }] },
        { edge: "OAuth", nodes: [{ title: "Convex Auth", detail: "GitHub, Google" }] },
        {
          edge: "WebSocket subscriptions",
          nodes: [
            { title: "Queries + mutations", detail: "messages, typing, search", accent: true },
            { title: "Presence", detail: "heartbeats" },
          ],
        },
        {
          edge: "store",
          nodes: [
            { title: "Tables + search index", detail: "message text" },
            { title: "File storage", detail: "images up to 25 MB" },
          ],
        },
      ],
    },
  },
  {
    slug: "phish",
    name: "Phish",
    tagline: "Paste a suspicious message, get a risk score.",
    description:
      "A hackathon prototype: paste a suspicious email or SMS and get a risk score, the red flags, and one safe next step. A fast offline check, and a slower agent that searches the web.",
    group: "Web apps & research",
    started: "2026-07",
    stack: ["TypeScript", "Hono", "React", "Pi SDK", "Tavily"],
    repo: "https://github.com/amanmprojects/phish",
    stats: [
      { value: "6", label: "weighted rules in the offline check" },
      { value: "22", label: "unit tests" },
    ],
    howItWorks: [
      "Quick Check needs no network and no LLM. Six weighted rules look for urgency, payment demands, requests for credentials, unrealistic rewards, authority framing and link shorteners. Extra checks catch UPI IDs, free-mail senders claiming to be an institution, lookalike domains and the \"scholarship plus processing fee\" combo. 35+ is Suspicious, 70+ High Risk.",
      "Deep Investigate runs an agent whose only tools are web search and fetch, with no shell or files. Its prompt treats the message as untrusted data, and a test fixture checks it against prompt injection. Results stream to the page.",
      "When the agent and the score disagree, the more cautious label wins. Input is capped at 100k characters, with 2 deep runs at a time, 8 per IP per minute, and a 3-minute timeout.",
    ],
    architecture: {
      stages: [
        { nodes: [{ title: "React UI", detail: "paste, highlighted red flags" }] },
        { edge: "POST", nodes: [{ title: "Hono API", detail: "size cap, rate limit, streaming" }] },
        {
          edge: "parse headers + links",
          nodes: [
            { title: "Quick Check", detail: "weighted rules, offline" },
            { title: "Agent", detail: "web search + fetch only", accent: true },
          ],
        },
        { edge: "merge", nodes: [{ title: "Final label", detail: "the more cautious one wins" }] },
      ],
    },
  },
];

export const projectHref = (project: Project) => `/stuff/${project.slug}`;

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

/** For the home page: the first featured project from each group, then more featured ones. */
export function homeProjects(count = 4): Project[] {
  const featured = projects.filter((p) => p.featured);
  const picked: Project[] = [];
  for (const group of projectGroups) {
    const first = featured.find((p) => p.group === group);
    if (first) picked.push(first);
  }
  for (const p of featured) if (!picked.includes(p)) picked.push(p);
  return picked.slice(0, count);
}

/** "2026-08" → "Aug 2026" */
export function formatStarted(started: string): string {
  const [year, month] = started.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
