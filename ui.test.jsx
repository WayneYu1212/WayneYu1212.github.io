import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import Intro from './Intro'
import Hud from './Hud'
import StarMap from './StarMap'
import Reader from './Reader'
import ProjectDirectory from './ProjectDirectory'
import ObserverIntro from './ObserverIntro'
import { projects } from '../data/projects'
import { initialCosmosState, SCENE_STAGE, useCosmos } from '../state/store'

const set = (patch) => useCosmos.setState({ ...initialCosmosState, ...patch })

beforeEach(() => {
  set({})
  window.history.replaceState({}, '', '#space')
})

describe('开场与旅程导航', () => {
  it('观察者号先介绍航行方式，不伪装成第四个项目', () => {
    set({ stage: SCENE_STAGE.SYSTEM, activeStop: 'observer', journeyProgress: 0.6 })
    render(<ObserverIntro />)
    expect(screen.getByRole('heading', { name: '欢迎进入我的个人宇宙' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /进入项目/ })).toBeNull()
  })

  it('开场提示向下滚动并允许跳过至项目引言', () => {
    render(<Intro />)
    expect(screen.getByText(/向下滚动，开始航行/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /跳过至项目/ }))
    expect(useCosmos.getState().stage).toBe(SCENE_STAGE.SYSTEM)
    expect(useCosmos.getState().activeStop).toBe('observer')
  })

  it('深空阶段提供前往个人银河的明确操作', () => {
    set({ stage: SCENE_STAGE.DEEP_SPACE })
    render(<Hud />)
    fireEvent.click(screen.getByRole('button', { name: /跟随星标/ }))
    expect(useCosmos.getState().stage).toBe(SCENE_STAGE.GALAXY_TRANSIT)
  })

  it('停靠文案直接说明点按行星查看项目', () => {
    set({ stage: SCENE_STAGE.SYSTEM })
    render(<Hud />)
    expect(screen.getByText(/点按行星查看项目/)).toBeTruthy()
    expect(screen.queryByText(/持续生长/)).toBeNull()
  })

  it('观察者说明使用继续滚动的直接引导', () => {
    set({ stage: SCENE_STAGE.SYSTEM, activeStop: 'observer', journeyProgress: 0.6 })
    render(<ObserverIntro />)
    expect(screen.getByText('继续向下滚动查看项目')).toBeTruthy()
    expect(screen.queryByText(/异常星系|持续生长/)).toBeNull()
  })

  it('行星聚焦态只提供一个主要进入操作', () => {
    set({ stage: SCENE_STAGE.PLANET_FOCUS, focused: 'apple' })
    render(<Hud />)
    const enter = screen.getByRole('button', { name: /进入项目/ })
    expect(enter).toBeTruthy()
    fireEvent.click(enter)
    expect(useCosmos.getState().stage).toBe(SCENE_STAGE.READING)
  })

  it('滚动停靠项目时显示介绍与进入项目操作', () => {
    set({ stage: SCENE_STAGE.SYSTEM, activeStop: 'apple', focused: 'apple', journeyProgress: 0.81 })
    render(<Hud />)
    expect(screen.getByRole('heading', { name: '苹果落下之前' })).toBeTruthy()
    expect(screen.getByRole('button', { name: /进入项目/ })).toBeTruthy()
  })
})

describe('作品目录', () => {
  it.each(Object.values(SCENE_STAGE))('%s 阶段始终可以打开作品目录', (stage) => {
    set({ stage })
    render(<ProjectDirectory />)
    fireEvent.click(screen.getByRole('button', { name: '作品目录' }))
    expect(screen.getByRole('dialog', { name: '作品目录' })).toBeTruthy()
  })

  it('从目录单击项目即可直接阅读', () => {
    render(<ProjectDirectory />)
    fireEvent.click(screen.getByRole('button', { name: '作品目录' }))
    fireEvent.click(screen.getByRole('button', { name: /苹果落下之前/ }))
    expect(useCosmos.getState().open).toBe('apple')
    expect(useCosmos.getState().stage).toBe(SCENE_STAGE.READING)
  })
})

describe('星图', () => {
  it('每个节点都是可键盘操作的单击按钮', () => {
    set({ stage: SCENE_STAGE.SYSTEM, mapOpen: true })
    render(<StarMap />)
    const nodes = projects.map((project) => screen.getByRole('button', { name: new RegExp(project.title) }))
    expect(nodes).toHaveLength(projects.length)
    fireEvent.click(nodes[1])
    expect(useCosmos.getState().focused).toBe('apple')
    expect(useCosmos.getState().stage).toBe(SCENE_STAGE.PLANET_FOCUS)
  })
})

describe('阅读层', () => {
  it('佣书和附近未见可打开 PDF 说明书，苹果不显示占位链接', () => {
    set({ stage: SCENE_STAGE.READING, focused: 'yongshu', open: 'yongshu' })
    const yongshu = render(<Reader />)
    const manual = screen.getByRole('link', { name: /打开项目说明书 PDF/ })
    expect(manual.getAttribute('href')).toContain('media/docs/yongshu-project-guide.pdf')
    expect(manual.getAttribute('target')).toBe('_blank')
    yongshu.unmount()

    set({ stage: SCENE_STAGE.READING, focused: 'apple', open: 'apple' })
    render(<Reader />)
    expect(screen.queryByRole('link', { name: /打开项目说明书 PDF/ })).toBeNull()
  })

  it('苹果项目以青年牛顿开场，并以一张主要人物群像替代零散 NPC 图', () => {
    set({ stage: SCENE_STAGE.READING, focused: 'apple', open: 'apple' })
    const { container } = render(<Reader />)
    const images = [...container.querySelectorAll('img')].map((image) => image.getAttribute('src'))
    expect(images[0]).toContain('apple-young-newton.webp')
    expect(images.some((src) => src.includes('apple-cast-ensemble.webp'))).toBe(true)
    expect(container.querySelectorAll('.reader__gallery > figure')).toHaveLength(0)
  })

  it('中文内容清晰呈现并可返回恒星系', () => {
    set({ stage: SCENE_STAGE.READING, focused: 'apple', open: 'apple' })
    const { container } = render(<Reader />)
    expect(screen.getByRole('heading', { name: '苹果落下之前' })).toBeTruthy()
    expect(container.querySelector('.reader').getAttribute('data-opaque')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: /返回恒星系/ }))
    expect(useCosmos.getState().stage).toBe(SCENE_STAGE.SYSTEM)
  })

  it('Escape 返回恒星系', () => {
    set({ stage: SCENE_STAGE.READING, focused: 'apple', open: 'apple' })
    render(<Reader />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(useCosmos.getState().stage).toBe(SCENE_STAGE.SYSTEM)
  })
})
