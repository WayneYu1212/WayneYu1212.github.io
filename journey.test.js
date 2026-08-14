import { describe, expect, it } from 'vitest'
import { SCENE_STAGE } from '../state/store'
import {
  JOURNEY_STOPS,
  advanceJourneyWithStops,
  applyJourneyDelta,
  boundedWheelDelta,
  frameForProgress,
  progressForStop,
  snapProgress,
} from './journey'

describe('continuous journey model', () => {
  it('maps the continuous route to stages and ordered stops', () => {
    expect(frameForProgress(0)).toMatchObject({ stage: SCENE_STAGE.INTRO, stopId: null })
    expect(frameForProgress(0.08)).toMatchObject({ stage: SCENE_STAGE.DEEP_SPACE, stopId: null })
    expect(frameForProgress(0.24)).toMatchObject({ stage: SCENE_STAGE.GALAXY_TRANSIT, stopId: null })
    expect(frameForProgress(0.44)).toMatchObject({ stage: SCENE_STAGE.GALAXY_TRANSIT, stopId: null })
    expect(frameForProgress(0.5)).toMatchObject({ stage: SCENE_STAGE.SYSTEM, stopId: null })
    expect(frameForProgress(0.6)).toMatchObject({ stage: SCENE_STAGE.SYSTEM, stopId: 'observer' })
    expect(frameForProgress(0.695).stopId).toBe('yongshu')
    expect(frameForProgress(0.81).stopId).toBe('apple')
    expect(frameForProgress(0.935).stopId).toBe('nearby')
    expect(JOURNEY_STOPS.map(({ id }) => id)).toEqual(['observer', 'yongshu', 'apple', 'nearby'])
  })

  it('applies reversible deltas and clamps progress', () => {
    expect(applyJourneyDelta(0.5, -100, 0.001)).toBeCloseTo(0.4)
    expect(applyJourneyDelta(0.98, 100, 0.001)).toBe(1)
    expect(applyJourneyDelta(0.02, -100, 0.001)).toBe(0)
  })

  it('exposes stop centers and only snaps inside the magnetic threshold', () => {
    expect(progressForStop('observer')).toBe(0.6)
    expect(progressForStop('missing')).toBeNull()
    expect(snapProgress(0.61)).toBe(0.6)
    expect(snapProgress(0.65)).toBe(0.65)
  })

  it('bounds wheel input and stops at the first project center crossed', () => {
    expect(boundedWheelDelta(1200)).toBeLessThanOrEqual(0.03)
    expect(boundedWheelDelta(-1200)).toBeGreaterThanOrEqual(-0.03)
    expect(advanceJourneyWithStops(0.77, 0.08)).toEqual({ progress: 0.81, stoppedAt: 'apple' })
    expect(advanceJourneyWithStops(0.73, -0.08)).toEqual({ progress: 0.695, stoppedAt: 'yongshu' })
  })
})
