import React, { useState, useRef, useEffect } from 'react';

/** 
 * PUBLIC_INTERFACE
 * Unified InputPanel for PolyLingo Live.
 * Provides both text and *continuous* voice input with start/stop capture (opt-in), clear mic-hot UI,
 * and continuous streaming via Web Speech API as long as enabled.
 *
 * Privacy Note:
 * - Microphone is accessed ONLY after explicit user action (mic button press).
 * - All voice data is handled in the browser and not transmitted externally by default.
 * - The Web Speech API may surface browser permission prompts per user/browser policy.
 *
 * Props:
 * - inputText: string (controlled)
 * - setInputText: function (controlled setter)
 * - onVoiceStart/onVoiceEnd: optional callbacks
 * - onSpeechStream: function (fragment: string, isFinal: boolean) => void
 */
function InputPanel({ inputText, setInputText, onVoiceStart, onVoiceEnd, onSpeechStream }) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');
  const [isSpeechSupported, setIsSpeechSupported] = useState(null);
  const recognitionRef = useRef(null);
  const isMounted = useRef(true);
  const [isMicrophoneAccessDenied, setIsMicrophoneAccessDenied] = useState(false);

  // Track continuous transcript
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    isMounted.current = true;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSpeechSupported(!!SpeechRecognition);

    if (SpeechRecognition && !recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.continuous = true;

      finalTranscriptRef.current = '';
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let anyUpdate = false;
        let newIsFinal = false;
        // Aggregate results
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscriptRef.current += event.results[i][0].transcript;
            newIsFinal = true;
            anyUpdate = true;
          } else {
            interimTranscript += event.results[i][0].transcript;
            anyUpdate = true;
          }
        }
        const fullText = finalTranscriptRef.current + interimTranscript;
        // Show interim as feedback for user while capturing
        if (isMounted.current) setInputText(fullText);

        // Stream live fragment to parent for continual translation (if supported)
        if (onSpeechStream && anyUpdate) {
          onSpeechStream(fullText, newIsFinal && !interimTranscript);
        }
      };

      recognition.onerror = (event) => {
        if (event.error === "not-allowed" || event.error === "denied") {
          setIsMicrophoneAccessDenied(true);
          setError('Microphone access denied.');
        } else {
          setError('Voice recognition error: ' + event.error);
        }
        setIsListening(false);
        if (onVoiceEnd) onVoiceEnd();
      };

      recognition.onend = () => {
        // Only auto-restart if user has not stopped it (continuous mode)
        if (isListening && !isMicrophoneAccessDenied) {
          try {
            recognition.start();
          } catch (e) {
            setIsListening(false);
          }
        } else {
          setIsListening(false);
          if (onVoiceEnd) onVoiceEnd();
        }
      };

      recognitionRef.current = recognition;
    }
    // Cleanup: stop any ongoing recognition on unmount
    return () => {
      isMounted.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        if (isListening) recognitionRef.current.stop();
      }
    };
    // eslint-disable-next-line
  }, []);

  // Start or stop continuous voice recognition on user action
  const handleMicClick = () => {
    setError('');
    if (!isSpeechSupported) {
      setError("Sorry, your browser doesn't support speech recognition.");
      return;
    }
    if (recognitionRef.current) {
      if (!isListening) {
        setIsMicrophoneAccessDenied(false);
        finalTranscriptRef.current = '';
        recognitionRef.current.lang = 'en-US'; // (Future: can make configurable per language selection)
        setIsListening(true);
        try {
          recognitionRef.current.start();
          if (onVoiceStart) onVoiceStart();
        } catch (e) {
          setError('Could not start voice recognition: ' + e.message);
          setIsListening(false);
        }
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
    // If user starts typing, stop listening
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (onVoiceEnd) onVoiceEnd();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <input
          type="text"
          className="input-box"
          placeholder={isListening ? 'Listening... (Press mic to stop)' : 'Type your text or use the mic'}
          value={inputText}
          onChange={handleInputChange}
          style={{
            flex: 1,
            padding: '12px 14px',
            borderRadius: 6,
            border: '1px solid #c9d1df',
            fontSize: '1.03rem',
            background: isListening ? '#faf7e1' : '#fff',
            outline: isListening ? '2px solid var(--accent)' : 'none',
            transition: 'all 0.15s'
          }}
          disabled={false}
        />
        <button
          type="button"
          onClick={handleMicClick}
          aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
          aria-pressed={isListening}
          className="btn"
          style={{
            background: isListening ? 'var(--accent)' : 'var(--primary)',
            color: 'var(--text-inverse)',
            borderRadius: '50%',
            width: 44,
            height: 44,
            border: isListening ? '2.3px solid #ffbb44' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.45rem',
            position: "relative",
            boxShadow: isListening ? '0 2px 11px rgba(245,166,35,0.21)' : undefined,
            transition: 'background 0.18s, border 0.18s'
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            {isListening ? (
              // "mic hot" (animate/pulse to indicate live audio)
              <svg viewBox="0 0 20 20" width={21} height={21} fill="currentColor">
                <ellipse cx="10" cy="10" rx="5.3" ry="6" fill="var(--text-inverse)" opacity="0.18"/>
                <rect x="7.7" y="6" width="4.6" height="8" rx="2.3" fill="var(--text-inverse)" />
                <rect x="10.8" y="4" width="1.4" height="4" rx="0.6" fill="#F5A623">
                  <animate
                    attributeName="height" values="4;10;4" dur="0.8s" repeatCount="indefinite"
                    begin="0.2s"
                  />
                </rect>
                <rect x="7.8" y="4" width="1.4" height="4" rx="0.6" fill="#4A90E2">
                  <animate
                    attributeName="height" values="10;4;10" dur="0.8s" repeatCount="indefinite"
                  />
                </rect>
              </svg>
            ) : (
              // Idle mic icon
              <svg viewBox="0 0 20 20" width={21} height={21} fill="currentColor">
                <ellipse cx="10" cy="10" rx="5.3" ry="6" fill="var(--text-inverse)" opacity="0.13"/>
                <rect x="7.7" y="6" width="4.6" height="8" rx="2.3" fill="var(--text-inverse)" />
                <rect x="10.8" y="7" width="1.4" height="5" rx="0.6" fill="#F5A623" />
                <rect x="7.8" y="7" width="1.4" height="5" rx="0.6" fill="#4A90E2" />
              </svg>
            )}
          </span>
        </button>
        {/* Live indicator */}
        {isListening && (
          <span
            style={{
              marginLeft: 5,
              padding: "2.5px 12px",
              background: "#FBFBDC",
              borderRadius: 7,
              color: "#cb7407",
              fontWeight: 600,
              fontSize: "0.98rem",
              letterSpacing: 0.15,
              border: "1.5px solid var(--accent)"
            }}
          >
            Mic is ON
          </span>
        )}
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
          ? "Listening (continuous)... You may speak as long as mic is ON."
          : "Type with your keyboard or use the mic button to start voice input."}
      </div>
    </div>
  );
}

export default InputPanel;
