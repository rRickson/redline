import { useEffect, useRef, useState } from 'react'
import { EMPTY_DOC, LAYERS, today, uid } from './model.js'
import * as store from './storage.js'
import { pdfToSheets, imageToSheet, blobToDataUrl, dataUrlToBlob } from './sheets.js'
import { printRedline, buildPrintHtml } from './print.js'
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
      const doc = (await store.getDoc()) || EMPTY_DOC
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
        showToast('Atenção: armazenamento do navegador limitado — mantenha backups JSON', 6000)
      }
    })()
  }, [])

  function commit(next) {
    setDb(next)
    store.setDoc(next).catch(() => showToast('Não foi possível salvar — exporte um backup!', 5000))
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
      return buildPrintHtml(db, urls)
    }
  }, [db])

  if (!db) return null

  // ---------- notes ----------
  function saveNote(v, pin) {
    if (!v.where && !v.want) {
      showToast('Preencha pelo menos o onde ou o que você quer')
      return
    }
    // The why is the framework's critical field: nudge once, never block.
    if (!v.why && !whyNudged.current) {
      whyNudged.current = true
      showToast('Preencha o porquê — é o campo que traz uma resposta melhor', 4000)
      document.getElementById('fWhy')?.focus()
      return
    }
    if (editing) {
      const items = db.items.map(i =>
        i.id === editing.id ? { ...i, ...v, pin } : i,
      )
      commit({ ...db, items })
      showToast('Nota ' + editing.num + ' atualizada')
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
      showToast('Nota ' + num + ' adicionada')
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
    if (!confirm('Excluir a nota ' + item.num + '? O número não será reutilizado.')) return
    commit({ ...db, items: db.items.filter(i => i.id !== item.id) })
    showToast('Nota excluída')
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
            showToast(`Dividindo ${f.name} — página ${p}/${n}`, 10000),
          )
          made.push(...pages)
        } else if (f.type.startsWith('image/')) {
          made.push(await imageToSheet(f))
        } else {
          showToast('Ignorado: ' + f.name + ' (não é PDF nem imagem)')
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
        store.setDoc(next).catch(() => showToast('Não foi possível salvar — exporte um backup!', 5000))
        return next
      })
      if (made.length) {
        showToast(
          made.length > 1 ? made.length + ' plantas adicionadas' : '1 planta adicionada',
        )
      }
    } catch (err) {
      console.error(err)
      showToast('Não foi possível ler esse arquivo', 4000)
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
    const msg = pinned
      ? `Remover "${sheet.name}"? ${pinned} marcaç${pinned > 1 ? 'ões' : 'ão'} de nota nela ser${pinned > 1 ? 'ão' : 'á'} removida${pinned > 1 ? 's' : ''}.`
      : `Remover "${sheet.name}"?`
    if (!confirm(msg)) return
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
    showToast('Planta removida')
  }

  // ---------- pin placer ----------
  function placeFromEditor(currentPin, cb) {
    setPlacer({
      noteNum: editing ? editing.num : 'nova',
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
        showToast(pin ? 'Marcação movida' : 'Marcação removida')
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
      await printRedline(db, store.getBlob)
    } catch (err) {
      console.error(err)
      showToast('Não foi possível gerar o documento de impressão', 4000)
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
      showToast('Backup salvo')
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
      showToast('Backup carregado')
    } catch (err) {
      console.error(err)
      showToast('Esse arquivo não é um backup do Redline', 4000)
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
              aria-label="Nome do projeto"
              spellCheck={false}
              onChange={e => commit({ ...db, project: e.target.value })}
            />
            <p className="tb-sub">Notas de revisão para o arquiteto</p>
          </div>
          <div className="tb-meta">
            <b>{today()}</b>
            {db.items.length
              ? `${db.items.length} nota${db.items.length > 1 ? 's' : ''}`
              : 'nenhuma nota ainda'}
          </div>
        </div>
        <div className="tb-stats">
          <div className="stat must"><b>{count(i => i.firm === 'must')}</b><span>Obrigatórias</span></div>
          <div className="stat"><b>{count(i => i.firm === 'prefer')}</b><span>Preferências</span></div>
          <div className="stat"><b>{count(i => i.firm === 'question')}</b><span>Perguntas</span></div>
          <div className="stat"><b>{count(i => i.status === 'open')}</b><span>Abertas</span></div>
          <div className="stat agreed"><b>{count(i => i.status === 'agreed')}</b><span>Combinadas</span></div>
        </div>
      </header>

      <div className="toolbar">
        <button className="btn btn-primary" onClick={() => setEditing(null)}>
          <PlusIcon /> Nova nota
        </button>
        <button className="btn" disabled={busy} onClick={() => fileRef.current.click()}>
          {busy ? (
            'Processando…'
          ) : (
            <>
              <PlusIcon /> Enviar plantas (PDF)
            </>
          )}
        </button>
        <div className="spacer" />
        <button className="btn" disabled={busy} onClick={handlePrint}>Imprimir / PDF</button>
        <button className="btn" disabled={busy} onClick={exportBackup}>Salvar backup</button>
        <button className="btn" disabled={busy} onClick={() => backupRef.current.click()}>
          Carregar backup
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
        {[
          ['all', 'Todas'],
          ['open', 'Abertas'],
          ['must', 'Obrigatórias'],
          ['agreed', 'Combinadas'],
          ['deferred', 'Adiadas'],
        ].map(([f, label]) => (
          <button
            key={f}
            className="chip"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {label}
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
            <h2>Nada marcado ainda</h2>
            <p>
              Envie as plantas do arquiteto e percorra uma cena do dia a dia —
              manhã de semana, chegando com as compras, dia de lavar roupa — e
              marque a primeira coisa que travar. Essa é a sua nota 1.1.
            </p>
          </div>
        ) : !shown.length ? (
          <div className="empty">
            <h2>Nenhuma nota neste filtro</h2>
            <p>Volte para Todas para ver o resto da lista.</p>
          </div>
        ) : (
          LAYERS.map(L => {
            const its = shown.filter(i => i.layer === L.n)
            if (!its.length) return null
            return (
              <section className="layer" key={L.n}>
                <div className="layer-head">
                  <span className="layer-num">{L.n}</span>
                  <h2 className="layer-title">{L.t}</h2>
                  <span className="layer-lock">{L.lock}</span>
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

      <p className="foot">A numeração é permanente — a nota 2.3 será sempre a 2.3</p>

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
