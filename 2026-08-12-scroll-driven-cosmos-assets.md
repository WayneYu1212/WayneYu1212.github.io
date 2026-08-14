# Scroll-Driven Cosmos Assets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace click-led travel and procedural project bodies with a reversible scroll-driven cosmos, NASA-sourced celestial textures, an Explorer 1 observer introduction, a desktop orbit-star cursor, and a coherent Apple reader presentation.

**Architecture:** Keep the existing six-stage Zustand state machine for routes and reading state, while adding a serializable journey progress model for camera and scene interpolation. Separate project data from the non-project observer stop, load celestial assets through focused R3F components with explicit fallbacks, and keep all essential navigation available through semantic 2D controls.

**Tech Stack:** React 19, Vite 8, Zustand 5, React Three Fiber 9, Drei 10, Three.js 0.180, Vitest 3, Testing Library, Python/Pillow for deterministic source-art compositing.

## Global Constraints

- Preserve `SCENE_STAGE` as the only source of stage strings.
- Journey order is exactly `observer → apple → yongshu → nearby` after the stellar-system reveal.
- Explorer 1 is an introduction stop, not a project and not a Reader entry.
- Observer copy is one title plus two or three short sentences and must not reveal later project names, count, or full route.
- Continuing to scroll introduces the next stop but never opens Reader automatically.
- Project Directory remains available in every stage and can open any project directly.
- Use only NASA official, CC0, or CC-BY external visual assets; record every source in `THIRD_PARTY_ASSETS.md`.
- Do not redraw or generate NPC faces; the Apple ensemble must preserve the supplied transparent portraits.
- Disable custom cursor, near dust, and expensive transparency on touch/mobile; preserve the complete journey hierarchy.
- `prefers-reduced-motion` replaces long travel with short fades/snaps.
- Production JavaScript gzip must remain at or below 350 KB and no large visual dependency may be added.
- Do not publish or deploy.

---

## File Structure

**Create**

- `src/lib/journey.js` — progress ranges, stop order, stage mapping, snapping, and keyboard/wheel delta helpers.
- `src/lib/journey.test.js` — pure journey-model tests.
- `src/ui/ScrollJourney.jsx` — wheel, touch, and keyboard input adapter with inertia and idle snapping.
- `src/ui/ScrollJourney.test.jsx` — input and Reader-blocking tests.
- `src/ui/ObserverIntro.jsx` — short Explorer 1 introduction overlay.
- `src/ui/OrbitStarCursor.jsx` — fine-pointer-only custom cursor.
- `src/ui/OrbitStarCursor.test.jsx` — cursor gating and state tests.
- `src/three/CelestialBody.jsx` — textured sphere with fallback material.
- `src/three/ObserverProbe.jsx` — Explorer 1 GLB with a geometry fallback.
- `src/three/ProjectFeatures.jsx` — Apple year rings, Yongshu paper fragments, and Nearby 500 m shell.
- `scripts/prepare-space-assets.py` — deterministic image resizing and Apple cast compositing.
- `public/media/celestial/apple-iapetus.webp` — NASA Iapetus-derived Apple texture.
- `public/media/celestial/yongshu-callisto.webp` — NASA Callisto-derived Yongshu texture.
- `public/media/celestial/nearby-europa.webp` — NASA Europa-derived Nearby texture.
- `public/media/models/explorer-1.glb` — NASA Explorer 1 model.
- `public/media/apple-young-newton.webp` — optimized existing young Newton hero.
- `public/media/apple-cast-ensemble.webp` — deterministic ensemble made from existing transparent portraits.
- `THIRD_PARTY_ASSETS.md` — source, credit, license, and transformation log.

**Modify**

