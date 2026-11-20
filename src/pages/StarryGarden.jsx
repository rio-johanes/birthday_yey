import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Bunny, PageTop } from '../components/Decorations';

const makeStars = () => Array.from({ length: 7 }, (_, index) => ({
  id: `${Date.now()}-${index}-${Math.random()}`,
  left: 5 + Math.random() * 88,
  delay: Math.random() * 1.8,
  size: 22 + Math.random() * 16,
}));

export default function StarryGarden() {
  const { progress, completeMission } = useGame();
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [seconds, setSeconds] = useState(30);
  const [stars, setStars] = useState([]);
  const won = progress.garden || score >= 10;
  const finished = !isPlaying && seconds === 0 && score < 10 && !progress.garden;

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = window.setInterval(() => {
      setSeconds((remaining) => {
        if (remaining <= 1) {
          window.clearInterval(timer);
          setIsPlaying(false);
          return 0;
        }
        return remaining - 1;
      });
    }, 1000);
    const spawner = window.setInterval(() => {
      setStars((current) => [...current.slice(-9), ...makeStars().slice(0, 2)]);
    }, 950);
    return () => {
      window.clearInterval(timer);
      window.clearInterval(spawner);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (score >= 10 && isPlaying) {
      setIsPlaying(false);
      completeMission('garden');
      setStars([]);
    }
  }, [score, isPlaying, completeMission]);

  const startGame = () => {
    setScore(0);
    setSeconds(30);
    setStars(makeStars());
    setIsPlaying(true);
  };

  const catchStar = (id) => {
    if (!isPlaying) return;
    setStars((current) => current.filter((star) => star.id !== id));
    setScore((current) => Math.min(10, current + 1));
  };

  const statusText = useMemo(() => {
    if (progress.garden) return 'Mission completed! You are a little star collector.';
    if (won) return 'YAY! You collected all the stars!';
    if (finished) return 'Aww, time is up! Try one more time?';
    if (isPlaying) return 'Tap the falling stars before they disappear!';
    return 'Collect 10 little stars before the timer runs out.';
  }, [progress.garden, won, finished, isPlaying]);

  return (
    <main className="game-screen page-screen garden-screen">
      <PageTop label="QUEST 01 · STARRY GARDEN" />
      <section className="game-heading">
        <span className="eyebrow">a little sparkle mission</span>
        <h1>Catch the Happiness!</h1>
        <p>{statusText}</p>
      </section>

      <div className="game-stats-row">
        <div className="stat-chip">⭐ <strong>{progress.garden ? 10 : score} / 10</strong></div>
        <div className="stat-chip">◷ <strong>00:{String(seconds).padStart(2, '0')}</strong></div>
      </div>

      <section className="star-game-board" aria-label="Area permainan menangkap bintang">
        <div className="game-board-sky" />
        <div className="game-board-cloud cloud-left" />
        <div className="game-board-cloud cloud-right" />
        <div className="game-board-hill hill-back" />
        <div className="game-board-hill hill-front" />
        {stars.map((star) => (
          <button
            type="button"
            key={star.id}
            className="falling-star"
            style={{ left: `${star.left}%`, animationDelay: `${star.delay}s`, fontSize: `${star.size}px` }}
            onClick={() => catchStar(star.id)}
            aria-label="Tangkap bintang"
          >★</button>
        ))}
        <div className="basket-character"><Bunny /></div>
        {!isPlaying && !progress.garden && (
          <div className="game-board-overlay">
            <span className="overlay-icon">{finished ? '🥺' : '🌟'}</span>
            <strong>{finished ? 'Almost there!' : 'Ready, little star?'}</strong>
            <span>{finished ? 'You can try again!' : 'Tap the stars to collect them.'}</span>
            <button type="button" className="primary-button" onClick={startGame}>{finished ? 'Try Again' : 'Start Game'}</button>
          </div>
        )}
        {(won || progress.garden) && (
          <div className="game-board-overlay win-overlay">
            <span className="overlay-icon">🎉</span>
            <strong>YAY! YOU DID IT!</strong>
            <span>10 little stars collected. You are amazing!</span>
            <Link to="/map" className="primary-button">Collect Reward ⭐</Link>
          </div>
        )}
        <div className="game-board-ground-label">a garden full of tiny wishes ♡</div>
      </section>
      <div className="game-tip">TIP: Tap each glowing star. You can play again anytime!</div>
    </main>
  );
}
