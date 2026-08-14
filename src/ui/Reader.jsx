import { useCallback, useEffect, useRef } from 'react'
import { useCosmos } from '../state/store'
import { byId, projects } from '../data/projects'
import ScaleCollapse from './ScaleCollapse'
import { replaceRoute } from '../lib/navigation'
import { SCENE_STAGE } from '../state/store'

// 阅读层：3D 负责发现，2D 负责理解。
// 这里没有立体文字，只有干净的排版。
export default function Reader() {
  const open = useCosmos((s) => s.open)
  const close = useCosmos((s) => s.closeProject)
  const openProject = useCosmos((s) => s.openProject)
  const scrollRef = useRef(null)
  const p = open ? byId(open) : null
  const leave = useCallback(() => {
    close()
    replaceRoute({ stage: SCENE_STAGE.SYSTEM })
  }, [close])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && leave()
    window.addEventListener('keydown', onKey)
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    return () => window.removeEventListener('keydown', onKey)
  }, [open, leave])

  if (!p) return null
  const others = projects.filter((q) => q.id !== p.id)

  return (
    <article
      className="reader"
      data-opaque="true"
      ref={scrollRef}
      style={{ '--accent': p.accent, '--paper': p.paper }}
    >
      <button className="reader__close" onClick={leave}>
        ← 返回恒星系 <em>Back to system</em>
      </button>

      <header className="reader__head">
        <span className="reader__idx">OBJECT {p.index}</span>
        <h1>{p.title}</h1>
        <p className="reader__en">{p.titleEn}</p>
        <p className="reader__kind">
          {p.kind} · {p.observed}
        </p>
        <p className="reader__lede">{p.lede}</p>
      </header>

      {p.featureMedia && (
        <figure className="reader__feature reader__feature--hero">
          <img src={`${import.meta.env.BASE_URL}${p.featureMedia.hero.src}`} alt={p.featureMedia.hero.alt} />
        </figure>
      )}

      {p.id === 'nearby' && <ScaleCollapse />}

      {p.video && !p.featureMedia && (
        <figure className="reader__video">
          <video src={`${import.meta.env.BASE_URL}${p.video}`} controls preload="none"
            poster={p.gallery[0] ? `${import.meta.env.BASE_URL}${p.gallery[0].src}` : undefined} />
          <figcaption>宣传片</figcaption>
        </figure>
      )}

      <section className="reader__body">
        {p.body.map((t, i) => (
          <p key={i}>{t}</p>
        ))}
      </section>

      {p.featureMedia && (
        <section className="reader__feature-sequence" aria-label="双时间线与主要人物">
          <figure className="reader__feature reader__feature--timeline">
            <img src={`${import.meta.env.BASE_URL}${p.featureMedia.timelinePortrait.src}`} alt={p.featureMedia.timelinePortrait.alt} loading="lazy" />
            <figcaption>1696 · 皇家铸币厅</figcaption>
          </figure>
          <figure className="reader__feature reader__feature--ensemble">
            <span>横向查看人物群像</span>
            <div>
              <img src={`${import.meta.env.BASE_URL}${p.featureMedia.ensemble.src}`} alt={p.featureMedia.ensemble.alt} loading="lazy" />
            </div>
            <figcaption>主要人物群像 · 保留原始立绘面部</figcaption>
          </figure>
        </section>
      )}

      <dl className="reader__credits">
        {p.credits.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>

      {(p.manual || p.links.length > 0) && (
        <nav className="reader__links">
          {p.manual && (
            <a
              className="reader__manual"
              href={`${import.meta.env.BASE_URL}${p.manual.href}`}
              target="_blank"
              rel="noreferrer noopener"
            >
              {p.manual.label} ↗
            </a>
          )}
          {p.links.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noreferrer noopener">
              {l.label} ↗
            </a>
          ))}
        </nav>
      )}

      {!p.featureMedia && p.gallery.length > 0 && (
        <section className="reader__gallery">
          {p.gallery.map((g) => (
            <figure key={g.src}>
              <img src={`${import.meta.env.BASE_URL}${g.src}`} alt={g.caption} loading="lazy" />
              <figcaption>{g.caption}</figcaption>
            </figure>
          ))}
        </section>
      )}

      <footer className="reader__next">
        <span>ALSO IN THIS FIELD</span>
        <ul>
          {others.map((q) => (
            <li key={q.id}>
              <button onClick={() => {
                openProject(q.id)
                replaceRoute({ stage: SCENE_STAGE.READING, projectId: q.id })
              }}>
                <i style={{ background: q.accent }} />
                {q.index} {q.title}
                <em>{q.kindEn}</em>
              </button>
            </li>
          ))}
        </ul>
      </footer>
    </article>
  )
}
