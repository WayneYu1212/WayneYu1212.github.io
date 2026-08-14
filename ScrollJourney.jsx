import { useEffect } from 'react'
import {
  JOURNEY_STOPS,
  advanceJourneyWithStops,
  boundedWheelDelta,
  snapProgress,
} from '../lib/journey'
import { pushRoute } from '../lib/navigation'
import { SCENE_STAGE, useCosmos } from '../state/store'

const nextStop = (progress, direction) => {
  const ordered = direction > 0 ? JOURNEY_STOPS : [...JOURNEY_STOPS].reverse()
  return ordered.find((stop) => direction > 0
    ? stop.progress > progress + 0.001
    : stop.progress < progress - 0.001)
}

export default function ScrollJourney() {
  useEffect(() => {
    let touchY = null
    let snapTimer = null
    let gestureStop = null

    const blocked = () => {
      const state = useCosmos.getState()
      return Boolean(state.open || state.directoryOpen || state.mapOpen)
    }

    const scheduleSnap = () => {
      window.clearTimeout(snapTimer)
      snapTimer = window.setTimeout(() => {
        const state = useCosmos.getState()
        state.setJourneyProgress(snapProgress(state.journeyProgress))
        gestureStop = null
      }, 180)
    }

    const onWheel = (event) => {
      if (blocked()) return
      event.preventDefault()
      if (gestureStop) {
        scheduleSnap()
        return
      }
      const state = useCosmos.getState()
      const next = advanceJourneyWithStops(
        state.journeyProgress,
        boundedWheelDelta(event.deltaY, event.deltaMode),
      )
      state.setJourneyProgress(next.progress)
      gestureStop = next.stoppedAt
      scheduleSnap()
    }

    const onTouchStart = (event) => {
      touchY = event.touches[0]?.clientY ?? null
    }

    const onTouchMove = (event) => {
      if (touchY == null || blocked()) return
      const nextY = event.touches[0]?.clientY
      if (nextY == null) return
      if (!gestureStop) {
        const state = useCosmos.getState()
        const next = advanceJourneyWithStops(
          state.journeyProgress,
          boundedWheelDelta((touchY - nextY) * 4.8),
        )
        state.setJourneyProgress(next.progress)
        gestureStop = next.stoppedAt
      }
      touchY = nextY
      scheduleSnap()
    }

    const onTouchEnd = () => {
      touchY = null
      gestureStop = null
    }

    const onKeyDown = (event) => {
      if (blocked()) return
      const state = useCosmos.getState()
      const backward = event.key === 'ArrowUp' || event.key === 'PageUp' || (event.key === ' ' && event.shiftKey)
      const forward = event.key === 'ArrowDown' || event.key === 'PageDown' || (event.key === ' ' && !event.shiftKey)
      if (forward || backward) {
        event.preventDefault()
        const stop = nextStop(state.journeyProgress, backward ? -1 : 1)
        if (stop) state.jumpToStop(stop.id)
        else state.setJourneyProgress(backward ? 0 : 1)
        return
      }
      if (event.key === 'Enter' && state.activeStop && state.activeStop !== 'observer') {
        state.openProject(state.activeStop)
        pushRoute({ stage: SCENE_STAGE.READING, projectId: state.activeStop })
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.clearTimeout(snapTimer)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return null
}
