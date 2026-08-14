import { describe, expect, it } from 'vitest'
import {
  CIRCULAR_PARTICLE_FRAGMENT_SHADER,
  particlePointSizeFloor,
  starBudgetForCount,
} from './particleVisuals'

describe('particle visuals', () => {
  it('keeps a small bright-star layer while scaling the micro layer', () => {
    expect(starBudgetForCount(7200)).toEqual({ micro: 7080, bright: 120 })
    expect(starBudgetForCount(20)).toEqual({ micro: 17, bright: 3 })
  })

  it('uses a circular discard and optional cross-star glow', () => {
    expect(CIRCULAR_PARTICLE_FRAGMENT_SHADER).toMatch(/gl_PointCoord/)
    expect(CIRCULAR_PARTICLE_FRAGMENT_SHADER).toMatch(/discard/)
    expect(CIRCULAR_PARTICLE_FRAGMENT_SHADER).toMatch(/cross/)
  })

  it('keeps distant stars visible without making every star a flare', () => {
    expect(particlePointSizeFloor(0)).toBe(1.45)
    expect(particlePointSizeFloor(1)).toBe(2.05)
  })
})
