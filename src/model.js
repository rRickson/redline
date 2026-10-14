export const LAYERS = [
  { n: 1, t: 'Estrutura & circulação', lock: 'Trava quando a demolição começa' },
  { n: 2, t: 'Pontos hidráulicos', lock: 'Trava na execução da hidráulica' },
  { n: 3, t: 'Armários & marcenaria', lock: 'Trava quando a marcenaria é encomendada' },
  { n: 4, t: 'Elétrica & iluminação', lock: 'Trava na execução da elétrica' },
  { n: 5, t: 'Acabamentos & metais', lock: 'Trava quando os materiais são comprados' },
  { n: 6, t: 'Layout dos móveis', lock: 'Flexível até a mudança' },
]

export const FIRM = { must: 'Obrigatório', prefer: 'Prefiro', question: 'Pergunta' }
export const STAT = { open: 'Aberta', agreed: 'Combinada', deferred: 'Adiada', rejected: 'Recusada' }

export const EMPTY_DOC = { project: 'Meu apartamento', seq: {}, items: [], sheets: [] }

export const today = () => new Date().toISOString().slice(0, 10)

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
