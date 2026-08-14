# Scroll Navigation Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every scroll gesture stop at the next project, turn the galaxy-to-system change into a continuous core-entry shot, replace the lagging cursor with an exact star pointer and short trail, and expose the two project-guide PDFs.

**Architecture:** Keep the existing Zustand journey state and React Three Fiber scene. Add pure scroll and galaxy-transform functions around the current progress model, leaving event orchestration in `ScrollJourney`; render the cursor trail in one lightweight 2D canvas without pointer-driven React state. Project manuals remain data-driven optional Reader links.

**Tech Stack:** React 19, Zustand, React Three Fiber, Three.js, Vitest, Testing Library, CSS Canvas 2D.

## Global Constraints

- Stop order is exactly `Observer → 佣书 01 → 苹果落下之前 02 → 附近未见 03`.
- A single wheel gesture may arrive at one stop but may not leave it until the gesture ends.
- No new npm dependency or second WebGL cursor effect.
- Desktop star core follows `clientX/clientY` without interpolation; mobile and reading mode render no custom cursor.
- Galaxy fully exits before the system presentation settles; it is not retained as a background plate.
- Only 《佣书》 and 《附近未见》 expose manuals in this pass.
- 《苹果落下之前》 shows no placeholder link until a real TapTap URL is supplied.
- Production JavaScript gzip stays at or below 350 KB.
- Do not deploy or publish.

---

### Task 1: Ordered, gesture-safe scroll stops

**Files:**
- Modify: `src/lib/journey.js`
- Modify: `src/lib/journey.test.js`
- Modify: `src/ui/ScrollJourney.jsx`
- Modify: `src/ui/ScrollJourney.test.jsx`

**Interfaces:**
- Produces: `boundedWheelDelta(deltaY: number, deltaMode?: number): number`
- Produces: `advanceJourneyWithStops(progress: number, delta: number): { progress: number, stoppedAt: string | null }`
- Consumes: existing `JOURNEY_STOPS`, `setJourneyProgress`, and the 180 ms gesture idle boundary.

- [ ] **Step 1: Write failing pure-function tests**

Add assertions that stop IDs are `observer,yongshu,apple,nearby`, a large wheel event is bounded, forward movement crossing `apple` returns exactly its center, and reverse movement crossing `yongshu` returns exactly its center.

```js
expect(JOURNEY_STOPS.map(({ id }) => id)).toEqual(['observer', 'yongshu', 'apple', 'nearby'])
expect(boundedWheelDelta(1200)).toBeLessThanOrEqual(0.03)
expect(advanceJourneyWithStops(0.77, 0.08)).toEqual({ progress: 0.81, stoppedAt: 'apple' })
expect(advanceJourneyWithStops(0.73, -0.08)).toEqual({ progress: 0.695, stoppedAt: 'yongshu' })
```

- [ ] **Step 2: Run the journey test and confirm RED**

Run: `npm.cmd test -- src/lib/journey.test.js --run --reporter=verbose`

Expected: FAIL because the order is wrong and the two functions do not exist.

- [ ] **Step 3: Implement the pure progress rules**

Set ranges and centers to observer `.60`, yongshu `.695`, apple `.81`, nearby `.935`. Normalize line/page deltas, clamp each wheel contribution to `±0.03`, and return the first stop center crossed between the current and proposed progress.

- [ ] **Step 4: Run the journey test and confirm GREEN**

Run: `npm.cmd test -- src/lib/journey.test.js --run --reporter=verbose`

- [ ] **Step 5: Write a failing gesture-lock UI test**

Render at progress `.77`, fire several same-gesture wheel events, and assert progress remains at `.81` after arriving at Apple. Advance fake timers past 180 ms, fire a new event, and assert it can leave `.81` without reaching Nearby.

- [ ] **Step 6: Run the UI test and confirm RED**

Run: `npm.cmd test -- src/ui/ScrollJourney.test.jsx --run --reporter=verbose`

- [ ] **Step 7: Implement the gesture lock**

Use refs inside `ScrollJourney`: `gestureStopRef` blocks remaining wheel events after `advanceJourneyWithStops` returns `stoppedAt`; the idle timer performs normal snapping and clears the ref. Touch movement uses the same bounded crossing helper.

