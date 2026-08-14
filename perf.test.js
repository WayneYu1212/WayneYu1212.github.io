import { describe, expect, it } from 'vitest'
import { resolveBudget } from './perf'

describe('resolveBudget', () => {
  it('high quality enables the complete celestial feature budget', () => {
    expect(resolveBudget('high', 'high')).toMatchObject({
      textureMax: 2048,
      paperFragments: 18,
      observationMarks: 10,
      brightStars: 120,
      atmosphere: true,
      transparentFeatures: true,
      cursorEffects: true,
    })
  })

  it('low quality removes transparent and pointer-only decoration', () => {
    expect(resolveBudget('low', 'low')).toMatchObject({
      textureMax: 1024,
      paperFragments: 6,
      observationMarks: 0,
      brightStars: 36,
      atmosphere: false,
      transparentFeatures: false,
      cursorEffects: false,
    })
  })

  it('运行时降级会覆盖高性能设备的初始预算', () => {
    expect(resolveBudget('high', 'low')).toMatchObject({
      stars: 1600,
      nebula: 380,
      orbitSegments: 48,
      nearDust: 0,
      dpr: [1, 1],
    })
  })

  it('运行时 high 不会把中端设备提升到高端预算', () => {
    expect(resolveBudget('medium', 'high')).toMatchObject({
      stars: 3600,
      nebula: 760,
      orbitSegments: 72,
      nearDust: 80,
      dpr: [1, 1.35],
    })
  })
})
