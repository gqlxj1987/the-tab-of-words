import React from 'react'
import ReactDOM from 'react-dom'
import './styles/global.css'
import App from './App'
import { ExtensionStorage, STORAGE_KEYS } from './utils/extension-storage'

// Apply theme immediately to prevent flash
const initTheme = async () => {
  try {
    const settings = await ExtensionStorage.get(STORAGE_KEYS.SETTINGS)
    if (settings?.theme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  } catch (error) {
    // Silently handle theme init errors
  }
}

// Start theme init immediately
initTheme()

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
