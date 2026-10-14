// Dedicated print document. The on-screen page is not what the architect
// receives: the Print button builds a standalone document in a hidden iframe,
// with sheet images embedded as data URLs, and prints only after every image
// has finished loading — object URLs + @media print proved unreliable.
import { LAYERS, FIRM, STAT, today } from './model.js'
import { blobToDataUrl } from './sheets.js'
import { FONT_CSS } from './fonts.js'

const esc = s =>
  String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

const CSS = `
${FONT_CSS}
@page{size:A4;margin:14mm}
*{box-sizing:border-box}
body{
  margin:0;color:#111;background:#fff;
  font:10.5pt/1.5 'Inter',-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;
}
.mono{font-family:'Fragment Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-variant-numeric:tabular-nums}
header{display:flex;align-items:flex-end;gap:12pt;border-bottom:2pt solid #111;padding-bottom:8pt}
h1{font-size:19pt;font-weight:700;letter-spacing:-.02em;margin:0;flex:1 1 auto}
.doc-meta{text-align:right;font-size:8pt;color:#444;line-height:1.7}
.legend{display:flex;gap:14pt;font-size:8pt;color:#444;margin:6pt 0 0}
.layer{margin-top:16pt;break-inside:avoid-page}
.layer-head{display:flex;align-items:baseline;gap:8pt;border-bottom:1pt solid #111;padding-bottom:3pt;margin-bottom:8pt}
.layer-num{font-size:9pt;color:#B93A2B}
.layer-title{font-size:11.5pt;font-weight:700;margin:0}
.layer-lock{margin-left:auto;font-size:7.5pt;color:#666}
.note{display:flex;gap:9pt;padding:7pt 0;border-bottom:.6pt solid #DDD;break-inside:avoid}
.note:last-child{border-bottom:none}
.bubble{
  flex:0 0 auto;width:22pt;height:22pt;border-radius:50%;
  border:1.2pt solid #B93A2B;color:#B93A2B;
  display:flex;align-items:center;justify-content:center;font-size:7.5pt;
}
.s-agreed .bubble{border-color:#2F6CB3;color:#2F6CB3}
.s-deferred .bubble{border-color:#8A6508;color:#8A6508}
.s-rejected .bubble{border-color:#999;color:#999}
.n-main{flex:1 1 auto;min-width:0}
.n-top{display:flex;flex-wrap:wrap;align-items:baseline;gap:6pt}
.n-where{font-weight:700;font-size:10.5pt;margin-right:auto}
.tag{font-size:7pt;font-weight:600;letter-spacing:.04em;text-transform:uppercase;
  border:1pt solid #999;border-radius:2pt;padding:1pt 4pt;color:#444}
.tag.must{background:#111;border-color:#111;color:#fff}
.tag.st-open{border-color:#B93A2B;color:#B93A2B}
.tag.st-agreed{border-color:#2F6CB3;color:#2F6CB3}
.tag.st-deferred{border-color:#8A6508;color:#8A6508}
.line{display:flex;gap:8pt;padding:1.2pt 0;font-size:10pt}
.line dt{flex:0 0 52pt;font-size:8pt;font-weight:600;color:#666;padding-top:1.2pt}
.line dd{margin:0;flex:1}
.line.why{background:#F5EAE8;border-radius:3pt;padding:2.5pt 5pt;margin:2.5pt 0 0 -5pt}
.line.why dt{color:#B93A2B}
dl{margin:2.5pt 0 0}
.n-date{font-size:7.5pt;color:#888;margin-top:2pt}
.sheet{break-before:page;padding-top:2pt}
.sheet-head{display:flex;align-items:baseline;gap:8pt;border-bottom:1.5pt solid #111;padding-bottom:4pt;margin-bottom:8pt}
.sheet-name{font-size:12pt;font-weight:700;margin:0}
.sheet-sub{margin-left:auto;font-size:7.5pt;color:#666}
.stage{position:relative;border:1pt solid #999}
.stage img{display:block;width:100%;height:auto}
.ps-pin{
  position:absolute;transform:translate(-50%,-50%);
  width:19pt;height:19pt;border-radius:50%;
  border:1.3pt solid #B93A2B;background:rgba(255,255,255,.93);color:#B93A2B;
  display:flex;align-items:center;justify-content:center;font-size:6.8pt;font-weight:600;
}
.ps-pin.s-agreed{border-color:#2F6CB3;color:#2F6CB3}
.ps-pin.s-deferred{border-color:#8A6508;color:#8A6508}
.ps-pin.s-rejected{border-color:#999;color:#999}
`

