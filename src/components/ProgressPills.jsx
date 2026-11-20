export default function ProgressPills({ completedCount }) {
  return (
    <div className="progress-pill" aria-label={`${completedCount} dari 3 misi selesai`}>
      <span>⭐</span>
      <strong>{completedCount} / 3</strong>
      <div className="progress-dots">
        {[0, 1, 2].map((item) => <i key={item} className={item < completedCount ? 'filled' : ''} />)}
      </div>
    </div>
  );
}
