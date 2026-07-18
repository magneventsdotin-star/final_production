'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ImageWithLoader({ src, alt, className, style, onError, ...props }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'hidden' }} className={className}>
      {isLoading && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: '#111', zIndex: 1,
        }}>
          <Image 
            src="/logo.webp" 
            alt="Loading..."
            width={50}
            height={50}
            style={{ 
              objectFit: 'contain', 
              animation: 'pulse-loader 1.5s infinite ease-in-out' 
            }} 
          />
        </div>
      )}
      <style>{`
        @keyframes pulse-loader {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.8); opacity: 0.5; }
        }
      `}</style>
      <Image
        src={src}
        alt={alt || "Image"}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        style={{ ...style, objectFit: style?.objectFit || 'cover', opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s ease-in-out' }}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          if (onError) onError();
        }}
      />
    </div>
  );
}