function noteHtml(i) {
  return `<div class="note s-${i.status}">
    <div class="bubble mono">${esc(i.num)}</div>
    <div class="n-main">
      <div class="n-top">
        <span class="n-where">${esc(i.where) || 'Local não definido'}</span>
        <span class="tag ${i.firm}">${FIRM[i.firm]}</span>
        <span class="tag st-${i.status}">${STAT[i.status]}${
          i.status !== 'open' && i.statusDate ? ' ' + esc(i.statusDate) : ''
        }</span>
      </div>
      <dl>
        ${i.see ? `<div class="line"><dt>Vejo</dt><dd>${esc(i.see)}</dd></div>` : ''}
        ${i.want ? `<div class="line"><dt>Quero</dt><dd>${esc(i.want)}</dd></div>` : ''}
        ${i.why ? `<div class="line why"><dt>Porque</dt><dd>${esc(i.why)}</dd></div>` : ''}
        ${i.ref ? `<div class="line"><dt>Ref</dt><dd>${esc(i.ref)}</dd></div>` : ''}
      </dl>
      <div class="n-date mono">Criada em ${esc(i.created)}</div>
    </div>
  </div>`
}

export function buildPrintHtml(db, sheetDataUrls) {
  const open = db.items.filter(i => i.status === 'open').length
  const layers = LAYERS.map(L => {
    const its = db.items.filter(i => i.layer === L.n)
    if (!its.length) return ''
    return `<section class="layer">
      <div class="layer-head">
        <span class="layer-num mono">${L.n}</span>
        <h2 class="layer-title">${esc(L.t)}</h2>
        <span class="layer-lock">${esc(L.lock)}</span>
      </div>
      ${its.map(noteHtml).join('')}
    </section>`
  }).join('')

  const sheets = db.sheets
    .map(s => ({ s, pins: db.items.filter(i => i.pin && i.pin.sheetId === s.id) }))
    .filter(x => x.pins.length && sheetDataUrls[x.s.id])
    .map(
      ({ s, pins }) => `<section class="sheet">
      <div class="sheet-head">
        <h2 class="sheet-name">${esc(s.name)}</h2>
        <span class="sheet-sub">${pins.length} nota${pins.length > 1 ? 's' : ''} — os números correspondem à lista</span>
      </div>
      <div class="stage">
        <img src="${sheetDataUrls[s.id]}" alt="${esc(s.name)}">
        ${pins
          .map(
            i =>
              `<span class="ps-pin mono s-${i.status}" style="left:${(i.pin.x * 100).toFixed(3)}%;top:${(i.pin.y * 100).toFixed(3)}%">${esc(i.num)}</span>`,
          )
          .join('')}
      </div>
    </section>`,
    )
    .join('')

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8">
<title>${esc(db.project)} — notas de revisão</title><style>${CSS}</style></head><body>
<header>
  <h1>${esc(db.project)}</h1>
  <div class="doc-meta mono">Notas de revisão para o arquiteto<br>${today()} · ${db.items.length} nota${db.items.length === 1 ? '' : 's'} · ${open} em aberto</div>
</header>
<div class="legend">
  <span>Cada nota: o que eu vejo · o que eu quero · <b>por quê</b></span>
  <span>A numeração é permanente e corresponde às marcações nas plantas</span>
</div>
${layers}
${sheets}
</body></html>`
}

export async function printRedline(db, getBlob) {
  const sheetDataUrls = {}
  for (const s of db.sheets) {
    const blob = await getBlob(s.id)
    if (blob) sheetDataUrls[s.id] = await blobToDataUrl(blob)
  }
  const html = buildPrintHtml(db, sheetDataUrls)

  const frame = document.createElement('iframe')
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden'
  document.body.appendChild(frame)
  const doc = frame.contentDocument
  doc.open()
  doc.write(html)
  doc.close()
  await new Promise(resolve => {
    if (doc.readyState === 'complete') resolve()
    else frame.addEventListener('load', resolve, { once: true })
  })
  await Promise.all(
    [...doc.images].map(img =>
      img.complete
        ? null
        : new Promise(r => {
            img.onload = r
            img.onerror = r
          }),
    ),
  )
  if (doc.fonts?.ready) await doc.fonts.ready
  frame.contentWindow.focus()
  frame.contentWindow.print()
  // keep the frame alive while the print dialog is open
  setTimeout(() => frame.remove(), 60000)
}
