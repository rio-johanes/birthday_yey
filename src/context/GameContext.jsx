import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "little-birthday-adventure-progress-v1";

const initialProgress = {
  garden: false,
  memories: false,
  photocard: false,
  cake: false,
  giftOpened: false,
};

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved
        ? { ...initialProgress, ...JSON.parse(saved) }
        : initialProgress;
    } catch {
      return initialProgress;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const completeMission = (mission) => {
    setProgress((current) => ({ ...current, [mission]: true }));
  };

  const openGift = () => {
    setProgress((current) => ({ ...current, giftOpened: true }));
  };

  const resetProgress = () => {
    setProgress(initialProgress);
    localStorage.removeItem(STORAGE_KEY);
  };

  const completedCount = [
    progress.garden,
    progress.memories,
    progress.cake,
  ].filter(Boolean).length;
  const value = useMemo(
    () => ({
      progress,
      completedCount,
      completeMission,
      openGift,
      resetProgress,
      isMemoryUnlocked: progress.garden,
      isCakeUnlocked: progress.garden && progress.memories,
      isCastleUnlocked: progress.garden && progress.memories && progress.cake,
    }),
    [progress, completedCount],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used inside GameProvider");
  return context;
}