- `src/state/store.js` — journey progress, active stop, snapshots, and observer-safe transitions.
- `src/state/store.test.js` — progress and return restoration tests.
- `src/data/projects.js` — remove observer from `projects`, add `observerStop`, and add asset metadata.
- `src/data/projects.test.js` — project/observer data contracts.
- `src/App.jsx` — mount `ScrollJourney`, `ObserverIntro`, and `OrbitStarCursor`; remove system-only touch handler.
- `src/three/cameraTargets.js` — continuous journey camera interpolation.
- `src/three/cameraTargets.test.js` — keyframe and reduced-motion tests.
- `src/three/CameraRig.jsx` — consume journey camera output.
- `src/three/Scene.jsx` — blend deep space, galaxy, and system using journey weights.
- `src/three/StellarSystem.jsx` — render observer separately, use textured bodies, and respect active stop.
- `src/three/ApplePlanet.jsx` — remove deformed apple mesh and retrograde satellite.
- `src/lib/perf.js` and `src/lib/perf.test.js` — budgets for textures, transparent features, and cursor effects.
- `src/ui/Intro.jsx` — replace click-led entry with scroll invitation while retaining skip controls.
- `src/ui/Hud.jsx` — remove step buttons and render current-stop information.
- `src/ui/ProjectDirectory.jsx` — retain direct Reader access for the three projects without listing Observer as a project.
- `src/ui/Reader.jsx` — Apple-specific hero/timeline/ensemble layout and hidden 3D label contract.
- `src/ui/ui.test.jsx` — observer order, directory, Reader, and no-auto-open tests.
- `src/index.css` — journey overlays, observer intro, cursor, responsive/reduced-motion, and Apple ensemble styling.
- `.gitignore` — ignore `.superpowers/` and `tmp/` visual-audit artifacts.

---

### Task 1: Define the continuous journey model

**Files:**
- Create: `src/lib/journey.js`
- Create: `src/lib/journey.test.js`
- Modify: `src/state/store.js`
- Modify: `src/state/store.test.js`

**Interfaces:**
- Produces: `JOURNEY_RANGES`, `JOURNEY_STOPS`, `frameForProgress(progress)`, `progressForStop(id)`, `applyJourneyDelta(progress, delta, scale)`, `snapProgress(progress)`.
- Produces in store: `journeyProgress: number`, `activeStop: null | 'observer' | 'apple' | 'yongshu' | 'nearby'`, `setJourneyProgress(number)`, `nudgeJourney(delta, scale)`, `jumpToStop(id)`, `saveReturnView(view)`.

- [ ] **Step 1: Write the failing pure-model tests**

```js
expect(frameForProgress(0)).toMatchObject({ stage: SCENE_STAGE.INTRO, stopId: null })
expect(frameForProgress(0.55)).toMatchObject({ stage: SCENE_STAGE.SYSTEM, stopId: 'observer' })
expect(frameForProgress(0.66).stopId).toBe('apple')
expect(frameForProgress(0.80).stopId).toBe('yongshu')
expect(frameForProgress(0.94).stopId).toBe('nearby')
expect(applyJourneyDelta(0.5, -100, 0.001)).toBeCloseTo(0.4)
expect(progressForStop('observer')).toBe(0.55)
```

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `npm.cmd test -- src/lib/journey.test.js src/state/store.test.js --reporter=verbose`

Expected: FAIL because the journey module and progress actions do not exist.

- [ ] **Step 3: Implement exact ranges and helpers**

```js
export const JOURNEY_RANGES = Object.freeze({
  intro: [0, 0.12],
  galaxy: [0.12, 0.36],
  systemReveal: [0.36, 0.50],
  observer: [0.50, 0.60],
  apple: [0.60, 0.74],
  yongshu: [0.74, 0.87],
  nearby: [0.87, 1],
})

export const JOURNEY_STOPS = Object.freeze([
  { id: 'observer', progress: 0.55 },
  { id: 'apple', progress: 0.67 },
  { id: 'yongshu', progress: 0.805 },
  { id: 'nearby', progress: 0.935 },
])
```

`frameForProgress` returns `INTRO` only at zero, `DEEP_SPACE` below `0.12`, `GALAXY_TRANSIT` below `0.36`, and `SYSTEM` thereafter; it selects a stop only inside that stop's range. Clamp every public progress setter to `[0, 1]`.

