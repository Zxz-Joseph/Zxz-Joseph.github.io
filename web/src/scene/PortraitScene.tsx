import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { assetUrl } from '../data/profile'

const ModelCanvas = lazy(() => import('./ModelCanvas'))

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onFailure() }
  render() { return this.state.failed ? null : this.props.children }
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => setReduced(query.matches)
    query.addEventListener('change', change)
    return () => query.removeEventListener('change', change)
  }, [])
  return reduced
}

function useSceneVisibility() {
  const [active, setActive] = useState(true)
  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 700px)')
    let heroVisible = true
    const update = () => setActive(document.visibilityState !== 'hidden' && (!mobile.matches || heroVisible))
    const hero = document.getElementById('about')
    const observer = new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting
      update()
    }, { rootMargin: '-90px 0px 0px 0px' })
    if (hero) observer.observe(hero)
    mobile.addEventListener('change', update)
    document.addEventListener('visibilitychange', update)
    update()
    return () => {
      observer.disconnect()
      mobile.removeEventListener('change', update)
      document.removeEventListener('visibilitychange', update)
    }
  }, [])
  return active
}

export default function PortraitScene({ modelUrl, portraitUrl }: { modelUrl: string | null; portraitUrl: string }) {
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const reducedMotion = useReducedMotion()
  const active = useSceneVisibility()
  const container = useRef<HTMLDivElement>(null)
  const onFailure = useCallback(() => { setFailed(true); setReady(false) }, [])
  const onReady = useCallback(() => setReady(true), [])

  useEffect(() => {
    if (!modelUrl || failed || ready) return
    const timeout = window.setTimeout(onFailure, 30000)
    return () => window.clearTimeout(timeout)
  }, [modelUrl, failed, ready, onFailure])

  useEffect(() => {
    const element = container.current
    if (!element) return
    // Capture the non-bubbling event so context loss immediately restores the stylized fallback.
    element.addEventListener('webglcontextlost', onFailure, true)
    return () => element.removeEventListener('webglcontextlost', onFailure, true)
  }, [onFailure])

  return (
    <div className={`portrait-stage${ready && !failed ? ' model-ready' : ''}`} ref={container} aria-hidden="true">
      <div className="portrait-halo" />
      <div className="portrait-photo"><img src={portraitUrl} alt="" loading="eager" /></div>
      {modelUrl && !failed && (
        <div className="portrait-canvas">
          <SceneBoundary onFailure={onFailure}>
            <Suspense fallback={null}>
              <ModelCanvas url={assetUrl(modelUrl)} reducedMotion={reducedMotion} active={active} onReady={onReady} />
            </Suspense>
          </SceneBoundary>
        </div>
      )}
      <div className="portrait-vignette" />
      <span className="portrait-label">ZHANG XINZHEN <span>张鑫振</span></span>
    </div>
  )
}
