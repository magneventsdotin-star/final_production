export default function BenefitItem({ label }) {
  return (
    <div className="footer-benefit">
      <div className="benefit-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFE032" strokeWidth="3">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <span>{label}</span>
    </div>
  )
}
