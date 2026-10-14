import { useEffect, useRef, useState } from 'react'
import { FIRMS, LAYERS } from '../model.js'
import { useI18n } from '../i18n/index.js'

function PinIcon({ filled }) {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="6.5" cy="6.5" r="1.7" fill={filled ? 'currentColor' : 'none'}
        stroke={filled ? 'none' : 'currentColor'} strokeWidth="1.2" />
    </svg>
  )
}

export default function Editor({
  editing, // item being edited, or null for new
  sheets,
  onSave, // (values, pin) => void
  onCancel,
  onPlacePin, // (currentPin, cb) => void — opens the placer, cb receives new pin
}) {
  const { t } = useI18n()
  const [v, setV] = useState(init(editing))
  const [pin, setPin] = useState(editing?.pin || null)
  const whereRef = useRef(null)

  useEffect(() => {
    setV(init(editing))
    setPin(editing?.pin || null)
    whereRef.current?.focus()
  }, [editing?.id])

  function init(item) {
    return {
      layer: item ? item.layer : 1,
      firm: item ? item.firm : 'must',
      where: item ? item.where : '',
      see: item ? item.see : '',
      want: item ? item.want : '',
      why: item ? item.why : '',
      ref: item ? item.ref || '' : '',
    }
  }
  const set = k => e => setV(s => ({ ...s, [k]: e.target.value }))
  const pinSheet = pin ? sheets.find(s => s.id === pin.sheetId) : null

  return (
    <section className="editor" aria-label={t('editor.aria')}>
      <div className="ed-head">
        {editing
          ? t('editor.editing', { num: <span className="num">{editing.num}</span> })
          : t('toolbar.newNote')}
      </div>

      <div className="grid2">
        <div className="field">
          <label htmlFor="fLayer">
            {t('editor.layer')} <span className="hint">{t('editor.layerHint')}</span>
          </label>
          <select id="fLayer" value={v.layer} onChange={e => setV(s => ({ ...s, layer: +e.target.value }))}>
            {LAYERS.map(n => (
              <option key={n} value={n}>{n} — {t(`layers.${n}.title`)}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="fFirm">{t('editor.firm')}</label>
          <select id="fFirm" value={v.firm} onChange={set('firm')}>
            {FIRMS.map(f => (
              <option key={f} value={f}>{t('editor.firmOption.' + f)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="fWhere">
          {t('editor.where')} <span className="hint">{t('editor.whereHint')}</span>
        </label>
        <input
          id="fWhere"
          ref={whereRef}
          type="text"
          placeholder={t('editor.wherePlaceholder')}
          value={v.where}
          onChange={set('where')}
        />
      </div>

      <div className="field">
        <label>
          {t('editor.pin')} <span className="hint">{t('editor.pinHint')}</span>
        </label>
        <div className="pin-row">
          {pinSheet ? (
            <span className="pin-attached">
              <PinIcon filled />
              {t('editor.pinnedOn', { name: pinSheet.name })}
              <button
                type="button"
                className="mini"
                onClick={() => onPlacePin(pin, setPin)}
              >
                {t('editor.move')}
              </button>
              <button type="button" className="mini del" onClick={() => setPin(null)}>
                {t('editor.remove')}
              </button>
            </span>
          ) : sheets.length ? (
            <button
              type="button"
              className="pin-attach"
              onClick={() => onPlacePin(pin, setPin)}
            >
              <PinIcon />
              {t('editor.pinAttach')}
            </button>
          ) : (
            <span className="hint" style={{ fontSize: 12.5 }}>
              {t('editor.pinNoSheets')}
            </span>
          )}
        </div>
      </div>

      <div className="field">
        <label htmlFor="fSee">{t('editor.see')}</label>
        <textarea
          id="fSee"
          placeholder={t('editor.seePlaceholder')}
          value={v.see}
          onChange={set('see')}
        />
      </div>

      <div className="field">
        <label htmlFor="fWant">{t('editor.want')}</label>
        <textarea
          id="fWant"
          placeholder={t('editor.wantPlaceholder')}
          value={v.want}
          onChange={set('want')}
        />
      </div>

      <div className="field why-field">
        <label htmlFor="fWhy">
          {t('editor.why')} <span className="hint">{t('editor.whyHint')}</span>
        </label>
        <textarea
          id="fWhy"
          placeholder={t('editor.whyPlaceholder')}
          value={v.why}
          onChange={set('why')}
        />
      </div>

      <div className="field">
        <label htmlFor="fRef">
          {t('editor.ref')} <span className="hint">{t('editor.refHint')}</span>
        </label>
        <input id="fRef" type="text" placeholder="https://…" value={v.ref} onChange={set('ref')} />
      </div>

      <div className="ed-actions">
        <button
          className="btn-dark"
          onClick={() => {
            const trimmed = {
              ...v,
              where: v.where.trim(),
              see: v.see.trim(),
              want: v.want.trim(),
              why: v.why.trim(),
              ref: v.ref.trim(),
            }
            onSave(trimmed, pin)
          }}
        >
          {t('editor.save')}
        </button>
        <button className="btn-ghost" onClick={onCancel}>{t('editor.cancel')}</button>
      </div>
    </section>
  )
}
