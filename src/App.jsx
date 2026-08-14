import { useEffect, useMemo, useState } from 'react'
import Scene from './three/Scene'
import Intro from './ui/Intro'
import Hud from './ui/Hud'
import StarMap from './ui/StarMap'
import Reader from './ui/Reader'
import Fallback from './ui/Fallback'
import ProjectDirectory from './ui/ProjectDirectory'
import ScrollJourney from './ui/ScrollJourney'
import ObserverIntro from './ui/ObserverIntro'
import OrbitStarCursor from './ui/OrbitStarCursor'
import { hasWebGL } from './lib/perf'
import { routeFromHash } from './lib/navigation'
import { SCENE_STAGE, useCosmos } from './state/store'

export default function App() {
  const webgl = useMemo(hasWebGL, [])
  const stage = useCosmos((state) => state.stage)
  const journeyProgress = useCosmos((state) => state.journeyProgress)
  const restoreRoute = useCosmos((state) => state.restoreRoute)
  const mapOpen = useCosmos((state) => state.mapOpen)
  const directoryOpen = useCosmos((state) => state.directoryOpen)
  const closeOverlays = useCosmos((state) => state.closeOverlays)
  const backToSystem = useCosmos((state) => state.backToSystem)
  const enterSystem = useCosmos((state) => state.enterSystem)
  const [booted, setBooted] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setBooted(true), 40)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (window.location.hash && window.location.hash !== '#space') restoreRoute(routeFromHash(window.location.hash))
    const onHistory = () => restoreRoute(routeFromHash(window.location.hash))
    window.addEventListener('popstate', onHistory)
    return () => window.removeEventListener('popstate', onHistory)
  }, [restoreRoute])

  useEffect(() => {
    const onEscape = (event) => {
      if (event.key !== 'Escape' || stage === SCENE_STAGE.READING || stage === SCENE_STAGE.INTRO) return
      if (mapOpen || directoryOpen) {
        closeOverlays()
      } else if (stage === SCENE_STAGE.PLANET_FOCUS) {
        backToSystem()
      } else if (stage === SCENE_STAGE.GALAXY_TRANSIT) {
        enterSystem()
      }
    }
    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [stage, mapOpen, directoryOpen, closeOverlays, backToSystem, enterSystem])

  if (!webgl) return <><Fallback /><ProjectDirectory /></>

  return (
    <div className={`app ${booted ? 'is-booted' : ''} stage-${stage}`} data-journey-progress={journeyProgress}>
      <ScrollJourney />
      <OrbitStarCursor />
      <Scene />
      <Intro />
      <Hud />
      <ObserverIntro />
      <ProjectDirectory />
      <StarMap />
      <Reader />
      <div className="vignette" aria-hidden="true" />
      <noscript>请开启 JavaScript 以浏览这片宇宙。</noscript>
    </div>
  )
}
