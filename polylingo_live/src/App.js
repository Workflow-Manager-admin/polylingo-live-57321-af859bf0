import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import LanguageSelector from './LanguageSelector';
import InputPanel from './InputPanel';
import { translateText } from './utils/translationApi';

// PUBLIC_INTERFACE
function App() {
  // State management for language selection and detection
  const [autoDetect, setAutoDetect] = useState(true);
  const [inputLanguage, setInputLanguage] = useState('en'); // Default input language (irrelevant if autoDetect)
  const [outputLanguage, setOutputLanguage] = useState('es'); // Default output language

  // Enable support for multiple output languages (future: UI for multi-select)
  const [outputLanguages, setOutputLanguages] = useState(['es']); // For now, just one, but use array

  // Handler when the user toggles auto-detect checkbox
  const handleAutoDetectChange = (checked) => {
    setAutoDetect(checked);
    // Optionally reset input language if enabling auto-detect
    // if (checked) setInputLanguage('en');
  };

  // Unified input state for text/voice
  const [inputText, setInputText] = useState('');

  // Translation output: { [langCode]: translatedText }
  const [translated, setTranslated] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState('');

  // Update outputLanguages when outputLanguage changes (single output model)
  useEffect(() => {
    setOutputLanguages([outputLanguage]);
  }, [outputLanguage]);

  // Translate handler (for button and auto updates)
  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) {
      setTranslated({});
      setError('');
      return;
    }
    setIsTranslating(true);
    setError('');
    try {
      const response = await translateText({
        text: inputText,
        inputLanguage,
        outputLanguages,
        autoDetect,
      });
      setTranslated(response);
    } catch (err) {
      setError('Translation failed.');
    }
    setIsTranslating(false);
  }, [inputText, inputLanguage, outputLanguages, autoDetect]);

  // Auto-translate on input change, language change, or autoDetect change
  useEffect(() => {
    if (inputText.trim() && outputLanguages.length > 0) handleTranslate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText, inputLanguage, outputLanguages, autoDetect]);

  // Optionally handle voice input events (e.g., for visual feedback, analytics)
  const handleVoiceStart = () => {};
  const handleVoiceEnd = () => {};

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
                  onOutputLanguageChange={(lang) => {
                    setOutputLanguage(lang);
                    setOutputLanguages([lang]);
                  }}
                  autoDetect={autoDetect}
                  onAutoDetectChange={handleAutoDetectChange}
                />
              </section>
              {/* Input Panel */}
              <section className="input-panel">
                <div className="section-title">Input Panel</div>
                <InputPanel
                  inputText={inputText}
                  setInputText={setInputText}
                  onVoiceStart={handleVoiceStart}
                  onVoiceEnd={handleVoiceEnd}
                />
              </section>
              {/* Translation Display Panel */}
              <section className="translation-panel">
                <div className="section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Translation</span>
                  <button
                    className="btn"
                    style={{
                      fontSize: '0.99rem',
                      padding: '7px 18px',
                      marginLeft: 10,
                      opacity: isTranslating ? 0.6 : 1,
                    }}
                    onClick={handleTranslate}
                    disabled={isTranslating || !inputText.trim()}
                  >
                    {isTranslating ? 'Translating...' : 'Translate'}
                  </button>
                </div>
                <div style={{ minHeight: 44, marginTop: 8 }}>
                {!inputText.trim() && (
                  <div className="section-placeholder">Enter text to translate.</div>
                )}
                {error && (
                  <div style={{ color: '#b91d1d', fontSize: '1rem', margin: '12px 0' }}>{error}</div>
                )}
                {/* Show real translation output */}
                {(!!Object.keys(translated).length && !error) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {outputLanguages.map((lang) => (
                      <div key={lang} style={{
                        background: '#f3f6ff',
                        borderRadius: 6,
                        padding: '10px 13px',
                        color: '#263152',
                        fontSize: '1.08rem'
                      }}>
                        <span style={{ fontWeight: 600, color: '#4A90E2', marginRight: 10 }}>
                          {lang.toUpperCase()}:
                        </span>
                        {translated[lang] || <span style={{ color: '#b5b5b5' }}>(no result)</span>}
                      </div>
                    ))}
                  </div>
                )}
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