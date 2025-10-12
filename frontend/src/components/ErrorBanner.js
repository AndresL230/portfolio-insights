import React from 'react';

const ErrorBanner = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div className="error-banner">
      <span>Warning: {error}</span>
      <button onClick={onClose} className="error-close">×</button>
    </div>
  );
};

export default ErrorBanner;
