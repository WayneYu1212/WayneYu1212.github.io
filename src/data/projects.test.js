import { describe, expect, it } from 'vitest'
import { readdirSync, existsSync, readFileSync } from 'node:fs'
import { projects, constellations, layouts, byId, observerStop } from './projects'

const ids = projects.map((p) => p.id)

describe('projects data', () => {
  it('keeps the observer introduction separate from the three projects', () => {
    expect(projects.map((project) => project.id)).toEqual(['yongshu', 'apple', 'nearby'])
    expect(observerStop.id).toBe('observer')
    expect(observerStop.copy).toHaveLength(3)
    expect(observerStop.copy.join(' ')).not.toMatch(/苹果|佣书|附近未见|三个/)
    expect(observerStop.world.position[0]).not.toBe(0)
  })

  it('每个项目 id 唯一', () => {
    expect(new Set(ids).size).toBe(ids.length)
  })

  it.each(projects)('$id 具备渲染所需的全部字段', (p) => {
    for (const key of ['index', 'title', 'titleEn', 'kind', 'kindEn', 'field', 'accent', 'lede']) {
      expect(p[key], `${p.id}.${key}`).toBeTruthy()
    }
    expect(p.accent).toMatch(/^#[0-9A-Fa-f]{6}$/)
    expect(p.body.length).toBeGreaterThan(0)
    expect(p.instrument.length).toBeGreaterThan(0)
    expect(p.instrument.every((row) => row.length === 2)).toBe(true)
    expect(p.credits.every((row) => row.length === 2)).toBe(true)
  })

  it.each(projects)('$id 在三种排布下都有坐标', (p) => {
    for (const { id } of layouts) {
      const pos = p.positions[id]
      expect(pos, `${p.id}.positions.${id}`).toHaveLength(3)
      expect(pos.every((n) => Number.isFinite(n))).toBe(true)
    }
  })

  it.each(projects)('$id 具备恒星系渲染所需的 world 描述', (p) => {
    expect(p.world).toEqual(expect.objectContaining({
      planetStyle: expect.any(String),
      radius: expect.any(Number),
      orbit: expect.objectContaining({ radius: expect.any(Number), speed: expect.any(Number), phase: expect.any(Number) }),
      surfacePalette: expect.arrayContaining([expect.any(String), expect.any(String)]),
      features: expect.any(Array),
      entryCamera: expect.objectContaining({ position: expect.any(Array), target: expect.any(Array) }),
    }))
  })

  it('all project worlds use credited NASA texture assets', () => {
    for (const project of projects) {
      expect(project.world.assetType).toBe('texture')
      expect(project.world.textureSet).toMatch(/^media\/celestial\/.+\.webp$/)
      expect(project.world.assetSource).toMatch(/^https:\/\//)
      expect(project.world.license).toBe('NASA media guidelines')
    }
    expect(byId('apple').world.features).not.toContain('polar-basin')
    expect(byId('apple').world.features).not.toContain('retrograde-moon')
  })

  it('三种排布下节点互不重合', () => {
    for (const { id } of layouts) {
      const keys = projects.map((p) => p.positions[id].join(','))
      expect(new Set(keys).size, `layout ${id} 有重合节点`).toBe(keys.length)
    }
  })

  it('星座连线两端都指向真实项目', () => {
    for (const c of constellations) {
      expect(ids).toContain(c.from)
      expect(ids).toContain(c.to)
      expect(c.from).not.toBe(c.to)
      expect(c.label).toBeTruthy()
    }
  })

  it('每个项目至少参与一条星座连线', () => {
    for (const id of ids) {
      expect(constellations.some((c) => c.from === id || c.to === id), `${id} 是孤点`).toBe(true)
    }
  })

  it('外链只用 https', () => {
    for (const p of projects) {
      for (const l of p.links) {
        expect(l.label).toBeTruthy()
        expect(l.href).toMatch(/^https:\/\//)
      }
    }
  })

  it('只有佣书和附近未见配置了真实存在的 PDF 说明书', () => {
    expect(byId('yongshu').manual).toEqual(expect.objectContaining({
      label: '打开项目说明书 PDF',
      href: expect.stringMatching(/^media\/docs\/.+\.pdf$/),
    }))
    expect(byId('nearby').manual).toEqual(expect.objectContaining({
      label: '打开项目说明书 PDF',
      href: expect.stringMatching(/^media\/docs\/.+\.pdf$/),
    }))
    expect(byId('apple').manual).toBeUndefined()
    for (const project of [byId('yongshu'), byId('nearby')]) {
      expect(existsSync(`public/${project.manual.href}`), `缺少 public/${project.manual.href}`).toBe(true)
      expect(readFileSync(`public/${project.manual.href}`).subarray(0, 5).toString()).toBe('%PDF-')
    }
  })

  it('图片资源真实存在于 public/', () => {
    for (const p of projects) {
      for (const media of Object.values(p.featureMedia ?? {})) {
        expect(existsSync(`public/${media.src}`), `缺少 public/${media.src}`).toBe(true)
        expect(media.alt).toBeTruthy()
      }
      for (const g of p.gallery) {
        expect(g.src).not.toMatch(/^\//)
        expect(existsSync(`public/${g.src}`), `缺少 public/${g.src}`).toBe(true)
        expect(g.caption).toBeTruthy()
      }
    }
  })

  it('gallery 不重复引用同一张图', () => {
    for (const p of projects) {
      const srcs = p.gallery.map((g) => g.src)
      expect(new Set(srcs).size, `${p.id} gallery 有重复`).toBe(srcs.length)
    }
  })

  it('宣传片资源真实存在于 public/', () => {
    for (const p of projects) {
      if (!p.video) continue
      expect(p.video).not.toMatch(/^\//)
      expect(p.video).toMatch(/\.mp4$/)
      expect(existsSync(`public/${p.video}`), `缺少 public/${p.video}`).toBe(true)
    }
  })

  it('public/media 里没有未被引用的文件', () => {
    const used = new Set(
      projects.flatMap((p) => [
        ...p.gallery.map((g) => g.src),
        ...Object.values(p.featureMedia ?? {}).map((media) => media.src),
        p.video,
        p.manual?.href,
      ].filter(Boolean)),
    )
    for (const entry of readdirSync('public/media', { withFileTypes: true })) {
      if (!entry.isFile()) continue
      expect(used.has(`media/${entry.name}`), `${entry.name} 未被任何项目引用`).toBe(true)
    }
  })

  it('byId 命中与落空都符合预期', () => {
    expect(byId('yongshu').title).toBe('佣书')
    expect(byId('nope')).toBeUndefined()
  })
})
