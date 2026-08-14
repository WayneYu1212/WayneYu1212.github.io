import { projects } from '../data/projects'
import { SCENE_STAGE, useCosmos } from '../state/store'

export default function StarMap() {
  const open = useCosmos((state) => state.mapOpen)
  const toggle = useCosmos((state) => state.toggleMap)
  const focusPlanet = useCosmos((state) => state.focusPlanet)

  if (!open) return null

  const choose = (project) => {
    focusPlanet(project.id)
    window.history.pushState({ stage: SCENE_STAGE.PLANET_FOCUS, projectId: project.id }, '', '#system')
  }

  return (
    <section className="star-map" role="dialog" aria-label="恒星系星图">
      <header><div><span>SYSTEM MAP</span><h2>恒星系星图</h2></div><button onClick={toggle}>关闭</button></header>
      <div className="star-map__sun" aria-hidden="true"><i /></div>
      <ol>
        {projects.map((project) => (
          <li key={project.id} style={{ '--orbit': project.world.orbit.radius, '--accent': project.accent }}>
            <button onClick={() => choose(project)} aria-label={`${project.index} ${project.title}，靠近行星`}>
              <i />
              <span>{project.index}</span>
              <strong>{project.title}</strong>
              <em>{project.kind}</em>
            </button>
          </li>
        ))}
      </ol>
      <p>单击任意行星靠近；无需双击。</p>
    </section>
  )
}