- [ ] **Step 4: Extend snapshots and restoration**

Store `journeyProgress` in `cameraView.travel`, set `activeStop` from `frameForProgress`, and restore both fields in `closeProject`, `backToSystem`, and `restoreRoute`. `openProject('observer')` must remain a no-op because `observer` is not in `projects`.

- [ ] **Step 5: Run tests and commit**

Run: `npm.cmd test -- src/lib/journey.test.js src/state/store.test.js --reporter=verbose`

Expected: PASS.

```powershell
git add src/lib/journey.js src/lib/journey.test.js src/state/store.js src/state/store.test.js
git commit -m "feat: model the scroll-driven cosmos journey"
```

---

### Task 2: Add wheel, touch, and keyboard journey input

**Files:**
- Create: `src/ui/ScrollJourney.jsx`
- Create: `src/ui/ScrollJourney.test.jsx`
- Modify: `src/App.jsx`
- Modify: `src/ui/Intro.jsx`
- Modify: `src/ui/ui.test.jsx`

**Interfaces:**
- Consumes: `journeyProgress`, `nudgeJourney`, `setJourneyProgress`, `open`, `directoryOpen`, `mapOpen`.
- Produces: a renderless `<ScrollJourney />` adapter and `data-journey-progress` on `.app` for diagnostics.

- [ ] **Step 1: Write failing input tests**

```jsx
render(<ScrollJourney />)
fireEvent.wheel(window, { deltaY: 240 })
expect(useCosmos.getState().journeyProgress).toBeGreaterThan(0)

set({ stage: SCENE_STAGE.READING, open: 'apple', journeyProgress: 0.67 })
fireEvent.wheel(window, { deltaY: 240 })
expect(useCosmos.getState().journeyProgress).toBe(0.67)

fireEvent.keyDown(window, { key: 'PageDown' })
expect(useCosmos.getState().activeStop).toBe('yongshu')
```

- [ ] **Step 2: Verify the tests fail**

Run: `npm.cmd test -- src/ui/ScrollJourney.test.jsx src/ui/ui.test.jsx --reporter=verbose`

Expected: FAIL because `ScrollJourney` does not exist and Intro is still click-led.

- [ ] **Step 3: Implement the input adapter**

Use `wheel` with `{ passive: false }` only while Reader and overlays are closed. Add wheel deltas to a target ref at `0.00042` per pixel, damp current progress toward the target with `1 - Math.exp(-deltaMs / 110)`, and after 180 ms idle call `snapProgress` when within `0.022` of a stop. Touch uses vertical deltas at `0.0012` per pixel. ArrowDown/PageDown/Space advance; ArrowUp/PageUp/Shift+Space reverse; Enter opens only project stops.

```jsx
export default function ScrollJourney() {
  useJourneyWheel()
  useJourneyTouch()
  useJourneyKeyboard()
  return null
}
```

- [ ] **Step 4: Replace the Intro call-to-action**

The primary visible instruction becomes `向下滚动，开始航行`. Keep a secondary semantic button `跳过至项目` that jumps to the observer stop for keyboard/reduced-motion users. Enter and Space advance progress rather than starting a timer.

- [ ] **Step 5: Mount once in App and remove the old system-only touch effect**

Mount `<ScrollJourney />` immediately inside `.app`. Do not mount it in the WebGL fallback because the 2D directory is already the complete navigation.

- [ ] **Step 6: Run tests and commit**

Run: `npm.cmd test -- src/ui/ScrollJourney.test.jsx src/ui/ui.test.jsx --reporter=verbose`

Expected: PASS.

```powershell
git add src/ui/ScrollJourney.jsx src/ui/ScrollJourney.test.jsx src/App.jsx src/ui/Intro.jsx src/ui/ui.test.jsx
git commit -m "feat: drive the cosmos journey with scrolling"
```

---

### Task 3: Drive camera and scene layers from journey progress

**Files:**
- Modify: `src/three/cameraTargets.js`
- Modify: `src/three/cameraTargets.test.js`
- Modify: `src/three/CameraRig.jsx`
- Modify: `src/three/Scene.jsx`
- Modify: `src/three/PersonalGalaxy.jsx`

