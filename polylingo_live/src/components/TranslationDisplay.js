import React, { useRef, useState } from "react";

/**
 * PUBLIC_INTERFACE
 * TranslationDisplay shows translation results per language,
 * with text-to-speech, copy to clipboard, and replay functionality.
 * It is branded to PolyLingo Live and designed to handle multiple output languages.
 *
 * Props:
 * - translations: { [langCode]: translatedText }
 * - outputLanguages: [langCode, ...]
 * - isTranslating: boolean
 * 
 * Example usage:
 * <TranslationDisplay
 *    translations={...}
 *    outputLanguages={['es','fr']}
 *    isTranslating={false}
 * />
 */
const languageLabels = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  zh: "Chinese",
  hi: "Hindi",
  ar: "Arabic",
  ja: "Japanese",
  ru: "Russian",
};

function getVoiceLang(code) {
  // Try to best-match speechSynthesis voices
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

function TranslationDisplay({ translations, outputLanguages, isTranslating }) {
  const [audioStates, setAudioStates] = useState({});
  const [copyStates, setCopyStates] = useState({});

  const ttsRefs = useRef({}); // Track which text is being/has been spoken

  // PUBLIC_INTERFACE
  const handleSpeak = (lang, text) => {
    if (!window.speechSynthesis) return;
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    const utter = new window.SpeechSynthesisUtterance(text);
    const targetLang = getVoiceLang(lang);

    // Find best voice matching language
    const voices = window.speechSynthesis.getVoices();
    const match =
      voices.find((v) => v.lang === targetLang) ||
      voices.find((v) => v.lang.startsWith(lang)) ||
      voices.find((v) => v.lang.startsWith(targetLang.slice(0, 2))) ||
      voices[0];

    if (match) utter.voice = match;
    utter.lang = targetLang;

    setAudioStates((prev) => ({ ...prev, [lang]: "playing" }));
    utter.onend = () =>
      setAudioStates((prev) => ({ ...prev, [lang]: "idle" }));
    utter.onerror = () =>
      setAudioStates((prev) => ({ ...prev, [lang]: "idle" }));

    window.speechSynthesis.speak(utter);
    ttsRefs.current[lang] = utter;
  };

  // PUBLIC_INTERFACE
  const handleReplay = (lang) => {
    if (!translations[lang]) return;
    handleSpeak(lang, translations[lang]);
  };

  // PUBLIC_INTERFACE
  const handleCopy = (lang, text) => {
    if (!navigator.clipboard) {
      window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
    } else {
      navigator.clipboard.writeText(text);
      setCopyStates((prev) => ({ ...prev, [lang]: "copied" }));
      setTimeout(
        () => setCopyStates((prev) => ({ ...prev, [lang]: undefined })),
        1300
      );
    }
  };

  const isSpeechSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  // If nothing to show:
  if (!outputLanguages?.length) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {outputLanguages.map((lang) => (
        <div
          key={lang}
          style={{
            marginBottom: 6,
            background: "#f3f6ff",
            borderRadius: 6,
            padding: "10px 13px 11px 13px",
            boxShadow: "0 0.5px 3.5px rgba(74,144,226,0.10)",
            display: "flex",
            alignItems: "flex-start",
            position: "relative",
          }}
        >
          <div style={{ flex: 1 }}>
            <span
              style={{
                fontWeight: 600,
                color: "#4A90E2",
                fontSize: "1.05rem",
                marginRight: 9,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
              title={languageLabels[lang] || lang.toUpperCase()}
            >
              {lang.toUpperCase()}
            </span>
            <span style={{ color: "#263152", fontSize: "1.09rem", wordBreak: "break-word" }}>
              {translations[lang] || <span style={{ color: "#b5b5b5" }}>(no result)</span>}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              marginLeft: 16,
            }}
          >
            {/* Speak button */}
            <button
              className="btn"
              title={
                isSpeechSupported
                  ? audioStates[lang] === "playing"
                    ? "Playing"
                    : `Speak: ${languageLabels[lang] || lang}`
                  : "Text-to-Speech not supported"
              }
              style={{
                background: isSpeechSupported
                  ? audioStates[lang] === "playing"
                    ? "var(--accent)"
                    : "var(--secondary)"
                  : "#eee",
                color: "var(--text-inverse)",
                borderRadius: "50%",
                width: 37,
                height: 37,
                fontSize: "1.08rem",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                opacity:
                  !isSpeechSupported || !translations[lang] ? 0.53 : 1,
                cursor:
                  !isSpeechSupported || !translations[lang]
                    ? "not-allowed"
                    : "pointer",
                boxShadow:
                  audioStates[lang] === "playing"
                    ? "0 1px 6px rgba(245,166,35,0.23)"
                    : undefined,
                transition: "background 0.16s",
                outline: "none",
              }}
              disabled={
                !isSpeechSupported ||
                !translations[lang] ||
                isTranslating
              }
              onClick={() => handleSpeak(lang, translations[lang])}
              aria-label={`Speak ${lang.toUpperCase()}`}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                <ellipse
                  cx="12"
                  cy="12"
                  rx="9"
                  ry="9"
                  fill="var(--text-inverse)"
                  opacity="0.11"
                />
                <path
                  d="M7.5 13V11C7.5 8.79086 9.29086 7 11.5 7C13.7091 7 15.5 8.79086 15.5 11V13C15.5 15.2091 13.7091 17 11.5 17C9.29086 17 7.5 15.2091 7.5 13Z"
                  fill="currentColor"
                  opacity={audioStates[lang] === "playing" ? "1" : "0.30"}
                />
                <path
                  d="M18 13C18.5523 13 19 12.5523 19 12C19 11.4477 18.5523 11 18 11"
                  stroke="var(--accent)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  opacity="0.74"
                />
              </svg>
            </button>
            {/* Replay button */}
            <button
              className="btn"
              title="Replay"
              aria-label={`Replay audio ${lang.toUpperCase()}`}
              style={{
                background: "var(--base-light)",
                color: "var(--text-inverse)",
                borderRadius: "50%",
                width: 34,
                height: 34,
                fontSize: "1.1rem",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                opacity:
                  !isSpeechSupported || !translations[lang] ? 0.45 : 1,
                cursor:
                  !isSpeechSupported || !translations[lang]
                    ? "not-allowed"
                    : "pointer",
                outline: "none",
                marginLeft: 0,
              }}
              disabled={
                !isSpeechSupported ||
                !translations[lang] ||
                isTranslating
              }
              onClick={() => handleReplay(lang)}
            >
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path
                  d="M8.5 3.5V1L5 4.5L8.5 8V5.5C11.5376 5.5 14 7.96243 14 11C14 14.0376 11.5376 16.5 8.5 16.5C5.46243 16.5 3 14.0376 3 11"
                  stroke="var(--text-inverse)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {/* Copy button */}
            <button
              className="btn"
              title={
                copyStates[lang] === "copied"
                  ? "Copied!"
                  : "Copy translation"
              }
              aria-label={`Copy ${lang.toUpperCase()} translation`}
              style={{
                background: "var(--primary)",
                color: "var(--text-inverse)",
                borderRadius: "50%",
                width: 34,
                height: 34,
                fontSize: "1.07rem",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                outline: "none",
                marginLeft: 0,
                opacity: !translations[lang] ? 0.44 : 1,
                cursor: !translations[lang] ? "not-allowed" : "pointer",
                boxShadow:
                  copyStates[lang] === "copied"
                    ? "0 1px 6px rgba(80,227,194,0.21)"
                    : undefined,
                transition: "background 0.15s, box-shadow 0.15s",
              }}
              disabled={!translations[lang] || isTranslating}
              onClick={() => handleCopy(lang, translations[lang])}
            >
              {copyStates[lang] === "copied" ? (
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                  <path
                    d="M13.5 5.5L7.25 11.5L4.5 8.75"
                    stroke="#fff"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <rect
                    x="3"
                    y="3"
                    width="8"
                    height="10"
                    rx="2"
                    fill="var(--text-inverse)"
                    opacity="0.12"
                  />
                  <rect
                    x="5"
                    y="1"
                    width="8"
                    height="10"
                    rx="2"
                    stroke="#fff"
                    strokeWidth="1.4"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TranslationDisplay;
