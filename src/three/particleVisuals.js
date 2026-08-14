import * as THREE from 'three'

const BRIGHT_CAP = 120

export function particlePointSizeFloor(kind) {
  return kind > 0.5 ? 2.05 : 1.45
}

export function starBudgetForCount(count) {
  const safeCount = Math.max(0, Math.floor(count))
  const bright = safeCount === 0 ? 0 : Math.min(BRIGHT_CAP, Math.max(3, Math.round(safeCount * 0.0167)))
  return { micro: Math.max(0, safeCount - bright), bright }
}

export const CIRCULAR_PARTICLE_VERTEX_SHADER = /* glsl */ `
  attribute float aSeed;
  attribute float aSize;
  attribute float aKind;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying float vKind;
  varying float vSeed;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float dist = max(-mv.z, 1.0);
    float twinkle = 0.82 + 0.18 * sin(uTime * (0.24 + aSeed * 0.44) + aSeed * 41.0);
    float sizePx = aSize * uPixelRatio * (170.0 / dist) * twinkle;
    gl_PointSize = clamp(sizePx, mix(1.45, 2.05, aKind), mix(4.2, 9.2, aKind) * uPixelRatio);
    gl_Position = projectionMatrix * mv;
    vAlpha = smoothstep(720.0, 22.0, dist) * (0.84 + 0.16 * twinkle);
    vKind = aKind;
    vSeed = aSeed;
  }
`

export const CIRCULAR_PARTICLE_FRAGMENT_SHADER = /* glsl */ `
  varying float vAlpha;
  varying float vKind;
  varying float vSeed;
  uniform float uOpacity;
  uniform float uPalette;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    float disc = smoothstep(0.5, 0.14, d);
    float core = smoothstep(0.28, 0.0, d);
    float crossGlow = exp(-abs(uv.x) * 26.0) + exp(-abs(uv.y) * 26.0);
    float crossMask = smoothstep(0.5, 0.0, d) * 0.34;
    float shape = mix(disc, max(disc, crossGlow * crossMask), step(0.5, vKind));

    vec3 cool = mix(vec3(0.72, 0.84, 1.0), vec3(0.33, 0.49, 1.0), uPalette);
    vec3 warm = mix(vec3(1.0, 0.82, 0.59), vec3(1.0, 0.36, 0.2), uPalette);
    vec3 color = mix(cool, warm, smoothstep(0.72, 1.0, vSeed));
    color += core * 0.22;
    gl_FragColor = vec4(color, shape * vAlpha * mix(0.72, 0.96, vKind) * uOpacity);
  }
`

export function makeParticleGeometry(count, { kind = 0, radius = 1, depth = 1 } = {}) {
  const safeCount = Math.max(0, Math.floor(count))
  const positions = new Float32Array(safeCount * 3)
  const seeds = new Float32Array(safeCount)
  const sizes = new Float32Array(safeCount)
  const kinds = new Float32Array(safeCount)

  for (let index = 0; index < safeCount; index += 1) {
    const shell = Math.random()
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const distance = radius * (0.72 + Math.pow(shell, 0.56) * 1.2)
    positions[index * 3] = Math.sin(phi) * Math.cos(theta) * distance
    positions[index * 3 + 1] = Math.sin(phi) * Math.sin(theta) * distance * depth
    positions[index * 3 + 2] = Math.cos(phi) * distance - radius * 0.32
    seeds[index] = Math.random()
    sizes[index] = kind > 0.5 ? 1.7 + Math.random() * 1.5 : 0.62 + Math.random() * 0.9
    kinds[index] = kind
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geometry.setAttribute('aKind', new THREE.BufferAttribute(kinds, 1))
  return geometry
}

export function makeCircularParticleMaterial({ palette = 0, opacity = 1 } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uOpacity: { value: opacity },
      uPalette: { value: palette },
    },
    vertexShader: CIRCULAR_PARTICLE_VERTEX_SHADER,
    fragmentShader: CIRCULAR_PARTICLE_FRAGMENT_SHADER,
  })
}
