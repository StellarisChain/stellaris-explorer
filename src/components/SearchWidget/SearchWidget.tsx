import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import stellarisAPI, { MiningInfo } from '../../services/api';
import './SearchWidget.scss';

const SearchWidget: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [miningInfo, setMiningInfo] = useState<MiningInfo | null>(null);
  const navigate = useNavigate();

  // Prefetch mining info to power example values
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const info = await stellarisAPI.getMiningInfo();
        if (isMounted) setMiningInfo(info);
      } catch (e) {
        // Non-blocking; examples just won't show dynamic data
        console.warn('SearchWidget: failed to fetch mining info', e);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim();
    
    // Determine search type and navigate based on Stellaris patterns
    if (/^[a-fA-F0-9]{64}$/.test(query)) {
      // 64-character hex string - likely a transaction hash or block hash
      navigate(`/tx/${query}`);
    } else if (/^\d+$/.test(query)) {
      // Pure number - block ID
      navigate(`/block/${query}`);
    } else if (query.length > 30 && /^[A-Za-z0-9]+$/.test(query)) {
      // Long alphanumeric string - likely an address
      navigate(`/address/${query}`);
    } else {
      // Default to transaction search
      navigate(`/tx/${query}`);
    }
    
    setSearchQuery('');
  };

  return (
    <div className="search-widget">
      <form onSubmit={handleSearch} className="search-widget-form">
        <div className="search-widget-input-wrapper">
          <Search className="search-widget-icon" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by transaction hash, block number, or address..."
            className="search-widget-input"
          />
        </div>
        <button type="submit" className="search-widget-button">
          Search
        </button>
      </form>
      
      <div className="search-examples">
        <span className="search-examples-label">Try:</span>
        <button 
          className="search-example" 
          onClick={() => {
            const latestBlock = miningInfo?.last_block?.id;
            if (latestBlock != null) setSearchQuery(String(latestBlock));
          }}
        >
          Block #{miningInfo?.last_block?.id || 'ERROR'}
        </button>
        <button 
          className="search-example" 
          onClick={() => {
            const latestTransaction = miningInfo?.last_block?.hash;
            if (latestTransaction != null) setSearchQuery(String(latestTransaction));
          }}
        >
          Transaction
        </button>
        <button 
          className="search-example" 
          onClick={() => setSearchQuery('DWMVFcRTZ8UMaWr2vsb7XkTmh7zaA57BQaDRGiAKB6qX6')}
        >
          Address
        </button>
      </div>
    </div>
  );
};

export default SearchWidget;
