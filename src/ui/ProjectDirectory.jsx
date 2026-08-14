import { projects } from '../data/projects'
import { pushRoute } from '../lib/navigation'
import { SCENE_STAGE, useCosmos } from '../state/store'

export default function ProjectDirectory() {
  const open = useCosmos((state) => state.directoryOpen)
  const toggle = useCosmos((state) => state.toggleDirectory)
  const openProject = useCosmos((state) => state.openProject)

  const choose = (id) => {
    openProject(id)
    pushRoute({ stage: SCENE_STAGE.READING, projectId: id })
  }

  return (
    <div className="directory-shell">
      <button className="directory-trigger" onClick={toggle} aria-expanded={open}>作品目录</button>
      {open && (
        <section className="directory" role="dialog" aria-label="作品目录">
          <header>
            <div><span>PROJECT INDEX</span><h2>作品目录</h2></div>
            <button onClick={toggle} aria-label="关闭作品目录">关闭</button>
          </header>
          <p>不必完成整段旅程；从这里可以直接打开任意项目。</p>
          <ol>
            {projects.map((project) => (
              <li key={project.id}>
                <button onClick={() => choose(project.id)}>
                  <i style={{ background: project.accent }} />
                  <span>{project.index}</span>
                  <strong>{project.title}</strong>
                  <em>{project.kind} · {project.observed}</em>
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}
