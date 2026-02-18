import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initializeOpenTelemetry } from './observability/telemetry';
import * as serviceWorkerRegistration from './serviceWorker';

// Initialize OpenTelemetry before anything else
initializeOpenTelemetry();

const ____root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
____root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Signal to the static index.html that the app has mounted so the
// initial loading spinner can be hidden. Also remove the spinner DOM
// node as a fallback for browsers that may not respect the .app-loaded
// class immediately.
document.body.classList.add('app-loaded');
const __loadingSpinner = document.getElementById('loading-spinner');
if (__loadingSpinner && __loadingSpinner.parentNode) {
  __loadingSpinner.parentNode.removeChild(__loadingSpinner);
}

// Service worker disabled (causes load hang when cached filenames change)
// serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
