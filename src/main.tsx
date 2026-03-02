import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { queryClient } from './lib/query-client';
import { suppressKnownWarnings } from './utils/suppressWarnings';

// Suppress known warnings from third-party libraries (e.g., react-quill)
suppressKnownWarnings();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  </StrictMode>
);
