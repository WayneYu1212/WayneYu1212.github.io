import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
import { initialCosmosState, SCENE_STAGE, useCosmos } from '../state/store'
import ScrollJourney from './ScrollJourney'

const set = (patch) => useCosmos.setState({ ...initialCosmosState, ...patch })

beforeEach(() => set({}))
afterEach(() => vi.useRealTimers())

describe('ScrollJourney', () => {
  it('uses wheel input to advance and reverse the same progress value', () => {
    render(<ScrollJourney />)
    fireEvent.wheel(window, { deltaY: 240 })
    const advanced = useCosmos.getState().journeyProgress
    expect(advanced).toBeGreaterThan(0)
    fireEvent.wheel(window, { deltaY: -120 })
    expect(useCosmos.getState().journeyProgress).toBeLessThan(advanced)
  })

  it('does not move the journey while a project is being read', () => {
    set({ stage: SCENE_STAGE.READING, open: 'apple', journeyProgress: 0.81 })
    render(<ScrollJourney />)
    fireEvent.wheel(window, { deltaY: 240 })
    expect(useCosmos.getState().journeyProgress).toBe(0.81)
  })

  it('PageDown and PageUp move between magnetic stops', () => {
    set({ stage: SCENE_STAGE.SYSTEM, journeyProgress: 0.695, activeStop: 'yongshu' })
    render(<ScrollJourney />)
    fireEvent.keyDown(window, { key: 'PageDown' })
    expect(useCosmos.getState().activeStop).toBe('apple')
    fireEvent.keyDown(window, { key: 'PageUp' })
    expect(useCosmos.getState().activeStop).toBe('yongshu')
  })

  it('locks at the first crossed stop until the wheel gesture ends', () => {
    vi.useFakeTimers()
    set({ stage: SCENE_STAGE.SYSTEM, journeyProgress: 0.77, activeStop: null })
    render(<ScrollJourney />)

    fireEvent.wheel(window, { deltaY: 1200 })
    fireEvent.wheel(window, { deltaY: 1200 })
    expect(useCosmos.getState().journeyProgress).toBe(0.81)

    vi.advanceTimersByTime(181)
    fireEvent.wheel(window, { deltaY: 120 })
    expect(useCosmos.getState().journeyProgress).toBeGreaterThan(0.81)
    expect(useCosmos.getState().journeyProgress).toBeCloseTo(0.84)
  })
})
