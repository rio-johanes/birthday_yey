import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";
import { PageTop } from "../components/Decorations";

const frostingChoices = [
  { name: "Strawberry", color: "#F8AFCB", shadow: "#E982AC" },
  { name: "Lavender", color: "#CDB9F5", shadow: "#A88ADB" },
  { name: "Blueberry", color: "#A9D8F5", shadow: "#78B6DD" },
  { name: "Mint", color: "#B9E8D1", shadow: "#83C9A9" },
];
const toppings = ["🍓", "🍒", "⭐", "💗", "🍬", "🫐"];

const CONFETTI_COLORS = [
  "#f48eb6",
  "#cdb9f5",
  "#a9d8f5",
  "#b9e8d1",
  "#ffd966",
  "#ff9fc4",
  "#ec75a5",
  "#a88adb",
];
const TOTAL_CONFETTI = 48;
const TOTAL_CANDLES = 3;

/* ───────────── Kue (SVG) ───────────── */

const CANDLE_X = [135, 160, 185];

const TIERS = [
  { x: 30, y: 225, w: 260, h: 65 }, // bawah
  { x: 65, y: 160, w: 190, h: 65 }, // tengah
  { x: 100, y: 95, w: 120, h: 65 }, // atas
];

const SPRINKLES = [
  [120, 125, "#fff"],
  [150, 135, "#ffd966"],
  [190, 122, "#fff"],
  [205, 140, "#ffd966"],
  [90, 190, "#fff"],
  [130, 200, "#ffd966"],
  [180, 195, "#fff"],
  [225, 188, "#ffd966"],
  [55, 255, "#fff"],
  [110, 265, "#ffd966"],
  [165, 258, "#fff"],
  [220, 268, "#ffd966"],
  [262, 256, "#fff"],
];

function Drips({ x, y, w, color }) {
  const n = Math.round(w / 30);
  return (
    <g fill={color}>
      <rect x={x} y={y} width={w} height={16} rx={8} />
      {Array.from({ length: n }, (_, i) => {
        const cx = x + (w * (i + 0.5)) / n;
        const len = i % 2 ? 34 : 22;
        return (
          <rect key={i} x={cx - 6} y={y + 6} width={12} height={len} rx={6} />
        );
      })}
    </g>
  );
}

