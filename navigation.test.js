import { describe, expect, it } from 'vitest'
import { hashForRoute, routeFromHash } from './navigation'

describe('hash navigation', () => {
  it.each([
    ['#space', { stage: 'deep-space' }],
    ['#galaxy', { stage: 'galaxy-transit' }],
    ['#system', { stage: 'system' }],
    ['#project/apple', { stage: 'reading', projectId: 'apple' }],
  ])('解析 %s', (hash, expected) => {
    expect(routeFromHash(hash)).toEqual(expected)
  })

  it('未知 hash 安全回退到深空', () => {
    expect(routeFromHash('#not-a-place')).toEqual({ stage: 'deep-space' })
  })

  it('把项目阅读态序列化成可分享链接', () => {
    expect(hashForRoute({ stage: 'reading', projectId: 'apple' })).toBe('#project/apple')
  })
})
