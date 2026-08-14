import { describe, expect, it } from 'vitest'
import {
  cameraTargetForJourney,
  cameraTargetForStage,
  galaxyTransformForProgress,
  sceneWeightsForProgress,
} from './cameraTargets'

describe('continuous journey camera', () => {
  it('starts at the authored sky keyframe', () => {
    expect(cameraTargetForJourney({ progress: 0 }).position).toEqual([24, 14, 108])
  })

  it('crossfades galaxy and system layers along the route', () => {
    expect(sceneWeightsForProgress(0.24).galaxy).toBeGreaterThan(0.8)
    expect(sceneWeightsForProgress(0.44).system).toBe(0)
  })

  it('flies into the galaxy core before revealing a clean stellar system', () => {
    expect(galaxyTransformForProgress(0.44).scale).toBeGreaterThan(galaxyTransformForProgress(0.24).scale)
    expect(cameraTargetForJourney({ progress: 0.44 }).position[2])
      .toBeLessThan(cameraTargetForJourney({ progress: 0.24 }).position[2])
    expect(Math.abs(cameraTargetForJourney({ progress: 0.44 }).target[2])).toBeLessThan(8)
    expect(sceneWeightsForProgress(0.48).system).toBeLessThan(0.5)
    expect(sceneWeightsForProgress(0.6).galaxy).toBe(0)
  })

  it('aims at the active body when arriving at a stop', () => {
    expect(cameraTargetForJourney({
      progress: 0.6,
      stop: 'observer',
      bodyPosition: [0, 0, 0],
    }).target).toEqual([0, 0, 0])
  })

  it('reduced motion uses a stable keyframe without roll', () => {
    expect(cameraTargetForJourney({ progress: 0.44, reducedMotion: true }).roll).toBe(0)
  })
})

describe('cameraTargetForStage', () => {
  it('深空、穿越与恒星系具有逐层靠近的镜头位置', () => {
    const deep = cameraTargetForStage({ stage: 'deep-space', progress: 0 })
    const transit = cameraTargetForStage({ stage: 'galaxy-transit', progress: 0.5 })
    const system = cameraTargetForStage({ stage: 'system', progress: 0 })
    expect(deep.position[2]).toBeGreaterThan(transit.position[2])
    expect(transit.position[2]).toBeGreaterThan(system.position[2])
  })

  it('聚焦行星时使用项目 entryCamera 的局部偏移', () => {
    const project = {
      world: { entryCamera: { position: [0, 3, 10], target: [0, 0, 0] } },
    }
    expect(cameraTargetForStage({
      stage: 'planet-focus',
      project,
      planetPosition: [12, 1, -4],
      progress: 0,
    })).toEqual({ position: [12, 4, 6], target: [12, 1, -4], roll: 0 })
  })

  it('减少动效时银河穿越直接落到终点', () => {
    const target = cameraTargetForStage({ stage: 'galaxy-transit', progress: 0.1, reducedMotion: true })
    expect(target.position).toEqual([0, 13, 34])
  })

  it('返回恒星系时优先恢复进入行星前保存的视角', () => {
    const cameraView = { position: [4, 9, 36], target: [2, 0, -1], travel: 0.3 }
    expect(cameraTargetForStage({ stage: 'system', cameraView })).toEqual({
      position: cameraView.position,
      target: cameraView.target,
      roll: 0,
    })
  })
})
