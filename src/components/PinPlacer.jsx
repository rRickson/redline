import { useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '../i18n/index.js'

// Full-screen modal: pan/zoom over a sheet, click to drop the note's pin.
// `note` may be a draft (unsaved) — the caller decides what to do with the result.
export default function PinPlacer({
  sheets,
  sheetUrls,
  items,
  noteNum, // display number for the pin being placed ("4.2" or "new")
  initial, // {sheetId, x, y} | null
  onDone, // (pin|null) => void  — null means "remove pin"
  onCancel,
}) {
  const { t } = useI18n()
  const browse = noteNum == null
  const [sheetId, setSheetId] = useState(
    initial?.sheetId || sheets[0]?.id || null,
  )
  const [pin, setPin] = useState(browse || !initial?.x ? null : initial)
  const [view, setView] = useState({ scale: 1, tx: 0, ty: 0 })
  const [imgSize, setImgSize] = useState(null) // displayed natural size
  const stageRef = useRef(null)
  const dragRef = useRef(null)

  const sheet = sheets.find(s => s.id === sheetId)
  const url = sheet ? sheetUrls[sheet.id] : null

  // Other notes already pinned on this sheet, for context.
  const otherPins = useMemo(
    () =>
      items.filter(
        i => i.pin && i.pin.sheetId === sheetId && (browse || i.num !== noteNum),
      ),
    [items, sheetId, noteNum, browse],
  )

  // Fit the sheet into the stage when it changes.
  useEffect(() => {
    if (!sheet || !stageRef.current) return
    const box = stageRef.current.getBoundingClientRect()
    const scale = Math.min(box.width / sheet.w, box.height / sheet.h)
    setView({
      scale,
      tx: (box.width - sheet.w * scale) / 2,
      ty: (box.height - sheet.h * scale) / 2,
    })
    setImgSize({ w: sheet.w, h: sheet.h })
  }, [sheetId])

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  function zoomAt(clientX, clientY, factor) {
    setView(v => {
      const box = stageRef.current.getBoundingClientRect()
      const px = clientX - box.left
      const py = clientY - box.top
      const scale = Math.min(Math.max(v.scale * factor, 0.05), 8)
      const k = scale / v.scale
      return {
        scale,
        tx: px - k * (px - v.tx),
        ty: py - k * (py - v.ty),
      }
    })
  }

  function onWheel(e) {
    e.preventDefault()
    zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.15 : 1 / 1.15)
  }

  function onPointerDown(e) {
    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
      tx: view.tx,
      ty: view.ty,
      moved: false,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  function onPointerMove(e) {
    const d = dragRef.current
    if (!d) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (Math.abs(dx) + Math.abs(dy) > 5) d.moved = true
    if (d.moved) setView(v => ({ ...v, tx: d.tx + dx, ty: d.ty + dy }))
  }
  function onPointerUp(e) {
    const d = dragRef.current
    dragRef.current = null
    if (!d || d.moved || !sheet || browse) return
    // A clean click: place the pin at that spot.
    const box = stageRef.current.getBoundingClientRect()
    const x = (e.clientX - box.left - view.tx) / view.scale / sheet.w
    const y = (e.clientY - box.top - view.ty) / view.scale / sheet.h
    if (x < 0 || x > 1 || y < 0 || y > 1) return
    setPin({ sheetId: sheet.id, x, y })
  }

  // Counter-scale so pin bubbles keep their on-screen size at any zoom.
  const pinStyle = p => ({
    left: p.x * (sheet?.w || 1) + 'px',
    top: p.y * (sheet?.h || 1) + 'px',
    transform: `translate(-50%,-50%) scale(${1 / view.scale})`,
  })

  return (
    <div className="modal-scrim" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="placer" role="dialog" aria-label={t('editor.pinAttach')}>
        <div className="placer-head">
          <span className="placer-title">
            {browse
              ? sheet?.name || t('placer.sheet')
              : t('placer.title', { num: <span className="num">{noteNum}</span> })}
          </span>
          <span className="placer-hint">
            {t(browse ? 'placer.hintBrowse' : 'placer.hintPlace')}
          </span>
          <button className="mini" onClick={e => zoomAt(centerX(), centerY(), 1.4)}>
            {t('placer.zoomIn')}
          </button>
          <button className="mini" onClick={e => zoomAt(centerX(), centerY(), 1 / 1.4)}>
            {t('placer.zoomOut')}
          </button>
        </div>

        <div
          className="placer-stage"
          ref={stageRef}
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {url && imgSize && (
            <div
              className="placer-canvas"
              style={{
                transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.scale})`,
              }}
            >
              <img src={url} width={imgSize.w} height={imgSize.h} alt={sheet.name} draggable={false} />
              {otherPins.map(i => (
                <div key={i.id} className="stage-pin" style={pinStyle(i.pin)}>
                  {i.num}
                </div>
              ))}
              {pin && pin.sheetId === sheetId && (
                <div className="stage-pin current" style={pinStyle(pin)}>
                  {noteNum}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="placer-foot">
          <div className="placer-tabs">
            {sheets.map(s => (
              <button
                key={s.id}
                className="ptab"
                aria-pressed={s.id === sheetId}
                onClick={() => setSheetId(s.id)}
                title={s.name}
              >
                {s.name}
              </button>
            ))}
          </div>
          <span className="spacer" />
          {browse ? (
            <button className="btn-dark" onClick={onCancel}>
              {t('placer.close')}
            </button>
          ) : (
            <>
              {initial?.x != null && (
                <button className="btn-ghost" onClick={() => onDone(null)}>
                  {t('placer.removePin')}
                </button>
              )}
              <button className="btn-ghost" onClick={onCancel}>
                {t('placer.cancel')}
              </button>
              <button
                className="btn-dark"
                disabled={!pin}
                onClick={() => pin && onDone(pin)}
              >
                {t('placer.use')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )

  function centerX() {
    const b = stageRef.current.getBoundingClientRect()
    return b.left + b.width / 2
  }
  function centerY() {
    const b = stageRef.current.getBoundingClientRect()
    return b.top + b.height / 2
  }
}
