// Turning uploaded files (PDF or images) into sheet images.
// pdf.js is bundled; the worker is inlined so the single-file build works offline.

const MAX_DIM = 2600
const JPEG_Q = 0.85

let pdfjsPromise = null
function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/build/pdf.worker.min.mjs?worker&inline'),
    ]).then(([pdfjs, workerMod]) => {
      pdfjs.GlobalWorkerOptions.workerPort = new workerMod.default()
      return pdfjs
    })
  }
  return pdfjsPromise
}

function canvasToJpeg(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      b => (b ? resolve(b) : reject(new Error('canvas.toBlob failed'))),
      'image/jpeg',
      JPEG_Q,
    )
  })
}

function baseName(fileName) {
  return fileName.replace(/\.[^.]+$/, '')
}

// Returns [{name, blob, w, h}] — one entry per PDF page.
export async function pdfToSheets(file, onProgress) {
  const pdfjs = await loadPdfjs()
  const data = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data }).promise
  const out = []
  for (let p = 1; p <= pdf.numPages; p++) {
    onProgress?.(p, pdf.numPages)
    const page = await pdf.getPage(p)
    const vp1 = page.getViewport({ scale: 1 })
    const scale = Math.min(MAX_DIM / Math.max(vp1.width, vp1.height), 4)
    const vp = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(vp.width)
    canvas.height = Math.round(vp.height)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    await page.render({ canvasContext: ctx, viewport: vp }).promise
    out.push({
      name:
        pdf.numPages > 1
          ? `${baseName(file.name)} — p${String(p).padStart(2, '0')}`
          : baseName(file.name),
      blob: await canvasToJpeg(canvas),
      w: canvas.width,
      h: canvas.height,
    })
    page.cleanup()
  }
  await pdf.destroy()
  return out
}

// Returns a single {name, blob, w, h}, downscaled if needed.
export async function imageToSheet(file) {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error('could not read image'))
      el.src = url
    })
    const scale = Math.min(1, MAX_DIM / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return {
      name: baseName(file.name),
      blob: await canvasToJpeg(canvas),
      w: canvas.width,
      h: canvas.height,
    }
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = () => reject(r.error)
    r.readAsDataURL(blob)
  })
}

export async function dataUrlToBlob(dataUrl) {
  return (await fetch(dataUrl)).blob()
}
