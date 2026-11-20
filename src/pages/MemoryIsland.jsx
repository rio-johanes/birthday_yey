import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { useGame } from "../context/GameContext";
import { PageTop } from "../components/Decorations";

// ─── Photocard design options ────────────────────────────────────────────────

const FRAMES = [
  {
    id: "blossom",
    label: "Blossom",
    emoji: "🌸",
    bg: "linear-gradient(160deg,#ffe4f0 0%,#ffd6ea 50%,#f9c8e0 100%)",
    border: "#f4a7c9",
    accent: "#e8629a",
    strip: "#fff0f7",
  },
  {
    id: "starnight",
    label: "Star Night",
    emoji: "✨",
    bg: "linear-gradient(160deg,#ddd4f8 0%,#c9bdf5 50%,#b8aaee 100%)",
    border: "#a893e0",
    accent: "#7c5ec9",
    strip: "#f3eeff",
  },
  {
    id: "minty",
    label: "Minty",
    emoji: "🌿",
    bg: "linear-gradient(160deg,#d4f5e5 0%,#c2edda 50%,#aee3cc 100%)",
    border: "#7fcca8",
    accent: "#3fa87a",
    strip: "#edfaf3",
  },
  {
    id: "sunny",
    label: "Sunny",
    emoji: "☀️",
    bg: "linear-gradient(160deg,#fff4c2 0%,#ffe899 50%,#ffd966 100%)",
    border: "#f0c040",
    accent: "#d4920a",
    strip: "#fffae8",
  },
  {
    id: "skyblue",
    label: "Sky Blue",
    emoji: "🫧",
    bg: "linear-gradient(160deg,#d4eeff 0%,#bfe2ff 50%,#a8d6ff 100%)",
    border: "#7bbde8",
    accent: "#3a90d4",
    strip: "#eaf5ff",
  },
];

const STICKER_SETS = [
  { id: "hearts", label: "Hearts", items: ["♡", "♥", "💕", "💗", "💖", "💘"] },
  {
    id: "nature",
    label: "Nature",
    items: ["🌸", "🌼", "🌿", "⭐", "🌙", "☁️"],
  },
  { id: "party", label: "Party", items: ["🎂", "🎉", "🎊", "🎈", "🍰", "🎁"] },
  {
    id: "sparkle",
    label: "Sparkle",
    items: ["✨", "💫", "🌟", "⚡", "🌈", "🦋"],
  },
];

const CAPTIONS = [
  "happy birthday! 🎂",
  "forever my fav ♡",
  "made with love ✨",
  "you are magic 🌟",
  "생일 축하해 💕",
  "", // no caption
];

const TOTAL_SHOTS = 3;
const COUNTDOWN_SEC = 3;

// ─── Helpers ────────────────────────────────────────────────────────────────

