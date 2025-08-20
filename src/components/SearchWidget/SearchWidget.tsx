import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import './SearchWidget.scss';

const SearchWidget: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

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
          onClick={() => setSearchQuery('123456')}
        >
          Block #123456
        </button>
        <button 
          className="search-example" 
          onClick={() => setSearchQuery('a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456')}
        >
          Transaction
        </button>
        <button 
          className="search-example" 
          onClick={() => setSearchQuery('STL1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7')}
        >
          Address
        </button>
      </div>
    </div>
  );
};

export default SearchWidget;
