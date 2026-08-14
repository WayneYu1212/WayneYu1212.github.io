import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// 近景尘埃。纵深感不是靠远处的星星给的——远星在镜头移动时几乎不动。
// 真正让人感到“在飞”的是贴着镜头掠过的这一层：它跟随镜头，
// 用取模的方式无限循环，所以永远飞不出去，也永远有东西掠过。
const SPAN = 46

export default function NearDust({ count = 220 }) {
  const ref = useRef()
  const { geometry, material } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * SPAN * 2
      pos[i * 3 + 1] = (Math.random() - 0.5) * SPAN * 1.2
      pos[i * 3 + 2] = (Math.random() - 0.5) * SPAN * 2
      seed[i] = Math.random()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))

    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 } },
      vertexShader: /* glsl */ `
        attribute float aSeed;
        uniform float uTime;
        uniform float uPixelRatio;
        varying float vAlpha;
        void main() {
          vec3 p = position;
          // 极慢的自漂移，避免尘埃看起来像钉死在网格上
          p.x += sin(uTime * 0.08 + aSeed * 30.0) * 1.6;
          p.y += cos(uTime * 0.06 + aSeed * 21.0) * 1.2;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          float dist = -mv.z;
          gl_Position = projectionMatrix * mv;
          gl_PointSize = clamp((0.9 + aSeed * 1.1) * uPixelRatio * (90.0 / max(dist, 1.0)), 0.5, 3.0 * uPixelRatio);
          // 太近会糊住画面，太远交给星场，所以两头都要淡出
          vAlpha = smoothstep(2.0, 12.0, dist) * smoothstep(64.0, 26.0, dist);
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vAlpha;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          if (d > 0.5) discard;
          float core = smoothstep(0.5, 0.32, d);
          gl_FragColor = vec4(vec3(0.72, 0.79, 0.88), core * vAlpha * 0.32);
        }
      `,
    })
    return { geometry: g, material: m }
  }, [count])

  useFrame((state, dt) => {
    material.uniforms.uTime.value += dt
    material.uniforms.uPixelRatio.value = Math.min(state.gl.getPixelRatio(), 2)
    if (!ref.current) return
    // 把这一层始终裹在镜头周围：以 SPAN 为周期取整对齐，
    // 视觉上等于一层无限延伸的尘埃，实际只有几百个点。
    const c = state.camera.position
    ref.current.position.set(
      Math.round(c.x / SPAN) * SPAN,
      Math.round(c.y / SPAN) * SPAN,
      Math.round(c.z / SPAN) * SPAN,
    )
  })

  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} />
}
