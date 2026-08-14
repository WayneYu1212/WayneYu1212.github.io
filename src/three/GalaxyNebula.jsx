import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const GALAXY_NEBULA_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    vec2 centered = vUv - 0.5;
    float radius = length(centered * vec2(1.0, 0.62));
    float angle = atan(centered.y, centered.x);
    float spiral = 0.5 + 0.5 * sin(angle * 4.0 + radius * 19.0 - uTime * 0.08);
    float arm = smoothstep(0.28, 0.76, spiral);
    float cloud = smoothstep(0.62, 0.03, radius) * (0.42 + arm * 0.58);
    float core = smoothstep(0.18, 0.0, radius);
    vec3 blue = vec3(0.18, 0.33, 0.95);
    vec3 violet = vec3(0.54, 0.25, 0.9);
    vec3 ember = vec3(1.0, 0.33, 0.15);
    vec3 color = mix(blue, violet, smoothstep(-1.0, 1.0, sin(angle * 2.0 + radius * 8.0)));
    color = mix(color, ember, smoothstep(0.34, 0.04, radius) * 0.56);
    gl_FragColor = vec4(color, (cloud * 0.12 + core * 0.05) * uOpacity);
  }
`

export default function GalaxyNebula({ opacity = 1 }) {
  const ref = useRef()
  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 1 },
    },
    vertexShader,
    fragmentShader: GALAXY_NEBULA_FRAGMENT_SHADER,
  }), [])

  useFrame((_, delta) => {
    material.uniforms.uTime.value += delta
    material.uniforms.uOpacity.value = opacity
    if (ref.current) ref.current.rotation.z += delta * 0.003
  })

  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]} scale={[1.22, 1.22, 1.22]} renderOrder={-1}>
      <planeGeometry args={[42, 42]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}
