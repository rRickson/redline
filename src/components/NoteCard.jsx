import { useI18n } from '../i18n/index.js'

// CSS-cropped thumbnail: shows the region of the sheet around the pin.
function PinThumb({ note, sheet, url, onClick }) {
  const { t } = useI18n()
  const BOX_W = 132
  const BOX_H = 99
  const ZOOM = 4 // background is ZOOM× the box width
  const bgW = BOX_W * ZOOM
  const bgH = (sheet.h / sheet.w) * bgW
  const px = Math.min(Math.max(note.pin.x * bgW, BOX_W / 2), bgW - BOX_W / 2)
  const py = Math.min(Math.max(note.pin.y * bgH, BOX_H / 2), bgH - BOX_H / 2)
  return (
    <button
      type="button"
      className="n-thumb"
      onClick={onClick}
      title={t('note.thumbTitle', { name: sheet.name })}
    >
      <span
        className="t-bg"
        style={{
          backgroundImage: `url(${url})`,
          backgroundSize: `${bgW}px ${bgH}px`,
          backgroundPosition: `${-(px - BOX_W / 2)}px ${-(py - BOX_H / 2)}px`,
        }}
      />
      <span className="t-dot">{note.num}</span>
      <span className="t-sheet">{sheet.name}</span>
    </button>
  )
}

export default function NoteCard({
  note,
  sheets,
  sheetUrls,
  onStatus,
  onEdit,
  onDelete,
  onOpenPin,
}) {
  const { t } = useI18n()
  const i = note
  const sheet = i.pin ? sheets.find(s => s.id === i.pin.sheetId) : null
  return (
    <article className={'note s-' + i.status}>
      <div className="pin">{i.num}</div>
      <div className="n-top">
        <span className="n-where">{i.where || t('note.noPlace')}</span>
        <span className={'tag t-' + i.firm}>{t('firm.' + i.firm)}</span>
        <span className={'tag t-' + i.status}>{t('status.' + i.status)}</span>
      </div>
      <div className="n-body">
        <div className="n-fields">
          <dl>
            {i.see && (
              <div className="line"><dt>{t('note.see')}</dt><dd>{i.see}</dd></div>
            )}
            {i.want && (
              <div className="line"><dt>{t('note.want')}</dt><dd>{i.want}</dd></div>
            )}
            {i.why && (
              <div className="line why"><dt>{t('note.why')}</dt><dd>{i.why}</dd></div>
            )}
            {i.ref && (
              <div className="line">
                <dt>{t('note.ref')}</dt>
                <dd>
                  <a className="ref" href={i.ref} target="_blank" rel="noopener noreferrer">
                    {i.ref}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>
        {sheet && sheetUrls[sheet.id] && (
          <PinThumb
            note={i}
            sheet={sheet}
            url={sheetUrls[sheet.id]}
            onClick={() => onOpenPin(i)}
          />
        )}
      </div>
      <div className="n-foot">
        <span className="n-date">
          {i.status === 'open'
            ? t('note.createdOn', { date: i.created })
            : t('note.statusOn', {
                status: t('status.' + i.status),
                date: i.statusDate || i.created,
              })}
        </span>
        <button
          className="mini on-agreed"
          aria-pressed={i.status === 'agreed'}
          onClick={() => onStatus(i, 'agreed')}
        >
          {t('statusAction.agreed')}
        </button>
        <button
          className="mini on-deferred"
          aria-pressed={i.status === 'deferred'}
          onClick={() => onStatus(i, 'deferred')}
        >
          {t('statusAction.deferred')}
        </button>
        <button
          className="mini on-rejected"
          aria-pressed={i.status === 'rejected'}
          onClick={() => onStatus(i, 'rejected')}
        >
          {t('statusAction.rejected')}
        </button>
        <button className="mini" onClick={() => onEdit(i)}>{t('note.edit')}</button>
        <button className="mini del" onClick={() => onDelete(i)}>{t('note.delete')}</button>
      </div>
    </article>
  )
}