**Interfaces:**
- Consumes: `journeyProgress`, `activeStop`, project or observer positions.
- Produces: `cameraTargetForJourney({ progress, stop, bodyPosition, reducedMotion })` and `sceneWeightsForProgress(progress)`.

- [ ] **Step 1: Write failing keyframe tests**

```js
expect(cameraTargetForJourney({ progress: 0 }).position).toEqual([24, 14, 108])
expect(sceneWeightsForProgress(0.24).galaxy).toBeGreaterThan(0.8)
expect(sceneWeightsForProgress(0.44).system).toBeGreaterThan(0)
expect(cameraTargetForJourney({ progress: 0.55, stop: 'observer', bodyPosition: [0, 0, 0] }).target).toEqual([0, 0, 0])
```

- [ ] **Step 2: Verify failure**

Run: `npm.cmd test -- src/three/cameraTargets.test.js --reporter=verbose`

Expected: FAIL because the continuous camera API is absent.

- [ ] **Step 3: Implement Catmull-Rom camera keyframes**

Use fixed keyframes at progress `0`, `0.12`, `0.36`, `0.50`, and the four stop centers. Interpolate position and target separately with `THREE.CatmullRomCurve3`; use smoothstep for scene opacity. Reduced-motion returns the nearest keyframe without traversal roll.

- [ ] **Step 4: Update CameraRig and Scene**

CameraRig reads only `cameraTargetForJourney` outside Reader. Remove elapsed-stage timers and the system sine travel offset. Scene renders deep space, galaxy, and system concurrently when their weights are non-zero and passes opacity/count multipliers rather than mounting layers solely from stage strings.

- [ ] **Step 5: Run camera and UI regression tests and commit**

Run: `npm.cmd test -- src/three/cameraTargets.test.js src/ui/ui.test.jsx --reporter=verbose`

Expected: PASS.

```powershell
git add src/three/cameraTargets.js src/three/cameraTargets.test.js src/three/CameraRig.jsx src/three/Scene.jsx src/three/PersonalGalaxy.jsx
git commit -m "feat: interpolate the camera through the cosmos"
```

---

### Task 4: Make Explorer 1 the first introduction stop

**Files:**
- Create: `src/ui/ObserverIntro.jsx`
- Create: `src/three/ObserverProbe.jsx`
- Modify: `src/data/projects.js`
- Modify: `src/data/projects.test.js`
- Modify: `src/three/StellarSystem.jsx`
- Modify: `src/ui/Hud.jsx`
- Modify: `src/ui/ProjectDirectory.jsx`
- Modify: `src/ui/ui.test.jsx`
- Add: `public/media/models/explorer-1.glb`

**Interfaces:**
- Produces: `observerStop` with `id`, `title`, `copy`, `world`, `assetSource`, `license`, and `fallbackStyle`.
- Consumes: `activeStop === 'observer'` and `/media/models/explorer-1.glb`.

- [ ] **Step 1: Write failing data and UI tests**

```js
expect(projects.map((project) => project.id)).toEqual(['yongshu', 'apple', 'nearby'])
expect(observerStop.id).toBe('observer')
expect(observerStop.copy).toHaveLength(3)
expect(observerStop.copy.join(' ')).not.toMatch(/苹果|佣书|附近未见|三个/)
```

```jsx
set({ stage: SCENE_STAGE.SYSTEM, activeStop: 'observer', journeyProgress: 0.55 })
render(<ObserverIntro />)
expect(screen.getByRole('heading', { name: '欢迎进入我的个人宇宙' })).toBeTruthy()
expect(screen.queryByRole('button', { name: /进入项目/ })).toBeNull()
```

- [ ] **Step 2: Verify failure**

Run: `npm.cmd test -- src/data/projects.test.js src/ui/ui.test.jsx --reporter=verbose`

Expected: FAIL because observer remains a project and the intro component is absent.

- [ ] **Step 3: Split observer data from projects**

