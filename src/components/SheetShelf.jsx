export default function SheetShelf({ sheets, sheetUrls, items, onRename, onDelete, onView }) {
  if (!sheets.length) return null
  return (
    <section className="shelf" aria-label="Plantas do projeto">
      <div className="shelf-head">
        <h2 className="shelf-title">Plantas</h2>
        <span className="shelf-hint">Clique numa planta para ver as marcações</span>
      </div>
      <div className="shelf-row">
        {sheets.map(s => {
          const pinCount = items.filter(i => i.pin && i.pin.sheetId === s.id).length
          return (
            <div className="sheet-card" key={s.id}>
              {sheetUrls[s.id] && (
                <img
                  className="thumb"
                  src={sheetUrls[s.id]}
                  alt={s.name}
                  onClick={() => onView(s)}
                />
              )}
              <input
                className="s-name"
                value={s.name}
                onChange={e => onRename(s, e.target.value)}
                aria-label="Nome da planta"
                spellCheck={false}
              />
              {pinCount > 0 && <span className="s-pins">{pinCount}</span>}
              <button
                className="s-del"
                title="Remover planta"
                aria-label={'Remover a planta ' + s.name}
                onClick={() => onDelete(s)}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                  <path
                    d="M1.5 1.5l7 7M8.5 1.5l-7 7"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
