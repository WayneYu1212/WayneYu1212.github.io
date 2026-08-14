import { useCallback, useEffect } from 'react'
import { byId } from '../data/projects'
import { pushRoute } from '../lib/navigation'
import { SCENE_STAGE, useCosmos } from '../state/store'

export default function Hud() {
  const stage = useCosmos((state) => state.stage)
  const focused = useCosmos((state) => state.focused)
  const activeStop = useCosmos((state) => state.activeStop)
  const approachGalaxy = useCosmos((state) => state.approachGalaxy)
  const enterSystem = useCosmos((state) => state.enterSystem)
  const openProject = useCosmos((state) => state.openProject)
  const toggleMap = useCosmos((state) => state.toggleMap)
  const project = focused ? byId(focused) : null
  const showingProject = project && (
    stage === SCENE_STAGE.PLANET_FOCUS
    || (stage === SCENE_STAGE.SYSTEM && activeStop === project.id)
  )

  const goGalaxy = () => {
    approachGalaxy()
    pushRoute({ stage: SCENE_STAGE.GALAXY_TRANSIT })
  }
  const goSystem = useCallback(() => {
    enterSystem()
    pushRoute({ stage: SCENE_STAGE.SYSTEM })
  }, [enterSystem])
  const enterProject = () => {
    if (!focused) return
    openProject(focused)
    pushRoute({ stage: SCENE_STAGE.READING, projectId: focused })
  }

  useEffect(() => {
    if (stage !== SCENE_STAGE.GALAXY_TRANSIT) return undefined
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(goSystem, reduced ? 120 : 4200)
    return () => window.clearTimeout(timer)
  }, [stage, goSystem])

  if ([SCENE_STAGE.INTRO, SCENE_STAGE.READING].includes(stage)) return null

  return (
    <div className={`journey-hud stage-${stage}`}>
      <header className="journey-hud__identity">
        <strong>WAYNE YU</strong>
        <span>个人银河观测记录</span>
      </header>

      {stage === SCENE_STAGE.DEEP_SPACE && (
        <section className="journey-card journey-card--route">
          <span className="journey-kicker">导航星标 · 北斗</span>
          <h2>发现通往个人银河的航线</h2>
          <p>北斗星标指向远处的彩色星云。继续向下滚动，沿航线进入我的作品世界。</p>
          <button className="primary-action" onClick={goGalaxy}>跟随星标</button>
        </section>
      )}

      {stage === SCENE_STAGE.GALAXY_TRANSIT && (
        <section className="journey-card journey-card--transit" aria-live="polite">
          <span className="journey-kicker">正在穿越旋臂</span>
          <h2>进入个人银河</h2>
          <p>穿过星云与尘埃，核心恒星系正在显现。</p>
          <button className="text-action" onClick={goSystem}>跳过穿越</button>
        </section>
      )}

      {stage === SCENE_STAGE.SYSTEM && !activeStop && (
        <section className="system-caption">
          <span>核心恒星系</span>
          <p>三颗项目行星分别对应一个作品。点按行星查看项目，或继续向下滚动。</p>
          <button className="text-action" onClick={toggleMap}>打开星图</button>
        </section>
      )}

      {showingProject && (
        <section className="planet-panel" style={{ '--accent': project.accent }}>
          <span className="journey-kicker">作品行星 {project.index}</span>
          <h2>{project.title}</h2>
          <p>{project.kind} · {project.observed}</p>
          {project.id === 'apple' && (
            <dl>
              <div><dt>轨道一</dt><dd>1666 · 伍尔索普</dd></div>
              <div><dt>轨道二</dt><dd>1696 · 皇家铸币厅</dd></div>
            </dl>
          )}
          <button className="primary-action" onClick={enterProject}>进入项目</button>
          <button className="text-action" onClick={goSystem}>返回恒星系</button>
        </section>
      )}
    </div>
  )
}