Use this approved copy exactly:

```js
export const observerStop = {
  id: 'observer',
  title: '欢迎进入我的个人宇宙',
  copy: [
    '我是 Wayne，一名叙事设计与独立开发者。',
    '继续向下滚动，你会沿着航线依次靠近我正在制作的项目。',
    '每次停靠都可以进入阅读，也可以继续前往下一站。',
  ],
}
```

Remove observer from `projects`, `constellations`, Reader next links, and Project Directory.

- [ ] **Step 4: Acquire the official GLB**

Run with network approval:

```powershell
New-Item -ItemType Directory -Force public\media\models
Invoke-WebRequest 'https://assets.science.nasa.gov/content/dam/science/missions/explorer-1/3d/Explorer_1.glb' -OutFile 'public\media\models\explorer-1.glb'
```

Verify the file is approximately 826 KB and begins with the binary glTF magic `glTF`.

- [ ] **Step 5: Render Explorer 1 with fallback**

`ObserverProbe` uses `useGLTF`, normalizes the model to a 4.8-unit longest axis, clones the scene, and applies restrained metal/roughness adjustments. Its error boundary fallback is a thin cylinder body with four antenna lines; it must never render a sphere.

- [ ] **Step 6: Run tests and commit**

Run: `npm.cmd test -- src/data/projects.test.js src/ui/ui.test.jsx --reporter=verbose`

Expected: PASS.

```powershell
git add src/data/projects.js src/data/projects.test.js src/ui/ObserverIntro.jsx src/three/ObserverProbe.jsx src/three/StellarSystem.jsx src/ui/Hud.jsx src/ui/ProjectDirectory.jsx src/ui/ui.test.jsx public/media/models/explorer-1.glb
git commit -m "feat: introduce projects with Explorer 1"
```

---

### Task 5: Replace procedural planets with NASA textures and project features

**Files:**
- Create: `src/three/CelestialBody.jsx`
- Create: `src/three/ProjectFeatures.jsx`
- Modify: `src/three/StellarSystem.jsx`
- Modify: `src/three/ApplePlanet.jsx`
- Modify: `src/data/projects.js`
- Modify: `src/data/projects.test.js`
- Create: `scripts/prepare-space-assets.py`
- Create: `THIRD_PARTY_ASSETS.md`
- Add: `public/media/celestial/*.webp`

**Interfaces:**
- Produces: `CelestialBody({ project, focused, activeBudget })` and `ProjectFeatures({ project, focused, activeBudget })`.
- Project `world` gains `assetType`, `textureSet`, `assetSource`, `license`, and `fallbackStyle`.

- [ ] **Step 1: Write failing world-data tests**

```js
for (const project of projects) {
  expect(project.world.assetType).toBe('texture')
  expect(project.world.textureSet).toMatch(/^media\/celestial\/.+\.webp$/)
  expect(project.world.assetSource).toMatch(/^https:\/\//)
  expect(project.world.license).toBe('NASA media guidelines')
}
expect(byId('apple').world.features).not.toContain('polar-basin')
expect(byId('apple').world.features).not.toContain('retrograde-moon')
```

- [ ] **Step 2: Verify failure**

Run: `npm.cmd test -- src/data/projects.test.js --reporter=verbose`

Expected: FAIL because asset metadata and the new Apple feature list are absent.

- [ ] **Step 3: Download exact NASA source textures to a temporary directory**

```powershell
New-Item -ItemType Directory -Force tmp\space-assets
Invoke-WebRequest 'https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/Images%20and%20Textures/Saturn%20-%20Iapetus/Saturn%20-%20Iapetus.jpg' -OutFile 'tmp\space-assets\iapetus.jpg'
Invoke-WebRequest 'https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/Images%20and%20Textures/Jupiter%20-%20Callisto/Jupiter%20-%20Callisto.jpg' -OutFile 'tmp\space-assets\callisto.jpg'
Invoke-WebRequest 'https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/Images%20and%20Textures/Jupiter%20-%20Europa/Jupiter%20-%20Europa.jpg' -OutFile 'tmp\space-assets\europa.jpg'
```