- [ ] **Step 8: Run both scroll test files and confirm GREEN**

Run: `npm.cmd test -- src/lib/journey.test.js src/ui/ScrollJourney.test.jsx --run --reporter=verbose`

- [ ] **Step 9: Commit**

```powershell
git add src/lib/journey.js src/lib/journey.test.js src/ui/ScrollJourney.jsx src/ui/ScrollJourney.test.jsx
git commit -m "fix: stop scroll gestures at each project"
```

### Task 2: Project manual links

**Files:**
- Copy: `../佣书资料/《佣书》项目运行说明.pdf` → `public/media/docs/yongshu-project-guide.pdf`
- Copy: `../附近未见/附近未见_作品使用手册.pdf` → `public/media/docs/nearby-user-guide.pdf`
- Modify: `src/data/projects.js`
- Modify: `src/data/projects.test.js`
- Modify: `src/ui/Reader.jsx`
- Modify: `src/ui/ui.test.jsx`
- Modify: `src/index.css`

**Interfaces:**
- Produces: optional project field `manual: { label: string, href: string }`.
- Reader resolves `manual.href` through `import.meta.env.BASE_URL` and opens it with `target="_blank"` and `rel="noreferrer noopener"`.

- [ ] **Step 1: Write failing data and UI tests**

Assert Yongshu and Nearby manuals point to existing `.pdf` files, Apple has no `manual`, and Reader renders exactly one `打开项目说明书 PDF` link for a configured project.

- [ ] **Step 2: Run tests and confirm RED**

Run: `npm.cmd test -- src/data/projects.test.js src/ui/ui.test.jsx --run --reporter=verbose`

- [ ] **Step 3: Copy the two verified source PDFs**

Create `public/media/docs` and copy each file byte-for-byte to the ASCII paths. Compare source and destination SHA-256 values before continuing.

- [ ] **Step 4: Add manual data and Reader rendering**

Add `manual` only to Yongshu and Nearby. Render it in `.reader__links` before ordinary project links; do not add an Apple placeholder.

- [ ] **Step 5: Run tests and confirm GREEN**

Run: `npm.cmd test -- src/data/projects.test.js src/ui/ui.test.jsx --run --reporter=verbose`

- [ ] **Step 6: Commit**

```powershell
git add public/media/docs src/data/projects.js src/data/projects.test.js src/ui/Reader.jsx src/ui/ui.test.jsx src/index.css
git commit -m "feat: link project guide PDFs"
```

### Task 3: Exact star cursor with a short trail

**Files:**
- Modify: `src/ui/OrbitStarCursor.jsx`
- Modify: `src/ui/OrbitStarCursor.test.jsx`
- Modify: `src/index.css`

**Interfaces:**
- The component still renders only when `finePointer && cursorEffects && stage !== reading`.
- Produces DOM hooks `.orbit-cursor__trail` and `.orbit-cursor__star`.

- [ ] **Step 1: Write the failing cursor test**

Stub the 2D canvas context. Fire `pointermove` at `(140, 90)` and assert `.orbit-cursor__star.style.transform` immediately equals `translate3d(131px, 81px, 0)`, with no animation-frame wait. Assert reading mode still returns null.

- [ ] **Step 2: Run the cursor test and confirm RED**

Run: `npm.cmd test -- src/ui/OrbitStarCursor.test.jsx --run --reporter=verbose`

Expected: FAIL because the current star only updates from the animation loop and the requested element does not exist.

- [ ] **Step 3: Implement direct positioning and canvas trail**

Replace pointer-coordinate React state with refs. The pointer handler updates the star transform synchronously and appends one history point. A single RAF clears and redraws at most six points with decreasing alpha; DPR is capped at `1.5`. Class toggles for hover and press mutate the star element directly.

- [ ] **Step 4: Adjust CSS**

Make the wrapper full-screen and pointer-transparent, the canvas fixed at `inset:0`, and the 18 px star independently transformable. Keep the existing core and ring visual language without positional easing.

- [ ] **Step 5: Run the cursor test and confirm GREEN**

