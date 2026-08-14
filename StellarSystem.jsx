import { useThree } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import { observerStop, projects } from '../data/projects'
import { pushRoute } from '../lib/navigation'
import { SCENE_STAGE, useCosmos } from '../state/store'
import ApplePlanet from './ApplePlanet'
import CelestialBody from './CelestialBody'
import ProjectFeatures from './ProjectFeatures'
import { orbitPoints, planetPosition } from './worldMath'
import ObserverProbe from './ObserverProbe'

function ProjectPlanet({ project, focused, systemFocused, opacity, activeBudget }) {
  const position = planetPosition(project)
  const focusPlanet = useCosmos((state) => state.focusPlanet)
  const travel = useCosmos((state) => state.travel)
  const { camera } = useThree()
  const select = (event) => {
    event.stopPropagation()
    focusPlanet(project.id, {
      position: camera.position.toArray(),
      target: [0, 0, 0],
      travel,
    })
    pushRoute({ stage: SCENE_STAGE.PLANET_FOCUS, projectId: project.id })
  }

  return (
    <group position={position} visible={!systemFocused || focused}>
      <group onClick={select} onPointerOver={() => { document.body.style.cursor = 'pointer' }} onPointerOut={() => { document.body.style.cursor = '' }}>
        {project.id === 'apple'
          ? <ApplePlanet project={project} focused={focused} activeBudget={activeBudget} opacity={opacity} />
          : <>
            <CelestialBody project={project} focused={focused} opacity={opacity} activeBudget={activeBudget} />
            <ProjectFeatures project={project} focused={focused} activeBudget={activeBudget} opacity={opacity} />
          </>}
      </group>
      <Html center distanceFactor={18} position={[0, project.world.radius + 1.1, 0]} className={`planet-label ${focused ? 'is-focused' : ''}`}>
        <span>{project.index}</span>
        <strong>{project.title}</strong>
      </Html>
      {focused && project.id === 'apple' && (
        <Html center distanceFactor={14} position={[0, -project.world.radius - 1.55, 0]} className="apple-orbit-readout">
          <span>1666 · 伍尔索普</span><i />
          <span>1696 · 皇家铸币局</span><i />
        </Html>
      )}
    </group>
  )
}

export default function StellarSystem({ opacity = 1, activeBudget }) {
  const focused = useCosmos((state) => state.focused)
  const activeStop = useCosmos((state) => state.activeStop)
  return (
    <group>
      <ambientLight intensity={0.16} />
      <directionalLight position={[12, 16, 28]} intensity={focused ? 2.8 : 1.15} color="#dbe8ef" />
      <pointLight position={[0, 0, 0]} intensity={110} distance={90} decay={2} color="#fff0d1" />
      {!focused && activeStop !== observerStop.id && (
        <group>
          <mesh>
            <sphereGeometry args={[2.45, 48, 32]} />
            <meshBasicMaterial color="#ffcf98" transparent opacity={opacity} />
          </mesh>
          <mesh scale={1.32}>
            <sphereGeometry args={[2.45, 32, 24]} />
            <meshBasicMaterial color="#ff9b56" transparent opacity={opacity * 0.14} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh scale={1.7}>
            <sphereGeometry args={[2.45, 32, 24]} />
            <meshBasicMaterial color="#ff824d" transparent opacity={opacity * 0.035} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
      )}
      {!focused && (
        <group position={observerStop.world.position}>
          <ObserverProbe opacity={opacity} active={activeStop === observerStop.id} />
        </group>
      )}
      {projects.map((project) => (
        <Line
          key={`orbit-${project.id}`}
          points={orbitPoints(project.world.orbit.radius, activeBudget?.orbitSegments ?? 48)}
          color={project.accent}
          transparent
          opacity={(focused === project.id ? 0.42 : focused ? 0.018 : 0.13) * opacity}
          lineWidth={focused === project.id ? 0.7 : 0.42}
        />
      ))}
      {projects.map((project) => (
        <ProjectPlanet key={project.id} project={project} focused={focused === project.id} systemFocused={Boolean(focused)} opacity={opacity} activeBudget={activeBudget} />
      ))}
    </group>
  )
}
