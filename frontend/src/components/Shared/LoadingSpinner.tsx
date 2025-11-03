import React from 'react';

const _LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div role="status" aria-live="polite" className="loading-spinner">
    <svg width="24" height="24" viewBox="0 0 50 50" aria-hidden>
      <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5" stroke="#0078d4" strokeLinecap="round" />
    </svg>
    <span className="sr-only">{message}</span>
    <span>{message}</span>
  </div>
);

export default _LoadingSpinner;
