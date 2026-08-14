import CelestialBody from './CelestialBody'
import ProjectFeatures from './ProjectFeatures'

export default function ApplePlanet({ project, focused, activeBudget, opacity = 1 }) {
  return (
    <group>
      <CelestialBody project={project} focused={focused} opacity={opacity} activeBudget={activeBudget} />
      <ProjectFeatures project={project} focused={focused} activeBudget={activeBudget} opacity={opacity} />
    </group>
  )
}
