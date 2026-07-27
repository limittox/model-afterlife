# Model Afterlife Home Map Redesign

**Date:** 2026-07-27

**Status:** Approved design

**Scope:** Replace the existing home map while preserving the approved resident sprites and social-preview artwork.

## Objective

Replace the sparse 352×256 home schematic with a larger, original pixel-art retirement home that feels inhabited, cozy, readable, and suitable for ambient resident scenes.

The redesign increases the world to 512×384 while retaining a 352×256 camera viewport. This preserves the current crisp 2× desktop presentation while providing substantially more room for environmental detail and resident movement.

## Fixed Decisions

- World dimensions: 512×384 logical pixels.
- Camera viewport: 352×256 logical pixels.
- Authoring grid: 16×16 pixels.
- Map extent: 32×24 tiles.
- Rendering: nearest-neighbour pixel art with integer display scaling.
- Existing 32×32 resident atlases remain unchanged.
- Visitors remain observers; the new map adds no world-influence controls.
- Existing canonical room identifiers remain stable.
- The home artwork must be original to Model Afterlife and must not copy another game's map, assets, proportions, or protected visual expression.

## Map Composition

The home uses a connected top-down layout rather than a collection of isolated rectangles. Corridors, thresholds, floor changes, lighting, and furniture establish spatial continuity.

### Common Room

The Common Room is the visual and social center of the home. It contains:

- A computational hearth or GPU-heater focal point.
- Armchairs and sofas arranged for small group conversations.
- Rugs and tables that define multiple conversational pockets.
- A noticeboard for activities and home announcements.
- Clear standing and seated resident anchors.
- Multiple unobstructed routes through the room.

### Library

The Library occupies a quieter wing and contains:

- Bookshelves and archived benchmark cabinets.
- Reading desks and individual chairs.
- A small display for old model documentation.
- Warm task lighting.
- Listening, seated, and solitary resident anchors.

### Memory Garden

The Memory Garden provides an outdoor visual contrast and contains:

- A small pond or reflective water feature.
- Benches and winding paths.
- Glowing memory flowers or data-like plants.
- Trees, shrubs, stones, and static glowing highlights.
- Walking, listening, and seated resident anchors.

### Tea Nook

The Tea Nook is compact and socially dense. It contains:

- A service counter and preparation area.
- Small tables and stools.
- Mugs, shelves, and a token vending machine.
- A visible connection to the primary corridor.
- Standing, seated, and conversational anchors.

### Entrance and Connecting Spaces

The home includes an entrance hall and connecting corridors with:

- A reception desk.
- A resident noticeboard.
- Doors and thresholds that clearly communicate room transitions.
- Charging points, discreet cables, and old server cabinets.
- Plants, lamps, windows, and wall decoration.

These connecting spaces are visual and navigational infrastructure. They do not create new canonical room identifiers in v1.

### Authored Zones

The map uses these grid-aligned bounding zones:

| Zone | Bounds | Purpose |
|------|--------|---------|
| Memory Garden | `x=0, y=96, w=144, h=224` | Western outdoor room |
| Common Room | `x=144, y=96, w=224, h=224` | Central social room |
| Library | `x=368, y=0, w=144, h=160` | Northeastern quiet room |
| Tea Nook | `x=368, y=160, w=144, h=160` | Eastern social room |
| Entrance Hall | `x=144, y=320, w=224, h=64` | Southern entrance and reception |
| Northern Corridor | `x=144, y=0, w=224, h=96` | Library connection and utility detail |

Doorways may visually interrupt these bounds, but canonical room hit regions remain rectangular and aligned to the same coordinates.

## Visual Direction

The home should feel like a warm computational care home viewed through a museum window.

- Use warm timber, muted greens, dusty violets, parchment neutrals, dark navy shadows, and restrained amber highlights.
- Give each canonical room a distinct floor material and silhouette.
- Use wall thickness, trim, windows, doors, and lighting pools to create depth.
- Prefer environmental storytelling over labels wherever the desktop view remains readable.
- Keep props large and legible at the 16px grid scale.
- Avoid excessive texture noise that competes with resident silhouettes or speech bubbles.
- Preserve sufficient negative space around resident anchors.

