export default function Stars({ count = 5 }) {
  return (
    <span className="stars-row" aria-label={`${count} stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="star">★</span>
      ))}
    </span>
  )
}
