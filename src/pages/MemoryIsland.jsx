import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useGame } from "../context/GameContext";
import { birthdayContent } from "../data/content";
import { PageTop } from "../components/Decorations";

const PHOTO_COUNT = 3;
const STORAGE_KEY = "little-birthday-photobooth-v1";

const designs = [
  {
    id: "kawaii",
    name: "Kawaii Pink",
    description: "Pink, hearts & bunny vibes",
    emoji: "🎀",
    background: "#ffe8f1",
    panel: "#fffafd",
    accent: "#e66f9c",
    dark: "#754963",
    soft: "#f7b2cf",
    title: "A LITTLE PHOTO MOMENT",
    footer: "made with lots of love ♡",
    decorations: ["♡", "✿", "♡", "✦"],
  },
  {
    id: "lavender",
    name: "Lavender Dream",
    description: "Dreamy purple & sparkles",
    emoji: "🦄",
    background: "#eee8ff",
    panel: "#fffaff",
    accent: "#9278d3",
    dark: "#5e4a89",
    soft: "#c7b5f2",
    title: "DREAMY LITTLE DAY",
    footer: "you make life magical ✧",
    decorations: ["✦", "☾", "✧", "★"],
  },
  {
    id: "strawberry",
    name: "Strawberry Pop",
    description: "Sweet red & cream",
    emoji: "🍓",
    background: "#fff0e9",
    panel: "#fffaf2",
    accent: "#e87979",
    dark: "#844d50",
    soft: "#f6b7a8",
    title: "SWEETEST MEMORIES",
    footer: "berry cute together!",
    decorations: ["🍓", "♡", "✿", "🍓"],
  },
  {
    id: "mint",
    name: "Mint Garden",
    description: "Fresh mint & flowers",
    emoji: "🌷",
    background: "#e7f6ed",
    panel: "#fbfff9",
    accent: "#69a88c",
    dark: "#426d5d",
    soft: "#abd9c4",
    title: "A DAY TO REMEMBER",
    footer: "blooming with happiness ♡",
    decorations: ["✿", "❀", "♡", "✧"],
  },
];

