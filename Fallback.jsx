import { projects, OBSERVER_NAME, OBSERVER_TAGLINE } from '../data/projects'

// 没有 WebGL 时的降级：仍然是完整可读的作品集，只是没有宇宙。
export default function Fallback() {
  return (
    <main className="fallback">
      <header>
        <p>{OBSERVER_TAGLINE}</p>
        <h1>{OBSERVER_NAME}</h1>
        <small>你的浏览器未启用 WebGL，这里是文字版作品集。</small>
        <p>观察者号在 3D 航线中负责引导；下方三项才是可以进入阅读的项目。</p>
      </header>
      {projects.map((p) => (
        <section key={p.id}>
          <h2>
            {p.index} {p.title}
          </h2>
          <p className="fallback__kind">{p.kind} · {p.observed}</p>
          <p>{p.lede}</p>
          {p.body.map((t, i) => (
            <p key={i}>{t}</p>
          ))}
          {p.links.map((l) => (
            <a key={l.href} href={l.href}>{l.label} ↗</a>
          ))}
        </section>
      ))}
    </main>
  )
}
