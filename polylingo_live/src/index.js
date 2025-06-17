/* eslint-disable */
// PUBLIC_URL global definition for template/build macro safety:
if (typeof PUBLIC_URL === "undefined") {
  var PUBLIC_URL = "";
}
if (typeof window !== "undefined" && typeof window.PUBLIC_URL === "undefined") {
  window.PUBLIC_URL = "";
}
/* eslint-enable */
import './publicUrlShim.js';

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

/* React 18 root API */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
