import React, { useState, useEffect } from 'react';
import QuasarWallet from '../../../quasar/src/lib/browser/wallet-injection';
import './QuasarInterface.scss';

// Declare window.quasar type using the proper QuasarWallet class
declare global {
  interface Window {
    quasar?: QuasarWallet;
  }
}

const QuasarInterface: React.FC = () => {
  const [isQuasarAvailable, setIsQuasarAvailable] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check if window.quasar exists and its connection status
    const checkQuasarAvailability = () => {
      const available = !!window.quasar;
      setIsQuasarAvailable(available);
      
      if (available && window.quasar) {
        setIsConnected(window.quasar.connected);
      } else {
        setIsConnected(false);
      }
    };

    // Check immediately
    checkQuasarAvailability();

    // Listen for the quasar:ready event
    const handleQuasarReady = () => {
      setIsQuasarAvailable(true);
      if (window.quasar) {
        setIsConnected(window.quasar.connected);
      }
    };

    // Listen for Quasar wallet ready event
    window.addEventListener('quasar:ready', handleQuasarReady);

    // Also check periodically in case Quasar loads after the component
    const interval = setInterval(checkQuasarAvailability, 1000);

    // Cleanup interval and event listener on unmount
    return () => {
      clearInterval(interval);
      window.removeEventListener('quasar:ready', handleQuasarReady);
    };
  }, []);

  const handleClick = async () => {
    if (isQuasarAvailable && window.quasar) {
      try {
        if (isConnected) {
          // If already connected, show account info or disconnect
          console.log('Quasar wallet is already connected');
        } else {
          // Use the proper connect method from QuasarWallet
          await window.quasar.connect();
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Failed to connect to Quasar wallet:', error);
      }
    } else {
      // Redirect to Quasar installation/download page
      window.open('https://github.com/StellarisChain/quasar/releases', '_blank');
    }
  };

  const getButtonText = () => {
    if (!isQuasarAvailable) {
      return 'Install Quasar';
    }
    return isConnected ? 'Quasar Connected' : 'Connect Quasar';
  };

  return (
    <button 
      className={`quasar-interface ${isConnected ? 'connected' : ''}`}
      onClick={handleClick}
      aria-label={isQuasarAvailable ? (isConnected ? "Quasar Wallet Connected" : "Connect Quasar Wallet") : "Install Quasar Wallet"}
    >
      <div className="quasar-logo">
        <img 
          src="/quasar-logo.png" 
          alt="Quasar Logo" 
          className="logo-icon"
        />
      </div>
      <span className="quasar-text">
        {getButtonText()}
      </span>
    </button>
  );
};

export default QuasarInterface;
