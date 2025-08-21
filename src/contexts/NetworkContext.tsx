import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setApiBaseUrl } from '../services/api';

export type NetworkType = 'MainNet' | 'TestNet' | 'DevNet';

export interface NetworkConfig {
  name: NetworkType;
  displayName: string;
  url: string;
  color: string;
  description: string;
}

export const networkConfigs: Record<NetworkType, NetworkConfig> = {
  MainNet: {
    name: 'MainNet',
    displayName: 'MainNet',
    url: 'https://stellaris-node.connor33341.dev',
    color: '#10b981',
    description: 'Stellaris Main Network'
  },
  TestNet: {
    name: 'TestNet',
    displayName: 'TestNet',
    url: 'http://localhost:3006',
    color: '#f59e0b',
    description: 'Stellaris Test Network'
  },
  DevNet: {
    name: 'DevNet',
    displayName: 'DevNet',
    url: 'http://devnet.stellaris-node.connor33341.dev',
    color: '#8b5cf6',
    description: 'Stellaris Development Network'
  }
};

interface NetworkContextType {
  currentNetwork: NetworkConfig;
  switchNetwork: (network: NetworkType) => void;
  isNetworkAvailable: (network: NetworkType) => Promise<boolean>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [currentNetwork, setCurrentNetwork] = useState<NetworkConfig>(networkConfigs.MainNet);

  // Load saved network from localStorage
  useEffect(() => {
    const savedNetwork = localStorage.getItem('stellaris-explorer-network') as NetworkType;
    if (savedNetwork && networkConfigs[savedNetwork]) {
      setCurrentNetwork(networkConfigs[savedNetwork]);
    }
  }, []);

  // Save network to localStorage and update API URL when it changes
  useEffect(() => {
    localStorage.setItem('stellaris-explorer-network', currentNetwork.name);
    setApiBaseUrl(currentNetwork.url);
  }, [currentNetwork]);

  const switchNetwork = (network: NetworkType) => {
    setCurrentNetwork(networkConfigs[network]);
  };

  const isNetworkAvailable = async (network: NetworkType): Promise<boolean> => {
    try {
      const config = networkConfigs[network];
      const response = await fetch(`${config.url}/get_mining_info`, {
        method: 'GET',
        timeout: 5000
      } as any);
      return response.ok;
    } catch (error) {
      console.warn(`Network ${network} is not available:`, error);
      return false;
    }
  };

  return (
    <NetworkContext.Provider value={{
      currentNetwork,
      switchNetwork,
      isNetworkAvailable
    }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
