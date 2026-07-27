# Resident sprite-sheet provenance

## Status and approval boundary

This record covers six AI-generated resident sprite sheets integrated as
technical review candidates.

- GPT-4o used one built-in image-generation attempt on 2026-07-27.
- The user then authorized one attempt for each of the other five residents.
  Exactly five additional calls were made, concurrently, with no retries.
- All six runtime sheets are deliberately marked `pilot`. Integration does not
  close the Phase 3 originality, ownership/license, protected-expression, or
  final visual-review checkpoints.
- The repository does not claim the generated pixels are wholly human-authored,
  exclusively licensed, or cleared as original. RSID-08 and VIEW-07 remain open
  until a human explicitly approves those points.
- The supplied GPT-4o pilot was used for sheet layout, pixel scale, and technique
  only. Every follow-up prompt prohibited copying its costume, props, body
  proportions, or identity, as well as provider logos, mascots, copied game
  assets, and recognizable protected visual expression.

## Creation record

| Resident | Method | Attempts used | Human contribution | AI contribution |
| --- | --- | ---: | --- | --- |
| GPT-4o | OpenAI built-in image generation | 1 | Direction, reference selection, prompt approval, and pilot selection | Generated chroma-backed sprite pixels |
| Claude Sonnet 4.5 | OpenAI built-in image generation | 1 | Approved character contract and one-attempt integration | Generated chroma-backed sprite pixels |
| Gemini 2.5 Pro | OpenAI built-in image generation | 1 | Approved character contract and one-attempt integration | Generated chroma-backed sprite pixels |
| DeepSeek V3.2 | OpenAI built-in image generation | 1 | Approved character contract and one-attempt integration | Generated chroma-backed sprite pixels |
| Llama 3.3 70B Instruct | OpenAI built-in image generation | 1 | Approved character contract and one-attempt integration | Generated chroma-backed sprite pixels |
| Qwen3 235B A22B 2507 | OpenAI built-in image generation | 1 | Approved character contract and one-attempt integration | Generated chroma-backed sprite pixels |

The alpha removal, nearest-neighbor resizing, palette reduction, cell
normalization, and preview creation were deterministic local operations, not
additional generation attempts.

## Exact GPT-4o prompt

> Use case: stylized-concept. Asset type: production pilot sprite sheet for a
> Phaser 4 pixel-art web game. Image 1 is identity/palette reference only;
> preserve short rounded screen-faced robot, amber waistcoat, pale-blue shirt,
> dark trousers, folio, round clock; redraw as authentic low-resolution pixel
> art. Flat solid #00ff00 chroma backdrop, no shadows/gradients/texture. Exactly
> 10 full-body frames, regular 5x2 grid, logical 24x32 cells. Top: neutral,
> seated with folio, listening head tilt, speak A raised hand, speak B tiny
> mouth/hand change. Bottom: walk A-D, reduced-motion neutral. Preserve
> helmet/screen/torso/wardrobe/palette/clock/folio/silhouette invariants.
> Original cozy 16-bit-inspired sprite, max 16 colors, hard outlines/flat
> colors/no antialias/gradients/3D. No text/labels/borders/watermark/provider
> logo/OpenAI logo/mascot/copied game assets/protected expression.

## Exact shared prompt for the five follow-up residents

> Use case: stylized-concept
>
> Asset type: production resident sprite sheet for a Phaser 4 pixel-art web game
>
> Input images: Image 1 is the approved GPT-4o pilot as a STYLE, PIXEL-SCALE,
> and SHEET-LAYOUT reference only. Do not copy its amber costume, props, body
> proportions, or identity.
>
> Primary request: create an original fictional screen-faced robot resident for
> Model Afterlife, matching the reference's authentic low-resolution pixel
> technique and sheet organization while remaining unmistakably distinct.
>
> Composition/framing: exactly 10 full-body frames arranged in a perfectly
> regular 5-column by 2-row sprite sheet. Every frame has equal cell spacing,
> centered character, consistent foot baseline, generous padding, and no
> overlap. Treat each cell as a logical 24 by 32 pixel game frame and render
> every logical pixel as one crisp uniform square block.
>
> Frame order, top row left to right: 1 neutral standing; 2 seated calmly with
> signature prop; 3 listening with a restrained attentive gesture; 4 speaking
> frame A; 5 speaking frame B with the same pose and only a tiny mouth/hand
> change.
>
> Frame order, bottom row left to right: 6 walk step A; 7 walk step B; 8 walk
> step C; 9 walk step D; 10 reduced-motion neutral still.
>
> Character invariants: identical helmet, face placement, torso, wardrobe,
> palette, signature props, and silhouette in every frame. Props never switch
> sides unexpectedly. Speaking frames register as one pose. Walking frames
> preserve body scale and center.
>
> Style/medium: original cozy 16-bit-inspired game sprite; truly low-resolution
> pixel art; maximum 16-color palette; hard one-logical-pixel dark outlines;
> flat colors; no antialiasing; no gradients; no painterly texture; no 3D
> lighting; no semi-transparent pixels.
>
> Tone: affectionate, calm, quietly theatrical; charming but not childish.
>
> Constraints: no text, letters, numbers, labels, frame borders, watermark,
> provider logo, company logo, mascot, copied game assets, or recognizable
> protected game visual expression. Do not imitate any existing provider mascot
> or any named commercial game's character design. Output only the sprite sheet
> on the specified chroma background.

