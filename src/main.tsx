import { createRoot } from 'react-dom/client'
import React from 'react';
import App from './App.tsx'
import './index.css'
import { SupabaseProvider } from './contexts/SupabaseContext';
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <SupabaseProvider>
        <App />
      </SupabaseProvider>
    </BrowserRouter>
  </React.StrictMode>
);
