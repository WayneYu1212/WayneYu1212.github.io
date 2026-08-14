# 电影宇宙视觉升级 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将现有个人银河升级为不再出现方块星点、星球更有材质层次、信息更易懂的电影感 React Bits 混合视觉。

**Architecture:** 使用 `particleVisuals.js` 集中管理圆形粒子 shader 与预算函数，DeepSpace 和 PersonalGalaxy 共享它；CelestialBody 继续使用 NASA 纹理并叠加按质量档位启用的 Fresnel 大气；HUD/CSS 只做信息层的清晰度和层级，不改变导航状态机。

**Tech Stack:** React 19、React Three Fiber 9、Three.js 0.180、Drei、Vitest、Vite。

## Global Constraints

- 不新增 React Bits 运行时依赖，只复刻局部视觉思路。
- 不改变滚动停靠、项目顺序、URL、Reader、目录或无 WebGL fallback。
- `activeBudget` 是 Scene 唯一预算输入；移动端和 reduced-motion 保持低成本路径。
- 每个新增纯函数或行为先写失败测试，再实现并验证。

### Task 1: 建立粒子视觉契约

**Files:**
- Create: `src/three/particleVisuals.js`
- Create: `src/three/particleVisuals.test.js`

**Interfaces:**
- Produces `starBudgetForCount(count)`，返回 `{ micro, bright }`。
- Produces `CIRCULAR_PARTICLE_VERTEX_SHADER` 与 `CIRCULAR_PARTICLE_FRAGMENT_SHADER`，供 Three.js ShaderMaterial 使用。

- [ ] **Step 1: Write the failing test**

```js
it('keeps a small bright-star layer while scaling the micro layer', () => {
  expect(starBudgetForCount(7200)).toEqual({ micro: 7080, bright: 120 })
  expect(starBudgetForCount(20)).toEqual({ micro: 17, bright: 3 })
})

it('uses a circular discard and optional cross-star glow', () => {
  expect(CIRCULAR_PARTICLE_FRAGMENT_SHADER).toMatch(/gl_PointCoord/)
  expect(CIRCULAR_PARTICLE_FRAGMENT_SHADER).toMatch(/discard/)
  expect(CIRCULAR_PARTICLE_FRAGMENT_SHADER).toMatch(/cross/)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- src/three/particleVisuals.test.js --reporter=verbose`
Expected: FAIL because the module and exports do not exist.

- [ ] **Step 3: Write minimal implementation**

Implement a bright cap of 120 and a minimum three bright stars. The fragment shader calculates `d = length(gl_PointCoord - 0.5)`, discards `d > 0.5`, and only evaluates the cross branch when `aKind > 0.5`.

- [ ] **Step 4: Run test to verify it passes**

Run the same command. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/three/particleVisuals.js src/three/particleVisuals.test.js
git commit -m "feat: define circular particle visuals"
```

### Task 2: Replace square deep-space and galaxy points

**Files:**
- Modify: `src/three/DeepSpace.jsx`
- Modify: `src/three/PersonalGalaxy.jsx`
- Modify: `src/three/Scene.jsx`
- Modify: `src/lib/perf.js`
- Modify: `src/lib/perf.test.js`

**Interfaces:**
- `DeepSpace` consumes `count`, `showMarker`, and `opacity`; it owns micro/bright point geometries and uses the shared shader.
- `PersonalGalaxy` consumes existing `count`, `opacity`, and `progress`; its point material becomes circular and keeps the existing transform.

- [ ] **Step 1: Write the failing test**

Add a budget assertion that high quality exposes `brightStars: 120`, medium `brightStars: 72`, and low `brightStars: 36`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- src/lib/perf.test.js --reporter=verbose`
Expected: FAIL because the budget has no `brightStars` field.

- [ ] **Step 3: Write minimal implementation**

Add the budget field and pass it to DeepSpace through `activeBudget`. Build each point geometry with `aSeed`, `aSize`, and `aKind`, use `THREE.AdditiveBlending` only for bright stars, and preserve `frustumCulled={false}`. PersonalGalaxy uses the same fragment shader with `aKind = 0`.

- [ ] **Step 4: Run focused and full tests**

