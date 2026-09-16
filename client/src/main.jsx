import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import CivicChatbot from './components/CivicChatbot.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <CivicChatbot />
  </StrictMode>,
)