- [ ] **Step 4: Implement deterministic preparation**

`prepare-space-assets.py` opens each source with Pillow, converts to RGB, resizes/crops to `2048×1024`, applies only project-specific color grading, and writes WebP quality 82:

```python
ASSETS = {
    "iapetus.jpg": ("apple-iapetus.webp", (0.90, 0.96, 1.04)),
    "callisto.jpg": ("yongshu-callisto.webp", (1.03, 0.92, 0.78)),
    "europa.jpg": ("nearby-europa.webp", (0.96, 0.91, 1.08)),
}
```

Run: `python -X utf8 scripts/prepare-space-assets.py --space-assets`

Expected: three 2048×1024 WebP files under `public/media/celestial/`.

- [ ] **Step 5: Implement rendering and semantic features**

- Apple: ordinary sphere, Iapetus texture, two thin rings labeled 1666 and 1696; no deformation and no satellite.
- Yongshu: Callisto texture plus at most `activeBudget.paperFragments` paper/map quads; no continuous Saturn ring.
- Nearby: Europa texture plus one low-opacity 500 m shell and at most `activeBudget.observationMarks` concrete observation marks.
- Set `texture.colorSpace = THREE.SRGBColorSpace`, anisotropy to the renderer-supported minimum of 4, and dispose textures on unmount.

- [ ] **Step 6: Record exact credits**

`THIRD_PARTY_ASSETS.md` must list the three NASA GitHub file URLs, Explorer 1 page/download URL, credits, NASA usage-guideline URL, local output names, and the stated resize/color-grade transformations.

- [ ] **Step 7: Run tests and commit**

Run: `npm.cmd test -- src/data/projects.test.js --reporter=verbose`

Expected: PASS.

```powershell
git add src/three/CelestialBody.jsx src/three/ProjectFeatures.jsx src/three/StellarSystem.jsx src/three/ApplePlanet.jsx src/data/projects.js src/data/projects.test.js scripts/prepare-space-assets.py public/media/celestial THIRD_PARTY_ASSETS.md
git commit -m "feat: texture project worlds with NASA assets"
```

---

### Task 6: Add the C-style orbit-star cursor

**Files:**
- Create: `src/ui/OrbitStarCursor.jsx`
- Create: `src/ui/OrbitStarCursor.test.jsx`
- Modify: `src/App.jsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: stage, media queries `(hover: hover) and (pointer: fine)` and `(prefers-reduced-motion: reduce)`.
- Produces: `.orbit-cursor`, `.orbit-cursor__core`, `.orbit-cursor__ring`, `.is-interactive`, and `.is-pressed`.

- [ ] **Step 1: Write failing cursor tests**

```jsx
set({ stage: SCENE_STAGE.SYSTEM })
render(<OrbitStarCursor />)
expect(screen.getByTestId('orbit-star-cursor')).toBeTruthy()
fireEvent.pointerDown(window)
expect(screen.getByTestId('orbit-star-cursor').className).toContain('is-pressed')

