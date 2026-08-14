import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// 亮星数量固定且很少：宇宙的主次感来自“绝大多数星点安静、极少数星点发光”，
// 不是数量本身。之前几万颗全部叠加发光才是变成白色棉花团的根本原因。
const MAX_BRIGHT = 56

function makeField(count, { minSize, maxSize }) {
  const pos = new Float32Array(count * 3)
  const seed = new Float32Array(count)
  const size = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const shell = Math.random()
    const r = 40 + Math.pow(shell, 0.6) * 420
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.55
    pos[i * 3 + 2] = r * Math.cos(phi) - 60
    seed[i] = Math.random()
    size[i] = minSize + Math.pow(1 - shell, 2.2) * (maxSize - minSize)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
  g.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
  return g
}

// 微星：绝大多数星尘。细小、锐利、不叠加发光——它们负责撑出宇宙里真正的“空”。
function MicroStars({ count }) {
  const ref = useRef()

  const { geometry, material } = useMemo(() => {
    const g = makeField(count, { minSize: 0.55, maxSize: 1.4 })
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 } },
      vertexShader: /* glsl */ `
        attribute float aSeed;
        attribute float aSize;
        uniform float uTime;
        uniform float uPixelRatio;
        varying float vAlpha;
        varying float vTemp;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          float dist = -mv.z;
          gl_Position = projectionMatrix * mv;
          float tw = 0.78 + 0.22 * sin(uTime * (0.2 + aSeed * 0.4) + aSeed * 43.0);
          float sizePx = aSize * uPixelRatio * (150.0 / max(dist, 1.0)) * tw;
          // 硬性上限：星点永远是针尖，绝不允许再长成光斑
          gl_PointSize = clamp(sizePx, 0.55, 2.4 * uPixelRatio);
          vAlpha = smoothstep(520.0, 90.0, dist) * tw;
          vTemp = aSeed;
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vAlpha;
        varying float vTemp;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          if (d > 0.5) discard;
          // 硬边：锐利的圆点，而不是柔光核心
          float core = smoothstep(0.5, 0.38, d);
          vec3 cool = vec3(0.78, 0.84, 0.92);
          vec3 warm = vec3(0.93, 0.92, 0.87);
          vec3 c = mix(cool, warm, smoothstep(0.75, 1.0, vTemp));
          gl_FragColor = vec4(c, core * vAlpha * 0.55);
        }
      `,
    })
    return { geometry: g, material: m }
  }, [count])

  useFrame((state, dt) => {
    material.uniforms.uTime.value += dt
    material.uniforms.uPixelRatio.value = Math.min(state.gl.getPixelRatio(), 2)
    if (ref.current) ref.current.rotation.y += dt * 0.003
  })

  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} />
}

// 亮星：极少数，允许柔和辉光，但半径被严格限制，不会互相叠爆成一片白。
function BrightStars({ count }) {
  const ref = useRef()

  const { geometry, material } = useMemo(() => {
    const g = makeField(count, { minSize: 1.5, maxSize: 3.0 })
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 } },
      vertexShader: /* glsl */ `
        attribute float aSeed;
        attribute float aSize;
        uniform float uTime;
        uniform float uPixelRatio;
        varying float vAlpha;
        varying float vTemp;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          float dist = -mv.z;
          gl_Position = projectionMatrix * mv;
          float tw = 0.7 + 0.3 * sin(uTime * (0.25 + aSeed * 0.5) + aSeed * 43.0);
          float sizePx = aSize * uPixelRatio * (150.0 / max(dist, 1.0)) * tw;
          gl_PointSize = clamp(sizePx, 1.2, 6.0 * uPixelRatio);
          vAlpha = smoothstep(520.0, 90.0, dist) * tw;
          vTemp = aSeed;
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vAlpha;
        varying float vTemp;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          if (d > 0.5) discard;
          float core = pow(smoothstep(0.5, 0.0, d), 1.7);
          vec3 cool = vec3(0.86, 0.90, 0.97);
          vec3 warm = vec3(0.99, 0.97, 0.92);
          vec3 c = mix(cool, warm, smoothstep(0.75, 1.0, vTemp));
          gl_FragColor = vec4(c, core * vAlpha * 0.75);
        }
      `,
    })
    return { geometry: g, material: m }
  }, [count])

  useFrame((state, dt) => {
    material.uniforms.uTime.value += dt
    material.uniforms.uPixelRatio.value = Math.min(state.gl.getPixelRatio(), 2)
    if (ref.current) ref.current.rotation.y += dt * 0.003
  })

  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} />
}

// 星尘：整片宇宙的纵深，拆成“微星”与“亮星”两层，绝不再让上万颗星互相
// additive 叠加成一坨模糊的白棉花球。
export default function Starfield({ count = 24000 }) {
  const brightCount = Math.min(MAX_BRIGHT, count)
  const microCount = Math.max(0, count - brightCount)
  return (
    <group>
      <MicroStars count={microCount} />
      <BrightStars count={brightCount} />
    </group>
  )
}
