---
name: Redline
description: Clean-studio review document — paper, ink, hairlines, and one red pen.
colors:
  paper: "#F6F6F4"
  surface: "#FFFFFF"
  surface-2: "#FAFAF8"
  ink: "#1B1D20"
  ink-2: "#565B61"
  ink-3: "#6B7178"
  hairline: "#E7E7E3"
  rule: "#D8D8D2"
  red: "#B93A2B"
  red-deep: "#A03123"
  red-tint: "#FAF0EE"
  blue: "#2F6CB3"
  blue-tint: "#EEF3F9"
  amber: "#8A6508"
  amber-tint: "#F8F2E1"
  hover-border: "#C2C2BB"
  red-tint-border: "#EBD5D1"
  blue-tint-border: "#C6D8EC"
  amber-tint-border: "#E8DCB8"
  black: "#000000"
  stage-ground: "#ECECE8"
  print-ink: "#111111"
  print-gray-strong: "#444444"
  print-gray: "#666666"
  print-gray-soft: "#888888"
  print-rule: "#999999"
  print-hairline: "#DDDDDD"
  print-why-tint: "#F5EAE8"
typography:
  display:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "clamp(24px, 4.5vw, 31px)"
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: "-0.022em"
  title:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "14.5px"
    fontWeight: 600
    letterSpacing: "-0.01em"
  body:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "12.5px"
    fontWeight: 550
  mono:
    fontFamily: "'Fragment Mono', ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "11px"
    fontWeight: 400
    fontVariation: "font-variant-numeric: tabular-nums"
  button:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "13.5px"
    fontWeight: 500
  heading:
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "16px"
    fontWeight: 600
  stat-numeral:
    fontFamily: "'Fragment Mono', ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "21px"
    fontWeight: 400
  mono-caption:
    fontFamily: "'Fragment Mono', ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "10px"
    fontWeight: 400
  mono-micro:
    fontFamily: "'Fragment Mono', ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "9.5px"
    fontWeight: 400
rounded:
  scrollbar: "3px"
  thumb: "4px"
  small: "6px"
  nested: "7px"
  control: "8px"
  toast: "9px"
  card: "10px"
  badge: "11px"
  modal: "12px"
  pill: "999px"
  bubble: "50%"
  print-tag: "2pt"
  print-why: "3pt"
spacing:
  xs: "8px"
  sm: "12px"
  md: "18px"
  lg: "26px"
components:
  button-primary:
    backgroundColor: "{colors.red}"
    textColor: "#FFFFFF"
    rounded: "{rounded.control}"
    padding: "8px 14px"
  button-primary-hover:
    backgroundColor: "{colors.red-deep}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 14px"
  button-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "9px 18px"
  button-ghost:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.control}"
    padding: "9px 16px"
  chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "5px 12px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "9px 12px"
  tag:
    rounded: "{rounded.pill}"
    padding: "2.5px 8px"
  callout-bubble:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.red}"
    rounded: "{rounded.bubble}"
    size: "31px"
---

# Design System: Redline

## Overview

**Creative North Star: "The Clean Studio"**

