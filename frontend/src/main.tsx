import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from 'next-themes'
import './index.css'
import App from './pages/App/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* ThemeProvider prende/apaga la clase "dark" en el <html> (modo oscuro) */}
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
