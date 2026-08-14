import { SCENE_STAGE } from '../state/stages'

export const JOURNEY_RANGES = Object.freeze({
  intro: [0, 0.12],
  galaxy: [0.12, 0.48],
  systemReveal: [0.48, 0.56],
  observer: [0.56, 0.64],
  yongshu: [0.64, 0.75],
  apple: [0.75, 0.87],
  nearby: [0.87, 1],
})

export const JOURNEY_STOPS = Object.freeze([
  { id: 'observer', progress: 0.6, range: JOURNEY_RANGES.observer },
  { id: 'yongshu', progress: 0.695, range: JOURNEY_RANGES.yongshu },
  { id: 'apple', progress: 0.81, range: JOURNEY_RANGES.apple },
  { id: 'nearby', progress: 0.935, range: JOURNEY_RANGES.nearby },
])

const clamp01 = (value) => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0))

export function progressForStop(id) {
  return JOURNEY_STOPS.find((stop) => stop.id === id)?.progress ?? null
}

export function frameForProgress(value) {
  const progress = clamp01(value)
  const stage = progress === 0
    ? SCENE_STAGE.INTRO
    : progress < JOURNEY_RANGES.galaxy[0]
      ? SCENE_STAGE.DEEP_SPACE
      : progress < JOURNEY_RANGES.systemReveal[0]
        ? SCENE_STAGE.GALAXY_TRANSIT
        : SCENE_STAGE.SYSTEM
  const stop = JOURNEY_STOPS.find(({ range }) => progress >= range[0] && progress <= range[1])
  return { progress, stage, stopId: stop?.id ?? null }
}

export function applyJourneyDelta(progress, delta, scale = 1) {
  return clamp01(progress + delta * scale)
}

export function boundedWheelDelta(deltaY, deltaMode = 0) {
  const unit = deltaMode === 1 ? 16 : deltaMode === 2 ? 800 : 1
  return Math.min(0.03, Math.max(-0.03, deltaY * unit * 0.00025))
}

export function advanceJourneyWithStops(progress, delta) {
  const current = clamp01(progress)
  const proposed = clamp01(current + delta)
  if (proposed === current) return { progress: current, stoppedAt: null }

  const ordered = proposed > current ? JOURNEY_STOPS : [...JOURNEY_STOPS].reverse()
  const crossed = ordered.find((stop) => proposed > current
    ? stop.progress > current + 0.0001 && stop.progress <= proposed
    : stop.progress < current - 0.0001 && stop.progress >= proposed)

  return crossed
    ? { progress: crossed.progress, stoppedAt: crossed.id }
    : { progress: proposed, stoppedAt: null }
}

export function snapProgress(progress, threshold = 0.022) {
  const current = clamp01(progress)
  const nearest = JOURNEY_STOPS.reduce((best, stop) => (
    Math.abs(stop.progress - current) < Math.abs(best.progress - current) ? stop : best
  ))
  return Math.abs(nearest.progress - current) <= threshold ? nearest.progress : current
}
