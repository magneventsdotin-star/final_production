"use client";

import { useEffect } from 'react';

export function useMouseGlow() {
  useEffect(() => {
    const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!supportsHover) return;

    const root = document.documentElement;
    let rafId = 0;
    let currentX = 50;
    let currentY = 12;
    let targetX = 50;
    let targetY = 12;

    const tick = () => {
      const dx = targetX - currentX;
      const dy = targetY - currentY;


      if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
        currentX += dx * 0.07;
        currentY += dy * 0.07;

        root.style.setProperty('--mx', `${currentX.toFixed(1)}%`);
        root.style.setProperty('--my', `${currentY.toFixed(1)}%`);
      }

      rafId = globalThis.requestAnimationFrame(tick);
    };

    const onPointerMove = event => {
      targetX = (event.clientX / globalThis.innerWidth) * 100;
      targetY = (event.clientY / globalThis.innerHeight) * 100;
    };

    rafId = globalThis.requestAnimationFrame(tick);
    globalThis.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => {
      globalThis.cancelAnimationFrame(rafId);
      globalThis.removeEventListener('pointermove', onPointerMove);
      root.style.removeProperty('--mx');
      root.style.removeProperty('--my');
    };
  }, []);
}
