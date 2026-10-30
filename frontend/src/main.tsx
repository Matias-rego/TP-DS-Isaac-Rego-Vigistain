import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from 'next-themes'
import './index.css'
import App from './pages/App/App'
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from './lib/queryClient'
import QueryCacheSync from './lib/QueryCacheSync'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
       <QueryCacheSync />
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)