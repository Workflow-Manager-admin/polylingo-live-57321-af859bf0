# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

## Features

- **Lightweight**: No heavy UI frameworks - uses only vanilla CSS and React
- **Modern UI**: Clean, responsive design with KAVIA brand styling
- **Fast**: Minimal dependencies for quick loading times
- **Simple**: Easy to understand and modify

---

## Privacy & Security

### Privacy Guarantees

- **Local-Only Processing**: All language detection, translation logic, voice recognition, and text-to-speech operations run on the user’s device (“on-device”) and within your browser, unless the app is explicitly modified or extended to connect to external APIs. By default, no speech, text, or translation data leaves your machine.  
- **Microphone Usage**: Voice input functionality is strictly opt-in. Microphone access is requested only after you press the mic button, and capture runs locally by default via the browser’s Web Speech API.  
- **Overlay & TTS**: The floating caption overlay and text-to-speech features process content entirely within the browser.

### No External Cloud Processing

- **Translation Simulation**: This template/demo simulates a translation API in-browser (no actual data sent to cloud services).  
- If you integrate a real external translation service, review its data handling and obtain user consent for data uploads.

### Security Boundaries (Overlay and Main App)

- The floating overlay component operates strictly within the visible browser application bounds. It does not have the ability to access, manipulate, or eavesdrop on other browser tabs, OS-level windows, or non-app UI elements.
- No information is shared by the overlay unless the app is extended or reconfigured.

### Explicit User Consent

- **Microphone Access**:  
  - PolyLingo Live requests your consent before accessing the microphone. Your browser will display a permissions prompt before any audio is captured.
  - Microphone capture is fully under your control—toggle it on/off at any time using the mic button.
- **Overlay & On-Screen Captioning**:  
  - The overlay is enabled or disabled by the user. Overlay shows your translation content (not other data).
- **Text-to-Speech**:  
  - TTS is triggered only after user request (via toggle or speech button).

### Browser Requirements & API Limitations

- **Required Browser Features:**  
  - Web Speech API: Used for both voice recognition (input) and text-to-speech (output).
  - Clipboard API: Used for “copy translation” functionality.
  - Modern JavaScript and CSS support (see `browserslist` in `package.json`).
- **Supported Browsers:**  
  - Chrome, Edge, and Safari support Web Speech API. Firefox has partial support (but may not support speech recognition as of mid-2024).
  - If required browser APIs are not present (or denied via user privacy settings), microphone and speech buttons will disable themselves and display guidance.

- **Limitations:**  
  - The Web Speech API and TTS feature quality varies by browser and OS. Some features may not be available or may prompt for user consent/policy acceptance per session.

### On-Device Resource Usage

- **Voice Input**: When enabled, voice-to-text uses the device microphone and processes audio locally.
- **Translation**: Demo logic is fast and lightweight, so memory/CPU usage is modest. Integrations with heavy AI models or third-party APIs can impact device resources.
- **Overlay**: The floating overlay is a lightweight UI only—no additional resource or privacy impact exists when enabled.

### Guidance for Sensitive Scenarios

- If your application is integrated with real cloud/third-party APIs, you are responsible for updating privacy notices and obtaining additional user consents as appropriate.
- In high-security environments, run PolyLingo Live in a browser with strict privacy protections, disable microphone access, or disable overlays as needed.
- Always inform users if any application mode or extension departs from the default “on-device only” privacy model.

---

## Important Note: Babel Configuration

This project’s `package.json` includes a `babel` section with a plugin:

```json
"babel": {
"plugins": ["./.ve/babel-plugin-jsx-editor-id.js"]
}
```

This plugin enables **visual editing functionality** in supported tools.

**Warning for AI code agents and contributors:**
**DO NOT** remove or modify this section - it is ESSENTIAL for proper operation.
Removing it will break editor integration and visual editing features.

## Getting Started

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Customization

### Colors

The main brand colors are defined as CSS variables in `src/App.css`:

```css
:root {
  --kavia-orange: #E87A41;
  --kavia-dark: #1A1A1A;
  --text-color: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --border-color: rgba(255, 255, 255, 0.1);
}
```

### Components

This template uses pure HTML/CSS components instead of a UI framework. You can find component styles in `src/App.css`. 

Common components include:
- Buttons (`.btn`, `.btn-large`)
- Container (`.container`)
- Navigation (`.navbar`)
- Typography (`.title`, `.subtitle`, `.description`)

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
