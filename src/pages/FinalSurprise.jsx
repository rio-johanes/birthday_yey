import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { birthdayContent } from '../data/content';
import { useGame } from '../context/GameContext';
import { Bunny, PageTop } from '../components/Decorations';

export default function FinalSurprise() {
  const { progress, resetProgress } = useGame();
  const [letterOpen, setLetterOpen] = useState(false);
  if (!progress.giftOpened) return <Navigate to="/castle" replace />;

  return (
    <main className="letter-screen page-screen">
      <PageTop label="A LITTLE LETTER FOR YOU" />
      <section className="letter-heading">
        <span className="eyebrow">the last page of our adventure</span>
        <h1>Happy Birthday! ♡</h1>
        <p>You made it to the sweetest part.</p>
      </section>

      {!letterOpen ? (
        <section className="envelope-scene">
          <div className="envelope-glow" />
          <div className="envelope-card">
            <div className="envelope-flap" />
            <div className="envelope-heart">♥</div>
            <span className="envelope-label">a little letter, just for you</span>
          </div>
          <Bunny className="letter-bunny" />
          <button type="button" className="primary-button big-button" onClick={() => setLetterOpen(true)}>Open My Letter ♡</button>
        </section>
      ) : (
        <section className="letter-paper-wrap">
          <div className="letter-paper">
            <div className="letter-paper-top"><span>✿</span><span>♡</span><span>✿</span></div>
            <span className="letter-small-title">TO MY FAVORITE PERSON</span>
            <h2>{birthdayContent.letterTitle}</h2>
            <div className="letter-body">
              {birthdayContent.letterParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
            <div className="letter-signature">With all my love,<br /><strong>{birthdayContent.senderName} ♡</strong></div>
            <div className="letter-sticker sticker-one">🌷</div>
            <div className="letter-sticker sticker-two">💗</div>
          </div>
          <div className="letter-end-actions">
            <button type="button" className="soft-button" onClick={() => setLetterOpen(false)}>Close letter</button>
            <Link to="/map" className="primary-button">Back to our little world</Link>
          </div>
          <button type="button" className="reset-link" onClick={() => { resetProgress(); window.location.href = '/'; }}>↻ Replay the adventure</button>
        </section>
      )}
      <footer className="letter-footer">Made with love, just for you <span>♡</span></footer>
    </main>
  );
}