Redline reads like a document produced in a calm architecture studio: warm paper ground, white cards, near-black ink, hairline rules, and generous air. The world explicitly refuses the dark drafting-table pastiche and the mono-everywhere costume — Inter carries all prose and UI; Fragment Mono appears only where a studio document would use precise figures. One red accent (#B93A2B) is the reviewer's pen, and it stays scarce so that when it appears it means something.

Structure comes from paper conventions, not chrome: 1px hairlines divide, dashed hairlines invite (empty states, attach affordances), and depth is two soft ambient shadows on white cards. Status is hue-coded — red for the reviewer's open marks, blue for Agreed, amber for Deferred — because the list lives for months and its state must be scannable at a glance. Red itself remains exclusive to the reviewer's marks: callout bubbles, Must, Open, Why, focus, caret, selection.

The print output is not a styled screen; it is a second, dedicated document built with the same embedded faces and the same semantic hues, tuned for A4 ink-on-white.

**Key Characteristics:**
- Warm paper ground (#F6F6F4) with white cards and 1px hairline structure
- One accent, semantically locked: red is the reviewer's pen
- Hue-coded status: red Open · blue Agreed · amber Deferred · gray Rejected
- Inter for everything verbal; Fragment Mono strictly for figures
- Numbered circular callout bubble as the signature mark, on screen and in print
- Soft ambient depth, 10px card radii, quick quiet motion

## Colors

A restrained ink-on-paper neutral ramp with three semantic hues, each carrying a matching pale tint for field backgrounds.

### Primary
- **Reviewer's Red** (#B93A2B): the pen. Callout bubbles and pins, the Must tag, the Open status, the Why field's label and tint, the primary button, text caret, selection wash, and every focus treatment. Deepens to **Pressed Red** (#A03123) on primary-button hover; washes to **Red Tint** (#FAF0EE) behind Why fields.

### Secondary
- **Agreed Blue** (#2F6CB3): the Agreed status hue — bubbles, tags, status buttons, print pins — and reference links (`.ref`). Pale field: **Blue Tint** (#EEF3F9).

### Tertiary
- **Deferred Amber** (#8A6508): the Deferred status hue, same surfaces as blue. Deliberately dark (ochre, not yellow) so amber text passes on white. Pale field: **Amber Tint** (#F8F2E1).

### Neutral
- **Paper** (#F6F6F4): page ground.
- **Surface** (#FFFFFF): cards, inputs, buttons — anything that sits on paper.
- **Surface-2** (#FAFAF8): hover fills, subordinate footers (modal foot), quiet tag fills.
- **Ink** (#1B1D20): primary text, dark buttons, selected chips.
- **Ink-2** (#565B61): secondary text, field labels, muted controls; the Rejected state hue.
- **Ink-3** (#6B7178): hints, placeholders, dates, footers.
- **Hairline** (#E7E7E3): card borders and internal dividers. (The direction contract planned #E6E6E2; the build shipped #E7E7E3 — the build wins.)
- **Rule** (#D8D8D2): slightly firmer lines — input borders, section underlines, dashed empties.

### Named Rules
**The Reviewer's Pen Rule.** Red belongs to the reviewer's marks only: callout bubbles/pins, Must, Open, the Why field, primary action, caret, selection, focus. It never decorates, and it never labels anyone else's state.

**The Status Hue Rule.** Agreed is blue, Deferred is amber, Rejected is grayed ink — applied identically to tags, status buttons, callout bubbles, and print pins. Hue is the state's identity; never encode status with a hue outside this set.

**The Tint-Pair Rule.** Each semantic hue has one pale tint (red-tint / blue-tint / amber-tint) used only as a field or tag background beneath text in the full-strength hue. No mid-strength intermediates exist.

## Typography

**UI/Body Font:** Inter (variable 400–700, latin subset, self-hosted and embedded; falls back to -apple-system, Segoe UI, sans-serif)
**Figure Font:** Fragment Mono (latin subset, self-hosted; falls back to ui-monospace, Menlo)

**Character:** A modern workhorse sans doing all the talking, tightened slightly at display sizes (-0.01 to -0.022em), with a typewriter-precise mono reserved for the document's numbers. The contrast between the two is the page's texture.

### Hierarchy
- **Display** (650, clamp(24px, 4.5vw, 31px), 1.15, -0.022em): the editable project name only.
- **Title** (600, 14.5–16px, -0.01em): section/layer titles, editor and modal headings, note locations (13.5px).
- **Body** (400, 15px base; 14–14.5px in fields and note lines, 1.5–1.55): prose, inputs, note content.
- **Label** (500–550, 12–12.5px): field labels, stat captions, hints, small buttons (13–13.5px at weight 500–600).
- **Figures** (Fragment Mono 400, 9.5–12.5px UI · 21px stat numerals, tabular-nums always): note numbers, dates, counts, layer numbers, sheet names, drawing refs, meta blocks.

### Named Rules
**The Numbers-Only Mono Rule.** Fragment Mono is reserved for figures and document identifiers — note numbers, dates, counts, layer numbers, sheet filenames, refs. It never sets prose, headings, labels, or buttons (sheet-tab buttons carrying filenames are identifiers, not labels). Always paired with `font-variant-numeric: tabular-nums`.

**The Quiet-Weight Rule.** Mono figures stay at weight 400 even at display size (the 21px stat numerals); emphasis in mono comes from size and color, never boldness.

## Layout

Single centered column, `max-width: 880px`, on a paper ground with `36px 20px 110px` page padding (16px/12px under 620px). Density is a document's, not a dashboard's: cards separated by 10–24px gaps, card interiors padded 16–26px, fields on a 15px rhythm. Internal structure is hairline-divided — the title block's five-stat row is a bordered grid (5 columns, collapsing to 3 on mobile), layer sections open with a hairline-underlined baseline row (mono number · title · lock note pushed right). One breakpoint at 620px: two-column field grids stack, the callout bubble moves inline above the note, note thumbnails go full-width, definition-list rows stack. The sheet shelf is the sole horizontal scroller, with a slim 6px custom scrollbar in rule gray.

## Elevation & Depth

Depth is soft and ambient, never structural: every raised surface pairs a 1px hairline border with one of two shadow tokens. There are no hard offsets, no glows outside focus, and no tonal-elevation ramp — surfaces are white; hierarchy comes from the border-plus-shadow pairing and the paper behind it.

### Shadow Vocabulary
- **Resting** (`box-shadow: 0 1px 2px rgba(27,29,32,.05), 0 10px 28px -14px rgba(27,29,32,.14)`): cards at rest — title block, note cards, sheet cards.
- **Lifted** (`box-shadow: 0 2px 6px rgba(27,29,32,.07), 0 24px 56px -20px rgba(27,29,32,.24)`): the working editor, modal dialog, toast — anything demanding attention.

### Named Rules
**The Border-Plus-Shadow Rule.** No surface floats on shadow alone; every elevated element also carries its 1px hairline border. In print, shadows drop and the border does all the work.

## Shapes

Rounded-rectangle paper language on a fixed scale: 10px (`--r`) for cards and dashed empty states, 8px for controls (buttons, inputs, chips-as-buttons, sheet cards), 12px for the modal, 6–7px for small nested elements (mini buttons, thumbnails, tabs), full pills (999px) for tags and filter chips, and perfect circles for the signature callout bubbles. Borders are 1px hairline or rule gray as a rule; 1.5px is reserved for emphasis strokes (callout bubble ring, Prefer tag, focused project name). Dashed borders mean "invitation": empty states and the attach-pin affordance (which solidifies and turns red on hover).

## Components

### Buttons
- **Shape:** softly rounded (8px), 13.5px text.
- **Primary:** Reviewer's Red fill, white text, weight 600, `8px 14px`; hover deepens to Pressed Red.
- **Secondary (default `.btn`):** white fill, 1px rule border, ink text, weight 500; hover fills Surface-2 and firms the border (#C2C2BB).
- **Dark (commit action):** ink fill, white text, weight 600, `9px 18px`; hover goes full black. Used for "save note" — the commit is ink, not red.
- **Ghost:** transparent, 1px rule border, Ink-2 text; hover darkens border and text.
- **States:** disabled at .45–.5 opacity; transitions at .14s ease; focus via the global red `:focus-visible` outline.

### Chips (filters)
- **Style:** borderless transparent pills (999px), 12.5px/500 Ink-2 text, `5px 12px`.
- **State:** hover gains a white fill and hairline; selected (`aria-pressed`) inverts to solid ink with white text.

### Cards / Containers
- **Corner Style:** 10px.
- **Background:** Surface white on Paper ground.
- **Shadow Strategy:** Resting shadow; Lifted for the editor/modal/toast (see Elevation & Depth).
- **Border:** always 1px Hairline.
- **Internal Padding:** 16–26px; note cards reserve a 62px left gutter for the callout bubble.

### Inputs / Fields
- **Style:** white fill, 1px rule border, 8px radius, `9px 12px`, 14.5px text; labels 12.5px/550 Ink-2 above; placeholders Ink-3. Selects use an inline SVG chevron (no native arrow).
- **Focus:** border turns Reviewer's Red plus a 3px soft red ring (`rgba(185,58,43,.13)`) — the pen touching the field.
- **The Why field:** label in red at weight 600, textarea washed Red Tint with a matching border, clearing to white on focus. The "why" is visually mandatory.
- **Inline editable text** (project name, sheet names): borderless and transparent at rest; hover/focus reveals a Surface-2 fill, the project name adding an inset 1.5px red ring.

### Tags (firmness & status)
11px pills (`2.5px 8px`, 999px), weight 550, +0.015em:
- **Must:** solid red, white text — the only filled firmness tag.
- **Prefer:** white with a 1.5px ink border, weight 600.
- **Question:** Surface-2 fill, Ink-2 text, hairline border.
- **Open:** transparent with red text and 1px red border.
- **Agreed:** Blue Tint fill, blue text, pale blue border (#C6D8EC).
- **Deferred:** Amber Tint fill, amber text, pale amber border (#E8DCB8).
- **Rejected:** Surface-2, Ink-2, hairline — visually retired; the whole rejected note also drops to .6 opacity.

### Numbered Callout Bubble (signature)
The product's mark, identical in grammar everywhere: a circle with a 1.5px ring in the note's status hue, white (or near-white translucent, `rgba(255,255,255,.92–.93)`) fill, and the permanent note number in Fragment Mono tabular figures. Sizes: 31px on note cards (mono 10.5px), 25–26px on placement stages and thumbnails (9.5–10px), 22pt in the print list, 19pt as print plan pins. The active pin during placement inverts — solid red, white number, with a 5px soft red halo. Status recolors the ring and number (blue/amber/gray); it never changes the shape.

### Navigation / Toolbar
No nav chrome; a wrapping flex toolbar of secondary buttons with one primary (red) action and a `.spacer` pushing utilities right, followed by the chip filter row. Mobile is the same toolbar wrapped, not collapsed.

### Toast
Ink pill-card (9px radius), white 13px/500 text, Lifted shadow, rising from bottom-center with the `rise` motion.

### The Print Document (part of the system)
The Print button builds a standalone A4 document (14mm margins) — not a print stylesheet over the screen. Same embedded Inter + Fragment Mono; 10.5pt/1.5 body on pure white with near-black #111 ink. Structure is drawn entirely with rules: a 2pt ink rule under the header, 1–1.5pt rules under layer and sheet heads, 0.6pt hairlines between notes. Tags become uppercase 7pt rectangles (2pt radius, 1pt border); Must inverts to solid black (ink economy — red stays for the marks). Callout bubbles (22pt) and plan pins (19pt, percent-positioned over full-width sheet images) keep the exact status-hue grammar of the screen. The Why line keeps a warm tint (#F5EAE8). Each plan sheet starts on its own page; layers and notes avoid page breaks. A minimal `@media print` fallback exists in the screen stylesheet but the dedicated document is the canonical print system.

## Motion

Quiet and quick. State transitions (background, border, color, shadow) run at .14s ease. Entrances use two named keyframes on a decisive ease-out (`cubic-bezier(.16,1,.3,1)`): `slip` (.3s, 6px drop-in for new note cards) and `rise` (.22–.26s, 10px rise for modal and toast), plus an .18s `fadein` for the scrim. `prefers-reduced-motion` kills all animation and transitions globally.

**The Two-Verbs Rule.** Elements either slip in (in-flow cards) or rise (overlays); nothing bounces, slides sideways, or animates on exit.

## Do's and Don'ts

### Do:
- **Do** keep red exclusively on the reviewer's marks: bubbles/pins, Must, Open, Why, primary action, caret, selection, focus (The Reviewer's Pen Rule).
- **Do** color every status surface consistently — blue Agreed, amber Deferred, grayed-ink Rejected — on tags, buttons, bubbles, and print pins alike (The Status Hue Rule).
- **Do** set every number, date, count, and drawing ref in Fragment Mono with tabular-nums at weight 400.
- **Do** pair every elevated surface with a 1px hairline border and one of the two shadow tokens.
- **Do** use dashed rule-gray borders for empty states and attach affordances, solidifying on hover.
- **Do** build print output as a dedicated document with the same embedded faces and the same status-hue grammar.

### Don't:
- **Don't** set prose, headings, labels, or button text in Fragment Mono — the mono-everywhere costume is the world this build replaced.
- **Don't** use dark surfaces, hard offset shadows, glows (outside the focus ring and active-pin halo), or gradients; depth is the two ambient tokens only.
- **Don't** introduce new status hues, or use blue/amber outside status semantics (blue's one extra job is reference links).
- **Don't** bold mono figures or let numerals fall out of tabular alignment.
- **Don't** restyle the callout bubble per context — size may change, the ring-circle-mono-number anatomy may not.
- **Don't** fill any firmness tag except Must; Prefer stays white with its 1.5px ink border at weight 600.
