import { SCENE_STAGE } from '../state/store'

const SIMPLE_ROUTES = new Map([
  ['#space', { stage: SCENE_STAGE.DEEP_SPACE }],
  ['#galaxy', { stage: SCENE_STAGE.GALAXY_TRANSIT }],
  ['#system', { stage: SCENE_STAGE.SYSTEM }],
])

export function routeFromHash(hash = '') {
  if (SIMPLE_ROUTES.has(hash)) return { ...SIMPLE_ROUTES.get(hash) }
  const match = /^#project\/([a-z0-9-]+)$/.exec(hash)
  if (match) return { stage: SCENE_STAGE.READING, projectId: match[1] }
  return { stage: SCENE_STAGE.DEEP_SPACE }
}

export function hashForRoute({ stage, projectId }) {
  if (stage === SCENE_STAGE.READING && projectId) return `#project/${projectId}`
  if (stage === SCENE_STAGE.GALAXY_TRANSIT) return '#galaxy'
  if (stage === SCENE_STAGE.SYSTEM || stage === SCENE_STAGE.PLANET_FOCUS) return '#system'
  return '#space'
}

export function pushRoute(route) {
  const hash = hashForRoute(route)
  if (window.location.hash !== hash) window.history.pushState(route, '', hash)
}

export function replaceRoute(route) {
  window.history.replaceState(route, '', hashForRoute(route))
}
