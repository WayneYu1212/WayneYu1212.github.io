import { create } from 'zustand'
import { projects } from '../data/projects'
import { applyJourneyDelta, frameForProgress, progressForStop } from '../lib/journey'
import { SCENE_STAGE } from './stages'

export { SCENE_STAGE } from './stages'

const HOME_VIEW = Object.freeze({
  position: [0, 13, 34],
  target: [0, 0, 0],
  travel: 0,
  journeyProgress: 0,
  activeStop: null,
})

export const initialCosmosState = {
  stage: SCENE_STAGE.INTRO,
  layout: 'time',
  hovered: null,
  focused: null,
  open: null,
  mapOpen: false,
  directoryOpen: false,
  deviceTier: 'high',
  quality: 'high',
  travel: 0,
  journeyProgress: 0,
  activeStop: null,
  lock: 0,
  returnView: null,
  cameraView: HOME_VIEW,
}

const validProject = (id) => id !== 'observer' && projects.some((project) => project.id === id)

export const useCosmos = create((set, get) => ({
  ...initialCosmosState,

  enterSpace: () => set({ stage: SCENE_STAGE.DEEP_SPACE }),
  approachGalaxy: () => set({ stage: SCENE_STAGE.GALAXY_TRANSIT }),
  enterSystem: () => set({ stage: SCENE_STAGE.SYSTEM, focused: null, open: null, cameraView: HOME_VIEW, returnView: null }),
  enter: () => set({ stage: SCENE_STAGE.DEEP_SPACE }),

  focusPlanet: (id, view = get().cameraView) => {
    if (!validProject(id)) return
    set({
      stage: SCENE_STAGE.PLANET_FOCUS,
      focused: id,
      open: null,
      mapOpen: false,
      directoryOpen: false,
      returnView: view,
    })
  },
  focus: (id) => get().focusPlanet(id),
  openProject: (id) => {
    if (!validProject(id)) return
    const state = get()
    const returnView = state.stage === SCENE_STAGE.SYSTEM && state.activeStop === id
      ? {
        ...state.cameraView,
        travel: state.journeyProgress,
        journeyProgress: state.journeyProgress,
        activeStop: state.activeStop,
      }
      : state.returnView
    set({
      stage: SCENE_STAGE.READING,
      open: id,
      focused: id,
      mapOpen: false,
      directoryOpen: false,
      returnView,
    })
  },
  closeProject: () => {
    const view = get().returnView || HOME_VIEW
    set({
      stage: SCENE_STAGE.SYSTEM,
      open: null,
      cameraView: view,
      travel: view.travel ?? 0,
      journeyProgress: view.journeyProgress ?? view.travel ?? 0,
      activeStop: view.activeStop ?? null,
      focused: view.activeStop && view.activeStop !== 'observer' ? view.activeStop : null,
    })
  },
  backToSystem: () => {
    const view = get().returnView || HOME_VIEW
    set({ stage: SCENE_STAGE.SYSTEM, focused: null, open: null, cameraView: view, travel: view.travel ?? 0 })
  },
  restoreRoute: ({ stage, projectId }) => {
    if (stage === SCENE_STAGE.READING) {
      if (!validProject(projectId)) {
        set({ stage: SCENE_STAGE.SYSTEM, focused: null, open: null })
        return
      }
      set({ stage, focused: projectId, open: projectId, mapOpen: false, directoryOpen: false })
      return
    }
    const allowed = Object.values(SCENE_STAGE)
    const view = stage === SCENE_STAGE.SYSTEM ? (get().returnView || get().cameraView || HOME_VIEW) : get().cameraView
    set({
      stage: allowed.includes(stage) ? stage : SCENE_STAGE.DEEP_SPACE,
      focused: null,
      open: null,
      mapOpen: false,
      directoryOpen: false,
      cameraView: view,
      travel: view.travel ?? get().travel,
    })
  },

  setLayout: (layout) => set({ layout }),
  cycleLayout: () => {
    const order = ['time', 'theme', 'medium']
    const index = order.indexOf(get().layout)
    set({ layout: order[(index + 1) % order.length] })
  },
  hover: (id) => set({ hovered: id }),
  toggleMap: () => set((state) => ({ mapOpen: !state.mapOpen, directoryOpen: false })),
  toggleDirectory: () => set((state) => ({ directoryOpen: !state.directoryOpen, mapOpen: false })),
  closeOverlays: () => set({ mapOpen: false, directoryOpen: false }),
  setDeviceTier: (deviceTier) => set({ deviceTier }),
  setQuality: (quality) => set({ quality }),
  setCameraView: (cameraView) => set({ cameraView }),
  setJourneyProgress: (journeyProgress) => {
    const frame = frameForProgress(journeyProgress)
    set({
      journeyProgress: frame.progress,
      travel: frame.progress,
      stage: frame.stage,
      activeStop: frame.stopId,
      focused: frame.stopId && frame.stopId !== 'observer' ? frame.stopId : null,
    })
  },
  nudgeJourney: (delta, scale = 1) => get().setJourneyProgress(
    applyJourneyDelta(get().journeyProgress, delta, scale),
  ),
  jumpToStop: (id) => {
    const progress = progressForStop(id)
    if (progress != null) get().setJourneyProgress(progress)
  },
  saveReturnView: (returnView) => set({ returnView }),
  addTravel: (delta) => set((state) => ({ travel: Math.min(1, Math.max(0, state.travel + delta)) })),
  setLock: (lock) => set({ lock: Math.min(1, Math.max(0, lock)) }),
  next: () => {
    const ids = projects.map((project) => project.id)
    const index = get().focused ? ids.indexOf(get().focused) : -1
    return ids[(index + 1) % ids.length]
  },
}))
