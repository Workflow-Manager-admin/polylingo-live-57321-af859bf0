import React from "react";

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

// PUBLIC_INTERFACE
/**
 * HistoryPanel displays translation history records and provides
 * per-item controls for copy, replay (TTS), replay translation, and clearing history.
 *
 * Props:
 * - history: Array of { inputText, inputLanguage, autoDetect, outputLanguages, translated, timestamp }
 * - onReplay: (item) => void
 * - onSpeak: (lang, text) => void
 * - onCopy: (lang, text) => void
 * - onClear: () => void
 */
function HistoryPanel({ history, onReplay, onSpeak, onCopy, onClear, copyStates, isSpeechSupported }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 60 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        {history.length > 0 && (
          <button
            className="btn"
            style={{
              fontSize: "0.95rem",
              padding: "7px 18px",
              background: "var(--secondary)",
              marginBottom: 3,
              marginRight: 2,
            }}
            onClick={onClear}
            aria-label="Clear translation history"
            title="Clear history"
          >
            Clear
          </button>
        )}
      </div>
      {!history.length && (
        <div className="section-placeholder" style={{ textAlign: "left", color: "#959cab" }}>
          No translation history yet. Your recent translations will appear here!
        </div>
      )}
      {history.length > 0 && (
        <ol style={{ padding: 0, margin: 0, listStyle: "none", maxHeight: 328, overflowY: "auto" }}>
          {history.map((item, idx) => (
            <li
              key={item.timestamp + "_" + idx}
              style={{
                background: "#f7fafc",
                borderRadius: 8,
                marginBottom: 8,
                padding: "10px 12px 7px 12px",
                boxShadow: "0 1px 8px rgba(80,227,194,0.04)",
                border: "1px solid var(--border-color)",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    fontWeight: 600,
                    color: "#4A90E2",
                    fontSize: "0.99rem",
                    letterSpacing: 0.3,
                  }}
                  title={
                    item.autoDetect
                      ? "Auto-detected"
                      : languageLabels[item.inputLanguage] || item.inputLanguage.toUpperCase()
                  }
                >
                  {item.autoDetect ? "Auto" : (item.inputLanguage || "??").toUpperCase()}
                </span>
                <span
                  style={{
                    color: "#454e59",
                    fontSize: "1.01rem",
                    fontWeight: 500,
                    wordBreak: "break-word",
                    flex: 1,
                  }}
                  title={item.inputText.length > 52 ? item.inputText : undefined}
                >
                  {item.inputText.length > 52
                    ? item.inputText.slice(0, 52) + "…"
                    : item.inputText}
                </span>
                <span style={{ fontSize: "0.92rem", color: "#7c8ba1" }}>
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div style={{ marginLeft: 2 }}>
                {item.outputLanguages.map((lang) => (
                  <div key={lang} style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "0.95rem",
                    marginTop: 2,
                  }}>
                    <span style={{
                      fontWeight: 500,
                      color: "#35b0a2",
                      letterSpacing: 0.4,
                      fontSize: "0.96rem",
                      marginRight: 6,
                      minWidth: 27,
                      textTransform: "uppercase",
                    }}>
                      {lang.toUpperCase()}
                    </span>
                    <span style={{
                      color: "#42556b",
                      marginRight: 7,
                      wordBreak: "break-word",
                      fontSize: "0.97rem",
                      flex: 1,
                    }}>
                      {(item.translated && item.translated[lang])
                        ? (item.translated[lang].length > 45
                          ? item.translated[lang].slice(0, 44) + "…"
                          : item.translated[lang])
                        : <span style={{ color: "#b5b5b5" }}>(no result)</span>}
                    </span>
                    <button
                      className="btn"
                      title="Replay translation"
                      aria-label={`Replay translation for ${lang}`}
                      style={{
                        background: "var(--accent)",
                        color: "var(--text-inverse)",
                        borderRadius: "34%",
                        width: 31,
                        height: 31,
                        fontSize: "1rem",
                        border: "none",
                        marginLeft: 0,
                        marginRight: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: item.translated && item.translated[lang] ? 1 : 0.42,
                        cursor: item.translated && item.translated[lang] ? "pointer" : "not-allowed",
                        outline: "none",
                      }}
                      disabled={!item.translated || !item.translated[lang]}
                      onClick={() => onReplay && onReplay({ ...item, replayLang: lang })}
                    >
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                        <path d="M7 3V1L3 5L7 9V7C10 7 13 10 13 13C13 16 10 19 7 19C4 19 1 16 1 13" stroke="#fff" strokeWidth="1.35" strokeLinecap="round"/>
                      </svg>
                    </button>
                    <button
                      className="btn"
                      title="Speak translation"
                      aria-label={`TTS for ${lang}`}
                      style={{
                        background: isSpeechSupported ? "var(--secondary)" : "#eee",
                        color: "var(--text-inverse)",
                        borderRadius: "50%",
                        width: 30,
                        height: 30,
                        fontSize: "1rem",
                        border: "none",
                        marginLeft: 0,
                        marginRight: 2,
                        opacity: (!isSpeechSupported || !item.translated || !item.translated[lang]) ? 0.55 : 1,
                        cursor: (!isSpeechSupported || !item.translated || !item.translated[lang]) ? "not-allowed" : "pointer",
                        outline: "none",
                      }}
                      disabled={!isSpeechSupported || !item.translated || !item.translated[lang]}
                      onClick={() => onSpeak && onSpeak(lang, item.translated[lang])}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <ellipse cx="12" cy="12" rx="9" ry="9" fill="var(--text-inverse)" opacity="0.11"/>
                        <path d="M7.5 13V11C7.5 8.79086 9.29086 7 11.5 7C13.7091 7 15.5 8.79086 15.5 11V13C15.5 15.2091 13.7091 17 11.5 17C9.29086 17 7.5 15.2091 7.5 13Z" fill="currentColor" opacity="0.42" />
                        <path d="M18 13C18.5523 13 19 12.5523 19 12C19 11.4477 18.5523 11 18 11" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" opacity="0.74"/>
                      </svg>
                    </button>
                    <button
                      className="btn"
                      title={copyStates && copyStates[item.timestamp + "_" + lang] === "copied" ? "Copied!" : "Copy translation"}
                      aria-label={`Copy ${lang} translation`}
                      style={{
                        background: "var(--primary)",
                        color: "var(--text-inverse)",
                        borderRadius: "50%",
                        width: 30,
                        height: 30,
                        fontSize: "1rem",
                        border: "none",
                        marginLeft: 1,
                        opacity: !item.translated || !item.translated[lang] ? 0.44 : 1,
                        cursor: !item.translated || !item.translated[lang] ? "not-allowed" : "pointer",
                        outline: "none",
                        boxShadow:
                          copyStates && copyStates[item.timestamp + "_" + lang] === "copied"
                            ? "0 1px 6px rgba(80,227,194,0.21)"
                            : undefined,
                        transition: "background 0.15s, box-shadow 0.15s",
                      }}
                      disabled={!item.translated || !item.translated[lang]}
                      onClick={() =>
                        onCopy &&
                        onCopy(lang, item.translated[lang], item.timestamp + "_" + lang)
                      }
                    >
                      {copyStates && copyStates[item.timestamp + "_" + lang] === "copied" ? (
                        <svg width="14" height="14" viewBox="0 0 17 17" fill="none">
                          <path d="M13.5 5.5L7.25 11.5L4.5 8.75" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/>
                        </svg>
                      ) : (
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                          <rect x="3" y="3" width="8" height="10" rx="2" fill="var(--text-inverse)" opacity="0.12"/>
                          <rect x="5" y="1" width="8" height="10" rx="2" stroke="#fff" strokeWidth="1.25"/>
                        </svg>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default HistoryPanel;
