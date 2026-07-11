import Image from 'next/image'

export default function BrandMark({ size = 'md', showTag = false, light = false, hideText = false }) {
  const markSizeMap = { sm: 22, md: 28, lg: 36 }
  const titleSizeMap = { sm: '18px', md: '20px', lg: '25px' }
  const markSize = markSizeMap[size] ?? markSizeMap.md
  const titleSize = titleSizeMap[size] ?? titleSizeMap.md
  const textColor = light ? '#ffffff' : 'var(--text-primary)'

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      <span
        aria-hidden="true"
        style={{
          width: `${markSize * 1.5}px`, 
          height: `${markSize * 1.5}px`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <Image
          src="/logo.webp"
          alt="Magnevents"
          fill
          unoptimized={true}
          style={{
            objectFit: 'contain',
            filter: 'invert(1) brightness(2)' 
          }}
        />
      </span>
      {!hideText && (
        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span
            style={{
              fontSize: titleSize,
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: textColor,
              textShadow: light ? '0 6px 18px rgba(0,0,0,0.25)' : 'none',
            }}
          >
            Magnevents
          </span>
          {showTag && (
            <span
              style={{
                fontSize: '10px',
                letterSpacing: '0.09em',
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
                marginTop: '3px',
              }}
            >
              Book bands. Create moments.
            </span>
          )}
        </span>
      )}
    </span>
  )
}
