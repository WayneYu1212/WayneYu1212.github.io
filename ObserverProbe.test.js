import { describe, expect, it } from 'vitest'
import { configureProbeMaterial } from './probeMaterial'

describe('configureProbeMaterial', () => {
  it('preserves transparent antenna planes from the NASA model', () => {
    const material = { transparent: true, opacity: 0.72, metalness: 0.9, roughness: 0.1 }
    configureProbeMaterial(material, 1)
    expect(material.transparent).toBe(true)
    expect(material.opacity).toBe(0.72)
  })
})