set({ stage: SCENE_STAGE.READING, open: 'apple' })
expect(render(<OrbitStarCursor />).container.firstChild).toBeNull()
```

- [ ] **Step 2: Verify failure**

Run: `npm.cmd test -- src/ui/OrbitStarCursor.test.jsx --reporter=verbose`

Expected: FAIL because the cursor component is absent.

- [ ] **Step 3: Implement behavior and CSS**

Use one DOM element updated by `requestAnimationFrame`; do not create particles. The core is 5 px, the ring is 18 px, ring rotation is 4.8 seconds, interactive scale is 1.45, pressed scale is 0.72, and movement uses a 0.22 lerp factor. Detect interactive targets with `event.target.closest('button,a,[role="button"]')`.

Only apply `cursor: none` to `.app.has-orbit-cursor` while not reading. In reduced motion, stop ring rotation; on touch/coarse pointers render nothing and retain the system cursor.

- [ ] **Step 4: Run tests and commit**

Run: `npm.cmd test -- src/ui/OrbitStarCursor.test.jsx src/ui/ui.test.jsx --reporter=verbose`

Expected: PASS.

```powershell
git add src/ui/OrbitStarCursor.jsx src/ui/OrbitStarCursor.test.jsx src/App.jsx src/index.css
git commit -m "feat: add the orbit-star cursor"
```

---

### Task 7: Rebuild the Apple reader imagery without changing faces

**Files:**
- Modify: `scripts/prepare-space-assets.py`
- Add: `public/media/apple-young-newton.webp`
- Add: `public/media/apple-cast-ensemble.webp`
- Modify: `src/data/projects.js`
- Modify: `src/ui/Reader.jsx`
- Modify: `src/ui/ui.test.jsx`
- Modify: `src/index.css`

**Interfaces:**
- Apple data produces `featureMedia.hero`, `featureMedia.timelinePortrait`, and `featureMedia.ensemble`.
- Reader renders sections in the order hero → overview/body → 1696 timeline portrait → ensemble → credits/links.

- [ ] **Step 1: Write failing Reader tests**

```jsx
set({ stage: SCENE_STAGE.READING, focused: 'apple', open: 'apple' })
const { container } = render(<Reader />)
const images = [...container.querySelectorAll('img')].map((img) => img.getAttribute('src'))
expect(images[0]).toContain('apple-young-newton.webp')
expect(images).toContain(expect.stringContaining('apple-cast-ensemble.webp'))
expect(container.querySelectorAll('.reader__gallery > figure')).toHaveLength(0)
```

- [ ] **Step 2: Verify failure**

Run: `npm.cmd test -- src/ui/ui.test.jsx --reporter=verbose`

Expected: FAIL because the current gallery begins with old Newton and isolated portraits.

- [ ] **Step 3: Extend the deterministic composition script**

Use `../苹果落下之前/牛顿立绘.png` for the hero and every `*-no-bg.png` file in `../苹果落下之前/NPC立绘/` for the ensemble. Create a `3200×1500` dark brown/blue oil-toned canvas. Place portraits in three depth rows with heights `880`, `1040`, and `1220` px; distribute each row evenly; compute alpha bounding boxes so heads remain inside the top 68% of the canvas; add only background vignette, contact shadow, and edge-light overlays. Do not blur, repaint, or geometrically warp faces.

Run: `python -X utf8 scripts/prepare-space-assets.py --apple-media`

Expected: optimized hero and ensemble WebP files, with all source filenames logged to stdout.

- [ ] **Step 4: Replace the Apple gallery contract**

```js
featureMedia: {
  hero: { src: 'media/apple-young-newton.webp', alt: '青年牛顿站在伍尔索普的书桌前' },
  timelinePortrait: { src: 'media/apple-newton.webp', alt: '1696 年的牛顿' },
  ensemble: { src: 'media/apple-cast-ensemble.webp', alt: '苹果落下之前主要人物群像' },
}
```

Reader must not render the previous Apple `gallery` array. Mobile ensemble uses horizontal overflow with a minimum image width of 920 px and a visible `横向查看人物群像` hint.

- [ ] **Step 5: Run tests and commit**

Run: `npm.cmd test -- src/ui/ui.test.jsx src/data/projects.test.js --reporter=verbose`

Expected: PASS.

```powershell
git add scripts/prepare-space-assets.py public/media/apple-young-newton.webp public/media/apple-cast-ensemble.webp src/data/projects.js src/ui/Reader.jsx src/ui/ui.test.jsx src/index.css
git commit -m "feat: rebuild the Apple reader presentation"
```

---

### Task 8: Make quality budgets and fallbacks control the new assets

**Files:**
- Modify: `src/lib/perf.js`
- Modify: `src/lib/perf.test.js`
- Modify: `src/three/Scene.jsx`
- Modify: `src/three/CelestialBody.jsx`
- Modify: `src/three/ProjectFeatures.jsx`
- Modify: `src/ui/Fallback.jsx`
- Modify: `.gitignore`

**Interfaces:**
- `resolveBudget` additionally returns `textureMax`, `paperFragments`, `observationMarks`, `transparentFeatures`, and `cursorEffects`.

- [ ] **Step 1: Write failing budget tests**

```js
expect(resolveBudget('high', 'high')).toMatchObject({
  textureMax: 2048,
  paperFragments: 18,
  observationMarks: 10,
  transparentFeatures: true,
  cursorEffects: true,
})
expect(resolveBudget('low', 'low')).toMatchObject({
  textureMax: 1024,
  paperFragments: 6,
  observationMarks: 0,
  transparentFeatures: false,
  cursorEffects: false,
})
```

- [ ] **Step 2: Verify failure**

Run: `npm.cmd test -- src/lib/perf.test.js --reporter=verbose`

Expected: FAIL because the new budget fields are missing.

- [ ] **Step 3: Wire every field to rendering**

High/medium/low values are:

```js
high:   { textureMax: 2048, paperFragments: 18, observationMarks: 10, transparentFeatures: true,  cursorEffects: true  }
medium: { textureMax: 1024, paperFragments: 10, observationMarks: 5,  transparentFeatures: true,  cursorEffects: false }
low:    { textureMax: 1024, paperFragments: 6,  observationMarks: 0,  transparentFeatures: false, cursorEffects: false }
```

Scene passes only `activeBudget`; feature components never read device tier directly. Texture or GLB errors preserve names, Directory, routes, and Reader. Fallback explicitly describes the same three projects and does not include observer as a project.

- [ ] **Step 4: Ignore local audit artifacts**

Add exactly:

```gitignore
.superpowers/
tmp/
```

- [ ] **Step 5: Run tests and commit**

Run: `npm.cmd test -- src/lib/perf.test.js src/ui/ui.test.jsx --reporter=verbose`

Expected: PASS.

```powershell
git add src/lib/perf.js src/lib/perf.test.js src/three/Scene.jsx src/three/CelestialBody.jsx src/three/ProjectFeatures.jsx src/ui/Fallback.jsx .gitignore
git commit -m "feat: budget and degrade celestial assets"
```

---

### Task 9: Complete engineering and visual acceptance

**Files:**
- Modify only files implicated by verification failures.
- Create screenshots under `tmp/visual-qa/` only; do not commit them.

**Interfaces:**
- Consumes the completed application.
- Produces passing verification output and desktop/mobile acceptance evidence.

- [ ] **Step 1: Run the complete automated gate**

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd test -- --reporter=verbose
```

