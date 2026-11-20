import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Bunny, PageTop } from '../components/Decorations';

export default function BirthdayCastle() {
  const navigate = useNavigate();
  const { completedCount, isCastleUnlocked, openGift, progress } = useGame();
  const [opening, setOpening] = useState(false);
  const [opened, setOpened] = useState(progress.giftOpened);

  const revealGift = () => {
    if (opening || opened) return;
    setOpening(true);
    window.setTimeout(() => {
      setOpening(false);
      setOpened(true);
      openGift();
    }, 800);
  };

  if (!isCastleUnlocked) {
    return (
      <main className="game-screen page-screen locked-screen">
        <PageTop label="THE FINAL CASTLE" />
        <div className="locked-card">
          <div className="locked-emoji">🏰</div>
          <h1>Almost there!</h1>
          <p>Complete all three little quests to open the Birthday Castle.</p>
          <div className="locked-progress">⭐ {completedCount} / 3 quests completed</div>
          <Link to="/map" className="primary-button">Back to my quests</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="castle-screen page-screen">
      <PageTop label="THE FINAL TREASURE" />
      <div className="castle-skyline" aria-hidden="true">
        <span className="castle-cloud c1">☁</span><span className="castle-cloud c2">☁</span><span className="castle-spark s1">✦</span><span className="castle-spark s2">✧</span>
        <img src="/assets/images/castle.svg" alt="Kastil ulang tahun" />
      </div>
      <section className="castle-content">
        <span className="eyebrow">you made it, birthday star!</span>
        <h1>{opened ? 'Your surprise is here!' : 'Congratulations!'}</h1>
        <p>{opened ? 'One last little thing is waiting for you...' : 'You completed all the little quests!'}</p>
        <div className="earned-stars"><span>⭐</span><span>⭐</span><span>⭐</span></div>
        <div className={`big-gift ${opening ? 'gift-opening' : ''} ${opened ? 'gift-opened' : ''}`}>
          <img src="/assets/images/gift-box.svg" alt="Hadiah ulang tahun" />
          {opened && <span className="gift-rays">✨</span>}
        </div>
        {opened ? (
          <button type="button" className="primary-button big-button" onClick={() => navigate('/letter')}>Read My Letter ♡</button>
        ) : (
          <button type="button" className="primary-button big-button" onClick={revealGift} disabled={opening}>{opening ? 'Opening your gift...' : 'Open My Gift ♡'}</button>
        )}
        <div className="castle-bunny"><Bunny /></div>
      </section>
    </main>
  );
}
