import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import {
  CIRCULAR_PARTICLE_FRAGMENT_SHADER,
  CIRCULAR_PARTICLE_VERTEX_SHADER,
  makeParticleGeometry,
} from './particleVisuals'

const DIPPER_POINTS = [
  [-15, 10, -18], [-10, 8.5, -19], [-5, 9, -20], [0, 6.5, -21],
  [5, 7.5, -22], [9, 10, -23], [13, 13, -24],
]

function NavigationStars() {
  return (
    <group>
      <Line points={DIPPER_POINTS} color="#8ca7c5" transparent opacity={0.34} lineWidth={0.55} />
      {DIPPER_POINTS.map((position, index) => (
        <mesh key={index} position={position}>
          <sphereGeometry args={[index === 0 ? 0.24 : 0.16, 12, 12]} />
          <meshBasicMaterial color={index === 0 ? '#fff2d7' : '#d9e7f8'} />
        </mesh>
      ))}
      <Line points={[[13, 13, -24], [24, 19, -37], [36, 22, -54]]} color="#8ca7c5" transparent opacity={0.18} lineWidth={0.45} dashed dashScale={1.5} dashSize={0.7} gapSize={0.7} />
    </group>
  )
}

function StarLayer({ count, kind, opacity }) {
  const ref = useRef()
  const geometry = useMemo(() => makeParticleGeometry(count, { kind, radius: 230, depth: 0.62 }), [count, kind])
  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uOpacity: { value: 1 },
      uPalette: { value: 0 },
    },
    vertexShader: CIRCULAR_PARTICLE_VERTEX_SHADER,
    fragmentShader: CIRCULAR_PARTICLE_FRAGMENT_SHADER,
  }), [])

  useFrame((state, delta) => {
    material.uniforms.uTime.value += delta
    material.uniforms.uPixelRatio.value = Math.min(state.gl.getPixelRatio(), 1.75)
    material.uniforms.uOpacity.value = opacity
    if (ref.current) ref.current.rotation.y += delta * (kind > 0.5 ? 0.004 : 0.002)
  })

  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} />
}

export default function DeepSpace({ count, brightCount = 72, showMarker = true, opacity = 1 }) {
  const microCount = Math.max(0, count - brightCount)
  return (
    <group>
      <StarLayer count={microCount} kind={0} opacity={opacity * 0.86} />
      {brightCount > 0 && <StarLayer count={brightCount} kind={1} opacity={opacity} />}
      {showMarker && <NavigationStars />}
    </group>
  )
}