Expected: lint exit 0, production build exit 0, all existing 51 tests plus new tests pass.

- [ ] **Step 2: Check the JavaScript gzip ceiling**

Run a PowerShell gzip measurement over `dist/assets/*.js` and sum compressed bytes.

Expected: total production JavaScript gzip ≤ 358400 bytes.

- [ ] **Step 3: Desktop visual journey**

At a desktop viewport, capture and inspect: intro, approaching galaxy, galaxy transit, system reveal, Explorer 1 intro, Apple, Yongshu, Nearby, Apple Reader hero, Apple timeline portrait, Apple ensemble, and Reader return. Confirm scrolling backward restores each previous stop and the orbit-star cursor disappears inside Reader.

- [ ] **Step 4: Mobile visual journey**

At `390×844`, repeat the full order using touch/scroll. Confirm no custom cursor, no hover/double-click requirement, no clipped text, horizontal Apple ensemble access, and working Directory.

- [ ] **Step 5: Reduced-motion and asset-failure checks**

Emulate `prefers-reduced-motion: reduce`; confirm snap/fade behavior. Temporarily block one texture and `explorer-1.glb`; confirm fallback geometry, labels, Directory, and Reader remain usable, then remove the block.

- [ ] **Step 6: Confirm the verified worktree state**

Run: `git status --short`

Expected: no tracked modifications. If verification exposed a defect, return to the task that owns that component, repeat its focused test and explicit commit sequence, then rerun this entire acceptance task. Do not create an empty verification commit.
