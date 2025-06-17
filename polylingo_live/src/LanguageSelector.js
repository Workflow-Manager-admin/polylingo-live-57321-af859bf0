import React from "react";

// Mocked language list for demo (can be replaced with real API data)
const MOCK_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "zh", name: "Chinese" },
  { code: "hi", name: "Hindi" },
  { code: "ar", name: "Arabic" },
  { code: "ja", name: "Japanese" },
  { code: "ru", name: "Russian" },
];

/**
 * PUBLIC_INTERFACE
 * LanguageSelector allows user to select input/output languages,
 * toggle auto-detect, and manages dropdown state.
 */
function LanguageSelector({
  inputLanguage,
  outputLanguage,
  onInputLanguageChange,
  onOutputLanguageChange,
  autoDetect,
  onAutoDetectChange,
  languages = MOCK_LANGUAGES,
}) {
  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <label
          htmlFor="input-language"
          style={{
            fontWeight: 500,
            fontSize: "0.97rem",
            marginRight: 10,
          }}
        >
          Input Language:
        </label>
        <select
          id="input-language"
          value={inputLanguage}
          onChange={(e) => onInputLanguageChange(e.target.value)}
          disabled={autoDetect}
          style={{
            padding: "6px 12px",
            marginRight: 10,
            borderRadius: 5,
            border: "1px solid #d5dbe3",
            background: autoDetect ? "#f9f9fc" : "#fff",
            color: "#333",
            minWidth: 120,
            cursor: autoDetect ? "not-allowed" : "pointer",
          }}
        >
          {languages.map((lang) => (
            <option value={lang.code} key={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
        <label style={{ fontSize: "0.93rem" }}>
          <input
            type="checkbox"
            checked={autoDetect}
            onChange={(e) => onAutoDetectChange(e.target.checked)}
            style={{ marginRight: 6 }}
            id="auto-detect-toggle"
          />
          Auto-detect
        </label>
      </div>
      <div>
        <label
          htmlFor="output-language"
          style={{
            fontWeight: 500,
            fontSize: "0.97rem",
            marginRight: 10,
          }}
        >
          Output Language:
        </label>
        <select
          id="output-language"
          value={outputLanguage}
          onChange={(e) => onOutputLanguageChange(e.target.value)}
          style={{
            padding: "6px 12px",
            borderRadius: 5,
            border: "1px solid #d5dbe3",
            background: "#fff",
            color: "#333",
            minWidth: 120,
            cursor: "pointer",
          }}
        >
          {languages.map((lang) => (
            <option value={lang.code} key={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>
      <div style={{ fontSize: "0.93rem", color: "#687485", marginTop: 10 }}>
        {autoDetect
          ? "The input language will be detected automatically."
          : "Select a specific language for input."}
      </div>
    </div>
  );
}

export default LanguageSelector;
