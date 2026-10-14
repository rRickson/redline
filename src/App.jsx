import { useEffect, useRef, useState } from 'react'
import { EMPTY_DOC, LAYERS, today, uid } from './model.js'
import * as store from './storage.js'
import { pdfToSheets, imageToSheet, blobToDataUrl, dataUrlToBlob } from './sheets.js'
import { printRedline, buildPrintHtml } from './print.js'
import { LOCALES, useI18n } from './i18n/index.js'
import Editor from './components/Editor.jsx'
import NoteCard from './components/NoteCard.jsx'
import SheetShelf from './components/SheetShelf.jsx'
import PinPlacer from './components/PinPlacer.jsx'

function PlusIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true">
      <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default function App() {
  const { t, lang, setLang } = useI18n()
  const [db, setDb] = useState(null)
  const [filter, setFilter] = useState('all')
  const [editing, setEditing] = useState(undefined) // undefined = closed, null = new, item = edit
  const [placer, setPlacer] = useState(null) // {noteNum, initial, onDone} | {browse, sheetId}
  const [sheetUrls, setSheetUrls] = useState({})
  const [toast, setToastMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef(null)
  const backupRef = useRef(null)
  const toastTimer = useRef(null)
  const whyNudged = useRef(false)

  function showToast(msg, ms = 2400) {
    setToastMsg(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(null), ms)
  }

  // ---------- load ----------
  useEffect(() => {
    ;(async () => {
      const doc = (await store.getDoc()) || { ...EMPTY_DOC, project: t('defaultProject') }
      doc.sheets = doc.sheets || []
      doc.items = (doc.items || []).map(i => ({ pin: null, ...i }))
      const urls = {}
      for (const s of doc.sheets) {
        const blob = await store.getBlob(s.id)
        if (blob) urls[s.id] = URL.createObjectURL(blob)
      }
      setSheetUrls(urls)
      setDb(doc)
      if (!(await store.storageHealthy())) {
        showToast(t('toast.storageLimited'), 6000)
      }
    })()
  }, [])

  function commit(next) {
    setDb(next)
    store.setDoc(next).catch(() => showToast(t('toast.saveFailed'), 5000))
  }

  // inspection hook: with ?printdebug, expose the print document's HTML
  useEffect(() => {
    if (!db || !window.location.search.includes('printdebug')) return
    window.__printHtml = async () => {
      const urls = {}
      for (const s of db.sheets) {
        const b = await store.getBlob(s.id)
        if (b) urls[s.id] = await blobToDataUrl(b)
      }
      return buildPrintHtml(db, urls, t, lang)
    }
  }, [db, t, lang])

  if (!db) return null

  // ---------- notes ----------
  function saveNote(v, pin) {
    if (!v.where && !v.want) {
      showToast(t('toast.needWhereOrWant'))
      return
    }
    // The why is the framework's critical field: nudge once, never block.
    if (!v.why && !whyNudged.current) {
      whyNudged.current = true
      showToast(t('toast.whyNudge'), 4000)
      document.getElementById('fWhy')?.focus()
      return
    }
    if (editing) {
      const items = db.items.map(i =>
        i.id === editing.id ? { ...i, ...v, pin } : i,
      )
      commit({ ...db, items })
      showToast(t('toast.noteUpdated', { num: editing.num }))
    } else {
      const k = String(v.layer)
      const seq = { ...db.seq, [k]: (db.seq[k] || 0) + 1 }
      const num = v.layer + '.' + seq[k]
      const item = {
        ...v,
        pin,
        id: uid(),
        num,
        status: 'open',
        created: today(),
        statusDate: '',
      }
      commit({ ...db, seq, items: [...db.items, item] })
      showToast(t('toast.noteAdded', { num }))
    }
    whyNudged.current = false
    setEditing(undefined)
  }

  function setStatus(item, s) {
    const items = db.items.map(i =>
      i.id === item.id
        ? { ...i, status: i.status === s ? 'open' : s, statusDate: today() }
        : i,
    )
    commit({ ...db, items })
  }

  function deleteNote(item) {
    if (!confirm(t('confirm.deleteNote', { num: item.num }))) return
    commit({ ...db, items: db.items.filter(i => i.id !== item.id) })
    showToast(t('toast.noteDeleted'))
  }

  // ---------- sheets ----------
  async function handleUpload(e) {
    const files = [...e.target.files]
    e.target.value = ''
    if (!files.length) return
    setBusy(true)
    try {
      const made = []
      for (const f of files) {
        if (f.type === 'application/pdf' || /\.pdf$/i.test(f.name)) {
          const pages = await pdfToSheets(f, (p, n) =>
            showToast(t('toast.splitting', { name: f.name, p, n }), 10000),
          )
          made.push(...pages)
        } else if (f.type.startsWith('image/')) {
          made.push(await imageToSheet(f))
        } else {
          showToast(t('toast.skippedFile', { name: f.name }))
        }
      }
      const newSheets = []
      const addedUrls = {}
      for (const m of made) {
        const id = uid()
        await store.putBlob(id, m.blob)
        addedUrls[id] = URL.createObjectURL(m.blob)
        newSheets.push({ id, name: m.name, w: m.w, h: m.h })
      }
      setSheetUrls(prev => ({ ...prev, ...addedUrls }))
      setDb(prev => {
        const next = { ...prev, sheets: [...prev.sheets, ...newSheets] }
        store.setDoc(next).catch(() => showToast(t('toast.saveFailed'), 5000))
        return next
      })
      if (made.length) {
        showToast(t('toast.sheetsAdded', { n: made.length }))
      }
    } catch (err) {
      console.error(err)
      showToast(t('toast.readFailed'), 4000)
    } finally {
      setBusy(false)
    }
  }

  function renameSheet(sheet, name) {
    commit({
      ...db,
      sheets: db.sheets.map(s => (s.id === sheet.id ? { ...s, name } : s)),
    })
  }

  function deleteSheet(sheet) {
    const pinned = db.items.filter(i => i.pin && i.pin.sheetId === sheet.id).length
    if (!confirm(t('confirm.deleteSheet', { name: sheet.name, pinned }))) return
    store.deleteBlob(sheet.id)
    if (sheetUrls[sheet.id]) URL.revokeObjectURL(sheetUrls[sheet.id])
    setSheetUrls(({ [sheet.id]: _, ...rest }) => rest)
    commit({
      ...db,
      sheets: db.sheets.filter(s => s.id !== sheet.id),
      items: db.items.map(i =>
        i.pin && i.pin.sheetId === sheet.id ? { ...i, pin: null } : i,
      ),
    })
    showToast(t('toast.sheetRemoved'))
  }

  // ---------- pin placer ----------
  function placeFromEditor(currentPin, cb) {
    setPlacer({
      noteNum: editing ? editing.num : t('newPinLabel'),
      initial: currentPin,
      onDone: pin => {
        cb(pin)
        setPlacer(null)
      },
    })
  }

  function placeFromCard(item) {
    setPlacer({
      noteNum: item.num,
      initial: item.pin,
      onDone: pin => {
        commit({
          ...db,
          items: db.items.map(i => (i.id === item.id ? { ...i, pin } : i)),
        })
        setPlacer(null)
        showToast(t(pin ? 'toast.pinMoved' : 'toast.pinRemoved'))
      },
    })
  }

  function browseSheet(sheet) {
    setPlacer({ browse: true, sheetId: sheet.id })
  }

  // ---------- print ----------
  async function handlePrint() {
    setBusy(true)
    try {
      await printRedline(db, store.getBlob, t, lang)
    } catch (err) {
      console.error(err)
      showToast(t('toast.printFailed'), 4000)
    } finally {
      setBusy(false)
    }
  }

  // ---------- backup ----------
  async function exportBackup() {
    setBusy(true)
    try {
      const sheetsData = {}
      for (const s of db.sheets) {
        const blob = await store.getBlob(s.id)
        if (blob) sheetsData[s.id] = await blobToDataUrl(blob)
      }
      const payload = { ...db, sheetsData }
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'redline-' + today() + '.json'
      a.click()
      URL.revokeObjectURL(a.href)
      showToast(t('toast.backupSaved'))
    } finally {
      setBusy(false)
    }
  }

  async function importBackup(e) {
    const f = e.target.files[0]
    e.target.value = ''
    if (!f) return
    setBusy(true)
    try {
      const d = JSON.parse(await f.text())
      if (!d.items) throw new Error('not a redline backup')
      const { sheetsData, ...doc } = d
      doc.sheets = doc.sheets || []
      doc.items = (doc.items || []).map(i => ({ pin: null, ...i }))
      // drop old blobs/urls, load the backup's
      for (const s of db.sheets) store.deleteBlob(s.id)
      Object.values(sheetUrls).forEach(u => URL.revokeObjectURL(u))
      const urls = {}
      for (const s of doc.sheets) {
        const data = sheetsData?.[s.id]
        if (!data) continue
        const blob = await dataUrlToBlob(data)
        await store.putBlob(s.id, blob)
        urls[s.id] = URL.createObjectURL(blob)
      }
      setSheetUrls(urls)
      commit(doc)
      showToast(t('toast.backupLoaded'))
    } catch (err) {
      console.error(err)
      showToast(t('toast.notABackup'), 4000)
    } finally {
      setBusy(false)
    }
  }

  // ---------- derived ----------
  const pass = i =>
    filter === 'all' ||
    (filter === 'open' && i.status === 'open') ||
    (filter === 'must' && i.firm === 'must') ||
    filter === i.status
  const shown = db.items.filter(pass)
  const count = fn => db.items.filter(fn).length

  return (
    <div className="wrap">
      <header className="titleblock">
        <div className="tb-top">
          <div className="tb-name">
            <input
              id="projectName"
              type="text"
              value={db.project}
              aria-label={t('title.projectName')}
              spellCheck={false}
              onChange={e => commit({ ...db, project: e.target.value })}
            />
            <p className="tb-sub">{t('title.subtitle')}</p>
          </div>
          <div className="tb-meta">
            <b>{today()}</b>
            {t('title.noteCount', { n: db.items.length })}
            <select
              className="lang-select"
              value={lang}
              aria-label={t('languageLabel')}
              onChange={e => setLang(e.target.value)}
            >
              {Object.entries(LOCALES).map(([code, m]) => (
                <option key={code} value={code}>{m.langName}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="tb-stats">
          <div className="stat must"><b>{count(i => i.firm === 'must')}</b><span>{t('stats.must')}</span></div>
          <div className="stat"><b>{count(i => i.firm === 'prefer')}</b><span>{t('stats.prefer')}</span></div>
          <div className="stat"><b>{count(i => i.firm === 'question')}</b><span>{t('stats.question')}</span></div>
          <div className="stat"><b>{count(i => i.status === 'open')}</b><span>{t('stats.open')}</span></div>
          <div className="stat agreed"><b>{count(i => i.status === 'agreed')}</b><span>{t('stats.agreed')}</span></div>
        </div>
      </header>

      <div className="toolbar">
        <button className="btn btn-primary" onClick={() => setEditing(null)}>
          <PlusIcon /> {t('toolbar.newNote')}
        </button>
        <button className="btn" disabled={busy} onClick={() => fileRef.current.click()}>
          {busy ? (
            t('toolbar.busy')
          ) : (
            <>
              <PlusIcon /> {t('toolbar.upload')}
            </>
          )}
        </button>
        <div className="spacer" />
        <button className="btn" disabled={busy} onClick={handlePrint}>{t('toolbar.print')}</button>
        <button className="btn" disabled={busy} onClick={exportBackup}>{t('toolbar.saveBackup')}</button>
        <button className="btn" disabled={busy} onClick={() => backupRef.current.click()}>
          {t('toolbar.loadBackup')}
        </button>
      </div>

      <SheetShelf
        sheets={db.sheets}
        sheetUrls={sheetUrls}
        items={db.items}
        onRename={renameSheet}
        onDelete={deleteSheet}
        onView={browseSheet}
      />

      <div className="filters">
        {['all', 'open', 'must', 'agreed', 'deferred'].map(f => (
          <button
            key={f}
            className="chip"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {t('filters.' + f)}
          </button>
        ))}
      </div>

      {editing !== undefined && (
        <Editor
          editing={editing}
          sheets={db.sheets}
          onSave={(v, pin) => saveNote(v, pin)}
          onCancel={() => {
            whyNudged.current = false
            setEditing(undefined)
          }}
          onPlacePin={placeFromEditor}
        />
      )}

      <main>
        {!db.items.length ? (
          <div className="empty">
            <h2>{t('empty.title')}</h2>
            <p>{t('empty.body')}</p>
          </div>
        ) : !shown.length ? (
          <div className="empty">
            <h2>{t('empty.filterTitle')}</h2>
            <p>{t('empty.filterBody')}</p>
          </div>
        ) : (
          LAYERS.map(n => {
            const its = shown.filter(i => i.layer === n)
            if (!its.length) return null
            return (
              <section className="layer" key={n}>
                <div className="layer-head">
                  <span className="layer-num">{n}</span>
                  <h2 className="layer-title">{t(`layers.${n}.title`)}</h2>
                  <span className="layer-lock">{t(`layers.${n}.lock`)}</span>
                </div>
                <div className="layer-items">
                  {its.map(i => (
                    <NoteCard
                      key={i.id}
                      note={i}
                      sheets={db.sheets}
                      sheetUrls={sheetUrls}
                      onStatus={setStatus}
                      onEdit={it => setEditing(it)}
                      onDelete={deleteNote}
                      onOpenPin={placeFromCard}
                    />
                  ))}
                </div>
              </section>
            )
          })
        )}
      </main>

      <p className="foot">{t('foot')}</p>

      {toast && (
        <div className="toast" role="status">{toast}</div>
      )}

      {placer && !placer.browse && (
        <PinPlacer
          sheets={db.sheets}
          sheetUrls={sheetUrls}
          items={db.items}
          noteNum={placer.noteNum}
          initial={placer.initial}
          onDone={placer.onDone}
          onCancel={() => setPlacer(null)}
        />
      )}
      {placer && placer.browse && (
        <PinPlacer
          sheets={db.sheets}
          sheetUrls={sheetUrls}
          items={db.items}
          noteNum={null}
          initial={{ sheetId: placer.sheetId, browseOnly: true }}
          onDone={null}
          onCancel={() => setPlacer(null)}
        />
      )}

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,image/*"
        multiple
        hidden
        onChange={handleUpload}
      />
      <input ref={backupRef} type="file" accept=".json" hidden onChange={importBackup} />
    </div>
  )
}
