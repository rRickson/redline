// Captures review screenshots (desktop, mobile, print document) against the
// preview server, seeding demo data into a fresh browser profile first.
// Usage: bun scripts/capture.mjs [outDir] [locale]
//   outDir defaults to .impeccable/review; locale (e.g. ja, zh-CN, pt-BR) to en-US
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const BASE = 'http://localhost:4573'
const out = resolve(process.argv[2] || '.impeccable/review')
const locale = process.argv[3] || 'en-US'
mkdirSync(out, { recursive: true })

const seed = async page => {
  await page.evaluate(async () => {
    const makeSheet = label => {
      const c = document.createElement('canvas')
      c.width = 2600
      c.height = 1837
      const x = c.getContext('2d')
      x.fillStyle = '#fff'
      x.fillRect(0, 0, c.width, c.height)
      x.strokeStyle = '#111'
      x.lineWidth = 6
      x.strokeRect(120, 200, 2360, 1500)
      x.lineWidth = 4
      x.strokeRect(300, 400, 700, 500)
      x.strokeRect(1150, 400, 600, 500)
      x.strokeRect(300, 1100, 800, 480)
      x.strokeRect(1300, 1100, 900, 480)
      x.font = '100px Helvetica'
      x.fillStyle = '#111'
      x.fillText(label, 140, 140)
      return new Promise(r => c.toBlob(b => r(b), 'image/jpeg', 0.85))
    }
    const [b1, b2] = await Promise.all([
      makeSheet('PLAN 01 - LIVING'),
      makeSheet('PLAN 02 - KITCHEN'),
    ])
    const db = await new Promise((res, rej) => {
      const r = indexedDB.open('redline', 1)
      r.onupgradeneeded = () => {
        r.result.createObjectStore('kv')
        r.result.createObjectStore('blobs')
      }
      r.onsuccess = () => res(r.result)
      r.onerror = () => rej(r.error)
    })
    const put = (store, key, val) =>
      new Promise((res, rej) => {
        const t = db.transaction(store, 'readwrite').objectStore(store).put(val, key)
        t.onsuccess = res
        t.onerror = () => rej(t.error)
      })
    await put('blobs', 's1', b1)
    await put('blobs', 's2', b2)
    const today = new Date().toISOString().slice(0, 10)
    const doc = {
      project: 'Sample Apartment 302',
      seq: { 1: 1, 4: 2 },
      sheets: [
        { id: 's1', name: 'sample-plans — p01', w: 2600, h: 1837 },
        { id: 's2', name: 'sample-plans — p02', w: 2600, h: 1837 },
      ],
      items: [
        { id: 'seed1', num: '1.1', layer: 1, firm: 'prefer', where: 'Living room, entry axis', see: 'The hallway door swings into the circulation path', want: 'Swing reversed or a pocket door', why: 'Arriving with grocery bags, the open door blocks the way to the kitchen', ref: '', status: 'agreed', created: today, statusDate: today, pin: { sheetId: 's1', x: 0.28, y: 0.42 } },
        { id: 'seed2', num: '4.1', layer: 4, firm: 'must', where: 'Kitchen, north wall', see: 'Only one outlet near the counter', want: 'At least three, spread along the run', why: 'Kettle, blender and air fryer all run at the same time in the morning', ref: '', status: 'open', created: today, statusDate: '', pin: { sheetId: 's2', x: 0.62, y: 0.3 } },
        { id: 'seed3', num: '4.2', layer: 4, firm: 'question', where: 'Kitchen, island', see: 'No pendant lights over the island', want: 'Two pendants centered on the island', why: 'It is the main prep surface and the plan lights it only from the ceiling edge', ref: 'https://example.com/pendants', status: 'deferred', created: today, statusDate: today, pin: { sheetId: 's2', x: 0.38, y: 0.62 } },
      ],
    }
    await put('kv', 'doc', JSON.stringify(doc))
    db.close()
  })
}

const browser = await chromium.launch({ channel: 'chrome' })
const ctx = await browser.newContext({ locale, viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()
await page.goto(BASE + '/?printdebug')
await seed(page)
await page.reload()
await page.waitForSelector('.note')
await page.waitForTimeout(600)
await page.screenshot({ path: resolve(out, 'desktop.png'), fullPage: true })

const printHtml = await page.evaluate(() => window.__printHtml())
writeFileSync(resolve(out, 'print.html'), printHtml)
const printPage = await ctx.newPage()
await printPage.setContent(printHtml, { waitUntil: 'load' })
await printPage.emulateMedia({ media: 'print' })
await printPage.setViewportSize({ width: 794, height: 1123 }) // A4 at 96dpi
await printPage.waitForTimeout(400)
await printPage.screenshot({ path: resolve(out, 'print.png'), fullPage: true })
await printPage.close()

await page.setViewportSize({ width: 375, height: 812 })
await page.reload()
await page.waitForSelector('.note')
await page.waitForTimeout(600)
await page.screenshot({ path: resolve(out, 'mobile.png'), fullPage: true })

await browser.close()
console.log('captured to', out)