const loadSavedPhotos = () => {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return Array.isArray(value)
      ? [
          ...value.slice(0, PHOTO_COUNT),
          ...Array(Math.max(0, PHOTO_COUNT - value.length)).fill(null),
        ]
      : Array(PHOTO_COUNT).fill(null);
  } catch {
    return Array(PHOTO_COUNT).fill(null);
  }
};

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function drawPhotocard(canvas, photos, design, recipientName) {
  if (!canvas) return;
  const width = 900;
  const height = 2040;
  const ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = design.background;
  ctx.fillRect(0, 0, width, height);

  roundedRect(ctx, 25, 25, 850, 1990, 42);
  ctx.fillStyle = design.panel;
  ctx.fill();
  ctx.save();
  ctx.setLineDash([9, 13]);
  ctx.lineWidth = 4;
  ctx.strokeStyle = design.soft;
  roundedRect(ctx, 43, 43, 814, 1954, 32);
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = "center";
  ctx.fillStyle = design.accent;
  ctx.font = "bold 48px Nunito, Arial, sans-serif";
  ctx.fillText(design.title, width / 2, 142);
  ctx.fillStyle = design.dark;
  ctx.font = "700 34px Nunito, Arial, sans-serif";
  ctx.fillText(
    `for ${recipientName || "my favorite person"} ♡`,
    width / 2,
    202,
  );
  ctx.font = "46px Arial";
  ctx.fillStyle = design.soft;
  ctx.fillText(
    `${design.decorations[0]}       ${design.decorations[1]}       ${design.decorations[2]}`,
    width / 2,
    276,
  );

  const imageLeft = 88;
  const imageWidth = 724;
  const imageHeight = 475;
  const gap = 26;
  const startY = 330;
  const placeholders = ["smile!", "say cheese!", "one more!"];

  for (let i = 0; i < PHOTO_COUNT; i += 1) {
    const y = startY + i * (imageHeight + gap);
    ctx.save();
    ctx.shadowColor = "rgba(110, 75, 104, .14)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 8;
    roundedRect(
      ctx,
      imageLeft - 11,
      y - 11,
      imageWidth + 22,
      imageHeight + 22,
      28,
    );
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.restore();

    ctx.save();
    roundedRect(ctx, imageLeft, y, imageWidth, imageHeight, 19);
    ctx.clip();
    if (photos[i]) {
      try {
        const image = await loadImage(photos[i]);
        const scale = Math.max(
          imageWidth / image.width,
          imageHeight / image.height,
        );
        const drawWidth = image.width * scale;
        const drawHeight = image.height * scale;
        ctx.drawImage(
          image,
          imageLeft + (imageWidth - drawWidth) / 2,
          y + (imageHeight - drawHeight) / 2,
          drawWidth,
          drawHeight,
        );
      } catch {
        ctx.fillStyle = design.soft;
        ctx.fillRect(imageLeft, y, imageWidth, imageHeight);
      }
    } else {
      ctx.fillStyle = design.background;
      ctx.fillRect(imageLeft, y, imageWidth, imageHeight);
      ctx.textAlign = "center";
      ctx.fillStyle = design.accent;
      ctx.font = "bold 38px Nunito, Arial, sans-serif";
      ctx.fillText(placeholders[i], width / 2, y + imageHeight / 2 + 13);
    }
    ctx.restore();

    ctx.textAlign = "left";
    ctx.fillStyle = design.accent;
    ctx.font = "bold 25px Nunito, Arial, sans-serif";
    ctx.fillText(`0${i + 1}  /  03`, imageLeft + 13, y + imageHeight - 18);
    ctx.textAlign = "right";
    ctx.font = "30px Arial";
    ctx.fillText(
      design.decorations[i % design.decorations.length],
      imageLeft + imageWidth - 14,
      y + imageHeight - 14,
    );
  }

  ctx.textAlign = "center";
  ctx.fillStyle = design.accent;
  ctx.font = "bold 37px Nunito, Arial, sans-serif";
  ctx.fillText(design.footer, width / 2, 1904);
  ctx.fillStyle = design.soft;
  ctx.font = "42px Arial";
  ctx.fillText("♡     ✦     ♡", width / 2, 1965);
}

