/* FloatingCaptionOverlay integration */
import './publicUrlShim.js';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import LanguageSelector from './LanguageSelector';
import InputPanel from './InputPanel';
import { translateText, streamTranslateText } from './utils/translationApi';
import TranslationDisplay from './components/TranslationDisplay';
import HistoryPanel from './components/HistoryPanel';
import FloatingCaptionOverlay from './components/FloatingCaptionOverlay';

// TTS helper function for mapping overlay language code (one central place)
function getVoiceLang(code) {
  switch (code) {
    case "en": return "en-US";
    case "es": return "es-ES";
    case "fr": return "fr-FR";
    case "de": return "de-DE";
    case "zh": return "zh-CN";
    case "hi": return "hi-IN";
    case "ar": return "ar-SA";
    case "ja": return "ja-JP";
    case "ru": return "ru-RU";
    default: return code;
  }
}

// Ensure PUBLIC_URL is defined as a global variable for template macro/build contexts
if (typeof PUBLIC_URL === "undefined") {
  var PUBLIC_URL = "";
}

/* 
 * PUBLIC_URL compatibility (noop shim for template/linter).
 * No direct usage found, but ensure this doesn't trigger lint/build errors.
 * This is just to avoid linter/template ReferenceErrors.
 */
if (typeof window !== "undefined" && typeof window.PUBLIC_URL === "undefined") {
  window.PUBLIC_URL = '';
}
// Do not reference PUBLIC_URL as a bare identifier in code.

