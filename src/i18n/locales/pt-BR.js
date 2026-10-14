// Português (Brasil) — the original copy. Rules: informal but precise
// `você` register; statuses agree with "a nota" (feminine).
const plural = (n, one, many) => (n === 1 ? one : many)

export default {
  langName: 'Português (Brasil)',
  languageLabel: 'Idioma',
  docTitle: 'Redline — revisão de projeto',
  defaultProject: 'Meu apartamento',
  newPinLabel: 'nova',

  layers: {
    1: { title: 'Estrutura & circulação', lock: 'Trava quando a demolição começa' },
    2: { title: 'Pontos hidráulicos', lock: 'Trava na execução da hidráulica' },
    3: { title: 'Armários & marcenaria', lock: 'Trava quando a marcenaria é encomendada' },
    4: { title: 'Elétrica & iluminação', lock: 'Trava na execução da elétrica' },
    5: { title: 'Acabamentos & metais', lock: 'Trava quando os materiais são comprados' },
    6: { title: 'Layout dos móveis', lock: 'Flexível até a mudança' },
  },
  firm: { must: 'Obrigatório', prefer: 'Prefiro', question: 'Pergunta' },
  status: { open: 'Aberta', agreed: 'Combinada', deferred: 'Adiada', rejected: 'Recusada' },
  statusAction: { agreed: 'Combinar', deferred: 'Adiar', rejected: 'Recusar' },

  title: {
    projectName: 'Nome do projeto',
    subtitle: 'Notas de revisão para o arquiteto',
    noteCount: ({ n }) => (n ? `${n} ${plural(n, 'nota', 'notas')}` : 'nenhuma nota ainda'),
  },
  stats: { must: 'Obrigatórias', prefer: 'Preferências', question: 'Perguntas', open: 'Abertas', agreed: 'Combinadas' },
  toolbar: {
    newNote: 'Nova nota',
    upload: 'Enviar plantas (PDF)',
    busy: 'Processando…',
    print: 'Imprimir / PDF',
    saveBackup: 'Salvar backup',
    loadBackup: 'Carregar backup',
  },
  filters: { all: 'Todas', open: 'Abertas', must: 'Obrigatórias', agreed: 'Combinadas', deferred: 'Adiadas' },
  empty: {
    title: 'Nada marcado ainda',
    body:
      'Envie as plantas do arquiteto e percorra uma cena do dia a dia — manhã de semana, ' +
      'chegando com as compras, dia de lavar roupa — e marque a primeira coisa que travar. ' +
      'Essa é a sua nota 1.1.',
    filterTitle: 'Nenhuma nota neste filtro',
    filterBody: 'Volte para Todas para ver o resto da lista.',
  },
  foot: 'A numeração é permanente — a nota 2.3 será sempre a 2.3',

  toast: {
    storageLimited: 'Atenção: armazenamento do navegador limitado — mantenha backups JSON',
    saveFailed: 'Não foi possível salvar — exporte um backup!',
    needWhereOrWant: 'Preencha pelo menos o onde ou o que você quer',
    whyNudge: 'Preencha o porquê — é o campo que traz uma resposta melhor',
    noteUpdated: 'Nota {num} atualizada',
    noteAdded: 'Nota {num} adicionada',
    noteDeleted: 'Nota excluída',
    splitting: 'Dividindo {name} — página {p}/{n}',
    skippedFile: 'Ignorado: {name} (não é PDF nem imagem)',
    sheetsAdded: ({ n }) => (n === 1 ? '1 planta adicionada' : `${n} plantas adicionadas`),
    readFailed: 'Não foi possível ler esse arquivo',
    sheetRemoved: 'Planta removida',
    pinMoved: 'Marcação movida',
    pinRemoved: 'Marcação removida',
    printFailed: 'Não foi possível gerar o documento de impressão',
    backupSaved: 'Backup salvo',
    backupLoaded: 'Backup carregado',
    notABackup: 'Esse arquivo não é um backup do Redline',
  },
  confirm: {
    deleteNote: 'Excluir a nota {num}? O número não será reutilizado.',
    deleteSheet: ({ name, pinned }) =>
      pinned
        ? `Remover "${name}"? ${pinned} ${plural(pinned, 'marcação', 'marcações')} de nota nela ` +
          `${plural(pinned, 'será removida', 'serão removidas')}.`
        : `Remover "${name}"?`,
  },

  editor: {
    aria: 'Editor de notas',
    editing: 'Editando a nota {num}',
    layer: 'Camada',
    layerHint: '— define a urgência',
    firm: 'Quanto eu faço questão',
    firmOption: {
      must: 'Obrigatório — não abro mão',
      prefer: 'Prefiro — aberto a alternativas',
      question: 'Pergunta — só perguntando',
    },
    where: 'Onde',
    whereHint: '— prancha, cômodo, parede',
    wherePlaceholder: 'Planta 02 — cozinha, parede norte',
    pin: 'Marcação na planta',
    pinHint: '— marque o ponto exato no desenho',
    pinnedOn: 'Marcada em {name}',
    move: 'Mover',
    remove: 'Remover',
    pinAttach: 'Marcar ponto na planta',
    pinNoSheets: 'Envie as plantas do arquiteto (botão acima) para marcar as notas nelas.',
    see: 'O que eu vejo hoje',
    seePlaceholder: 'Só uma tomada perto da bancada',
    want: 'O que eu quero no lugar',
    wantPlaceholder: 'Pelo menos três, distribuídas pela bancada',
    why: 'Por quê',
    whyHint: '— o campo que traz uma resposta melhor',
    whyPlaceholder: 'Chaleira, liquidificador e air fryer ligados ao mesmo tempo de manhã',
    ref: 'Link de referência',
    refHint: '— opcional, para qualquer coisa visual',
    save: 'Salvar nota',
    cancel: 'Cancelar',
  },

  note: {
    noPlace: 'Local não definido',
    see: 'Vejo',
    want: 'Quero',
    why: 'Porque',
    ref: 'Ref',
    createdOn: 'Criada em {date}',
    statusOn: '{status} em {date}',
    thumbTitle: 'Marcada em {name} — clique para ver ou mover',
    edit: 'Editar',
    delete: 'Excluir',
  },

  placer: {
    sheet: 'Planta',
    title: 'Marcar a nota {num} na planta',
    hintBrowse: 'Arraste para mover · role para dar zoom',
    hintPlace: 'Clique para marcar · arraste para mover · role para dar zoom',
    zoomIn: 'Zoom +',
    zoomOut: 'Zoom −',
    close: 'Fechar',
    removePin: 'Remover marcação',
    cancel: 'Cancelar',
    use: 'Usar este ponto',
  },

  shelf: {
    aria: 'Plantas do projeto',
    title: 'Plantas',
    hint: 'Clique numa planta para ver as marcações',
    nameAria: 'Nome da planta',
    remove: 'Remover planta',
    removeAria: 'Remover a planta {name}',
  },

  print: {
    docTitle: '{project} — notas de revisão',
    openCount: '{n} em aberto',
    legend: ({ b }) => `Cada nota: o que eu vejo · o que eu quero · ${b('por quê')}`,
    legendNumbers: 'A numeração é permanente e corresponde às marcações nas plantas',
    sheetSub: ({ n }) => `${n} ${plural(n, 'nota', 'notas')} — os números correspondem à lista`,
  },
}
