import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { constellations, byId } from '../data/projects'
import { useCosmos } from '../state/store'

// 作品之间的母题连线。极细、几乎看不见，只有相关节点被 hover 时才亮起来。
export default function Constellation({ layout }) {
  const groupRef = useRef()
  const hovered = useCosmos((s) => s.hovered)

  const lines = useMemo(
    () =>
      constellations.map((link) => {
        const a = new THREE.Vector3(...byId(link.from).positions[layout])
        const b = new THREE.Vector3(...byId(link.to).positions[layout])
        const mid = a.clone().lerp(b, 0.5)
        // 让线稍微弯曲，空间里没有直线更好看
        mid.y += a.distanceTo(b) * 0.06
        const curve = new THREE.QuadraticBezierCurve3(a, mid, b)
        const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(48))
        return { ...link, geometry }
      }),
    [layout],
  )

  useFrame((_, dt) => {
    if (!groupRef.current) return
    groupRef.current.children.forEach((child) => {
      const target = child.userData.active(hovered) ? 0.34 : 0.07
      child.material.opacity += (target - child.material.opacity) * Math.min(1, dt * 3)
    })
  })

  return (
    <group ref={groupRef}>
      {lines.map((l) => (
        <line
          key={`${l.from}-${l.to}`}
          geometry={l.geometry}
          userData={{ active: (h) => h === l.from || h === l.to }}
        >
          <lineBasicMaterial color="#7E93AD" transparent opacity={0.07} />
        </line>
      ))}
    </group>
  )
}