// PUBLIC_INTERFACE
function App() {
  // State management for language selection and detection
  const [autoDetect, setAutoDetect] = useState(true);
  const [inputLanguage, setInputLanguage] = useState('en'); // Default input language (irrelevant if autoDetect)
  const [outputLanguage, setOutputLanguage] = useState('es'); // Default output language

  // Overlay & TTS language: independently chosen by user; defaults to outputLanguage
  const [overlayTTSLanguage, setOverlayTTSLanguage] = useState('es');

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

  // Live overlay streaming state
  const [overlayLiveText, setOverlayLiveText] = useState('');
  const voiceStreamingStateRef = useRef({
    cancel: false,
    prevText: '',
    streamPromise: null,
  });

  // Update outputLanguages when outputLanguage changes (single output model)
  useEffect(() => {
    setOutputLanguages([outputLanguage]);
  }, [outputLanguage]);

  // Translate handler (for button and auto updates, not streaming)
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

  // Auto-translate on input change, language change, or autoDetect change (non-streaming, for text/manual use)
  useEffect(() => {
    if (inputText.trim() && outputLanguages.length > 0) handleTranslate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText, inputLanguage, outputLanguages, autoDetect]);

  // Streaming pipeline for voice input and overlay: state is updated as user speaks
  const handleSpeechStream = useCallback(
    async (fragment, isFinal) => {
      // New fragment arrives from InputPanel (voice recognition engine)
      // Cancel previous ongoing stream if the fragment markedly decreases (i.e., user started new utterance)
      if (
        fragment.trim() === '' ||
        (voiceStreamingStateRef.current.prevText &&
          fragment.length < voiceStreamingStateRef.current.prevText.length - 4)
      ) {
        setOverlayLiveText('');
        voiceStreamingStateRef.current.cancel = true;
        voiceStreamingStateRef.current.prevText = '';
        voiceStreamingStateRef.current.streamPromise = null;
        if (isFinal) setTranslated({});
        return;
      }

      // Cancel previous streaming promise if in flight and input advances
      if (voiceStreamingStateRef.current.streamPromise) {
        voiceStreamingStateRef.current.cancel = true;
      }

      voiceStreamingStateRef.current.cancel = false;
      voiceStreamingStateRef.current.prevText = fragment;

      const overlayStreamLang = overlayTTSLanguage || outputLanguages[0] || outputLanguage || 'en';
      // Call simulated streaming translation API
      const streamPromise = streamTranslateText({
        text: fragment,
        inputLanguage,
        outputLanguages: [overlayStreamLang],
        autoDetect,
        onPartial: (partial) => {
          // Only update overlay, not main translation panel
          if (!voiceStreamingStateRef.current.cancel)
            setOverlayLiveText((partial && partial[overlayStreamLang]) || '');
        }
      }).then(finalRes => {
        // Set to last translation when utterance is marked as final
        if (!voiceStreamingStateRef.current.cancel && isFinal) {
          setOverlayLiveText((finalRes && finalRes[overlayStreamLang]) || '');
          setTranslated((tr) => ({
            ...tr,
            ...finalRes,
          }));
        }
        // Clean up handle after streaming
        voiceStreamingStateRef.current.streamPromise = null;
      });

      voiceStreamingStateRef.current.streamPromise = streamPromise;
    },
    [overlayTTSLanguage, outputLanguages, outputLanguage, inputLanguage, autoDetect]
  );

  // Optionally handle voice input events (could be used for visual feedback, analytics)
  const handleVoiceStart = () => {
    // Clear overlay streaming state for new utterance
    setOverlayLiveText('');
    voiceStreamingStateRef.current.cancel = false;
    voiceStreamingStateRef.current.prevText = '';
    voiceStreamingStateRef.current.streamPromise = null;
  };
  const handleVoiceEnd = () => {
    // Mark as finalized: keep last text, or clear immediately if you prefer.
    // setOverlayLiveText('');
    // If last partial was not final, you may want to flush/finalize here.
  };

  // Floating overlay state/logic
  const [showOverlay, setShowOverlay] = useState(false);
  // Overlay TTS toggle
  const [overlayTTSEnabled, setOverlayTTSEnabled] = useState(true);

  // Use overlayTTSLanguage as the overlay language for both captions and TTS
  const overlayLang = overlayTTSLanguage || outputLanguages[0] || outputLanguage || "en";
  // For overlayText, prefer streaming state, fallback to original translation if overlay not streaming
  const overlayText =
    overlayLiveText ||
    ((!!Object.keys(translated).length && translated[overlayLang])
      ? translated[overlayLang]
      : "");

  // Is browser speech Synthesis supported?
  const isSpeechSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  // --- Overlay TTS logic ---
  // Speech synthesis state helpers for overlays (prevent repeat, per language, etc)
  const overlayTTSRef = useRef({
    lastText: "",
    lastLang: "",
    speaking: false,
    utterInstance: null,
  });

  // Helper: Stop overlay TTS if needed
  const cancelOverlaySpeech = () => {
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } catch (e) {/* ignore */}
    overlayTTSRef.current.speaking = false;
    overlayTTSRef.current.utterInstance = null;
    overlayTTSRef.current.lastText = "";
    overlayTTSRef.current.lastLang = "";
  };

  // Watch overlayTTS toggle, overlayText, overlayLang, showOverlay. Speak only if enabled and others valid.
  useEffect(() => {
    // Only speak if ON and visible, not empty, and supported
    if (
      overlayTTSEnabled &&
      showOverlay &&
      !!overlayText &&
      !!overlayLang &&
      isSpeechSupported
    ) {
      // Avoid repeated reads of same text/lang.
      const last = overlayTTSRef.current;
      if (
        last.speaking &&
        overlayText === last.lastText &&
        overlayLang === last.lastLang
      ) {
        // Already speaking correct fragment - do nothing.
        return;
      }

      // Cancel any ongoing overlay TTS if new fragment.
      cancelOverlaySpeech();

      const utter = new window.SpeechSynthesisUtterance(overlayText);
      const targetLang = getVoiceLang(overlayLang);

      // Find best matching voice
      const voices = window.speechSynthesis.getVoices();
      const match =
        voices.find((v) => v.lang === targetLang) ||
        voices.find((v) => v.lang.startsWith(overlayLang)) ||
        voices.find((v) => v.lang.startsWith(targetLang.slice(0, 2))) ||
        voices[0];

      if (match) utter.voice = match;
      utter.lang = targetLang;

      utter.onend = () => {
        overlayTTSRef.current.speaking = false;
      };
      utter.onerror = () => {
        overlayTTSRef.current.speaking = false;
      };

      // Only speak if not already spoken for this fragment
      window.speechSynthesis.speak(utter);
      overlayTTSRef.current = {
        lastText: overlayText,
        lastLang: overlayLang,
        speaking: true,
        utterInstance: utter,
      };
    } else {
      // Conditions not met: cancel any ongoing overlay speech
      if (overlayTTSRef.current.speaking) {
        cancelOverlaySpeech();
      }
    }
    // eslint-disable-next-line
  }, [overlayText, overlayLang, showOverlay, overlayTTSEnabled, isSpeechSupported]);

  // Clean up TTS when overlay closes or unmounts
  useEffect(() => {
    return () => {
      cancelOverlaySpeech();
    }
    // eslint-disable-next-line
  }, []);

  // Cancel overlay TTS if overlay is hidden
  useEffect(() => {
    if (!showOverlay || !overlayTTSEnabled) {
      cancelOverlaySpeech();
    }
    // eslint-disable-next-line
  }, [showOverlay, overlayTTSEnabled]);


  // Keyboard shortcut (Ctrl+Shift+O) to toggle overlay for power users
  useEffect(() => {
    const handler = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "o"
      ) {
        setShowOverlay((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="app">
      <nav className="navbar">
        <div className="container" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div className="logo">
              <span className="logo-symbol">L</span>
              <span style={{ fontWeight: 800, marginLeft: 2 }}>PolyLingo Live</span>
            </div>
            <span style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {/* Overlay/TTS Language quick control */}
              <span style={{display: 'flex', alignItems: "center", gap: 7, marginRight: 2}}>
                <label htmlFor="navbar-overlay-tts-lang" style={{ fontSize: ".93rem", fontWeight: 500, color: "#fafbff", marginRight: 4 }}>
                  Overlay/TTS:
                </label>
                <select
                  id="navbar-overlay-tts-lang"
                  value={overlayTTSLanguage}
                  onChange={(e) => setOverlayTTSLanguage(e.target.value)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: 5,
                    border: "1.5px solid #eee",
                    background: "#fff",
                    color: "#2d435e",
                    minWidth: 95,
                    fontWeight: 500,
                    fontSize: ".97rem"
                  }}
                  title="Language for overlay and text-to-speech"
                >
                  {/* Duplicate language list from LanguageSelector for user convenience */}
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                  <option value="hi">Hindi</option>
                  <option value="ar">Arabic</option>
                  <option value="ja">Japanese</option>
                  <option value="ru">Russian</option>
                </select>
              </span>
              <button className="btn"
                aria-pressed={showOverlay}
                style={{
                  fontWeight: 600,
                  letterSpacing: 0.5,
                  background: showOverlay ? 'var(--accent)' : undefined,
                  color: showOverlay ? '#222' : undefined,
                  border: showOverlay ? '2px solid var(--primary)' : undefined
                }}
                onClick={() => setShowOverlay((v) => !v)}
              >
                {showOverlay ? "Hide Overlay" : "Show Overlay"}
              </button>
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
                  overlayTTSLanguage={overlayTTSLanguage}
                  onInputLanguageChange={setInputLanguage}
                  onOutputLanguageChange={(lang) => {
                    setOutputLanguage(lang);
                    setOutputLanguages([lang]);
                  }}
                  onOverlayTTSLanguageChange={setOverlayTTSLanguage}
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
                  onSpeechStream={handleSpeechStream}
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
                  <TranslationDisplay
                    translations={translated}
                    outputLanguages={outputLanguages}
                    isTranslating={isTranslating}
                  />
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
      <FloatingCaptionOverlay
        open={showOverlay && !!overlayText}
        text={overlayText}
        language={overlayLang}
        onClose={() => setShowOverlay(false)}
        ttsEnabled={overlayTTSEnabled}
        onTTSChanged={setOverlayTTSEnabled}
        isSpeechSupported={isSpeechSupported}
      />
    </div>
  );
}

export default App;