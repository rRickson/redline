# Contributing to Redline

Thanks for wanting to help! Issues and pull requests are welcome in
**Portuguese or English**. Be kind and assume good intent — this is a small
project maintained in spare time.

## What Redline is (and isn't)

Redline is a deliberately small, **local-first** tool that embeds one
opinionated review method. Contributions that respect these constraints are
easy to merge; ones that fight them will be declined even if well built:

- **No servers, accounts, sync, or telemetry.** Data lives in the user's
  browser; portability happens through the JSON backup. This is a feature,
  not a gap.
- **The review method is the product.** The five fields (Onde · Vejo · Quero
  · **Por quê** · firmeza), the six cost-ordered layers, permanent numbering,
  and dated statuses are the core of the product (see the README's *Why*).
  Changing them needs a strong case in an issue *before* any code.
- **The single-file build must keep working.** `bun run build` must always
  emit a self-contained `dist/index.html` that runs offline from disk. That
  rules out runtime CDN dependencies and network-loaded assets — fonts and
  libraries get embedded.
- **Backups are forever.** `Carregar backup` must keep accepting every JSON
  format ever exported. Migrate old shapes on import; never break them.

## Reporting bugs

Open an issue with:

- What you did, what you expected, what happened instead
- Browser and OS
- Whether you were running `bun run dev`, `bun run preview`, or the built
  single file from disk
- If it involves your data, an exported backup JSON helps enormously —
  **strip anything personal first** (project name, note text) and keep the
  structure

## Proposing features

Open an issue before writing code. Describe the *need* (in the tool's own
spirit: what you see, what you want, and **why**), not just the solution.
Good first contributions:

- **A new language** — see [Adding a language](#adding-a-language)
- Accessibility improvements (keyboard flows in the pin placer, screen-reader
  labels)
- Import/export interop (e.g. CSV/spreadsheet export of the note list)

## Development setup

```bash
bun install
bun run dev                     # hot-reloading dev server
bun run build                   # single-file production build (dist/index.html)
bun run preview                 # serves the built app on :4573
bun scripts/capture.mjs        # (preview running) desktop/mobile/print screenshots
bun scripts/capture.mjs out ja  # …in a given language
```

`?printdebug` on the app URL exposes `window.__printHtml()` for inspecting
the generated print document without opening the print dialog.

## Design rules

[DESIGN.md](DESIGN.md) is the design authority — read it before touching UI.
The rules most often broken by well-meaning PRs:

- **Red belongs to the reviewer's marks only** (callout bubbles, Obrigatório,
  Aberta, the Porquê field, focus, the primary action). Never use it to
  decorate.
- **Status hues are fixed**: blue = Combinada, amber = Adiada, grayed ink =
  Recusada — identically on tags, buttons, bubbles, and print pins.
- **Fragment Mono is for figures only** (numbers, dates, counts, sheet
  names), always with tabular numerals, never bold. Prose and labels are
  Inter.
- **The numbered callout bubble is the signature** — its ring-circle-mono
  anatomy never changes, only its size.
- Every elevated surface pairs a 1px hairline border with one of the two
  shadow tokens; depth is never shadow alone.

New colors, radii, or type sizes must be added to DESIGN.md's frontmatter in
the same PR — an automated detector compares the CSS against it.

## Copy rules

- Every UI string lives in `src/i18n/locales/` — never hardcode text in
  components or in the print document. Add new keys to **all** locales.
- Buttons name actions (Agree, Defer, Reject); tags name states (Agreed,
  Deferred, Rejected)
- Dates stay ISO (`2026-09-08`) in every language — they are figures, set in
  mono
- **pt-BR**: informal but precise `você` register; statuses agree with
  *a nota* (feminine): Aberta, Combinada, Adiada, Recusada
- **zh-CN**: a note is 意见, counted with 条
- **ja**: a note is コメント, counted with 件; polite です・ます for messages

## Adding a language

1. Copy `src/i18n/locales/en.js` to `src/i18n/locales/<code>.js` (a BCP 47
   tag such as `de` or `es-MX`) and translate every value. Values are
   strings with `{placeholders}`, or functions of the params where the
   language needs plurals — see how `en.js` and `pt-BR.js` handle counts.
2. Register it in `LOCALES` in `src/i18n/index.js`, and add its prefix to
   `detectLang()` so browsers in that language pick it automatically.
3. Non-Latin scripts: Inter has no glyphs for them, so add a `:lang()`
   font stack with the script's native system fonts in `src/styles.css` and
   in the print CSS in `src/print.js` (copy the `zh` / `ja` rules). Don't
   embed fonts for it — the single-file build has to stay small.
4. Check the title block, the editor, the pin placer, and the printed
   package in your language, and include screenshots in the PR.

## Pull request checklist

- [ ] One focused change per PR; unrelated refactors go in their own PR
- [ ] `bun run build` succeeds and `dist/index.html` still works offline
      from disk (open it directly in a browser)
- [ ] For UI changes: run `bun scripts/capture.mjs` and include the
      relevant before/after screenshots in the PR description
- [ ] For print changes: include the regenerated print screenshot — the
      printed package is a first-class deliverable, not an afterthought
- [ ] Existing backups still import (test with an old export if you touched
      the doc shape — add migration on import, never a breaking change)
- [ ] No new runtime dependencies without prior discussion in an issue
      (bundle size matters: the whole app ships as one file)
- [ ] UI strings added to every locale, following the copy rules;
      `DESIGN.md` updated if you added any design token

Commit messages: short imperative summary line ("Add English locale",
"Fix pin drift on zoomed sheets"). No strict convention beyond that.

## Code style

Match what's there: functional React with hooks, no state library, plain CSS
with custom properties in `src/styles.css`, no CSS-in-JS. Prettier-ish
formatting (2 spaces, no semicolons in JS modules where the file already
omits them). Comments only for constraints the code can't express.

## License

By contributing you agree your contributions are licensed under the
project's [MIT license](LICENSE).
