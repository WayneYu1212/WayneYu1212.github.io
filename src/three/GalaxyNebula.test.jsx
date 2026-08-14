import { describe, expect, it } from 'vitest'
import { GALAXY_NEBULA_FRAGMENT_SHADER } from './GalaxyNebula'

describe('GalaxyNebula', () => {
  it('builds a soft spiral cloud from radial and angular falloff', () => {
    expect(GALAXY_NEBULA_FRAGMENT_SHADER).toMatch(/smoothstep/)
    expect(GALAXY_NEBULA_FRAGMENT_SHADER).toMatch(/atan/)
    expect(GALAXY_NEBULA_FRAGMENT_SHADER).toMatch(/spiral/)
  })
})
