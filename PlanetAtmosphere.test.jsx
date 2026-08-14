import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PlanetAtmosphere from './PlanetAtmosphere'

describe('PlanetAtmosphere', () => {
  it('does not render the shell when the quality budget disables atmosphere', () => {
    const { container } = render(<PlanetAtmosphere radius={2} color="#aabbcc" opacity={1} enabled={false} />)
    expect(container.firstChild).toBeNull()
  })
})
