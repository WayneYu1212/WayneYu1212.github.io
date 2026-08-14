import { beforeEach, describe, expect, it } from 'vitest'
import { SCENE_STAGE, initialCosmosState, useCosmos } from './store'

const s = () => useCosmos.getState()

beforeEach(() => useCosmos.setState(initialCosmosState))

describe('Personal Cosmos 状态机', () => {
  it('从开场依次进入深空、银河穿越与恒星系', () => {
    expect(s().stage).toBe(SCENE_STAGE.INTRO)
    s().enterSpace()
    expect(s().stage).toBe(SCENE_STAGE.DEEP_SPACE)
    s().approachGalaxy()
    expect(s().stage).toBe(SCENE_STAGE.GALAXY_TRANSIT)
    s().enterSystem()
    expect(s().stage).toBe(SCENE_STAGE.SYSTEM)
  })

  it('聚焦行星时保存可序列化的返回镜头', () => {
    const view = { position: [1, 2, 3], target: [4, 5, 6], travel: 0.4 }
    s().focusPlanet('apple', view)
    expect(s().stage).toBe(SCENE_STAGE.PLANET_FOCUS)
    expect(s().focused).toBe('apple')
    expect(s().returnView).toEqual(view)
  })

  it('阅读项目后返回恒星系并恢复保存的视角', () => {
    const view = { position: [1, 2, 3], target: [4, 5, 6], travel: 0.4 }
    s().focusPlanet('apple', view)
    s().openProject('apple')
    expect(s().stage).toBe(SCENE_STAGE.READING)
    s().closeProject()
    expect(s().stage).toBe(SCENE_STAGE.SYSTEM)
    expect(s().open).toBeNull()
    expect(s().focused).toBeNull()
    expect(s().cameraView).toEqual(view)
    expect(s().journeyProgress).toBe(0.4)
    expect(s().activeStop).toBeNull()
  })

  it('旅程进度同步阶段与当前停靠点', () => {
    s().setJourneyProgress(0.6)
    expect(s().stage).toBe(SCENE_STAGE.SYSTEM)
    expect(s().journeyProgress).toBe(0.6)
    expect(s().activeStop).toBe('observer')

    s().nudgeJourney(95, 0.001)
    expect(s().journeyProgress).toBeCloseTo(0.695)
    expect(s().activeStop).toBe('yongshu')
  })

  it('从滚动停靠点进入阅读后返回同一颗项目天体', () => {
    s().setJourneyProgress(0.81)
    expect(s().activeStop).toBe('apple')

    s().openProject('apple')
    s().closeProject()

    expect(s().stage).toBe(SCENE_STAGE.SYSTEM)
    expect(s().journeyProgress).toBeCloseTo(0.81)
    expect(s().activeStop).toBe('apple')
    expect(s().focused).toBe('apple')
  })

  it('目录可跳到停靠点但观察者不能被当成项目打开', () => {
    s().jumpToStop('observer')
    expect(s().activeStop).toBe('observer')
    expect(s().journeyProgress).toBe(0.6)
    s().openProject('observer')
    expect(s().open).toBeNull()
  })

  it('从 URL 恢复项目深链', () => {
    s().restoreRoute({ stage: SCENE_STAGE.READING, projectId: 'apple' })
    expect(s().stage).toBe(SCENE_STAGE.READING)
    expect(s().open).toBe('apple')
    expect(s().focused).toBe('apple')
  })

  it('非法项目深链回退到恒星系', () => {
    s().restoreRoute({ stage: SCENE_STAGE.READING, projectId: 'missing' })
    expect(s().stage).toBe(SCENE_STAGE.SYSTEM)
    expect(s().open).toBeNull()
  })
})
