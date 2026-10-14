// English — the reference locale. Every key here must exist in the others;
// a missing key falls back to this file.
// Values are strings with {placeholders}, or functions of the params
// (used where a language needs plurals).
const plural = (n, one, many) => (n === 1 ? one : many)

export default {
  langName: 'English',
  languageLabel: 'Language',
  docTitle: 'Redline — design review',
  defaultProject: 'My apartment',
  newPinLabel: 'new',

  layers: {
    1: { title: 'Structure & circulation', lock: 'Locks when demolition starts' },
    2: { title: 'Wet points', lock: 'Locks at plumbing rough-in' },
    3: { title: 'Storage & built-ins', lock: 'Locks when millwork is ordered' },
    4: { title: 'Electrical & lighting', lock: 'Locks at electrical rough-in' },
    5: { title: 'Finishes & fixtures', lock: 'Locks when materials are ordered' },
    6: { title: 'Furniture layout', lock: 'Flexible until move-in' },
  },
  firm: { must: 'Must', prefer: 'Prefer', question: 'Question' },
  status: { open: 'Open', agreed: 'Agreed', deferred: 'Deferred', rejected: 'Rejected' },
  statusAction: { agreed: 'Agree', deferred: 'Defer', rejected: 'Reject' },

  title: {
    projectName: 'Project name',
    subtitle: 'Review notes for the architect',
    noteCount: ({ n }) => (n ? `${n} ${plural(n, 'note', 'notes')}` : 'no notes yet'),
  },
  stats: { must: 'Musts', prefer: 'Preferences', question: 'Questions', open: 'Open', agreed: 'Agreed' },
  toolbar: {
    newNote: 'New note',
    upload: 'Upload plans (PDF)',
    busy: 'Processing…',
    print: 'Print / PDF',
    saveBackup: 'Save backup',
    loadBackup: 'Load backup',
  },
  filters: { all: 'All', open: 'Open', must: 'Musts', agreed: 'Agreed', deferred: 'Deferred' },
  empty: {
    title: 'Nothing marked yet',
    body:
      'Upload the architect’s plans and walk through a scene from daily life — a weekday ' +
      'morning, arriving with groceries, laundry day — and mark the first thing that gets ' +
      'in the way. That’s your note 1.1.',
    filterTitle: 'No notes in this filter',
    filterBody: 'Switch back to All to see the rest of the list.',
  },
  foot: 'Numbering is permanent — note 2.3 will always be 2.3',

  toast: {
    storageLimited: 'Heads up: browser storage is limited — keep JSON backups',
    saveFailed: 'Couldn’t save — export a backup!',
    needWhereOrWant: 'Fill in at least where, or what you want',
    whyNudge: 'Fill in the why — it’s the field that gets you a better answer',
    noteUpdated: 'Note {num} updated',
    noteAdded: 'Note {num} added',
    noteDeleted: 'Note deleted',
    splitting: 'Splitting {name} — page {p}/{n}',
    skippedFile: 'Skipped: {name} (not a PDF or image)',
    sheetsAdded: ({ n }) => `${n} ${plural(n, 'sheet', 'sheets')} added`,
    readFailed: 'Couldn’t read that file',
    sheetRemoved: 'Sheet removed',
    pinMoved: 'Pin moved',
    pinRemoved: 'Pin removed',
    printFailed: 'Couldn’t generate the print document',
    backupSaved: 'Backup saved',
    backupLoaded: 'Backup loaded',
    notABackup: 'That file isn’t a Redline backup',
  },
  confirm: {
    deleteNote: 'Delete note {num}? Its number won’t be reused.',
    deleteSheet: ({ name, pinned }) =>
      pinned
        ? `Remove "${name}"? ${pinned} note ${plural(pinned, 'pin', 'pins')} on it will be removed.`
        : `Remove "${name}"?`,
  },

  editor: {
    aria: 'Note editor',
    editing: 'Editing note {num}',
    layer: 'Layer',
    layerHint: '— sets the urgency',
    firm: 'How firm I am',
    firmOption: {
      must: 'Must — non-negotiable',
      prefer: 'Prefer — open to alternatives',
      question: 'Question — just asking',
    },
    where: 'Where',
    whereHint: '— sheet, room, wall',
    wherePlaceholder: 'Plan 02 — kitchen, north wall',
    pin: 'Pin on the plan',
    pinHint: '— mark the exact spot on the drawing',
    pinnedOn: 'Pinned on {name}',
    move: 'Move',
    remove: 'Remove',
    pinAttach: 'Mark spot on the plan',
    pinNoSheets: 'Upload the architect’s plans (button above) to pin notes on them.',
    see: 'What I see now',
    seePlaceholder: 'Only one outlet near the counter',
    want: 'What I want instead',
    wantPlaceholder: 'At least three, spread along the counter',
    why: 'Why',
    whyHint: '— the field that gets you a better answer',
    whyPlaceholder: 'Kettle, blender and air fryer all running at once in the morning',
    ref: 'Reference link',
    refHint: '— optional, for anything visual',
    save: 'Save note',
    cancel: 'Cancel',
  },

  note: {
    noPlace: 'No location set',
    see: 'See',
    want: 'Want',
    why: 'Why',
    ref: 'Ref',
    createdOn: 'Created {date}',
    statusOn: '{status} {date}',
    thumbTitle: 'Pinned on {name} — click to view or move',
    edit: 'Edit',
    delete: 'Delete',
  },

  placer: {
    sheet: 'Sheet',
    title: 'Pin note {num} on the plan',
    hintBrowse: 'Drag to pan · scroll to zoom',
    hintPlace: 'Click to pin · drag to pan · scroll to zoom',
    zoomIn: 'Zoom +',
    zoomOut: 'Zoom −',
    close: 'Close',
    removePin: 'Remove pin',
    cancel: 'Cancel',
    use: 'Use this spot',
  },

  shelf: {
    aria: 'Project plans',
    title: 'Plans',
    hint: 'Click a sheet to see its pins',
    nameAria: 'Sheet name',
    remove: 'Remove sheet',
    removeAria: 'Remove sheet {name}',
  },

  print: {
    docTitle: '{project} — review notes',
    openCount: '{n} open',
    legend: ({ b }) => `Each note: what I see · what I want · ${b('why')}`,
    legendNumbers: 'Numbering is permanent and matches the pins on the plans',
    sheetSub: ({ n }) => `${n} ${plural(n, 'note', 'notes')} — numbers match the list`,
  },
}
