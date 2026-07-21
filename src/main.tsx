import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import '@fontsource/open-sauce-one/400.css'
import '@fontsource/open-sauce-one/500.css'
import '@fontsource/open-sauce-one/600.css'
import '@fontsource/open-sauce-one/700.css'
import './styles/global.css'
import { Store } from './store/store'
import { App } from './App'

registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Store>
      <App />
    </Store>
  </StrictMode>,
)
