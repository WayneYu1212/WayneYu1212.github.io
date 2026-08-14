export function detectTier() {
  if (typeof window === 'undefined') return 'high'
  const mobile = window.matchMedia('(max-width: 820px)').matches
  const cores = navigator.hardwareConcurrency || 4
  const memory = navigator.deviceMemory ?? 8
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced || cores <= 2 || memory <= 2) return 'low'
  if (mobile || cores <= 4 || memory <= 4) return 'medium'
  return 'high'
}

export function hasWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export const budget = Object.freeze({
  high: {
    stars: 7200, brightStars: 120, nebula: 1500, orbitSegments: 112, nearDust: 180, dpr: [1, 1.75],
    textureMax: 2048, paperFragments: 18, observationMarks: 10, atmosphere: true, transparentFeatures: true, cursorEffects: true,
  },
  medium: {
    stars: 3600, brightStars: 72, nebula: 760, orbitSegments: 72, nearDust: 80, dpr: [1, 1.35],
    textureMax: 1024, paperFragments: 10, observationMarks: 5, atmosphere: true, transparentFeatures: true, cursorEffects: false,
  },
  low: {
    stars: 1600, brightStars: 36, nebula: 380, orbitSegments: 48, nearDust: 0, dpr: [1, 1],
    textureMax: 1024, paperFragments: 6, observationMarks: 0, atmosphere: false, transparentFeatures: false, cursorEffects: false,
  },
})

const rank = { low: 0, medium: 1, high: 2 }

export function resolveBudget(deviceTier, runtimeQuality) {
  const deviceRank = rank[deviceTier] ?? 0
  const runtimeRank = rank[runtimeQuality] ?? deviceRank
  const activeRank = Math.min(deviceRank, runtimeRank)
  const activeTier = Object.keys(rank).find((key) => rank[key] === activeRank) || 'low'
  return budget[activeTier]
}
