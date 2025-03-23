'use client'
import { useCallback, useEffect, useState } from 'react'

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [previousY, setPreviousY] = useState(0)

  const toggleVisibility = useCallback(() => {
    const currentY = window.scrollY
    setIsVisible(currentY < previousY && currentY > 0)
    setPreviousY(currentY)
  }, [previousY])

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [toggleVisibility])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button type="button" onClick={scrollToTop} title="Back to Top" className={`fixed right-4 z-10 w-10 h-10 inline-flex items-center justify-center bg-primary-light hover:bg-primary-tone text-white rounded-full transition-colors duration-500 hover:bg-primary-dark cursor-pointer ease-in-out ${isVisible ? 'bottom-4' : '-bottom-10 pointer-events-none'}`}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </button>
  )
}
