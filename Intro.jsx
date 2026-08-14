import { SCENE_STAGE, useCosmos } from '../state/store'

export default function Intro() {
  const stage = useCosmos((state) => state.stage)
  const jumpToStop = useCosmos((state) => state.jumpToStop)

  if (stage !== SCENE_STAGE.INTRO) return null

  return (
    <section className="intro" aria-label="个人宇宙开场">
      <div className="intro__constellation" aria-hidden="true">
        <span>北斗导航星标</span>
        <i />
      </div>
      <p className="intro__eyebrow">WAYNE YU · PERSONAL COSMOS</p>
      <h1>一些我做过的小世界</h1>
      <p className="intro__lede">从苍穹出发，沿着一组熟悉的星标，寻找一座属于创作者的银河。</p>
      <p className="intro__scroll">向下滚动，开始航行</p>
      <button className="text-action" onClick={() => jumpToStop('observer')}>跳过至项目</button>
      <p className="intro__skip">滚轮 / 触控板 / 方向键</p>
    </section>
  )
}