function CakeSVG({ frosting, topping, litCandles, onBlow }) {
  return (
    <svg
      className="cake-svg"
      viewBox="0 36 320 280"
      role="img"
      aria-label="Layered birthday cake"
    >
      {/* Bayangan & piring */}
      <ellipse cx="160" cy="300" rx="150" ry="13" fill="#e9dff3" />
      <ellipse
        cx="160"
        cy="294"
        rx="150"
        ry="13"
        fill="#ffffff"
        stroke="#e3d4f0"
      />

      {/* Tier: dari bawah ke atas */}
      {TIERS.map((t, i) => (
        <g key={i}>
          <rect
            x={t.x}
            y={t.y}
            width={t.w}
            height={t.h}
            rx={12}
            fill="#FFF1DC"
            stroke="#F0D9B5"
            strokeWidth="2"
          />
          <Drips x={t.x} y={t.y} w={t.w} color={frosting.color} />
          <rect
            x={t.x}
            y={t.y + 12}
            width={t.w}
            height={4}
            rx={2}
            fill={frosting.shadow}
            opacity="0.35"
          />
          <rect
            x={t.x}
            y={t.y + t.h - 10}
            width={t.w}
            height={10}
            rx={5}
            fill={frosting.color}
            stroke={frosting.shadow}
            strokeWidth="1.5"
          />
        </g>
      ))}

      {/* Topping di tepi atas tiap tier */}
      <g fontSize="18" textAnchor="middle">
        {[112, 208].map((x) => (
          <text key={`t${x}`} x={x} y={93}>
            {topping}
          </text>
        ))}
        {[85, 160, 235].map((x) => (
          <text key={`m${x}`} x={x} y={158}>
            {topping}
          </text>
        ))}
        {[50, 125, 195, 270].map((x) => (
          <text key={`b${x}`} x={x} y={223}>
            {topping}
          </text>
        ))}
      </g>

      {/* Taburan kecil */}
      <g opacity="0.9">
        {SPRINKLES.map(([cx, cy, c], i) => (
          <circle key={i} cx={cx} cy={cy} r="3" fill={c} />
        ))}
      </g>

      {/* Lilin */}
      {CANDLE_X.map((cx, i) => {
        const lit = litCandles[i];
        return (
          <g
            key={i}
            className={`svg-candle ${lit ? "is-lit" : "is-out"}`}
            onClick={lit ? () => onBlow(i) : undefined}
            onKeyDown={(e) => {
              if (lit && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onBlow(i);
              }
            }}
            role="button"
            tabIndex={lit ? 0 : -1}
            aria-label={lit ? "Blow out candle" : "Candle out"}
          >
            {/* area klik lebih besar */}
            <rect
              x={cx - 14}
              y={38}
              width={28}
              height={58}
              fill="transparent"
            />
            <rect
              x={cx - 4}
              y={63}
              width={8}
              height={32}
              rx={2}
              fill="#fff"
              stroke={frosting.shadow}
              strokeWidth="1.2"
            />
            <rect
              x={cx - 4}
              y={70}
              width={8}
              height={4}
              fill={frosting.color}
            />
            <rect
              x={cx - 4}
              y={80}
              width={8}
              height={4}
              fill={frosting.color}
            />
            <line
              x1={cx}
              y1={58}
              x2={cx}
              y2={63}
              stroke="#6b5566"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {lit ? (
              <g transform={`translate(${cx} 58)`}>
                <g className="svg-flame">
                  <path
                    d="M0,-18 C8,-9 7,-1 0,0 C-7,-1 -8,-9 0,-18Z"
                    fill="#FFB347"
                  />
                  <path
                    d="M0,-12 C4,-6 4,-1 0,0 C-4,-1 -4,-6 0,-12Z"
                    fill="#FFE066"
                  />
                </g>
              </g>
            ) : (
              <g
                className="svg-smoke"
                transform={`translate(${cx} 56)`}
                fill="none"
                stroke="#b9aac4"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M0,0 C-5,-6 5,-10 0,-18" />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ───────────── Confetti ───────────── */

function Confetti({ active }) {
  const pieces = useRef(
    Array.from({ length: TOTAL_CONFETTI }, (_, i) => ({
      id: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      left: `${Math.random() * 100}%`,
      delay: `${(Math.random() * 1.2).toFixed(2)}s`,
      duration: `${(1.4 + Math.random() * 1.2).toFixed(2)}s`,
      size: 6 + Math.floor(Math.random() * 7),
      shape: Math.random() > 0.5 ? "circle" : "rect",
      rotate: `${Math.floor(Math.random() * 360)}deg`,
    })),
  );

  if (!active) return null;

  return (
    <div className="confetti-container" aria-hidden="true">
      {pieces.current.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: `${p.size}px`,
            height: p.shape === "circle" ? `${p.size}px` : `${p.size * 0.5}px`,
            borderRadius: p.shape === "circle" ? "50%" : "2px",
            background: p.color,
            transform: `rotate(${p.rotate})`,
          }}
        />
      ))}
    </div>
  );
}

/* ───────────── Halaman ───────────── */

export default function CakeTown() {
  const navigate = useNavigate();
  const { progress, completeMission } = useGame();

  const [frosting, setFrosting] = useState(frostingChoices[0]);
  const [topping, setTopping] = useState("🍓");
  const [litCandles, setLitCandles] = useState(() =>
    Array.from({ length: TOTAL_CANDLES }, () => true),
  );
  const [showConfetti, setShowConfetti] = useState(false);
  const [showFinished, setShowFinished] = useState(progress.cake);

  const anyLit = litCandles.some(Boolean);
  const blownCount = litCandles.filter((v) => !v).length;

  const blowCandle = (i) => {
    if (!litCandles[i]) return;
    const next = litCandles.map((v, idx) => (idx === i ? false : v));
    setLitCandles(next);
    if (next.every((v) => !v)) setShowConfetti(true);
  };

  // Sembunyikan confetti setelah 3 detik
  useEffect(() => {
    if (!showConfetti) return;
    const t = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(t);
  }, [showConfetti]);

  const finishCake = () => {
    setShowFinished(true);
    completeMission("cake");
  };

  return (
    <main className="game-screen page-screen cake-screen">
      <PageTop label="QUEST 03 · SWEET CAKE TOWN" />

      <Confetti active={showConfetti} />

      <section className="game-heading">
        <span className="eyebrow">the sweetest little mission</span>
        <h1>Let's Bake Your Cake!</h1>
        <p>
          Choose your frosting, add toppings, and blow out the candles to make a
          wish.
        </p>
      </section>

      <section className="cake-workshop">
        {/* ── Kiri: preview kue ── */}
        <div className="cake-preview-panel">
          <div className="bakery-window">
            <span>☁</span>
            <span>✦</span>
            <span>☁</span>
          </div>

          <div className="cake-stage">
            <CakeSVG
              frosting={frosting}
              topping={topping}
              litCandles={litCandles}
              onBlow={blowCandle}
            />
          </div>

          <p className="cake-name-tag">a cake made with love ♡</p>
        </div>

        {/* ── Kanan: kontrol ── */}
        <div className="cake-controls">
          {/* Step 1 */}
          <div className="control-card">
            <h3>
              <span className="step-badge">01</span> Pick your frosting
            </h3>
            <p>Choose a color theme for your cake.</p>
            <div className="color-options">
              {frostingChoices.map((choice) => (
                <button
                  type="button"
                  key={choice.name}
                  className={`color-choice ${frosting.name === choice.name ? "selected" : ""}`}
                  style={{ background: choice.color, "--ring": choice.shadow }}
                  onClick={() => setFrosting(choice)}
                  aria-label={choice.name}
                  title={choice.name}
                />
              ))}
            </div>
            <span className="selected-label">✦ {frosting.name} frosting</span>
          </div>

          {/* Step 2 */}
          <div className="control-card">
            <h3>
              <span className="step-badge">02</span> Add toppings
            </h3>
            <p>Make it extra cute!</p>
            <div className="topping-options">
              {toppings.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`topping-choice ${topping === item ? "selected" : ""}`}
                  onClick={() => setTopping(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3 */}
          <div className="control-card candle-control-card">
            <h3>
              <span className="step-badge">03</span> Make a wish
            </h3>
            {anyLit ? (
              <p>
                Tap each candle flame to blow it out — {blownCount}/
                {TOTAL_CANDLES} blown.
              </p>
            ) : (
              <p className="wish-granted">
                🌟 Your wish is flying to the stars!
              </p>
            )}
            <div className="candle-track">
              {litCandles.map((lit, i) => (
                <span
                  key={i}
                  className={`candle-track-dot ${lit ? "track-lit" : "track-out"}`}
                >
                  {lit ? "🕯️" : "💨"}
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="primary-button finish-cake-button"
            onClick={finishCake}
            disabled={anyLit && !showFinished}
          >
            {showFinished
              ? "Cake completed ✓"
              : anyLit
                ? `Blow out all candles first (${blownCount}/${TOTAL_CANDLES})`
                : "Finish My Cake ♡"}
          </button>
        </div>
      </section>

      {showFinished && (
        <div className="cake-complete-card">
          <span>🎂</span>
          <div>
            <strong>Your cake is super sweet!</strong>
            <small>Sweet Cake Designer achievement unlocked.</small>
          </div>
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate("/map")}
          >
            Collect my star ⭐
          </button>
        </div>
      )}

      <div className="memory-next-hint">
        <button type="button" onClick={() => navigate("/map")}>
          ← Back to Adventure Map
        </button>
      </div>
    </main>
  );
}
