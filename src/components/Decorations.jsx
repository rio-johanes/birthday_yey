import { useEffect, useRef, useState } from 'react';

export function FloatingDecor() {
  return (
    <div className="floating-decor" aria-hidden="true">
      <span className="decor-star star-a">✦</span>
      <span className="decor-star star-b">✧</span>
      <span className="decor-heart heart-a">♡</span>
      <span className="decor-heart heart-b">♥</span>
      <span className="decor-cloud cloud-a" />
      <span className="decor-cloud cloud-b" />
      <span className="decor-cloud cloud-c" />
    </div>
  );
}

export function Bunny({ className = '' }) {
  return <img className={`bunny-mascot ${className}`} src="/assets/images/mascot-bunny.svg" alt="Bubu si kelinci kecil" />;
}

export function MusicToggle() {
  const [enabled, setEnabled] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const audioRef = useRef(null);

  const toggleMusic = async () => {
    if (enabled) {
      audioRef.current?.pause();
      setEnabled(false);
      return;
    }
    try {
      await audioRef.current?.play();
      setEnabled(true);
      setShowHint(false);
    } catch {
      setShowHint(true);
      window.setTimeout(() => setShowHint(false), 3500);
    }
  };

  return (
    <span className="music-control-wrap">
      <button
        type="button"
        className={`music-toggle ${enabled ? 'is-on' : ''}`}
        onClick={toggleMusic}
        aria-label={enabled ? 'Matikan musik' : 'Aktifkan musik'}
        title="Putar musik latar"
      >
        {enabled ? '♫' : '♪'}
      </button>
      <audio ref={audioRef} src="/assets/audio/birthday.mp3" loop preload="none" />
      {showHint && <span className="music-hint">Tambahkan <b>birthday.mp3</b> ke public/assets/audio/</span>}
    </span>
  );
}

export function PageTop({ backTo = '/map', label = 'ADVENTURE MODE' }) {
  return (
    <div className="page-top">
      <a className="back-pill" href={backTo}>← <span>Back</span></a>
      <span className="page-kicker">{label}</span>
      <MusicToggle />
    </div>
  );
}

export function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(onClose, 2500);
    return () => window.clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;
  return <div className="toast-message" role="status">{message}</div>;
}
