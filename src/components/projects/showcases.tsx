import { BarList } from "@/components/charts/BarList";
import { Figure } from "@/components/charts/Figure";
import { LineChart } from "@/components/charts/LineChart";
import { PipelineToggle } from "@/components/charts/PipelineToggle";
import { SegmentedBar } from "@/components/charts/SegmentedBar";
import chessLoss from "@/data/projects/chessllm-loss.json";
import miniLoss from "@/data/projects/minillm-loss.json";
import { LiveEmbed } from "./LiveEmbed";

/*
 * Charts and diagrams for individual project pages. Numbers come from the
 * training logs (src/data/projects) and the matching posts in content/writing.
 */

type Points = [number, number][];
const mini = miniLoss as { train: Points; val: Points };
const chess = chessLoss as { train: Points; val: Points };

function MiniLlmChessLlm() {
  return (
    <>
      <Figure
        title="Training the 101M model"
        caption="9,144 steps of 131,072 tokens, 12.4 hours on an RTX 4060 Laptop. Most of the drop happens in the first few hundred steps; the rest is a slow grind from 4 down to 3.2."
        table={{ columns: ["step", "val loss"], rows: mini.val }}
      >
        <LineChart
          ariaLabel="Training and validation loss of the 101M model over 9,144 steps, falling from 9.9 to about 3.2"
          xLabel="step"
          logX
          series={[
            { name: "train loss", points: mini.train, mark: "line", color: "s1" },
            { name: "val loss", points: mini.val, mark: "line", color: "s2" },
          ]}
        />
      </Figure>

      <Figure
        title="Muon vs AdamW"
        caption="A controlled A/B: the same 200-step, 13.1M-token budget, schedule and model. Swapping the optimizer cut validation perplexity 2.7x for a 2% throughput cost. Lower is better."
      >
        <BarList
          ariaLabel="Validation perplexity by optimizer"
          bars={[
            { label: "AdamW, lr 1.5e-3", value: 433.2 },
            { label: "Muon, lr 0.035", value: 165.3 },
            { label: "Muon, lr 0.02", value: 162.7, accent: true },
          ]}
        />
      </Figure>

      <Figure
        title="Training chessLLM"
        caption="The same architecture, 94.4M parameters, retrained on nothing but move text with a 40-character vocabulary. It never sees a board."
        table={{ columns: ["step", "val loss"], rows: chess.val }}
      >
        <LineChart
          ariaLabel="Training and validation loss of chessLLM over 7,505 steps, falling from 2.6 to about 0.42"
          xLabel="step"
          logX
          series={[
            { name: "train loss", points: chess.train, mark: "line", color: "s1" },
            { name: "val loss", points: chess.val, mark: "line", color: "s2" },
          ]}
        />
      </Figure>

      <Figure
        title="Does it know where the pieces are?"
        caption="A linear probe on layer 10 tries to read every square's contents straight out of the activations, on 6,839 positions from games it never trained on. Always guessing 'empty' gets 64.5%."
      >
        <BarList
          ariaLabel="Per-square board accuracy, linear probe versus always guessing empty"
          max={100}
          bars={[
            { label: "Always guess 'empty'", value: 64.5, display: "64.5%" },
            { label: "Linear probe, layer 10", value: 85.6, display: "85.6%", accent: true },
          ]}
        />
      </Figure>

      <Figure
        title="Where its illegal moves come from"
        caption="200 self-play games, 11,216 moves, 87 illegal: 99.22% legal. 80 of the 87 are well-formed notation for a move that's illegal in that position. The model wrote a real move for a board that isn't the board."
      >
        <BarList
          ariaLabel="Illegal moves by kind of failure"
          bars={[
            { label: "Piece can't reach that square", value: 68, accent: true },
            { label: "Quiet move onto an occupied square", value: 11 },
            { label: "Malformed notation", value: 7 },
            { label: "Capture on an empty square", value: 1 },
          ]}
        />
      </Figure>

      <Figure
        title="60 games against Stockfish"
        caption="Against an opponent assumed at 1400 Elo, that puts chessLLM around 1131 (±103 at 95%). 24 of the losses were forfeits for an illegal move."
      >
        <SegmentedBar
          ariaLabel="Results against Stockfish: 8 wins, 5 draws, 47 losses"
          segments={[
            { label: "wins", value: 8, color: "var(--chart-s1)" },
            { label: "draws", value: 5, color: "color-mix(in srgb, var(--color-mute) 70%, transparent)" },
            { label: "losses", value: 47, color: "color-mix(in srgb, var(--color-mute) 30%, transparent)" },
          ]}
        />
      </Figure>
    </>
  );
}

