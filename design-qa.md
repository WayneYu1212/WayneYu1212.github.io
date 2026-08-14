# Personal Cosmos Design QA

## Evidence

- Source visual truth:
  - `C:\Users\UUWayne\.codex\generated_images\019ff566-7f8a-7ee1-b2c5-a6de2a5b2d33\exec-b4f30ee5-dba2-4d66-8130-1493fc6c8a90.png` — flow and interface board, 2048×768 px.
  - `C:\Users\UUWayne\.codex\generated_images\019ff566-7f8a-7ee1-b2c5-a6de2a5b2d33\exec-61850935-b9ec-4e20-9145-dc53af64b7f0.png` — Apple planet A/B/C material board; B is the selected direction, full board 1672×941 px.
- Browser-rendered implementation evidence:
  - `qa-desktop-intro-final.png` — 1280×720 px at a 1280×720 CSS viewport, DPR 1.
  - `qa-desktop-system.png` — 1280×720 px at a 1280×720 CSS viewport, DPR 1.
  - `qa-desktop-apple-final.png` — 1280×720 px at a 1280×720 CSS viewport, DPR 1.
  - `qa-desktop-reader.png` — 1280×720 px at a 1280×720 CSS viewport, DPR 1.
  - `qa-mobile-intro.png`, `qa-mobile-system.png`, `qa-mobile-reader.png` — 390×844 px at a 390×844 CSS viewport, DPR 1.
  - `qa-mobile-apple-final.png` — 390×844 px at a 390×844 CSS viewport, DPR 1.
- Density normalization: all implementation captures are DPR 1. The source boards are mood/direction boards rather than same-frame production mocks, so comparisons were made by visual region and state instead of pixel overlay. No fidelity finding was based only on source-frame size.
- States compared: intro, system overview, Apple planet focus, project reader; desktop and 390×844 mobile.

## Full-view comparison

The implementation preserves the source flow board's black negative space, sharp star points, restrained hairline trajectories, Chinese-first project hierarchy and near-opaque reading surface. It intentionally expands the source's abstract four-frame flow into the approved six-stage journey, so the extra North Dipper and stellar-system states are expected product changes rather than drift.

The selected Apple B direction is preserved as a scientific sphere with gray-green, soil-brown and cold-white material, a deformed north-pole basin, two dated orbit lines and one retrograde satellite. It avoids the A/C apple silhouette and has no stem or red fruit treatment.

## Focused-region comparison

- Apple surface: compared the B region in the A/B/C board against `qa-desktop-apple-final.png`. The final generated equirectangular texture supplies real erosion, impact basins, land/water variation and cloud detail; the earlier shader bands were removed.
- Focus UI: compared source flow frame 03 against the desktop and mobile Apple captures. Project name, type, year and the only primary action remain clear. On mobile, the duplicate 3D orbit readout is hidden so it does not collide with the 2D panel.
- Reader: compared source flow frame 04 against desktop/mobile reader captures. The final reader is nearly opaque, keeps the project typography dominant, and leaves a clear return path plus the persistent project directory.

## Findings and comparison history

### Iteration 1 — blocked

- [P2] Desktop intro title ended with a single-character line.
  - Fix: widened the intro measure and reduced the maximum title scale. The final desktop capture keeps the title on one line; mobile uses a balanced two-line wrap.
- [P1] Apple focus retained the central star and other planets in the foreground.
  - Fix: isolated the selected planet and suppressed unrelated system bodies while focused. The final focus capture has one unambiguous spatial subject.
- [P1] Apple surface used broad procedural vertical bands and did not meet source-image fidelity.
  - Fix: generated and integrated a dedicated equirectangular planetary texture asset, retained physical pole deformation, and added controlled key lighting.

### Iteration 2 — blocked

- [P2] Mobile Apple focus duplicated the 3D year readout over the 2D information panel.
  - Fix: hid the redundant spatial readout below 820 px while retaining both years and the retrograde satellite in the accessible panel.

### Iteration 3 — passed

- Post-fix evidence: `qa-desktop-intro-final.png`, `qa-desktop-apple-final.png`, and `qa-mobile-apple-final.png`.
- No actionable P0/P1/P2 visual mismatch remains for the approved vertical slice.

## Required fidelity surfaces

- Fonts and typography: Chinese UI/body uses a Source Han Sans-style system chain; project titles and historical copy use a Source Han Serif-style chain; English uses Arial; small data uses Space Grotesk with Arial fallback. Large decorative monospace use was removed. Heading wrapping is safe at both viewports.
- Spacing and layout rhythm: desktop UI stays within 44–48 px edges; mobile persistent controls stay inside 18 px edges. Focus and reader surfaces do not collide with the project directory.
- Colors and visual tokens: black negative space, blue-gray navigation, restrained orange/blue/violet galaxy light and the Apple gray-green/earth/cold-white material match the approved art direction. Contrast remains sufficient in the reader and controls.
- Image quality and asset fidelity: Apple uses the project asset `src/assets/apple-surface.png`, not a CSS or placeholder approximation. Existing project gallery imagery remains sharp and correctly cropped in the reader.
- Copy and content: Chinese remains primary; English is limited to the title translation and compact operation/data labels. The directory explains that visitors may skip the spatial journey.
- Accessibility and interaction: semantic buttons, keyboard activation, visible focus, Escape handling, single-tap star map nodes, browser Back, reduced-motion code path and persistent directory were checked. Mobile does not depend on hover or double-click.

## Primary interactions tested

- Enter intro immediately; follow the navigation marker; skip galaxy transit.
- Open the star map and single-click Apple.
- Enter the project; return with the Reader button; use browser Back from `#project/apple` to `#system`.
- Open the same hierarchy at 390×844 and verify the persistent directory.
- Console checked after desktop and mobile flows: no application warnings or errors.

## Follow-up polish

- [P3] A future planet-specific pass could add a normal/roughness map to increase grazing-angle relief without changing the current silhouette.
- [P3] Other three planets intentionally remain basic until the Apple slice is accepted.

final result: passed
