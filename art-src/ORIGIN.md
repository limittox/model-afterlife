# GPT-4o resident sprite pilot provenance

## Status and approval boundary

This record covers a deliberately partial, AI-generated production pilot for the
`gpt-4o` resident using the `amber-waistcoat-short-stack` visual variant.

- The user explicitly authorized up to five built-in image-generation attempts.
- Attempt 1 was selected for technical integration on 2026-07-27.
- Exactly one image-generation attempt was used. No additional generation call is
  authorized by this pilot integration.
- Selection means “use this result for the technical pilot.” It is not the
  `approved original assets` confirmation required by Phase 3 Plan 06, and it is
  not final visual/originality approval.
- This repository does not claim that the generated pixels are wholly
  human-authored, project-owned, exclusively licensed, or cleared as original.
  Ownership, license, protected-expression, and final originality review remain
  explicit human checkpoints before RSID-08 or VIEW-07 can be completed.

## Creation record

| Field | Record |
| --- | --- |
| Creation date | 2026-07-27 |
| Creation method | OpenAI built-in image generation, user-authorized attempt 1 of a maximum of 5 |
| Human contribution | Direction, reference selection, prompt approval, attempt-1 selection, and authorization for pilot integration |
| AI contribution | Generated the chroma-backed sprite-sheet pixels |
| Reference use | The supplied image reference was restricted to identity and palette guidance; the prompt expressly prohibited logos, mascots, copied game assets, and protected visual expression |
| Integration status | Technical pilot only; broader source/originality and final-visual approvals are pending |

### Exact generation prompt

> Use case: stylized-concept. Asset type: production pilot sprite sheet for a Phaser 4 pixel-art web game. Image 1 is identity/palette reference only; preserve short rounded screen-faced robot, amber waistcoat, pale-blue shirt, dark trousers, folio, round clock; redraw as authentic low-resolution pixel art. Flat solid #00ff00 chroma backdrop, no shadows/gradients/texture. Exactly 10 full-body frames, regular 5x2 grid, logical 24x32 cells. Top: neutral, seated with folio, listening head tilt, speak A raised hand, speak B tiny mouth/hand change. Bottom: walk A-D, reduced-motion neutral. Preserve helmet/screen/torso/wardrobe/palette/clock/folio/silhouette invariants. Original cozy 16-bit-inspired sprite, max 16 colors, hard outlines/flat colors/no antialias/gradients/3D. No text/labels/borders/watermark/provider logo/OpenAI logo/mascot/copied game assets/protected expression.

## Source-to-export mapping

| Stage | Path | SHA-256 | Notes |
| --- | --- | --- | --- |
| Selected generation output | `art-src/residents/gpt-4o/pilot-attempt-01-chroma.png` | `6a5bbca6f419cba1f596dd82f89c3db7cdd422a0b1c2f3f9cdd7195001dc3a7a` | Attempt 1, preserved with its flat chroma backdrop |
| Mechanically prepared source | `art-src/residents/gpt-4o/pilot-attempt-01-alpha.png` | `774c53ceec63be94b42f9df766a2ec03c30254bdfd3e9d95febb7099c6fe579b` | Chroma removed locally; no generative alteration |
| Review preview | `art-src/residents/gpt-4o/pilot-attempt-01-preview-8x.png` | Rebuilt by the atlas script | Nearest-neighbor review enlargement; not loaded at runtime |
| Runtime sprite sheet | `public/art/residents/gpt-4o-pilot.png` | `ee3d3349c5efab355b401382d99d197c46ded9d5138cbf3a8b57fedfc2178e61` | 120×64 PNG; 5×2 grid of 24×32 cells |

Rebuild the runtime sprite sheet and preview from the prepared alpha source:

```powershell
python scripts/build-gpt4o-pilot-atlas.py `
  --input art-src/residents/gpt-4o/pilot-attempt-01-alpha.png `
  --output public/art/residents/gpt-4o-pilot.png `
  --preview art-src/residents/gpt-4o/pilot-attempt-01-preview-8x.png
```

Frame order is fixed:

1. neutral
2. seated with folio
3. listening
4. speaking A
5. speaking B
6. walking A
7. walking B
8. walking C
9. walking D
10. reduced-motion neutral

The public manifest intentionally contains runtime facts only. The generation
prompt and source-process record remain here under `art-src/`.