function dataURLtoBlob(dataURL) {
  const [header, data] = dataURL.split(",");
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(data);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

// ─── Camera Shot ─────────────────────────────────────────────────────────────

function CameraShot({ index, photo, active, done, onRetake }) {
  return (
    <div
      className={`shot-slot ${active ? "shot-active" : ""} ${done ? "shot-done" : ""}`}
    >
      <div className="shot-number">#{index + 1}</div>
      {photo ? (
        <>
          <img src={photo} alt={`Shot ${index + 1}`} className="shot-preview" />
          <button
            type="button"
            className="retake-btn"
            onClick={() => onRetake(index)}
          >
            ↺ Retake
          </button>
        </>
      ) : (
        <div className="shot-empty">
          {active ? (
            <span className="shot-recording">●</span>
          ) : (
            <span className="shot-placeholder">📷</span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MemoryIsland() {
  const navigate = useNavigate();
  const { progress, completeMission } = useGame();

  // ── Camera state ──
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const cardRef = useRef(null);

  const [step, setStep] = useState("booth"); // 'booth' | 'design' | 'done'
  const [photos, setPhotos] = useState([null, null, null]);
  const [currentShot, setCurrentShot] = useState(0);
  const [countdown, setCountdown] = useState(null); // null | number
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [flash, setFlash] = useState(false);
  const [retakeIndex, setRetakeIndex] = useState(null); // which slot is being retaken

  // ── Design state ──
  const [frame, setFrame] = useState(FRAMES[0]);
  const [stickers, setStickers] = useState([]);
  const [stickerTab, setStickerTab] = useState(0);
  const [caption, setCaption] = useState(CAPTIONS[0]);
  const [saving, setSaving] = useState(false);

  // ── Active shot index ──
  const activeSlot = retakeIndex !== null ? retakeIndex : currentShot;

  // ── Start camera ──
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraReady(true);
      }
    } catch (err) {
      setCameraError(
        "Camera not accessible. Please allow camera permission and try again.",
      );
    }
  }, []);

  // ── Stop camera ──
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraReady(false);
  }, []);

  useEffect(() => {
    if (step === "booth") startCamera();
    return () => stopCamera();
  }, [step]);

  // ── Take photo ──
  const takePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    // Mirror for selfie
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.9);
  }, []);

  // ── Countdown then shoot ──
  const startCountdown = useCallback(() => {
    setCountdown(COUNTDOWN_SEC);
    let n = COUNTDOWN_SEC;
    const tick = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(tick);
        setCountdown(null);
        // Flash
        setFlash(true);
        setTimeout(() => setFlash(false), 350);
        // Capture
        const dataUrl = takePhoto();
        if (!dataUrl) return;
        if (retakeIndex !== null) {
          setPhotos((prev) =>
            prev.map((p, i) => (i === retakeIndex ? dataUrl : p)),
          );
          setRetakeIndex(null);
        } else {
          setPhotos((prev) => {
            const next = [...prev];
            next[currentShot] = dataUrl;
            return next;
          });
          setCurrentShot((prev) => prev + 1);
        }
      } else {
        setCountdown(n);
      }
    }, 1000);
  }, [currentShot, retakeIndex, takePhoto]);

  const allPhotosTaken = photos.every(Boolean);

  const goToDesign = () => {
    stopCamera();
    setStep("design");
    completeMission("memories");
  };

  const handleRetake = (index) => {
    setRetakeIndex(index);
    if (step !== "booth") {
      setStep("booth");
    }
  };

  // ── Sticker toggle ──
  const toggleSticker = (emoji) => {
    setStickers((prev) =>
      prev.includes(emoji) ? prev.filter((s) => s !== emoji) : [...prev, emoji],
    );
  };

  // ── Save / Download ──
  const handleSave = async () => {
    if (!cardRef.current) return;
    setSaving(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const blob = dataURLtoBlob(dataUrl);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "birthday-photocard.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // fallback: open in new tab
      const canvas = await html2canvas(cardRef.current, { scale: 2 });
      window.open(canvas.toDataURL(), "_blank");
    } finally {
      setSaving(false);
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <main className="game-screen page-screen memory-screen">
      <PageTop label="QUEST 02 · MEMORY ISLAND" />

      <section className="game-heading">
        <span className="eyebrow">a little photo moment</span>
        <h1>Photo Booth ♡</h1>
        <p>Strike a pose! Take 3 photos and design your birthday photocard.</p>
      </section>

      {/* ══════════ STEP 1: BOOTH ══════════ */}
      {step === "booth" && (
        <div className="booth-layout">
          {/* Camera panel */}
          <div className="booth-camera-panel">
            <div className={`camera-frame ${flash ? "camera-flash" : ""}`}>
              {cameraError ? (
                <div className="camera-error">
                  <span>📷</span>
                  <p>{cameraError}</p>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={startCamera}
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    className="camera-video"
                    autoPlay
                    playsInline
                    muted
                  />
                  {countdown !== null && (
                    <div className="camera-countdown">{countdown}</div>
                  )}
                  {!cameraReady && (
                    <div className="camera-loading">
                      <span className="camera-spinner" />
                      <span>Starting camera…</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Shoot button */}
            <div className="booth-actions">
              {retakeIndex !== null ? (
                <>
                  <p className="booth-hint">
                    Retaking photo #{retakeIndex + 1}
                  </p>
                  <div className="booth-btn-row">
                    <button
                      type="button"
                      className="shoot-btn"
                      onClick={startCountdown}
                      disabled={!cameraReady || countdown !== null}
                    >
                      {countdown !== null ? countdown : "📸 Shoot"}
                    </button>
                    <button
                      type="button"
                      className="cancel-retake-btn"
                      onClick={() => setRetakeIndex(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : currentShot < TOTAL_SHOTS ? (
                <>
                  <p className="booth-hint">
                    Photo <strong>{currentShot + 1}</strong> of {TOTAL_SHOTS} —
                    smile! 😊
                  </p>
                  <button
                    type="button"
                    className="shoot-btn"
                    onClick={startCountdown}
                    disabled={!cameraReady || countdown !== null}
                  >
                    {countdown !== null ? countdown : "📸 Shoot"}
                  </button>
                </>
              ) : (
                <>
                  <p className="booth-hint all-done-hint">
                    All photos taken! ✓
                  </p>
                  <button
                    type="button"
                    className="primary-button shoot-next-btn"
                    onClick={goToDesign}
                  >
                    Design My Photocard →
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Shot strip preview */}
          <div className="booth-strip">
            <p className="strip-label">Your shots</p>
            {photos.map((photo, i) => (
              <CameraShot
                key={i}
                index={i}
                photo={photo}
                active={i === activeSlot && !allPhotosTaken}
                done={!!photo}
                onRetake={handleRetake}
              />
            ))}
          </div>
        </div>
      )}

      {/* ══════════ STEP 2: DESIGN ══════════ */}
      {step === "design" && (
        <div className="design-layout">
          {/* Left: live photocard preview */}
          <div className="design-preview-col">
            <p className="design-col-label">Preview</p>
            <div
              ref={cardRef}
              className="photocard-render"
              style={{ background: frame.bg, borderColor: frame.border }}
            >
              {/* Sticker overlays */}
              <div className="card-sticker-overlay">
                {stickers.map((s, i) => (
                  <span
                    key={s + i}
                    className="card-sticker"
                    style={{
                      top: `${10 + ((i * 13) % 72)}%`,
                      left: `${5 + ((i * 23) % 82)}%`,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Three photos strip */}
              <div className="card-photos">
                {photos.map((photo, i) => (
                  <div
                    key={i}
                    className="card-photo-cell"
                    style={{ borderColor: frame.border }}
                  >
                    {photo ? (
                      <img
                        src={photo}
                        alt={`Photo ${i + 1}`}
                        className="card-photo-img"
                      />
                    ) : (
                      <span className="card-photo-empty">📷</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Caption bar */}
              <div
                className="card-caption-bar"
                style={{ background: frame.strip, borderColor: frame.border }}
              >
                <span className="card-frame-emoji">{frame.emoji}</span>
                {caption && (
                  <span
                    className="card-caption-text"
                    style={{ color: frame.accent }}
                  >
                    {caption}
                  </span>
                )}
                <span className="card-frame-emoji">{frame.emoji}</span>
              </div>
            </div>

            {/* Retake option */}
            <button
              type="button"
              className="retake-all-btn"
              onClick={() => {
                setPhotos([null, null, null]);
                setCurrentShot(0);
                setRetakeIndex(null);
                setStep("booth");
              }}
            >
              ↺ Retake all photos
            </button>
          </div>

          {/* Right: controls */}
          <div className="design-controls-col">
            {/* Frame picker */}
            <div className="design-card">
              <h3>
                <span className="step-badge">01</span> Choose frame
              </h3>
              <div className="frame-options">
                {FRAMES.map((f) => (
                  <button
                    type="button"
                    key={f.id}
                    className={`frame-choice ${frame.id === f.id ? "selected" : ""}`}
                    style={{ background: f.bg, borderColor: f.border }}
                    onClick={() => setFrame(f)}
                    title={f.label}
                  >
                    <span>{f.emoji}</span>
                    <span className="frame-choice-label">{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sticker picker */}
            <div className="design-card">
              <h3>
                <span className="step-badge">02</span> Add stickers
              </h3>
              <div className="sticker-tabs">
                {STICKER_SETS.map((set, i) => (
                  <button
                    type="button"
                    key={set.id}
                    className={`sticker-tab ${stickerTab === i ? "active" : ""}`}
                    onClick={() => setStickerTab(i)}
                  >
                    {set.label}
                  </button>
                ))}
              </div>
              <div className="sticker-grid">
                {STICKER_SETS[stickerTab].items.map((s) => (
                  <button
                    type="button"
                    key={s}
                    className={`sticker-btn ${stickers.includes(s) ? "sticker-on" : ""}`}
                    onClick={() => toggleSticker(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {stickers.length > 0 && (
                <button
                  type="button"
                  className="clear-stickers-btn"
                  onClick={() => setStickers([])}
                >
                  Clear all stickers
                </button>
              )}
            </div>

            {/* Caption picker */}
            <div className="design-card">
              <h3>
                <span className="step-badge">03</span> Caption
              </h3>
              <div className="caption-options">
                {CAPTIONS.map((c) => (
                  <button
                    type="button"
                    key={c || "none"}
                    className={`caption-btn ${caption === c ? "selected" : ""}`}
                    onClick={() => setCaption(c)}
                  >
                    {c || "— no caption —"}
                  </button>
                ))}
              </div>
            </div>

            {/* Save button */}
            <button
              type="button"
              className="primary-button save-card-btn"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving…" : "⬇ Save Photocard"}
            </button>

            {progress.memories && (
              <div className="success-ribbon">
                🌷 Memory Keeper achievement unlocked!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div className="memory-next-hint">
        <button type="button" onClick={() => navigate("/map")}>
          ← Back to Adventure Map
        </button>
      </div>
    </main>
  );
}
