"use client";

import { useEffect, useRef } from 'react'

export default function TiltCard({ children, className = '', ...props }) {
  const ref = useRef(null)
  const rafRef = useRef(null)

  const canAnimateTilt =
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function handleMouseMove(e) {
    if (!canAnimateTilt) return
    const el = ref.current
    if (!el) return
    const { left, top, width, height } = el.getBoundingClientRect()
    const x = (e.clientX - left) / width - 0.5
    const y = (e.clientY - top) / height - 0.5

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      el.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`
    })
  }

  function handleMouseLeave() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (ref.current) ref.current.style.transform = ''
  }

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <article ref={ref} className={className} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} {...props}>
      {children}
    </article>
  )
}
