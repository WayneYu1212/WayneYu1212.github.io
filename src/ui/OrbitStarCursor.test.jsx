import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { initialCosmosState, SCENE_STAGE, useCosmos } from '../state/store'
import OrbitStarCursor from './OrbitStarCursor'

const set = (patch) => useCosmos.setState({ ...initialCosmosState, ...patch })

beforeEach(() => {
  set({})
  vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
    matches: query.includes('hover: hover'),
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }))
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    stroke: vi.fn(),
    setTransform: vi.fn(),
    createLinearGradient: () => ({ addColorStop: vi.fn() }),
  })
})

describe('OrbitStarCursor', () => {
  it('renders on fine pointers and reacts to pressing', () => {
    set({ stage: SCENE_STAGE.SYSTEM })
    render(<OrbitStarCursor />)
    expect(screen.getByTestId('orbit-star-cursor')).toBeTruthy()
    fireEvent.pointerDown(window)
    expect(screen.getByTestId('orbit-star-cursor').className).toContain('is-pressed')
  })

  it('keeps the star core exactly under the pointer without easing delay', () => {
    set({ stage: SCENE_STAGE.SYSTEM })
    render(<OrbitStarCursor />)
    fireEvent.pointerMove(window, { clientX: 140, clientY: 90 })
    expect(screen.getByTestId('orbit-star').style.transform).toBe('translate3d(131px, 81px, 0)')
  })

  it('does not render over the reading surface', () => {
    set({ stage: SCENE_STAGE.READING, open: 'apple' })
    expect(render(<OrbitStarCursor />).container.firstChild).toBeNull()
  })
})
