/* eslint-disable import/first */

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