function ChessBot() {
  return (
    <>
      <Figure
        title="Play it"
        caption="The real bot, running entirely in your browser. The default engine is the 5.6M neural net; the other levels in the menu are a search engine with no model."
      >
        <LiveEmbed
          src="https://chess-bot-vercel.vercel.app"
          title="Chess Bot, playable"
          cta="Play the bot"
          note="Loads the model into this page"
        />
      </Figure>

      <Figure
        title="Two ways to teach a model chess"
        caption="chess-bot gets the board handed to it. chessLLM, the other chess model, has to build the board itself from move text."
      >
        <div className="overflow-hidden rounded-xl border border-line text-sm">
          {[
            ["", "chess-bot", "chessLLM"],
            ["Input", "64 squares + 3 extra tokens", "move text, one character at a time"],
            ["Parameters", "5.58M", "94.4M"],
            ["Legal moves", "100%, by construction", "99.22% self-play, ~60% vs Stockfish"],
            ["Strength", "~1150–1200 Elo", "~1131 Elo"],
            ["Training", "a few hours, 2.6M positions", "10.3 hours, 1.01B tokens"],
          ].map((row, i) => (
            <div
              key={i}
              className={`grid grid-cols-[6.5rem_1fr_1fr] gap-3 px-4 py-2.5 ${
                i === 0 ? "bg-surface font-semibold text-ink" : "border-t border-line"
              }`}
            >
              <span className="text-mute">{row[0]}</span>
              <span className={i === 0 ? "" : "text-ink"}>{row[1]}</span>
              <span className={i === 0 ? "" : "text-mute"}>{row[2]}</span>
            </div>
          ))}
        </div>
      </Figure>

      <Figure
        title="Score against Stockfish"
        caption="One forward pass per move and no lookahead, so it picks moves the way a club player does before calculating. Its Elo estimate sits around 1150–1200 against the two weaker settings, then collapses at 1500, where the opponent starts setting two-move traps."
      >
        <BarList
          ariaLabel="Score against Stockfish at three strengths"
          max={100}
          bars={[
            { label: "vs Stockfish ≈1320 (8.5 / 30)", value: 28, display: "28%", accent: true },
            { label: "vs Stockfish ≈1400 (7.5 / 30)", value: 25, display: "25%", accent: true },
            { label: "vs Stockfish ≈1500 (1 / 30)", value: 3, display: "3%" },
          ]}
        />
      </Figure>
    </>
  );
}

function AmazonPricing() {
  const curve: Points = [
    [100, 60.52],
    [300, 54.59],
    [500, 49.53],
    [800, 47.7],
    [1000, 46.65],
    [1184, 45.99],
  ];
  return (
    <>
      <Figure
        title="From a lookup table to a fine-tuned LLM"
        caption="Validation SMAPE, lower is better. The best non-ML baseline is a median price per unit and quantity bucket. Qwen3.5-2B with a 4-bit LoRA beat it by 24.7 points."
      >
        <BarList
          ariaLabel="Validation SMAPE by approach"
          bars={[
            { label: "Always predict the median", value: 71.66 },
            { label: "Median by unit × quantity bucket", value: 68.83 },
            { label: "Qwen, 12k rows, one epoch", value: 55.78 },
            { label: "Qwen, full split, epoch 1", value: 45.7 },
            { label: "Qwen, full split, epoch 2", value: 44.11, accent: true },
          ]}
        />
      </Figure>

      <Figure
        title="Epoch 1, validation as it trained"
        caption="Measured every few hundred steps on 1,200 held-out rows. It was still improving when the cosine schedule ran the learning rate down to nearly zero, so epoch 2 restarted with a fresh optimizer."
        table={{ columns: ["step", "SMAPE"], rows: curve }}
      >
        <LineChart
          ariaLabel="Validation SMAPE during epoch 1, from 60.5 at step 100 to 46.0 at step 1,184, against a 68.83 baseline"
          xLabel="step"
          height={220}
          refLine={{ y: 68.83, label: "best baseline, 68.83" }}
          series={[{ name: "SMAPE", points: curve, mark: "line", color: "s1" }]}
        />
      </Figure>
    </>
  );
}

function Jcow411() {
  return (
    <Figure
      title="The network it builds"
      caption="Most repeaters route: a second network behind a second NAT. This one bridges at Layer 2, so every device gets its address from the main router."
    >
      <PipelineToggle
        initial={1}
        variants={[
          {
            label: "Routed",
            note: "The easy setup, and the one I didn't want: two subnets, double NAT, and devices on one side can't roam to the other.",
            stages: [
              { nodes: [{ title: "Main router", detail: "192.168.1.0/24" }] },
              {
                edge: "Wi-Fi uplink",
                nodes: [{ title: "Repeater as a router", detail: "its own NAT and DHCP" }],
              },
              {
                nodes: [{ title: "Your devices", detail: "a second subnet, behind double NAT" }],
              },
            ],
          },
          {
            label: "Bridged (what I built)",
            note: "Broadcom WET mode bridges the 5 GHz uplink into one bridge with every port and the 2.4 GHz access point.",
            stages: [
              { nodes: [{ title: "Main router", detail: "DHCP for 192.168.1.0/24" }] },
              {
                edge: "5 GHz backhaul (wl1, WET)",
                nodes: [{ title: "JCOW411, bridge bdg2", detail: "no NAT, no DHCP of its own", accent: true }],
              },
              {
                nodes: [
                  { title: "4 Gigabit ports", detail: "eth0–eth3" },
                  { title: "2.4 GHz AP", detail: "wl0.2, hostapd" },
                ],
              },
              {
                edge: "same subnet",
                nodes: [{ title: "Your devices", detail: "192.168.1.x, straight from the main router" }],
              },
            ],
          },
        ]}
      />
    </Figure>
  );
}

export const showcases: Record<string, () => React.ReactNode> = {
  "minillm-chessllm": MiniLlmChessLlm,
  "chess-bot": ChessBot,
  "amazon-ml-pricing": AmazonPricing,
  "jcow411-repeater": Jcow411,
};

/** Small trend lines for the /stuff cards, where a project has one */
export const cardSparklines: Record<string, { points: Points; logX?: boolean }> = {
  "minillm-chessllm": { points: mini.train, logX: true },
  "amazon-ml-pricing": {
    points: [
      [0, 68.83],
      [1, 55.78],
      [2, 45.7],
      [3, 44.11],
    ],
  },
};
