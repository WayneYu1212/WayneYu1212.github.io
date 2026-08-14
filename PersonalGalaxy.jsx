import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { galaxyTransformForProgress } from './cameraTargets'
import {
  CIRCULAR_PARTICLE_FRAGMENT_SHADER,
  CIRCULAR_PARTICLE_VERTEX_SHADER,
} from './particleVisuals'
import GalaxyNebula from './GalaxyNebula'

export default function PersonalGalaxy({ count, opacity = 1, progress = 0 }) {
  const ref = useRef()
  const transform = galaxyTransformForProgress(progress)
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    const size = new Float32Array(count)
    const kind = new Float32Array(count)
    for (let index = 0; index < count; index += 1) {
      const arm = index % 4
      const radius = Math.pow(Math.random(), 0.56) * 28
      const angle = radius * 0.3 + arm * Math.PI * 0.5 + (Math.random() - 0.5) * (0.28 + radius * 0.015)
      const thickness = (1 - radius / 31) * 2.4 + 0.3
      positions[index * 3] = Math.cos(angle) * radius
      positions[index * 3 + 1] = (Math.random() - 0.5) * thickness
      positions[index * 3 + 2] = Math.sin(angle) * radius * 0.62
      seed[index] = (arm / 4 + Math.random() * 0.45) % 1
      size[index] = 0.68 + (1 - radius / 32) * 1.25
      kind[index] = 0
    }
    const cloud = new THREE.BufferGeometry()
    cloud.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    cloud.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    cloud.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    cloud.setAttribute('aKind', new THREE.BufferAttribute(kind, 1))
    return cloud
  }, [count])

  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uOpacity: { value: 1 },
      uPalette: { value: 1 },
    },
    vertexShader: CIRCULAR_PARTICLE_VERTEX_SHADER,
    fragmentShader: CIRCULAR_PARTICLE_FRAGMENT_SHADER,
  }), [])

  useFrame((state, delta) => {
    material.uniforms.uTime.value += delta
    material.uniforms.uPixelRatio.value = Math.min(state.gl.getPixelRatio(), 1.75)
    material.uniforms.uOpacity.value = opacity
    if (ref.current) ref.current.rotation.y += delta * 0.018
  })

  return (
    <group ref={ref} position={[0, 0, 0]} rotation={[0.24, -0.28, -0.08]} scale={transform.scale}>
      <GalaxyNebula opacity={opacity * 0.72} />
      <points geometry={geometry} frustumCulled={false}>
        <primitive object={material} attach="material" />
      </points>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4.6, 64]} />
        <meshBasicMaterial color="#fff1d2" transparent opacity={opacity * (0.14 + transform.core * 0.2)} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  )
}
