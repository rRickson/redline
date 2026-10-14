// Tiny i18n layer: one module per locale, a translator `t(key, params)`, and a
// React context so a language switch re-renders the app. Adding a language is
// one file in ./locales plus one line in LOCALES.
import { createContext, createElement, Fragment, useContext, useEffect, useMemo, useState } from 'react'
import en from './locales/en.js'
import ptBR from './locales/pt-BR.js'
import zhCN from './locales/zh-CN.js'
import ja from './locales/ja.js'

export const LOCALES = { en, 'pt-BR': ptBR, 'zh-CN': zhCN, ja }
const FALLBACK = 'en'
const STORE_KEY = 'redline-lang'

const lookup = (messages, key) =>
  key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), messages)

// Replaces {name} placeholders. When a param is a React element the result is
// an array of nodes, so callers can drop e.g. a styled <span> into a sentence.
function interpolate(str, params) {
  const parts = String(str).split(/\{(\w+)\}/)
  if (parts.length === 1) return str
  const out = parts.map((p, i) => (i % 2 ? params[p] ?? `{${p}}` : p))
  if (out.every(p => typeof p !== 'object')) return out.join('')
  return out.map((p, i) => (typeof p === 'object' ? createElement(Fragment, { key: i }, p) : p))
}

export function makeT(lang) {
  const messages = LOCALES[lang] || LOCALES[FALLBACK]
  return (key, params = {}) => {
    let v = lookup(messages, key)
    if (v === undefined) v = lookup(LOCALES[FALLBACK], key)
    if (v === undefined) return key
    if (typeof v === 'function') v = v(params)
    return interpolate(v, params)
  }
}

// Saved choice first, then the browser's preferred languages, then English.
export function detectLang() {
  try {
    const saved = localStorage.getItem(STORE_KEY)
    if (saved && LOCALES[saved]) return saved
  } catch {}
  for (const tag of navigator.languages || [navigator.language || '']) {
    const l = tag.toLowerCase()
    if (l.startsWith('pt')) return 'pt-BR'
    if (l.startsWith('zh')) return 'zh-CN'
    if (l.startsWith('ja')) return 'ja'
    if (l.startsWith('en')) return 'en'
  }
  return FALLBACK
}

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detectLang)
  const t = useMemo(() => makeT(lang), [lang])

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = t('docTitle')
  }, [lang, t])

  const setLang = next => {
    if (!LOCALES[next]) return
    try {
      localStorage.setItem(STORE_KEY, next)
    } catch {}
    setLangState(next)
  }

  return createElement(I18nContext.Provider, { value: { lang, setLang, t } }, children)
}

export const useI18n = () => useContext(I18nContext)
