import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { birthdayContent } from '../data/content';
import ProgressPills from '../components/ProgressPills';
import { Bunny, FloatingDecor, MusicToggle } from '../components/Decorations';

const missions = [
  { key: 'garden', title: 'Starry Garden', subtitle: 'Catch the happiness!', emoji: '🌸', image: '/assets/images/island-garden.svg', path: '/garden', locked: false, number: '01' },
  { key: 'memories', title: 'Memory Island', subtitle: 'Little moments together', emoji: '📸', image: '/assets/images/island-memory.svg', path: '/memories', number: '02' },
  { key: 'cake', title: 'Sweet Cake Town', subtitle: 'Bake a sweet surprise', emoji: '🎂', image: '/assets/images/island-cake.svg', path: '/cake', number: '03' },
];

export default function AdventureMap() {
  const { progress, completedCount, isMemoryUnlocked, isCakeUnlocked } = useGame();
  const unlocked = { garden: true, memories: isMemoryUnlocked, cake: isCakeUnlocked };

  return (
    <main className="map-screen page-screen">
      <FloatingDecor />
      <header className="map-topbar">
        <Link to="/" className="back-pill">← <span>Home</span></Link>
        <div className="map-brand">YOUR ADVENTURE <span>✦</span></div>
        <MusicToggle />
      </header>
      <section className="map-heading">
        <span className="eyebrow">chapter one · the journey begins</span>
        <h1>Welcome, {birthdayContent.recipientName}!</h1>
        <p>Three little adventures are waiting for you.</p>
        <ProgressPills completedCount={completedCount} />
      </section>

      <section className="island-map" aria-label="Peta petualangan">
        <div className="map-rainbow">🌈</div>
        <div className="map-cloud map-cloud-one">☁</div>
        <div className="map-cloud map-cloud-two">☁</div>
        <div className="map-path path-one" />
        <div className="map-path path-two" />
        {missions.map((mission, index) => {
          const done = progress[mission.key];
          const canEnter = unlocked[mission.key];
          return (
            <Link
              key={mission.key}
              to={canEnter ? mission.path : '/map'}
              onClick={(event) => { if (!canEnter) event.preventDefault(); }}
              className={`island-card island-${index + 1} ${done ? 'is-complete' : ''} ${!canEnter ? 'is-locked' : ''}`}
              aria-disabled={!canEnter}
            >
              <div className="island-art-wrap">
                <img src={mission.image} alt="" className="island-art" />
                {done && <span className="island-check">✓</span>}
                {!canEnter && <span className="island-lock">🔒</span>}
              </div>
              <div className="island-info">
                <span className="island-number">QUEST {mission.number}</span>
                <strong>{mission.title}</strong>
                <small>{done ? 'Completed! ✨' : canEnter ? mission.subtitle : 'Complete the previous quest'}</small>
              </div>
              <span className="island-star">{done ? '⭐' : mission.emoji}</span>
            </Link>
          );
        })}
      </section>

      <div className="map-bottom-card">
        <div className="map-mascot"><Bunny /></div>
        <div className="map-bottom-copy">
          <strong>{completedCount === 3 ? 'All quests completed!' : 'You got this, little star!'}</strong>
          <span>{completedCount === 3 ? 'Your final treasure is ready.' : 'Complete every little quest to unlock your surprise.'}</span>
          <div className="map-progress-track"><i style={{ width: `${(completedCount / 3) * 100}%` }} /></div>
        </div>
        <div className="map-bottom-stars">{[0, 1, 2].map((i) => <span key={i} className={i < completedCount ? 'earned' : ''}>★</span>)}</div>
      </div>
      {completedCount === 3 && <div className="map-castle-action"><Link to="/castle" className="primary-button">Enter Birthday Castle 🏰</Link></div>}
      <footer className="map-footnote">Psst... your surprise is waiting at the end <span>♡</span></footer>
    </main>
  );
}
