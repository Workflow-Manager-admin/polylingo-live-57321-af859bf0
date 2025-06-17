import React from "react";
import "./FloatingCaptionOverlay.css";

/**
 * PUBLIC_INTERFACE
 * FloatingCaptionOverlay displays a fixed-position real-time caption overlay
 * with branding, background, fade-in/out, and responsive styling, and can host
 * overlay control elements such as TTS toggle.
 * 
 * Privacy/Security Notes:
 * - The overlay only displays translation output from within the app; it cannot interact with or
 *   capture content from other browser tabs, windows, or applications (strict web security model).
 * - All overlay logic runs on-device, and no overlay information is transmitted off-device.
 * - TTS in the overlay is user-controlled.
 *
 * Props:
 * - open: boolean (controls visibility)
 * - text: string (caption/translation to display)
 * - language: string (language label/abbreviation to show)
 * - onClose: function (optional, closes the overlay)
 * - ttsEnabled: boolean (optional) - TTS toggle state
 * - onTTSChanged: function(newVal) (optional) - toggles TTS
 * - isSpeechSupported: boolean (optional) - for greying toggle when not supported
 */
function FloatingCaptionOverlay({ open, text, language, onClose, ttsEnabled, onTTSChanged, isSpeechSupported }) {
  return (
    <div
      className={`floating-caption-overlay${open ? " show" : ""}`}
      tabIndex={open ? 0 : -1}
      aria-live="polite"
      aria-label="Live Translation Overlay"
      style={{
        pointerEvents: open ? "auto" : "none",
        opacity: open ? 1 : 0,
        transition: "opacity 0.25s"
      }}
    >
      <div className="floating-caption-content" style={{width: "100%"}}>
        <span className="caption-language">
          {language ? language.toUpperCase() : ""}
        </span>
        <span className="caption-text">{text}</span>

        {/* TTS Toggle: shown right side, can be hidden if prop omitted */}
        {typeof ttsEnabled === "boolean" && typeof onTTSChanged === "function" && (
          <label style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginLeft: 16,
            userSelect: "none",
            background: "rgba(255,255,255,0.09)",
            borderRadius: 7,
            padding: "2px 8px"
          }}>
            <input
              type="checkbox"
              checked={ttsEnabled}
              onChange={e => onTTSChanged(e.target.checked)}
              disabled={!isSpeechSupported}
              aria-label={isSpeechSupported ? "Enable translated speech (TTS)" : "TTS not supported in browser"}
              style={{
                accentColor: "#F5A623",
                width: 17, height: 17,
                marginRight: 3
              }}
            />
            <span style={{
              color: isSpeechSupported ? "#fff" : "#abaeba",
              opacity: isSpeechSupported ? 1 : 0.44,
              fontWeight: 600,
              fontSize: "0.98rem",
              letterSpacing: 0.15,
              textShadow: "0 1px 8px rgba(34,69,140,0.13)",
              marginRight: 2
            }}>
              TTS
            </span>
            <span role="img" aria-label="speaker" style={{fontSize:"1.13em", color: isSpeechSupported && ttsEnabled ? "#FAE72C" : "#b3bdc7"}}>
              🔊
            </span>
          </label>
        )}
        
        {onClose && (
          <button className="caption-close-btn" onClick={onClose} aria-label="Close overlay">
            ×
          </button>
        )}
      </div>
    </div>
  );
}

export default FloatingCaptionOverlay;
