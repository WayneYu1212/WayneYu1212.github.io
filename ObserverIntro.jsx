import { observerStop } from '../data/projects'
import { useCosmos } from '../state/store'

export default function ObserverIntro() {
  const activeStop = useCosmos((state) => state.activeStop)
  if (activeStop !== observerStop.id) return null

  return (
    <section className="observer-intro" aria-labelledby="observer-title">
      <span className="journey-kicker">观察者号 · 航行说明</span>
      <h2 id="observer-title">{observerStop.title}</h2>
      {observerStop.copy.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      <small>继续向下滚动查看项目</small>
    </section>
  )
}
