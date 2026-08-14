import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// 极弱的空间坐标线。它的作用只有一个：让访客感到这片黑暗是被测量过的。
export default function Grid() {
  const ref = useRef()
  const geometry = useMemo(() => {
    const pts = []
    const span = 260
    const step = 26
    for (let i = -span; i <= span; i += step) {
      pts.push(new THREE.Vector3(i, -26, -span), new THREE.Vector3(i, -26, span))
      pts.push(new THREE.Vector3(-span, -26, i), new THREE.Vector3(span, -26, i))
    }
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    // 网格跟着镜头缓慢平移，永远不会走到尽头
    ref.current.position.z = Math.floor(state.camera.position.z / 26) * 26
  })

  return (
    <lineSegments ref={ref} geometry={geometry}>
      <lineBasicMaterial color="#243244" transparent opacity={0.16} />
    </lineSegments>
  )
}
