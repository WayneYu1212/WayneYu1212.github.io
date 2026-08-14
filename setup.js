import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import { useCosmos } from '../state/store'

// jsdom 没有 matchMedia,而 perf.js 用它判断设备档位。
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    media: query,
    matches: false,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })
}

const initial = useCosmos.getState()

beforeEach(() => {
  useCosmos.setState(initial, true)
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