export default function MemoryIsland() {
  const { progress, completeMission } = useGame();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputs = useRef([]);
  const previewCanvas = useRef(null);
  const [photos, setPhotos] = useState(loadSavedPhotos);
  const [selectedSlot, setSelectedSlot] = useState(0);
  const [selectedDesign, setSelectedDesign] = useState("kawaii");
  const [cameraState, setCameraState] = useState("idle");
  const [cameraError, setCameraError] = useState("");
  const [countdown, setCountdown] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [cameraFacing, setCameraFacing] = useState("user");
  const [notice, setNotice] = useState("");

  const currentDesign = useMemo(
    () => designs.find((item) => item.id === selectedDesign) || designs[0],
    [selectedDesign],
  );
  const completedPhotos = photos.filter(Boolean).length;
  const allPhotosReady = completedPhotos === PHOTO_COUNT;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
    } catch {
      setNotice(
        "Penyimpanan browser penuh. Foto tetap bisa dipakai selama halaman ini terbuka.",
      );
    }
  }, [photos]);

  useEffect(() => {
    if (cameraState === "ready" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraState]);

  useEffect(() => {
    if (!previewCanvas.current) return undefined;
    let cancelled = false;
    drawPhotocard(
      previewCanvas.current,
      photos,
      currentDesign,
      birthdayContent.recipientName,
    ).catch(() => {
      if (!cancelled)
        setNotice(
          "Preview photocard belum bisa dibuat. Coba pilih desain lain.",
        );
    });
    return () => {
      cancelled = true;
    };
  }, [photos, currentDesign]);

  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraState("idle");
  }, []);

  const startCamera = async (facing = cameraFacing) => {
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        "Browser ini tidak mendukung akses kamera. Gunakan tombol upload foto sebagai alternatif.",
      );
      setCameraState("error");
      return;
    }
    stopCamera();
    setCameraState("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      });
      streamRef.current = stream;
      setCameraFacing(facing);
      setCameraState("ready");
    } catch (error) {
      const messages = {
        NotAllowedError:
          "Izin kamera belum diberikan. Aktifkan izin kamera di browser, atau upload foto dari perangkat.",
        NotFoundError:
          "Kamera tidak ditemukan di perangkat ini. Kamu tetap bisa upload foto.",
        NotReadableError:
          "Kamera sedang digunakan aplikasi lain. Tutup aplikasi tersebut lalu coba lagi.",
      };
      setCameraError(
        messages[error?.name] ||
          "Kamera tidak dapat dibuka. Pastikan website dibuka melalui localhost atau HTTPS.",
      );
      setCameraState("error");
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || cameraState !== "ready" || isCapturing) return;
    if (!videoRef.current.videoWidth) {
      setNotice(
        "Kamera masih menyiapkan gambar. Coba tekan Capture sekali lagi sebentar ya.",
      );
      return;
    }
    setIsCapturing(true);
    for (let number = 3; number > 0; number -= 1) {
      setCountdown(number);
      await new Promise((resolve) => window.setTimeout(resolve, 700));
    }
    setCountdown("♡");
    await new Promise((resolve) => window.setTimeout(resolve, 250));

    const video = videoRef.current;
    if (video?.videoWidth) {
      const canvas = document.createElement("canvas");
      canvas.width = 720;
      canvas.height = 900;
      const context = canvas.getContext("2d");
      context.save();
      if (cameraFacing === "user") {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }
      const scale = Math.max(
        canvas.width / video.videoWidth,
        canvas.height / video.videoHeight,
      );
      const drawWidth = video.videoWidth * scale;
      const drawHeight = video.videoHeight * scale;
      context.drawImage(
        video,
        (canvas.width - drawWidth) / 2,
        (canvas.height - drawHeight) / 2,
        drawWidth,
        drawHeight,
      );
      context.restore();
      const captured = canvas.toDataURL("image/jpeg", 0.84);
      setPhotos((current) =>
        current.map((photo, index) =>
          index === selectedSlot ? captured : photo,
        ),
      );
      const nextEmpty = photos.findIndex(
        (photo, index) => !photo && index !== selectedSlot,
      );
      if (nextEmpty !== -1) setSelectedSlot(nextEmpty);
      else setSelectedSlot((selectedSlot + 1) % PHOTO_COUNT);
      setNotice(`Foto ${selectedSlot + 1} berhasil diambil! ✨`);
    }
    setCountdown(null);
    setIsCapturing(false);
  };

  const handleUpload = (index, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setNotice("Pilih file gambar seperti JPG, PNG, atau WebP.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 720;
        canvas.height = 900;
        const context = canvas.getContext("2d");
        const scale = Math.max(
          canvas.width / image.width,
          canvas.height / image.height,
        );
        const drawWidth = image.width * scale;
        const drawHeight = image.height * scale;
        context.drawImage(
          image,
          (canvas.width - drawWidth) / 2,
          (canvas.height - drawHeight) / 2,
          drawWidth,
          drawHeight,
        );
        setPhotos((current) =>
          current.map((photo, photoIndex) =>
            photoIndex === index ? canvas.toDataURL("image/jpeg", 0.84) : photo,
          ),
        );
        setSelectedSlot(Math.min(index + 1, PHOTO_COUNT - 1));
        setNotice(`Foto ${index + 1} berhasil ditambahkan! ♡`);
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const downloadPhotocard = async () => {
    if (!allPhotosReady || isDownloading) return;
    setIsDownloading(true);
    try {
      const exportCanvas = document.createElement("canvas");
      await drawPhotocard(
        exportCanvas,
        photos,
        currentDesign,
        birthdayContent.recipientName,
      );
      const blob = await new Promise((resolve) =>
        exportCanvas.toBlob(resolve, "image/png"),
      );
      if (!blob) throw new Error("Tidak dapat membuat file PNG.");
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `birthday-photocard-${currentDesign.id}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1500);
      completeMission("photocard");
      setNotice("Photocard berhasil diunduh! Misi Photocard Studio selesai 🎉");
    } catch {
      setNotice("Photocard belum berhasil diunduh. Coba lagi ya.");
    } finally {
      setIsDownloading(false);
    }
  };

  const clearSlot = (index) => {
    setPhotos((current) =>
      current.map((photo, photoIndex) => (photoIndex === index ? null : photo)),
    );
    setSelectedSlot(index);
  };

  return (
    <main className="game-screen page-screen photobooth-screen">
      <PageTop label="QUEST 02 · PHOTOCARD STUDIO" />
      <section className="game-heading photobooth-heading">
        <span className="eyebrow">strike a pose, little birthday star!</span>
        <h1>Let's Make a Photocard! 📸</h1>
        <p>
          Ambil tiga foto lucu, pilih desain favoritmu, lalu simpan photocard
          kenangannya.
        </p>
        <div className="photobooth-counter">
          <span>📷</span>
          <strong>{completedPhotos} / 3 photos captured</strong>
          <div className="photobooth-dots">
            {photos.map((photo, index) => (
              <i key={index} className={photo ? "is-filled" : ""} />
            ))}
          </div>
        </div>
      </section>

      <section className="photobooth-layout">
        <div className="photobooth-capture-panel">
          <div className="photobooth-panel-heading">
            <div>
              <span className="eyebrow">01 · photo session</span>
              <h2>Say cheeeese! ♡</h2>
            </div>
            <span className="camera-live-pill">
              {cameraState === "ready" ? "● CAMERA READY" : "♡ PHOTO BOOTH"}
            </span>
          </div>

          <div
            className={`camera-preview ${cameraState === "ready" ? "camera-is-live" : ""}`}
          >
            {cameraState === "ready" ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  transform: cameraFacing === "user" ? "scaleX(-1)" : "none",
                }}
                aria-label="Live camera preview"
              />
            ) : (
              <div className="camera-placeholder">
                <span className="camera-placeholder-emoji">🐰📸</span>
                <strong>
                  {cameraState === "starting"
                    ? "Opening your camera..."
                    : "Your photobooth is ready!"}
                </strong>
                <span>Tap start camera, then pose your cutest smile.</span>
              </div>
            )}
            {cameraState === "ready" && (
              <div className="camera-frame-decoration">
                <span>✦</span>
                <span>♡</span>
                <span>✿</span>
                <span>✧</span>
              </div>
            )}
            {countdown !== null && (
              <div className="camera-countdown">{countdown}</div>
            )}
            <span className="camera-corner camera-corner-tl" />
            <span className="camera-corner camera-corner-tr" />
            <span className="camera-corner camera-corner-bl" />
            <span className="camera-corner camera-corner-br" />
          </div>

          <div className="capture-controls">
            {cameraState === "ready" ? (
              <>
                <button
                  type="button"
                  className="soft-button"
                  onClick={() =>
                    startCamera(
                      cameraFacing === "user" ? "environment" : "user",
                    )
                  }
                  disabled={isCapturing}
                >
                  ↻ Flip camera
                </button>
                <button
                  type="button"
                  className="primary-button shutter-button"
                  onClick={capturePhoto}
                  disabled={isCapturing}
                >
                  <span className="shutter-dot" />{" "}
                  {isCapturing
                    ? "Get ready..."
                    : `Capture photo ${selectedSlot + 1}`}
                </button>
                <button
                  type="button"
                  className="soft-button"
                  onClick={stopCamera}
                  disabled={isCapturing}
                >
                  Stop camera
                </button>
              </>
            ) : (
              <button
                type="button"
                className="primary-button"
                onClick={() => startCamera()}
                disabled={cameraState === "starting"}
              >
                📷{" "}
                {cameraState === "starting"
                  ? "Opening camera..."
                  : "Start camera"}
              </button>
            )}
          </div>
          {cameraError && (
            <div className="camera-error" role="alert">
              {cameraError}
            </div>
          )}
          <div className="camera-tip">
            💡 Tips: izinkan akses kamera, posisikan wajah di tengah, lalu ambil
            3 pose berbeda.
          </div>

          <div className="photo-slots-heading">
            <strong>Your 3 snapshots</strong>
            <span>Tap a slot to retake or upload</span>
          </div>
          <div className="photo-slots">
            {photos.map((photo, index) => (
              <div
                className={`photo-slot ${selectedSlot === index ? "is-selected" : ""} ${photo ? "has-photo" : ""}`}
                key={index}
              >
                <button
                  type="button"
                  className="photo-slot-select"
                  onClick={() => setSelectedSlot(index)}
                  aria-label={`Pilih slot foto ${index + 1}`}
                >
                  {photo ? (
                    <img src={photo} alt={`Hasil foto ${index + 1}`} />
                  ) : (
                    <span className="empty-photo-slot">
                      ＋<small>Photo {index + 1}</small>
                    </span>
                  )}
                  <span className="photo-slot-number">0{index + 1}</span>
                </button>
                <div className="photo-slot-actions">
                  <label className="tiny-action">
                    {photo ? "Replace" : "Upload"}
                    <input
                      ref={(element) => {
                        fileInputs.current[index] = element;
                      }}
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={(event) => handleUpload(index, event)}
                    />
                  </label>
                  {photo && (
                    <button
                      type="button"
                      className="tiny-action remove-action"
                      onClick={() => clearSlot(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="photocard-design-panel">
          <div className="photobooth-panel-heading">
            <div>
              <span className="eyebrow">02 · make it yours</span>
              <h2>Choose your style ✨</h2>
            </div>
          </div>
          <div className="design-options">
            {designs.map((design) => (
              <button
                type="button"
                key={design.id}
                className={`design-option ${selectedDesign === design.id ? "is-active" : ""}`}
                onClick={() => setSelectedDesign(design.id)}
              >
                <span className={`design-swatch swatch-${design.id}`}>
                  <i />
                  <i />
                  <i />
                </span>
                <span className="design-option-copy">
                  <strong>{design.name}</strong>
                  <small>{design.description}</small>
                </span>
                <span className="design-check">
                  {selectedDesign === design.id ? "✓" : design.emoji}
                </span>
              </button>
            ))}
          </div>

          <div className="photocard-preview-heading">
            <strong>Live photocard preview</strong>
            <span>
              {currentDesign.emoji} {currentDesign.name}
            </span>
          </div>
          <div className={`photocard-preview-wrap preview-${selectedDesign}`}>
            <canvas
              ref={previewCanvas}
              className="photocard-preview-canvas"
              aria-label="Preview photocard tiga foto"
            />
          </div>
          <div className="download-actions">
            <button
              type="button"
              className="primary-button download-photocard-button"
              onClick={downloadPhotocard}
              disabled={!allPhotosReady || isDownloading}
            >
              {isDownloading ? "Preparing PNG..." : "⬇ Download Photocard"}
            </button>
            {!allPhotosReady && (
              <small>Isi ketiga slot foto untuk membuka tombol download.</small>
            )}
            {progress.photocard && (
              <span className="photocard-complete-label">
                ✓ Photocard quest completed!
              </span>
            )}
          </div>
        </aside>
      </section>

      <div className="photobooth-bottom-actions">
        <Link to="/map" className="soft-button">
          ← Back to Adventure Map
        </Link>
        <span>Three poses, one cute little keepsake ♡</span>
      </div>
      {notice && (
        <div
          className="photobooth-toast"
          role="status"
          onClick={() => setNotice("")}
        >
          {notice}{" "}
          <button type="button" aria-label="Tutup pesan">
            ×
          </button>
        </div>
      )}
    </main>
  );
}