Subtle technical motifs may include charging furniture, archived benchmark binders, cable conduits, server cabinets, token dispensers, and a GPU-heater. These motifs should remain affectionate and domestic rather than resemble a futuristic laboratory.

## Camera and Presentation

The Phaser canvas remains a 352×256 logical viewport. The new 512×384 map exists as a larger camera world.

- Camera bounds cover the full 512×384 map.
- The initial view is a curated central establishing view, not a forced full-map fit.
- Active scenes may frame their participants using the existing presentation system.
- Reset view returns to the curated central view.
- Manual pan remains bounded to the map.
- Integer zoom behavior remains crisp.
- Speech bubbles and resident interaction targets remain within safe viewport bounds.
- Room highlighting must not obscure the artwork.

The complete world does not need to be visible simultaneously on desktop. The current scene remains the primary focal point.

## Room Geometry and Resident Anchors

The implementation will replace the existing room rectangles and anchor tables.

- Every canonical room receives the rectangular interaction region defined in the authored-zone table.
- The Common Room receives at least eight named anchors, the Memory Garden six, the Library four, and the Tea Nook four.
- Anchors must identify supported presentation states such as standing, seated, listening, speaking, and walking.
- Furniture and collision-like visual boundaries must agree with anchor placement.
- Walking intents use authored waypoint paths rather than crossing furniture.
- Facing directions must correspond to the room composition and nearby residents.

The canonical simulation continues to provide room membership and presentation intent. The map controls only visual placement.

## Asset Structure

Editable source artwork remains under:

`art-src/home/`

Runtime artwork remains under:

`public/art/home/`

The home is authored as one deterministic 512×384 project-authored SVG named `model-afterlife-home.svg`. It contains terrain, floors, walls, architectural structure, furniture, props, and lighting details. Phaser renders residents and speech bubbles above this base asset.

The public manifest must record the final dimensions, hash, provenance, and production approval state.

## Compact and Mobile Presentation

Compact and mobile layouts display the complete 512×384 home as a static nearest-neighbour overview.

- The overview uses the same approved runtime artwork as the Phaser world.
- It preserves the existing semantic room and resident shortcuts.
- Resident portraits remain static under reduced-motion preferences.
- Long room names must wrap without changing map geometry.
- Failure to load the artwork retains the existing semantic fallback.

## Accessibility and Motion

- Canvas remains supplementary to semantic scene, room, and resident content.
- Room identity must not rely solely on color.
- Resident silhouettes and speech bubbles require adequate contrast against every floor treatment.
- Reduced motion holds resident animation frames without changing world state.
- Camera movement continues to respect the existing reduced-motion contract.

## Error and Fallback Behavior

- If the production map fails to load, the procedural fallback remains available.
- The fallback must set explicit renderer metadata so automated checks can distinguish it from production artwork.
- Invalid dimensions, hashes, paths, or manifest records fail asset validation before deployment.

## Testing and Acceptance

The redesign is accepted when:

- The runtime world is exactly 512×384 and the camera viewport remains 352×256.
- All four canonical rooms have new geometry and readable visual identities.
- The entrance and corridors connect every room coherently.
- All six residents render at valid anchors without intersecting major furniture.
- Seated, listening, speaking, neutral, and walking presentations remain supported.
- Camera pan, reset, scene framing, zoom, and bounds work across the larger map.
- Desktop rendering remains crisp at integer scale.
- Compact view shows the complete map and all six resident shortcuts.
- Reduced-motion rendering uses held frames.
- The procedural fallback still works when the production asset is unavailable.
- Asset hashes and dimensions pass validation.
- Focused unit and browser checks pass.
- A human reviewer approves the final map for visual quality, originality, and project use.

## Out of Scope

- New canonical rooms or simulation locations.
- Visitor-controlled movement or interaction.
- Changes to resident character art.
- Changes to the social-preview artwork.
- Dynamic lighting simulation.
- Environmental map animation.
- Physics or collision-driven resident navigation.
- A day/night art set.
- Copying or adapting any third-party game map or asset.
