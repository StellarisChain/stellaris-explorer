import React, { useState, useEffect } from 'react';
import './QuasarInterface.scss';

// Declare window.quasar type
declare global {
  interface Window {
    quasar?: {
      connect: () => void;
    };
  }
}

const QuasarInterface: React.FC = () => {
  const [isQuasarAvailable, setIsQuasarAvailable] = useState(false);

  useEffect(() => {
    // Check if window.quasar exists
    const checkQuasarAvailability = () => {
      setIsQuasarAvailable(!!window.quasar);
    };

    // Check immediately
    checkQuasarAvailability();

    // Also check periodically in case Quasar loads after the component
    const interval = setInterval(checkQuasarAvailability, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    if (isQuasarAvailable && window.quasar && window.quasar.connect) {
      window.quasar.connect();
    } else {
      // Redirect to Quasar installation/download page
      window.open('https://www.quasar.com/download', '_blank');
    }
  };

  return (
    <button 
      className="quasar-interface" 
      onClick={handleClick}
      aria-label={isQuasarAvailable ? "Connect Quasar Wallet" : "Install Quasar Wallet"}
    >
      <div className="quasar-logo">
        <img 
          src="/quasar-logo.png" 
          alt="Quasar Logo" 
          className="logo-icon"
        />
      </div>
      <span className="quasar-text">
        {isQuasarAvailable ? 'Connect Quasar' : 'Install Quasar'}
      </span>
    </button>
  );
};

export default QuasarInterface;
