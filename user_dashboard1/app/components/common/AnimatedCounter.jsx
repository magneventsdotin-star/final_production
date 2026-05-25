"use client";

import { useEffect, useRef } from 'react'
import { animate, useInView } from 'framer-motion'

export default function AnimatedCounter({ to, suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  useEffect(() => {
    if (!inView || !ref.current) return;
    
    const node = ref.current;
    
    const controls = animate(0, to, {
      duration: 2.5,
      ease: 'easeOut',
      onUpdate(value) {
        node.textContent = Math.round(value).toLocaleString('en-IN') + suffix;
      }
    });

    return () => controls.stop();
  }, [inView, to, suffix]);

  return (
    <span ref={ref}>0{suffix}</span>
  )
}
