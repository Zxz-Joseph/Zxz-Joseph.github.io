import { useEffect, useRef } from 'react'

export default function PortraitScene({ portraitUrl }: { portraitUrl: string }) {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = container.current
    if (!element) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mobile = window.matchMedia('(max-width: 700px)')
    let frame = 0
    let pointerX = 0
    let pointerY = 0

    const render = () => {
      frame = 0
      const reduced = reducedMotion.matches
      const progress = reduced ? 0 : Math.min(window.scrollY / window.innerHeight, 1)
      const x = reduced || mobile.matches ? 0 : pointerX * 9
      const y = reduced || mobile.matches ? 0 : pointerY * 5
      element.style.setProperty('--portrait-x', `${x}px`)
      element.style.setProperty('--portrait-y', `${y - progress * (mobile.matches ? 8 : 20)}px`)
      element.style.setProperty('--portrait-angle', `${x * 0.08}deg`)
    }
    const update = () => {
      if (document.visibilityState === 'hidden' || frame) return
      frame = window.requestAnimationFrame(render)
    }
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || reducedMotion.matches || mobile.matches) return
      pointerX = event.clientX / window.innerWidth * 2 - 1
      pointerY = event.clientY / window.innerHeight * 2 - 1
      update()
    }
    const resetPointer = () => { pointerX = 0; pointerY = 0; update() }

    render()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('resize', update)
    document.documentElement.addEventListener('pointerleave', resetPointer)
    document.addEventListener('visibilitychange', update)
    reducedMotion.addEventListener('change', update)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('resize', update)
      document.documentElement.removeEventListener('pointerleave', resetPointer)
      document.removeEventListener('visibilitychange', update)
      reducedMotion.removeEventListener('change', update)
    }
  }, [])

  return (
    <div className="portrait-stage" ref={container} aria-hidden="true">
      <div className="portrait-halo" />
      <div className="portrait-photo"><img src={portraitUrl} alt="" loading="eager" /></div>
      <div className="portrait-vignette" />
      <span className="portrait-label">ZHANG XINZHEN <span>张鑫振</span></span>
    </div>
  )
}
