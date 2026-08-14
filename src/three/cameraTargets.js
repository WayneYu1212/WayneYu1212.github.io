import { SCENE_STAGE } from '../state/store'

const CAMERA_TARGETS = {
  [SCENE_STAGE.INTRO]: {
    position: [24, 14, 108],
    target: [0, 2, -30],
    roll: 0.025,
  },
  [SCENE_STAGE.DEEP_SPACE]: {
    position: [0, 8, 82],
    target: [0, 1, -32],
    roll: 0,
  },
  [SCENE_STAGE.SYSTEM]: {
    position: [0, 13, 34],
    target: [0, 0, 0],
    roll: 0,
  },
}

const clamp01 = (value) => Math.min(1, Math.max(0, value ?? 0))
const lerp = (from, to, progress) => from + (to - from) * progress
const lerpVector = (from, to, progress) => from.map((value, index) => lerp(value, to[index], progress))
const addVector = (left, right) => left.map((value, index) => value + right[index])

const JOURNEY_CAMERA_KEYFRAMES = Object.freeze([
  { progress: 0, position: [24, 14, 108], target: [0, 2, -30], roll: 0.025 },
  { progress: 0.12, position: [9, 10, 82], target: [0, 1, 0], roll: 0.012 },
  { progress: 0.24, position: [5, 7, 58], target: [0, 0, 0], roll: -0.008 },
  { progress: 0.36, position: [-4, 4, 34], target: [0, 0, 0], roll: -0.02 },
  { progress: 0.46, position: [1, 2, 13], target: [0, 0, 0], roll: 0.014 },
  { progress: 0.51, position: [0, 1, 5], target: [0, 0, 0], roll: 0.02 },
  { progress: 0.56, position: [0, 13, 34], target: [0, 0, 0], roll: 0 },
  { progress: 0.6, position: [5, 8, 25], target: [0, 0, 0], roll: 0.008 },
  { progress: 0.695, position: [-11, 7, 22], target: [-3, 0, 0], roll: 0.006 },
  { progress: 0.81, position: [13, 6, 20], target: [4, 0, 0], roll: -0.008 },
  { progress: 0.935, position: [4, 9, 27], target: [2, 0, -2], roll: 0 },
])

const smoothstep = (from, to, value) => {
  const amount = clamp01((value - from) / (to - from))
  return amount * amount * (3 - 2 * amount)
}

const nearestKeyframe = (progress) => JOURNEY_CAMERA_KEYFRAMES.reduce((nearest, keyframe) => (
  Math.abs(keyframe.progress - progress) < Math.abs(nearest.progress - progress) ? keyframe : nearest
))

const journeyValue = (field, progress) => {
  const afterIndex = JOURNEY_CAMERA_KEYFRAMES.findIndex((keyframe) => keyframe.progress >= progress)
  if (afterIndex <= 0) return [...JOURNEY_CAMERA_KEYFRAMES[0][field]]
  if (afterIndex === -1) return [...JOURNEY_CAMERA_KEYFRAMES.at(-1)[field]]
  const before = JOURNEY_CAMERA_KEYFRAMES[afterIndex - 1]
  const after = JOURNEY_CAMERA_KEYFRAMES[afterIndex]
  const amount = smoothstep(before.progress, after.progress, progress)
  return lerpVector(before[field], after[field], amount)
}

export function galaxyTransformForProgress(progress = 0) {
  const approach = smoothstep(0.12, 0.51, clamp01(progress))
  return {
    scale: lerp(0.32, 3.4, approach),
    core: smoothstep(0.34, 0.5, progress) * (1 - smoothstep(0.5, 0.56, progress)),
  }
}

export function sceneWeightsForProgress(progress = 0) {
  const value = clamp01(progress)
  return {
    deepSpace: 1 - smoothstep(0.46, 0.62, value) * 0.82,
    galaxy: smoothstep(0.1, 0.2, value) * (1 - smoothstep(0.49, 0.56, value)),
    system: smoothstep(0.5, 0.58, value),
    dust: smoothstep(0.18, 0.3, value) * (1 - smoothstep(0.48, 0.56, value)),
  }
}

export function cameraTargetForJourney({
  progress = 0,
  stop,
  bodyPosition,
  reducedMotion = false,
}) {
  const value = clamp01(progress)
  const keyframe = nearestKeyframe(value)
  const position = reducedMotion ? [...keyframe.position] : journeyValue('position', value)
  const target = reducedMotion ? [...keyframe.target] : journeyValue('target', value)
  let roll = reducedMotion ? 0 : Math.sin(value * Math.PI * 4) * 0.012

  if (stop && bodyPosition) {
    const distance = stop === 'observer' ? [0, 4.5, 13] : [0, 3.5, 11]
    return {
      position: addVector(bodyPosition, distance),
      target: [...bodyPosition],
      roll: 0,
    }
  }

  if (value === 0) roll = JOURNEY_CAMERA_KEYFRAMES[0].roll
  return { position, target, roll }
}

export function cameraTargetForStage({
  stage,
  progress = 0,
  project,
  planetPosition = [0, 0, 0],
  cameraView,
  reducedMotion = false,
}) {
  if (stage === SCENE_STAGE.GALAXY_TRANSIT) {
    const amount = reducedMotion ? 1 : clamp01(progress)
    return {
      position: lerpVector(CAMERA_TARGETS[SCENE_STAGE.DEEP_SPACE].position, CAMERA_TARGETS[SCENE_STAGE.SYSTEM].position, amount),
      target: lerpVector(CAMERA_TARGETS[SCENE_STAGE.DEEP_SPACE].target, CAMERA_TARGETS[SCENE_STAGE.SYSTEM].target, amount),
      roll: Math.sin(amount * Math.PI) * 0.055,
    }
  }

  if (stage === SCENE_STAGE.PLANET_FOCUS || stage === SCENE_STAGE.READING) {
    const entryCamera = project?.world?.entryCamera ?? {
      position: [0, 3, 10],
      target: [0, 0, 0],
    }
    return {
      position: addVector(planetPosition, entryCamera.position),
      target: addVector(planetPosition, entryCamera.target),
      roll: 0,
    }
  }

  if (stage === SCENE_STAGE.SYSTEM && cameraView?.position && cameraView?.target) {
    return { position: cameraView.position, target: cameraView.target, roll: 0 }
  }

  return CAMERA_TARGETS[stage] ?? CAMERA_TARGETS[SCENE_STAGE.DEEP_SPACE]
}

export { CAMERA_TARGETS }