Run: `npm.cmd test -- src/lib/perf.test.js src/three/particleVisuals.test.js --reporter=verbose`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/three/DeepSpace.jsx src/three/PersonalGalaxy.jsx src/three/Scene.jsx src/lib/perf.js src/lib/perf.test.js
git commit -m "feat: render circular cinematic star fields"
```

### Task 3: Add planet atmosphere and a restrained stellar core

**Files:**
- Create: `src/three/PlanetAtmosphere.jsx`
- Create: `src/three/PlanetAtmosphere.test.jsx`
- Modify: `src/three/CelestialBody.jsx`
- Modify: `src/three/StellarSystem.jsx`
- Modify: `src/three/ProjectFeatures.jsx`
- Modify: `src/lib/perf.js`
- Modify: `src/lib/perf.test.js`

**Interfaces:**
- `PlanetAtmosphere({ radius, color, opacity, enabled })` returns `null` when disabled and a transparent Fresnel shell otherwise.
- `CelestialBody` derives `enabled` from `activeBudget.atmosphere` and project accent/palette.

- [ ] **Step 1: Write the failing test**

```jsx
it('does not render the shell when the quality budget disables atmosphere', () => {
  const { container } = render(<PlanetAtmosphere radius={2} color="#aabbcc" opacity={1} enabled={false} />)
  expect(container.firstChild).toBeNull()
})
```

Add a budget assertion that low quality has `atmosphere: false` and high quality has `atmosphere: true`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- src/three/PlanetAtmosphere.test.jsx src/lib/perf.test.js --reporter=verbose`
Expected: FAIL because the component and budget field do not exist.

- [ ] **Step 3: Write minimal implementation**

Implement a `ShaderMaterial` using view-space normal Fresnel (`pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.6)`) and transparent additive blending. Add the shell beside the textured sphere. Replace the plain star sphere with a core sphere and two low-opacity shells using the same project palette, without changing system coordinates.

- [ ] **Step 4: Run focused and full tests**

Run: `npm.cmd test -- src/three/PlanetAtmosphere.test.jsx src/lib/perf.test.js src/data/projects.test.js --reporter=verbose`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/three/PlanetAtmosphere.jsx src/three/PlanetAtmosphere.test.jsx src/three/CelestialBody.jsx src/three/StellarSystem.jsx src/three/ProjectFeatures.jsx src/lib/perf.js src/lib/perf.test.js
git commit -m "feat: add atmospheric planet rendering"
```

### Task 4: Clarify stop copy and visual hierarchy

**Files:**
- Modify: `src/ui/Hud.jsx`
- Modify: `src/ui/ObserverIntro.jsx`
- Modify: `src/ui/ProjectDirectory.jsx`
- Modify: `src/index.css`
- Modify: `src/ui/ui.test.jsx`

**Interfaces:**
- Keep existing stage and store interfaces; only copy, semantic labels, contrast, and panel decoration change.

- [ ] **Step 1: Write the failing test**

Assert that the rendered system copy includes “点按行星查看项目” and the observer copy includes “继续向下滚动查看项目”，while not including “异常星系” or “持续生长”.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm.cmd test -- src/ui/ui.test.jsx --reporter=verbose`
Expected: FAIL because the current copy uses the older abstract wording.

- [ ] **Step 3: Write minimal implementation**

Use short Chinese copy, add a small route marker and subtle CSS radial glow to `.system-caption`, `.planet-panel`, and `.observer-intro`. Keep the primary action as the only visually dominant button.

- [ ] **Step 4: Run focused test**

Run: `npm.cmd test -- src/ui/ui.test.jsx --reporter=verbose`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/Hud.jsx src/ui/ObserverIntro.jsx src/ui/ProjectDirectory.jsx src/index.css src/ui/ui.test.jsx
git commit -m "copy: clarify cosmic project stops"
```

### Task 5: Browser and engineering verification

**Files:**
- Modify only if verification reveals a regression.
- Create: `tmp/visual-qa-cinematic/` screenshots (ignored by git).

- [ ] **Step 1: Run lint, build, and full tests**

```bash
npm.cmd run lint
npm.cmd run build
npm.cmd test -- --reporter=verbose
```

- [ ] **Step 2: Run local browser QA**

At 1280×720 verify deep space, galaxy, system, Apple focus, and Reader. At 390×844 verify no horizontal overflow and clear panel text. Confirm no console errors.

- [ ] **Step 3: Inspect screenshots**

Confirm every star is circular or intentionally cross-shaped, no full-screen white bloom, planets have visible rim light, and text remains readable over negative space.

- [ ] **Step 4: Commit any final correction and record evidence**

Only after fresh verification, record the final commit and status.
