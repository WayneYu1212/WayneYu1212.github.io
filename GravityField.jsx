import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const MODE = { fragments: 0, trajectory: 1, scale: 2, observer: 3 }

// 每个作品是一个“场”，不是一颗行星。
// 靠近 / hover 时 uPull 上升：碎片开始被吸引、轨迹开始弯曲、尺度开始坍缩。
export default function GravityField({ project, count = 2600, pullRef: outer }) {
  const matRef = useRef()
  const pullRef = useRef(0)

  const { geometry, material } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    const ring = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const t = i / count
      const a = Math.random() * Math.PI * 2
      // 场的静息形态：一个中空的、稍扁的云
      const r = 3.2 + Math.pow(Math.random(), 0.5) * 7.5
      const h = (Math.random() - 0.5) * (project.field === 'fragments' ? 2.4 : 5.0)
      pos[i * 3] = Math.cos(a) * r
      pos[i * 3 + 1] = h
      pos[i * 3 + 2] = Math.sin(a) * r
      seed[i] = Math.random()
      ring[i] = t
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    g.setAttribute('aRing', new THREE.BufferAttribute(ring, 1))

    const accent = new THREE.Color(project.accent)
    const paper = new THREE.Color(project.paper)

    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPull: { value: 0 },
        uMode: { value: MODE[project.field] ?? 0 },
        uAccent: { value: accent },
        uPaper: { value: paper },
        uPixelRatio: { value: 1 },
      },
      vertexShader: /* glsl */ `
        attribute float aSeed;
        attribute float aRing;
        uniform float uTime;
        uniform float uPull;
        uniform float uMode;
        uniform float uPixelRatio;
        varying float vAlpha;
        varying float vMix;

        void main() {
          vec3 p = position;
          float r = length(p.xz);
          float a = atan(p.z, p.x);
          float t = uTime;

          if (uMode < 0.5) {
            // 碎片 → 聚合：环绕一个空的中心缓慢旋转，被吸引时向内塌缩并排齐
            a += t * (0.06 + aSeed * 0.05) + uPull * 0.6;
            float rr = mix(r, 2.0 + aRing * 3.0, uPull * 0.75);
            p.x = cos(a) * rr;
            p.z = sin(a) * rr;
            p.y = mix(p.y, sin(aRing * 28.0) * 0.5, uPull * 0.8);
          } else if (uMode < 1.5) {
            // 轨迹 → 偏离：几条椭圆轨道，其中一部分逆向运动
            float dir = aSeed > 0.86 ? -1.0 : 1.0;
            a += t * (0.10 + mod(aSeed, 0.2)) * dir;
            float rr = mix(r, 3.5 + floor(aSeed * 4.0) * 1.9, uPull * 0.85);
            p.x = cos(a) * rr * 1.25;
            p.z = sin(a) * rr * 0.72;
            p.y = mix(p.y, sin(a * 2.0) * 0.9 * dir, uPull * 0.9);
          } else if (uMode < 2.5) {
            // 尺度坍缩：同心环整体向内收缩，宇宙点阵变成街区尺度
            a += t * 0.05;
            float rings = floor(aRing * 6.0) + 1.0;
            float rr = mix(r, rings * 0.55, uPull);
            p.x = cos(a) * rr;
            p.z = sin(a) * rr;
            p.y = mix(p.y, 0.0, uPull) + sin(t * 0.4 + aSeed * 6.0) * 0.06;
          } else {
            // 观察者：几乎不动，只有极轻微的呼吸
            a += t * 0.02;
            float rr = r * (1.0 - uPull * 0.12);
            p.x = cos(a) * rr;
            p.z = sin(a) * rr;
            p.y += sin(t * 0.3 + aSeed * 9.0) * 0.05;
          }

          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          float dist = -mv.z;
          gl_Position = projectionMatrix * mv;
          float base = 0.9 + aSeed * 1.6;
          gl_PointSize = base * uPixelRatio * (95.0 / max(dist, 1.0)) * (0.7 + uPull * 0.9);
          vAlpha = smoothstep(240.0, 20.0, dist) * (0.20 + uPull * 0.80);
          vMix = aSeed;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uAccent;
        uniform vec3 uPaper;
        uniform float uPull;
        varying float vAlpha;
        varying float vMix;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          if (d > 0.5) discard;
          float core = smoothstep(0.5, 0.0, d);
          // 远处保持冷白，靠近后才让作品自己的颜色浮出来
          vec3 cold = vec3(0.82, 0.86, 0.92);
          vec3 own = mix(uPaper, uAccent, smoothstep(0.55, 1.0, vMix));
          vec3 c = mix(cold, own, clamp(uPull * 1.15, 0.0, 1.0));
          gl_FragColor = vec4(c, core * core * vAlpha);
        }
      `,
    })
    return { geometry: g, material: m }
  }, [count, project.field, project.accent, project.paper])

  useFrame((state, dt) => {
    material.uniforms.uTime.value += dt
    material.uniforms.uPixelRatio.value = Math.min(state.gl.getPixelRatio(), 2)
    // 引力是渐变的，不做开关式跳变
    const want = outer?.current ?? 0
    pullRef.current += (want - pullRef.current) * Math.min(1, dt * 2.6)
    material.uniforms.uPull.value = pullRef.current
  })

  return <points ref={matRef} geometry={geometry} material={material} frustumCulled={false} />
}