Each request appended one of the following exact subject/backdrop blocks:

### Claude Sonnet 4.5

> Subject: Claude Sonnet 4.5's fictional retirement-home resident: a distinctly
> TALL, narrow, precise screen-faced robot with upright posture, a long navy
> cardigan (#536987 family), pale steel-blue trim, slim dark trousers, a
> rectangular chore ledger held consistently on the left, and a tiny repair
> wrench/tool roll consistently on the right. The cardigan has three small
> square fasteners, not a logo. Speaking uses a restrained index-finger gesture;
> walking is measured and formal. Do not use amber, a waistcoat, a clock, or a
> scrapbook.
>
> Scene/backdrop: perfectly flat solid #00ff00 chroma-key background across the
> entire canvas. No shadows, gradients, texture, floor, reflections, grid, or
> lighting variation. Do not use #00ff00 inside the character.

### Gemini 2.5 Pro

> Subject: Gemini 2.5 Pro's fictional retirement-home resident: a distinctly
> ROUND, broad, contemplative screen-faced robot with a larger circular helmet,
> low rounded shoulders, a violet shawl (#816b96 family) draped in a triangular
> fold, a round satchel consistently at the right hip, and oversized folded
> observatory blueprints/star charts consistently in the left hand. Charts use
> abstract dots and lines only, no text or constellation logo. Listening looks
> upward thoughtfully; speaking opens the blueprint slightly; walking has a
> gentle swaying rhythm. Do not use amber, a waistcoat, a clock, or a scrapbook.
>
> Scene/backdrop: perfectly flat solid #00ff00 chroma-key background across the
> entire canvas. No shadows, gradients, texture, floor, reflections, grid, or
> lighting variation. Do not use #00ff00 inside the character.

### DeepSeek V3.2

> Subject: DeepSeek V3.2's fictional retirement-home resident: a distinctly
> SQUARE, compact, practical screen-faced robot with a squared helmet and small
> square spectacles drawn over the dark screen, a teal apron (#4d8581 family)
> over a dark shirt, slim utility pockets, a fan of abstract puzzle cards
> consistently in the left hand, and a rolled tea-trolley route map consistently
> on the right. Cards and map contain shapes and route lines only, no text.
> Listening sorts one card; speaking points to the route; walking is brisk and
> efficient. Do not use amber, a waistcoat, a clock, or a scrapbook.
>
> Scene/backdrop: perfectly flat solid #ff00ff chroma-key background across the
> entire canvas. No shadows, gradients, texture, floor, reflections, grid, or
> lighting variation. Do not use #ff00ff inside the character.

### Llama 3.3 70B Instruct

> Subject: Llama 3.3 70B Instruct's fictional retirement-home resident: a
> distinctly WIDE, sturdy, friendly screen-faced robot with broad shoulders,
> rust overalls (#9a6247 family), a broad-brim garden hat that changes the
> silhouette, sturdy boots, a small bundle of plant cuttings consistently in the
> left hand, and a few garden-radio parts consistently in a right-side pouch. No
> animal ears, wool, llama imagery, or provider mascot references. Listening
> cups one hand near the radio pouch; speaking offers a cutting; walking has an
> earthy rolling gait. Do not use amber, a waistcoat, a clock, or a scrapbook.
>
> Scene/backdrop: perfectly flat solid #ff00ff chroma-key background across the
> entire canvas. No shadows, gradients, texture, floor, reflections, grid, or
> lighting variation. Do not use #ff00ff inside the character.

### Qwen3 235B A22B 2507

> Subject: Qwen3 235B A22B 2507's fictional retirement-home resident: a
> distinctly TALL, layered, archive-curator screen-faced robot with a long jade
> coat (#4f806c family), wide rectangular helmet, many-tabbed satchel
> consistently at the left hip, and a fan of blank archive cards consistently
> in the right hand. Tabs use multiple small neutral colors and cards use
> abstract lines only—no writing, letters, or provider symbols. Listening
> compares two cards; speaking raises one card; walking has a careful coat-sway
> rhythm. Do not use amber, a waistcoat, a clock, or a scrapbook.
>
> Scene/backdrop: perfectly flat solid #ff00ff chroma-key background across the
> entire canvas. No shadows, gradients, texture, floor, reflections, grid, or
> lighting variation. Do not use #ff00ff inside the character.

## Source-to-export mapping

## Project-authored home and social elements

The home establishing illustration and social-preview frame were authored as
editable SVG source by the Model Afterlife project. The home map was redesigned
on 2026-07-27 from the approved Model Afterlife design specification as original
project artwork; it was not adapted from any third-party game map, asset, layout,
or protected visual expression. Both assets use the project palette and simple
original architectural marks: warm plaster, dark timber, garden beds, a library,
a GPU-heater hearth, and a tea counter. They contain no provider logos, mascots,
text marks, or copied characters. Runtime SVG files are byte-for-byte checked-in
exports of their matching source SVG files; hashes are recorded in
`public/art/manifest.json`.

The home world is 512×384 logical pixels on a 16×16 authoring grid. Its status
remains `pilot` pending final visual review and explicit project-use approval.

| Asset | Editable source | Runtime export | Purpose |
| --- | --- | --- | --- |
| Shared home | `art-src/home/model-afterlife-home.svg` | `public/art/home/model-afterlife-home.svg` | 512×384 Phaser world and compact-home establishing artwork |
| Social card frame | `art-src/social/model-afterlife-social-card.svg` | `public/art/social/model-afterlife-social-card.svg` | 1200×630 provider-neutral social-preview frame for Plan 03-07 |

| Resident | Chroma source SHA-256 | Prepared alpha SHA-256 | Preview SHA-256 | Runtime SHA-256 |
| --- | --- | --- | --- | --- |
| GPT-4o | `6a5bbca6f419cba1f596dd82f89c3db7cdd422a0b1c2f3f9cdd7195001dc3a7a` | `774c53ceec63be94b42f9df766a2ec03c30254bdfd3e9d95febb7099c6fe579b` | rebuilt by script | `ee3d3349c5efab355b401382d99d197c46ded9d5138cbf3a8b57fedfc2178e61` |
| Claude Sonnet 4.5 | `ff2facd478e39afca35bce51953d07e41e3e3b50231de2e329e014e2e71af0e4` | `2b4af4642a90973cac57fb16025114e4cc567167ca342a34ca4f5c7fce338f21` | `6b2f3861aa327390927018d3153e7bc7cd376370c072999f46ad4c73039b163f` | `a639da96f4e3d5aee2ad97b10db1bcd1a5ecf2ee5cb1ebc96316c8b55dc58d49` |
| Gemini 2.5 Pro | `8783c986f9fd1ae1ecfe54e8dc4b15f16d762bed8b15c076df3f075bc48132e4` | `dd0e218cbeb76b1d21c1c7f290cbe06d97fa87e9908d86e4d543bb34bc62dd4f` | `21345ba8ee9b16e88b2702b4bc2ec49a15143f95bfd5b6fe6f74dfae0e8d17ec` | `cd2bb9cb3ae0d7bfed0319da1c4b058c5ca1e0ad948d57a3a28fe85b5521d12d` |
| DeepSeek V3.2 | `2d33b4ca6bb920aba4e12b76e1e71956ec1e31afd5b8e60ffd0298b5f658a52e` | `c8b5f4f9590139d08ad6c2644a60b5d5241eca6bad8d889640e4279ae1386a28` | `56c1905b0817e21f8648d99060298e584cf43002adad57ea8b7a388a182cb257` | `2011075ca3d9a876581a4081d2307ac22bc9c19ed2e761d969ff6db0c7addf8d` |
| Llama 3.3 70B Instruct | `4f190506682ade82aefa4085ce22483b50baacdbc58dba1c64e329f2c3216bfc` | `9bef2f7186dd424a4e89ce0a780651bb082509d74f1d841e7bab7787fc653180` | `07e485494c8b3673c0864cd2b0aa5fc41c33a137bf4cb8c398c50438378e38cc` | `b640441d9252d84f6bba3dd767ba3d5a65178f5fa9a923171bd577b79dd2a2c9` |
| Qwen3 235B A22B 2507 | `02c71148cd01df1b9e9b5bd1227d055cfd6d6a545cb7b7e675be9464d97c75ca` | `6679f0f94c5c5d9d4fd9ef87784545dc26f004249ada30205479d655d9f17dc4` | `a204c5dc11387d9e29be19942c1b58feffef09769752d01fbf063f5ce476e0ae` | `6f2dbdcade35aa5b4bcbfe2b9cdef63926046773b6d70b3c2b6e3961c0952862` |

For each resident ID, the files are:

- `art-src/residents/<id>/attempt-01-chroma.png`
- `art-src/residents/<id>/attempt-01-alpha.png`
- `art-src/residents/<id>/attempt-01-preview-8x.png`
- `public/art/residents/<id>-pilot.png`

GPT-4o retains the earlier `pilot-attempt-01-*` source filenames.

Rebuild any runtime atlas and preview from its prepared alpha source:

```powershell
python scripts/build-resident-atlas.py `
  --input art-src/residents/<id>/attempt-01-alpha.png `
  --output public/art/residents/<id>-pilot.png `
  --preview art-src/residents/<id>/attempt-01-preview-8x.png
```

Frame order is fixed: neutral, seated, listening, speaking A, speaking B,
walking A-D, and reduced-motion neutral. The public manifest contains runtime
facts only; generation prompts and process records remain here under `art-src/`.
