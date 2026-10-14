import { useEffect, useRef, useState } from 'react'
import { LAYERS } from '../model.js'

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
    <section className="editor" aria-label="Editor de notas">
      <div className="ed-head">
        {editing ? (
          <>
            Editando a nota<span className="num">{editing.num}</span>
          </>
        ) : (
          'Nova nota'
        )}
      </div>

      <div className="grid2">
        <div className="field">
          <label htmlFor="fLayer">
            Camada <span className="hint">— define a urgência</span>
          </label>
          <select id="fLayer" value={v.layer} onChange={e => setV(s => ({ ...s, layer: +e.target.value }))}>
            {LAYERS.map(L => (
              <option key={L.n} value={L.n}>{L.n} — {L.t}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="fFirm">Quanto eu faço questão</label>
          <select id="fFirm" value={v.firm} onChange={set('firm')}>
            <option value="must">Obrigatório — não abro mão</option>
            <option value="prefer">Prefiro — aberto a alternativas</option>
            <option value="question">Pergunta — só perguntando</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="fWhere">
          Onde <span className="hint">— prancha, cômodo, parede</span>
        </label>
        <input
          id="fWhere"
          ref={whereRef}
          type="text"
          placeholder="Planta 02 — cozinha, parede norte"
          value={v.where}
          onChange={set('where')}
        />
      </div>

      <div className="field">
        <label>
          Marcação na planta{' '}
          <span className="hint">— marque o ponto exato no desenho</span>
        </label>
        <div className="pin-row">
          {pinSheet ? (
            <span className="pin-attached">
              <PinIcon filled />
              Marcada em {pinSheet.name}
              <button
                type="button"
                className="mini"
                onClick={() => onPlacePin(pin, setPin)}
              >
                Mover
              </button>
              <button type="button" className="mini del" onClick={() => setPin(null)}>
                Remover
              </button>
            </span>
          ) : sheets.length ? (
            <button
              type="button"
              className="pin-attach"
              onClick={() => onPlacePin(pin, setPin)}
            >
              <PinIcon />
              Marcar ponto na planta
            </button>
          ) : (
            <span className="hint" style={{ fontSize: 12.5 }}>
              Envie as plantas do arquiteto (botão acima) para marcar as notas nelas.
            </span>
          )}
        </div>
      </div>

      <div className="field">
        <label htmlFor="fSee">O que eu vejo hoje</label>
        <textarea
          id="fSee"
          placeholder="Só uma tomada perto da bancada"
          value={v.see}
          onChange={set('see')}
        />
      </div>

      <div className="field">
        <label htmlFor="fWant">O que eu quero no lugar</label>
        <textarea
          id="fWant"
          placeholder="Pelo menos três, distribuídas pela bancada"
          value={v.want}
          onChange={set('want')}
        />
      </div>

      <div className="field why-field">
        <label htmlFor="fWhy">
          Por quê <span className="hint">— o campo que traz uma resposta melhor</span>
        </label>
        <textarea
          id="fWhy"
          placeholder="Chaleira, liquidificador e air fryer ligados ao mesmo tempo de manhã"
          value={v.why}
          onChange={set('why')}
        />
      </div>

      <div className="field">
        <label htmlFor="fRef">
          Link de referência <span className="hint">— opcional, para qualquer coisa visual</span>
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
          Salvar nota
        </button>
        <button className="btn-ghost" onClick={onCancel}>Cancelar</button>
      </div>
    </section>
  )
}
