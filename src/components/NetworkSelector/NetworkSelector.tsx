import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe, Activity, Zap } from 'lucide-react';
import { useNetwork, NetworkType, networkConfigs } from '../../contexts/NetworkContext';
import './NetworkSelector.scss';

const NetworkSelector: React.FC = () => {
  const { currentNetwork, switchNetwork, isNetworkAvailable } = useNetwork();
  const [isOpen, setIsOpen] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<Record<NetworkType, boolean>>({
    MainNet: true,
    TestNet: false,
    DevNet: false
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check network availability on component mount
  useEffect(() => {
    const checkNetworks = async () => {
      const status: Record<NetworkType, boolean> = {
        MainNet: false,
        TestNet: false,
        DevNet: false
      };
      
      for (const networkType of Object.keys(networkConfigs) as NetworkType[]) {
        status[networkType] = await isNetworkAvailable(networkType);
      }
      
      setNetworkStatus(status);
    };

    checkNetworks();
  }, [isNetworkAvailable]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNetworkSelect = (network: NetworkType) => {
    switchNetwork(network);
    setIsOpen(false);
  };

  const getNetworkIcon = (network: NetworkType) => {
    switch (network) {
      case 'MainNet':
        return <Globe size={16} />;
      case 'TestNet':
        return <Activity size={16} />;
      case 'DevNet':
        return <Zap size={16} />;
      default:
        return <Globe size={16} />;
    }
  };

  return (
    <div className="network-selector" ref={dropdownRef}>
      <button
        className="network-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="network-info">
          <div className="network-icon" style={{ color: currentNetwork.color }}>
            {getNetworkIcon(currentNetwork.name)}
          </div>
          <div className="network-details">
            <span className="network-name">{currentNetwork.displayName}</span>
            <div className="network-status">
              <div 
                className={`status-indicator ${networkStatus[currentNetwork.name] ? 'online' : 'offline'}`}
              ></div>
              <span className="status-text">
                {networkStatus[currentNetwork.name] ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
        <ChevronDown 
          size={16} 
          className={`chevron ${isOpen ? 'chevron-open' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="network-dropdown">
          <div className="dropdown-header">
            <h4>Select Network</h4>
          </div>
          <div className="network-list" role="listbox">
            {Object.values(networkConfigs).map((network) => (
              <button
                key={network.name}
                className={`network-option ${
                  currentNetwork.name === network.name ? 'selected' : ''
                } ${networkStatus[network.name] ? 'available' : 'unavailable'}`}
                onClick={() => handleNetworkSelect(network.name)}
                disabled={!networkStatus[network.name]}
                role="option"
                aria-selected={currentNetwork.name === network.name}
              >
                <div className="option-content">
                  <div className="option-icon" style={{ color: network.color }}>
                    {getNetworkIcon(network.name)}
                  </div>
                  <div className="option-details">
                    <div className="option-name">{network.displayName}</div>
                    <div className="option-description">{network.description}</div>
                  </div>
                  <div className="option-status">
                    <div 
                      className={`status-indicator ${networkStatus[network.name] ? 'online' : 'offline'}`}
                    ></div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkSelector;
