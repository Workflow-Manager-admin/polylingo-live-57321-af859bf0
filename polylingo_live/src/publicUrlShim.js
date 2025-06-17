/**
 * Ensures PUBLIC_URL global is defined for both browser & build environments.
 * Prevents ReferenceError during macro/template processing or in code.
 * Required for compatibility with some build/macros even if not directly used.
 */
if (typeof PUBLIC_URL === "undefined") {
  var PUBLIC_URL = "";
}
if (typeof window !== "undefined" && typeof window.PUBLIC_URL === "undefined") {
  window.PUBLIC_URL = "";
}
