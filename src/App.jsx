import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { GameProvider } from "./context/GameContext";
import Welcome from "./pages/Welcome";
import AdventureMap from "./pages/AdventureMap";
import StarryGarden from "./pages/StarryGarden";
import MemoryIsland from "./pages/MemoryIsland";
import CakeTown from "./pages/CakeTown";
import BirthdayCastle from "./pages/BirthdayCastle";
import FinalSurprise from "./pages/FinalSurprise";

function MusicPlayer() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);

  // Start on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (started) return;
      setStarted(true);
      audioRef.current
        ?.play()
        .then(() => setPlaying(true))
        .catch(() => {});
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
    window.addEventListener("click", handleFirstInteraction);
    window.addEventListener("keydown", handleFirstInteraction);
    window.addEventListener("touchstart", handleFirstInteraction);
    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, [started]);

  const toggle = (e) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => {});
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/assets/audio/birthday.mp3" loop />
      <button
        type="button"
        className={`music-toggle ${playing ? "music-playing" : ""}`}
        onClick={toggle}
        aria-label={playing ? "Pause music" : "Play music"}
        title={playing ? "Pause music" : "Play music"}
      >
        {playing ? "♪" : "♩"}
      </button>
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/map" element={<AdventureMap />} />
      <Route path="/garden" element={<StarryGarden />} />
      <Route path="/memories" element={<MemoryIsland />} />
      <Route path="/cake" element={<CakeTown />} />
      <Route path="/castle" element={<BirthdayCastle />} />
      <Route path="/letter" element={<FinalSurprise />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <GameProvider>
        <div className="app-shell">
          <AppRoutes />
          <MusicPlayer />
        </div>
      </GameProvider>
    </BrowserRouter>
  );
}
