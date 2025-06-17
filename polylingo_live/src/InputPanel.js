import React, { useState, useRef, useEffect } from 'react';

// PUBLIC_INTERFACE
/**
 * Unified InputPanel for PolyLingo Live.
 * Provides both text and voice input with single 'inputText' state, error handling, 
 * and toggles recording via the Web Speech API if supported.
 */
function InputPanel({ inputText, setInputText, onVoiceStart, onVoiceEnd }) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');
  const [isSpeechSupported, setIsSpeechSupported] = useState(null);
  const recognitionRef = useRef(null);

  // Check for Web Speech API support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSpeechSupported(!!SpeechRecognition);
    if (SpeechRecognition && !recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onresult = (event) => {
        if (event.results && event.results[0] && event.results[0][0]) {
          setInputText(event.results[0][0].transcript);
        }
        setIsListening(false);
        if (onVoiceEnd) onVoiceEnd();
      };

      recognition.onerror = (event) => {
        setError('Voice recognition error: ' + event.error);
        setIsListening(false);
        if (onVoiceEnd) onVoiceEnd();
      };

      recognition.onend = () => {
        setIsListening(false);
        if (onVoiceEnd) onVoiceEnd();
      };

      recognitionRef.current = recognition;
    }
    // Cleanup: stop any ongoing recognition on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        if (isListening) recognitionRef.current.stop();
      }
    };
    // eslint-disable-next-line
  }, []);

  const handleMicClick = () => {
    setError('');
    if (!isSpeechSupported) {
      setError("Sorry, your browser doesn't support speech recognition.");
      return;
    }
    if (recognitionRef.current) {
      if (!isListening) {
        recognitionRef.current.lang = 'en-US'; // Make language configurable as needed
        setIsListening(true);
        recognitionRef.current.start();
        if (onVoiceStart) onVoiceStart();
      } else {
        recognitionRef.current.stop();
        setIsListening(false);
        if (onVoiceEnd) onVoiceEnd();
      }
    } else {
      setError("Speech recognition unavailable.");
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    setError('');
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <input
          type="text"
          className="input-box"
          placeholder={isListening ? 'Listening...' : 'Type your text or use the mic'}
          value={inputText}
          onChange={handleInputChange}
          style={{
            flex: 1,
            padding: '12px 14px',
            borderRadius: 6,
            border: '1px solid #c9d1df',
            fontSize: '1.03rem',
            background: isListening ? '#e8f0fc' : '#fff',
            outline: isListening ? '1.3px solid #4A90E2' : 'none',
            transition: 'all 0.15s'
          }}
          disabled={isListening}
        />
        <button
          type="button"
          onClick={handleMicClick}
          aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
          className="btn"
          style={{
            background: isListening ? 'var(--accent)' : 'var(--primary)',
            color: 'var(--text-inverse)',
            borderRadius: '50%',
            width: 44,
            height: 44,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.45rem',
            transition: 'background 0.18s',
            boxShadow: isListening ? '0 1px 6px rgba(245,166,35,0.23)' : undefined,
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            {isListening ? (
              <svg viewBox="0 0 20 20" width={21} height={21} fill="currentColor">
                <ellipse cx="10" cy="10" rx="5.3" ry="6" fill="var(--text-inverse)" opacity="0.14"/>
                <rect x="7.7" y="6" width="4.6" height="8" rx="2.3" fill="var(--text-inverse)" />
                {/* Animated listening bars */}
                <rect x="10.8" y="4" width="1.4" height="4" rx="0.6" fill="#F5A623">
                  <animate 
                    attributeName="height" values="4;8;4" dur="0.8s" repeatCount="indefinite"
                    begin="0.3s"
                  />
                </rect>
                <rect x="7.8" y="4" width="1.4" height="4" rx="0.6" fill="#4A90E2">
                  <animate 
                    attributeName="height" values="8;4;8" dur="0.8s" repeatCount="indefinite"
                  />
                </rect>
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" width={21} height={21} fill="currentColor">
                <ellipse cx="10" cy="10" rx="5.3" ry="6" fill="var(--text-inverse)" opacity="0.14"/>
                <rect x="7.7" y="6" width="4.6" height="8" rx="2.3" fill="var(--text-inverse)" />
                <rect x="10.8" y="7" width="1.4" height="5" rx="0.6" fill="#F5A623" />
                <rect x="7.8" y="7" width="1.4" height="5" rx="0.6" fill="#4A90E2" />
              </svg>
            )}
          </span>
        </button>
      </div>
      {error && (
        <div style={{ color: '#d52f24', fontSize: '0.97rem', marginTop: 8 }}>
          {error}
        </div>
      )}
      {(!isSpeechSupported && isSpeechSupported !== null) && (
        <div style={{ color: '#a17d2b', fontSize: '0.95rem', marginTop: 6 }}>
          Sorry, voice input is not available in your browser.
        </div>
      )}
      <div style={{ fontSize: '0.95rem', color: '#6c7f99', marginTop: 10 }}>
        {isSpeechSupported === false
          ? "Your browser does not support voice recognition."
          : isListening
          ? "Listening... Speak now."
          : "Type with your keyboard or use the mic button."}
      </div>
    </div>
  );
}

export default InputPanel;
