import React, { useState } from 'react';
import './App.css';
import LanguageSelector from './LanguageSelector';

// PUBLIC_INTERFACE
function App() {
  // State management for language selection and detection
  const [autoDetect, setAutoDetect] = useState(true);
  const [inputLanguage, setInputLanguage] = useState('en'); // Default input language (irrelevant if autoDetect)
  const [outputLanguage, setOutputLanguage] = useState('es'); // Default output language

  // Handler when the user toggles auto-detect checkbox
  const handleAutoDetectChange = (checked) => {
    setAutoDetect(checked);
    // Optionally reset input language if enabling auto-detect
    // if (checked) setInputLanguage('en');
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="container" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div className="logo">
              <span className="logo-symbol">L</span>
              <span style={{ fontWeight: 800, marginLeft: 2 }}>PolyLingo Live</span>
            </div>
            <span>
              <button className="btn" style={{ fontWeight: 600, letterSpacing: 0.5 }}>
                Try Demo
              </button>
            </span>
          </div>
        </div>
      </nav>
      <main>
        <div className="polylingo-main">
          <div style={{ marginLeft: 'auto', marginRight: 'auto', width: '100%', maxWidth: 1320 }}>
            <div className="app-sections">
              {/* Language Selector Panel */}
              <section className="language-panel">
                <div className="section-title">Language Selection</div>
                <LanguageSelector
                  inputLanguage={inputLanguage}
                  outputLanguage={outputLanguage}
                  onInputLanguageChange={setInputLanguage}
                  onOutputLanguageChange={setOutputLanguage}
                  autoDetect={autoDetect}
                  onAutoDetectChange={handleAutoDetectChange}
                />
              </section>
              {/* Input Panel */}
              <section className="input-panel">
                <div className="section-title">Input Panel</div>
                <div className="section-placeholder">
                  {/* Placeholder: Voice input button, text input box, mic icon, etc. */}
                  [Text field]<br />
                  [Voice input button/icon]
                </div>
              </section>
              {/* Translation Display Panel */}
              <section className="translation-panel">
                <div className="section-title">Translation</div>
                <div className="section-placeholder">
                  {/* Placeholder: Translated text, text-to-speech controls */}
                  [Translated output area]<br />
                  [Copy / Replay buttons]
                </div>
              </section>
              {/* History Panel */}
              <section className="history-panel">
                <div className="section-title">History</div>
                <div className="section-placeholder">
                  {/* Placeholder: Table, list or timeline of previous translations */}
                  [Recent translations list]
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;