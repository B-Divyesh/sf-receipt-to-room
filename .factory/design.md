# Receipt to Room — visual thesis

## Direction: a household botanical field guide

Receipt to Room treats a pile of anonymous till slips like field specimens: each
line is identified, checked, labelled, and placed in its habitat. The visual
language borrows the quiet precision of a botanist's worktable—uncoated paper,
ink annotations, specimen tags, room-colour tabs, and a single pressed-leaf
illustration—without becoming nostalgic decoration. Ruled baselines and small
folio labels explain review state and provenance; they are functional, not
filler.

The desktop workspace is deliberately single-mode and light. Accurate receipt
review benefits from stable paper-like colour and print parity; a dark canvas
would turn the field-guide metaphor into a cosmetic theme and make receipt
previews harder to judge. Background is always explicitly painted.

## Tokens

| Role | Token | Value | Rationale |
| --- | --- | --- | --- |
| background | `--paper` | `#F3EFE3` | warm archival stock |
| raised surface | `--sheet` | `#FFFCF3` | a clean specimen sheet |
| text | `--ink` | `#19332B` | dark botanical ink; 11.3:1 on paper |
| muted text | `--ink-soft` | `#53645C` | graphite notation; 5.8:1 on paper |
| accent | `--fern` | `#1F6349` | pressed fern / primary action |
| accent contrast | `--white` | `#FFFFFF` | 7.1:1 on fern |
| secondary | `--clay` | `#A34B2A` | earthen specimen labels |
| rule | `--rule` | `#C6C0AE` | paper ruling and boundaries |
| success | `--moss` | `#336B3B` | verified OCR / saved |
| warning | `--ochre` | `#8B5A08` | needs review, always paired with text/icon |
| danger | `--berry` | `#9B2C3B` | destructive/error state |
| focus | `--focus` | `#0B63CE` | familiar, high-contrast keyboard ring |

Room tabs use pale semantic washes with dark labels: kitchen sage, living-room
clay, bedroom lavender, bathroom blue, office ochre, garage stone, and other
paper. Confidence is never colour-only: every value has a percentage and
`Good`, `Check`, or `Low` label.

## Typography

- Display: Georgia, `Times New Roman`, serif. It gives headings the measured,
  editorial authority of a field guide without a network or font payload.
- Interface and data: Inter-compatible system stack (`ui-sans-serif`,
  `-apple-system`, `Segoe UI`, sans-serif). Tables use tabular figures.
- Scale: 14px folio, 16px body, 20px lead, 25px section, 32px workspace title,
  48–64px landing title. Body leading is 1.55 and reading measure is 68ch.

No external fonts are loaded. The familiar system face keeps OCR editing fast,
while the serif is reserved for hierarchy.

## Spacing and shape

The base rhythm is 4px. Common gaps are 8, 12, 16, 24, 32, 48, and 64px.
Content maxes at 1180px. Controls are at least 44px high. Corners are restrained:
4px for tags, 8px for controls, 14px for independent sheets. Shadows resemble
one sheet resting on another (`0 12px 35px rgba(25,51,43,.10)`), never floating
glass. A faint 24px baseline texture may appear on large paper surfaces.

## Interaction grammar

- **Collect:** a dashed intake plot accepts click, keyboard, or image drop.
- **Identify:** OCR progress grows along a specimen rule; the image is handled
  locally and discarded after extraction.
- **Annotate:** each extracted line is an editable row with its own room,
  category, optional warranty date, numbered folio, and written confidence.
- **Plant:** accepted items keep their line-level placement and can be edited
  later from the searchable inventory.
- **Press:** exports translate the same records into redacted CSV or a printable
  insurance summary. Payment fragments matching card patterns are removed.

Primary actions are filled fern; secondary actions are ink outlines; dangerous
actions are quiet berry text until confirmation. Feedback appears beside the
action and in a polite live region. Deletions have a five-second undo.

## Responsive intent

At 390px the receipt preview becomes a compact file strip; review rows stack
labels above values; the inventory table becomes labelled specimen cards; and
secondary header links move below the wordmark. No control or required field is
dropped. Landing copy precedes a 200px specimen thumbnail so the first action
remains immediate and the headline paints without waiting for the illustration.

## Motion policy

UI transitions last 160–220ms and use opacity plus at most 8px of translation.
Newly accepted items travel down toward the inventory only as a brief contextual
cue. Nothing loops. With `prefers-reduced-motion: reduce`, scroll is instant,
transforms are removed, and progress/state changes use opacity or immediate
replacement. Depth remains through borders, overlap, and scale.

## Original asset plan and provenance

The hero is a generated editorial still life: a receipt as specimen sheet,
pressed fern fronds, room-labelled paper tabs, a brass ruler, pencil marks, and
soft daylight on warm paper. It explains the receipt-to-organized-room
transformation without pretending to show an exact UI.

Prompt sheet:

> Use case: stylized-concept. Asset type: wide landing-page hero illustration.
> Scene: overhead botanist's field desk on warm archival paper. Subject: one
> generic textless receipt laid out like a specimen sheet, crossed by a delicate
> pressed fern frond, small blank colour-coded paper tabs suggesting household
> rooms, a brass ruler and restrained graphite check marks. Style: refined
> editorial gouache with subtle paper grain and crisp product-illustration
> finish, not photorealistic. Composition: landscape 3:2, central receipt with
> calm negative space around the edges, no cropped objects. Light: soft northern
> window light, quiet and trustworthy. Palette: parchment, deep botanical green,
> terracotta, muted ochre, graphite. Avoid: readable words, letters, numbers,
> logos, brands, QR codes, barcodes, hands, people, excessive props, gradients,
> neon, glossy 3D, watermark. No text, no watermark, no logos.

Generated with the factory Azure image deployment (`factory-image`) on
2026-08-28. The generation is original for this product. Source PNG and prompt
sidecar live in `assets/src/`; optimized WebP/AVIF derivatives live with the
site. Provenance is recorded in this design note. All interface icons are
original inline SVG strokes authored for this repository.

The four desktop walkthrough images in `site/public/assets/walkthrough-*.png`
are original Playwright captures of the shipped app's demo inventory, review,
line assignment, and export states. They were captured on 2026-08-29 from the
bundled local UI; they are not generated imagery or stock material.