Run: `npm.cmd test -- src/ui/OrbitStarCursor.test.jsx --run --reporter=verbose`

- [ ] **Step 6: Commit**

```powershell
git add src/ui/OrbitStarCursor.jsx src/ui/OrbitStarCursor.test.jsx src/index.css
git commit -m "fix: make the star cursor track precisely"
```

### Task 4: Continuous galaxy-core entry

**Files:**
- Modify: `src/three/cameraTargets.js`
- Modify: `src/three/cameraTargets.test.js`
- Modify: `src/three/PersonalGalaxy.jsx`
- Modify: `src/three/Scene.jsx`

**Interfaces:**
- Produces: `galaxyTransformForProgress(progress: number): { scale: number, core: number }`.
- `PersonalGalaxy` consumes `progress`, `opacity`, and the existing particle budget.
- `sceneWeightsForProgress` guarantees galaxy opacity reaches zero by the first project-region stop.

- [ ] **Step 1: Write failing camera and layer tests**

Assert galaxy scale strictly increases from `.16` through `.48`, camera Z approaches the shared origin across the same interval, galaxy weight is zero by `.60`, and system weight does not settle before the core transition.

```js
expect(galaxyTransformForProgress(.44).scale).toBeGreaterThan(galaxyTransformForProgress(.24).scale)
expect(cameraTargetForJourney({ progress: .44 }).position[2]).toBeLessThan(cameraTargetForJourney({ progress: .24 }).position[2])
expect(sceneWeightsForProgress(.60).galaxy).toBe(0)
```

- [ ] **Step 2: Run the camera test and confirm RED**

Run: `npm.cmd test -- src/three/cameraTargets.test.js --run --reporter=verbose`

- [ ] **Step 3: Implement the shared-core camera curve and weights**

Place the galaxy at the stellar-system origin. Use keyframes at `.12`, `.30`, `.44`, `.50`, and `.56` to approach the core and then settle into the overview. Keep the galaxy visible through the approach, fade it over `.49–.56`, and bring the system in over `.50–.58`.

- [ ] **Step 4: Apply transform to PersonalGalaxy**

Scale from roughly `.32` at discovery to above `2.5` at core entry. Increase point size only modestly, keep depth writing disabled, and let the enlarged arms leave the frame before opacity reaches zero.

- [ ] **Step 5: Run the camera test and confirm GREEN**

Run: `npm.cmd test -- src/three/cameraTargets.test.js --run --reporter=verbose`

- [ ] **Step 6: Commit**

```powershell
git add src/three/cameraTargets.js src/three/cameraTargets.test.js src/three/PersonalGalaxy.jsx src/three/Scene.jsx
git commit -m "feat: fly through the galaxy core"
```

### Task 5: Full verification and visual acceptance

**Files:**
- Inspect: all modified files
- Write ignored evidence: `tmp/visual-qa/`

**Interfaces:**
- Consumes all previous tasks; produces no new runtime interface.

- [ ] **Step 1: Run focused integration tests**

Run: `npm.cmd test -- src/lib/journey.test.js src/ui/ScrollJourney.test.jsx src/ui/OrbitStarCursor.test.jsx src/data/projects.test.js src/ui/ui.test.jsx src/three/cameraTargets.test.js --run --reporter=verbose`

- [ ] **Step 2: Run complete engineering gates**

Run:

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd test -- --reporter=verbose
```

Measure every `dist/assets/*.js` with GZipStream and fail above `358400` bytes.

- [ ] **Step 3: Desktop browser acceptance at 1440×900**

Verify slow and fast scrolling both produce Observer→01→02→03, reverse scrolling restores each stop, star center remains under the pointer while clicking directory and project actions, galaxy expands through the camera and disappears before the clean system settles, both PDFs return `application/pdf`, and the console contains no application errors.

- [ ] **Step 4: Mobile browser acceptance at 390×844**

Verify the same stop order with touch/scroll, no custom cursor, readable project panels, working PDF links, and no horizontal overflow.

- [ ] **Step 5: Commit any acceptance-only fixes after repeating RED/GREEN**

Use a focused commit message describing only the observed defect. Do not deploy, merge, push, or open a PR.
