import React from 'react';

const _ErrorBanner: React.FC<{ message?: string }> = ({ message = 'An error occurred.' }) => (
  <div role="alert" className="error-banner" style={{ color: '#9b0000', background: '#fff1f0', padding: '12px', borderRadius: 4 }}>
    <strong>Error:</strong> <span>{message}</span>
  </div>
);

export default _ErrorBanner;
