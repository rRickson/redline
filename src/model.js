// Review layers, ordered by cost of change. Titles and lock notes live in the
// locale files (layers.<n>.title / layers.<n>.lock).
export const LAYERS = [1, 2, 3, 4, 5, 6]

export const FIRMS = ['must', 'prefer', 'question']

// The project name is filled in from the active locale on first load.
export const EMPTY_DOC = { project: '', seq: {}, items: [], sheets: [] }

export const today = () => new Date().toISOString().slice(0, 10)

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
