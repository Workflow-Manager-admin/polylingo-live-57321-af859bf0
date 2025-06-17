import React from "react";
import "./FloatingCaptionOverlay.css";

/**
 * PUBLIC_INTERFACE
 * FloatingCaptionOverlay displays a fixed-position real-time caption overlay
 * with branding, background, fade-in/out, and responsive styling. 
 * 
 * Props:
 * - open: boolean (controls visibility)
 * - text: string (caption/translation to display)
 * - language: string (language label/abbreviation to show)
 * - onClose: function (optional, closes the overlay)
 */
function FloatingCaptionOverlay({ open, text, language, onClose }) {
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
      <div className="floating-caption-content">
        <span className="caption-language">
          {language ? language.toUpperCase() : ""}
        </span>
        <span className="caption-text">{text}</span>
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
