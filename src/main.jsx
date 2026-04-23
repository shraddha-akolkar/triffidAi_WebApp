import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ProjectStoreProvider } from './context/ProjectStore.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ProjectStoreProvider>
      <App />
    </ProjectStoreProvider>
  </StrictMode>,
)
