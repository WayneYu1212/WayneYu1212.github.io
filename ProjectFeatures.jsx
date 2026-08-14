import { Html, Line } from '@react-three/drei'
import * as THREE from 'three'

const ringPoints = (radius, segments = 96) => Array.from({ length: segments + 1 }, (_, index) => {
  const angle = (index / segments) * Math.PI * 2
  return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius]
})

function AppleFeatures({ project, focused, opacity }) {
  const radius = project.world.radius
  return (
    <group rotation={[0.22, 0, -0.12]}>
      <Line points={ringPoints(radius * 1.42)} color="#9fb7c7" transparent opacity={opacity * (focused ? 0.58 : 0.2)} lineWidth={0.55} />
      <group rotation={[0.18, 0.08, 0.06]}>
        <Line points={ringPoints(radius * 1.72)} color="#c3ab82" transparent opacity={opacity * (focused ? 0.52 : 0.17)} lineWidth={0.5} />
      </group>
      {focused && (
        <>
          <Html position={[radius * 1.42, 0.18, 0]} className="orbit-year" center>1666</Html>
          <Html position={[-radius * 1.72, -0.12, 0]} className="orbit-year" center>1696</Html>
        </>
      )}
    </group>
  )
}

function YongshuFeatures({ project, activeBudget, opacity }) {
  const count = Math.min(activeBudget?.paperFragments ?? 12, 18)
  const radius = project.world.radius
  return (
    <group>
      {Array.from({ length: count }, (_, index) => {
        const angle = index * 2.39996
        const distance = radius * (1.25 + (index % 4) * 0.16)
        return (
          <mesh key={index} position={[Math.cos(angle) * distance, ((index % 5) - 2) * 0.34, Math.sin(angle) * distance]} rotation={[angle * 0.23, angle, angle * 0.11]}>
            <planeGeometry args={[0.34 + (index % 3) * 0.08, 0.22]} />
            <meshBasicMaterial color={index % 3 === 0 ? '#c5a567' : '#766247'} transparent opacity={opacity * 0.56} side={THREE.DoubleSide} />
          </mesh>
        )
      })}
    </group>
  )
}

function NearbyFeatures({ project, activeBudget, opacity }) {
  const count = Math.min(activeBudget?.observationMarks ?? 8, 14)
  const radius = project.world.radius
  return (
    <group>
      {activeBudget?.transparentFeatures !== false && (
        <mesh>
          <sphereGeometry args={[radius * 1.22, 36, 24]} />
          <meshBasicMaterial color="#eaddeb" wireframe transparent opacity={opacity * 0.075} />
        </mesh>
      )}
      {Array.from({ length: count }, (_, index) => {
        const angle = index * 2.39996
        return (
          <mesh key={index} position={[Math.cos(angle) * radius * 1.3, Math.sin(index * 1.7) * radius * 0.55, Math.sin(angle) * radius * 1.3]}>
            <boxGeometry args={[0.09, 0.09, 0.09]} />
            <meshBasicMaterial color="#f1e8f1" transparent opacity={opacity * 0.72} />
          </mesh>
        )
      })}
    </group>
  )
}

export default function ProjectFeatures({ project, focused = false, activeBudget, opacity = 1 }) {
  if (project.id === 'apple') return <AppleFeatures project={project} focused={focused} opacity={opacity} />
  if (project.id === 'yongshu') return <YongshuFeatures project={project} activeBudget={activeBudget} opacity={opacity} />
  return <NearbyFeatures project={project} activeBudget={activeBudget} opacity={opacity} />
}
