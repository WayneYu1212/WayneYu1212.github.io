import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import GravityField from './GravityField'
import { useCosmos } from '../state/store'

const tmp = new THREE.Vector3()

// 一个作品 = 一个引力场 + 一个很小的核 + 一个克制的标签。
// pull 由“镜头距离”和“是否 hover”共同决定：用户先感受到作品，然后才看见作品。
export default function Node({ project, count }) {
  const group = useRef()
  const core = useRef()
  const pullRef = useRef(0)
  const labelRef = useRef()
  const hovered = useCosmos((s) => s.hovered)
  const focused = useCosmos((s) => s.focused)
  const layout = useCosmos((s) => s.layout)
  const hover = useCosmos((s) => s.hover)
  const openProject = useCosmos((s) => s.openProject)
  const target = project.positions[layout]

  useFrame((state, dt) => {
    if (!group.current) return
    // RECOMPOSE：切换排列方式时，节点在空间中重新长到新位置
    tmp.set(target[0], target[1], target[2])
    group.current.position.lerp(tmp, Math.min(1, dt * 1.4))

    const d = state.camera.position.distanceTo(group.current.position)
    const proximity = THREE.MathUtils.clamp(1 - (d - 12) / 46, 0, 1)
    const isHot = hovered === project.id || focused === project.id
    pullRef.current = Math.max(proximity, isHot ? 1 : 0)

    if (core.current) {
      const s = 1 + pullRef.current * 0.5
      core.current.scale.setScalar(s)
      core.current.material.opacity = 0.28 + pullRef.current * 0.62
    }
    if (labelRef.current) {
      const near = proximity > 0.22 || isHot
      labelRef.current.style.opacity = near ? '1' : '0'
    }
  })

  return (
    <group ref={group} position={target}>
      <GravityField project={project} count={count} pullRef={pullRef} />

      <mesh ref={core}>
        <sphereGeometry args={[0.42, 20, 20]} />
        <meshBasicMaterial color={project.accent} transparent opacity={0.3} />
      </mesh>

      <mesh
        onPointerOver={(e) => {
          e.stopPropagation()
          hover(project.id)
          document.body.style.cursor = 'crosshair'
        }}
        onPointerOut={() => {
          hover(null)
          document.body.style.cursor = ''
        }}
        onClick={(e) => {
          e.stopPropagation()
          openProject(project.id)
        }}
        visible={false}
      >
        <sphereGeometry args={[9.5, 12, 12]} />
      </mesh>

      <Html center distanceFactor={26} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div ref={labelRef} className="node-label">
          <span className="node-label__idx">{project.index}</span>
          <span className="node-label__title">{project.title}</span>
          <span className="node-label__kind">{project.kindEn}</span>
        </div>
      </Html>
    </group>
  )
}
