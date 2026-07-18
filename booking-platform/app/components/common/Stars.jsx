export default function Stars({ count = 5 }) {
  const activeCount = Math.min(Math.max(0, count), 5);
  
  return (
    <span className="stars-row" aria-label={`${activeCount} out of 5 stars`} style={{ display: 'flex', gap: '2px' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="star" style={{ color: i < activeCount ? '#f59e0b' : 'rgba(255,255,255,0.2)' }}>★</span>
      ))}
    </span>
  )
}
