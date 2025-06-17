import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

/* Shim for PUBLIC_URL for compatibility with any legacy template macros. */
if (typeof window.PUBLIC_URL === "undefined") {
  window.PUBLIC_URL = "";
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
