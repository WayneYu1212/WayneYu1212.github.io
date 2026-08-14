import { useMemo } from 'react'
import * as THREE from 'three'

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vNormal = normalize(mat3(modelMatrix) * normal);
    vView = cameraPosition - worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.6);
    gl_FragColor = vec4(uColor, rim * uOpacity);
  }
`

export default function PlanetAtmosphere({ radius, color = '#9bbfe8', opacity = 1, enabled = true }) {
  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity * 0.7 },
    },
    vertexShader,
    fragmentShader,
  }), [color, opacity])

  if (!enabled) return null
  return (
    <mesh scale={1.055} renderOrder={2}>
      <sphereGeometry args={[radius, 48, 32]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}
