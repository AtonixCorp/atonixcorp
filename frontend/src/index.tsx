import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initializeOpenTelemetry } from './observability/telemetry';
import * as serviceWorkerRegistration from './serviceWorker';

// Initialize OpenTelemetry before anything else
initializeOpenTelemetry();

const _root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
_root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA functionality
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
