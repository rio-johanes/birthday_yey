import { Link } from 'react-router-dom';
import { birthdayContent } from '../data/content';
import { Bunny, FloatingDecor, MusicToggle } from '../components/Decorations';

export default function Welcome() {
  return (
    <main className="welcome-screen page-screen">
      <FloatingDecor />
      <header className="welcome-top">
        <div className="brand-mark"><span>♡</span> A LITTLE ADVENTURE</div>
        <MusicToggle />
      </header>
      <section className="welcome-content">
        <div className="welcome-copy">
          <span className="eyebrow">a tiny world, just for you</span>
          <h1>A Little Birthday <em>Adventure!</em></h1>
          <p className="welcome-subtitle">{birthdayContent.subtitle}</p>
          <div className="welcome-note">
            <span className="note-sparkle">✦</span>
            <p>Hellooo, <strong>{birthdayContent.recipientName}</strong>!<br />Someone prepared a little surprise for you...</p>
            <span className="note-heart">♡</span>
          </div>
          <Link to="/map" className="primary-button big-button">Start Adventure <span>➜</span></Link>
          <p className="made-with">made with lots of love <span>♡</span></p>
        </div>
        <div className="welcome-art">
          <div className="art-halo" />
          <div className="art-sparkle sparkle-one">✦</div>
          <div className="art-sparkle sparkle-two">✧</div>
          <div className="welcome-cloud cloud-left" />
          <div className="welcome-cloud cloud-right" />
          <img src="/assets/images/gift-box.svg" alt="Kotak hadiah ulang tahun" className="welcome-gift" />
          <Bunny className="welcome-bunny" />
          <span className="floating-heart">♥</span>
          <span className="floating-star">✦</span>
        </div>
      </section>
      <footer className="welcome-footer">A little adventure, made just for you <span>♡</span></footer>
    </main>
  );
}
