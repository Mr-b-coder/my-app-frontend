import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '@acutrack-bookprint/acutrack-ds';
import App from './App';
import ThemeProvider from './components/ThemeSwitcher';

// Import Acutrack Design System styles
import '@acutrack-bookprint/acutrack-ds/style.css';

// --- V V V THIS IS THE LINE THAT FIXES EVERYTHING V V V ---
// This line imports all of your application's styles.
import './index.css';
// --- ^ ^ ^ THIS IS THE LINE THAT FIXES EVERYTHING ^ ^ ^ ---

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ThemeProvider>
        <ToastProvider defaultPosition="top-right" defaultSize="sm">
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}