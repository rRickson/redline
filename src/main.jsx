import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { I18nProvider } from './i18n/index.js'
import { FONT_CSS } from './fonts.js'
import './styles.css'

const fontStyle = document.createElement('style')
fontStyle.textContent = FONT_CSS
document.head.appendChild(fontStyle)

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>,
)
