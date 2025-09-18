import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';   // ✅ FIXED: was "./data/App", must be "./App"
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
