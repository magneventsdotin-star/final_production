import { useRef, useEffect } from 'react'
import { useInView } from 'framer-motion'

export function useReveal(delay = 0) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px 0px" })

  useEffect(() => {
    if (isInView && ref.current) {
      ref.current.classList.add('visible')
    }
  }, [isInView])

  return ref
}
