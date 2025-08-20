import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import './Header.scss';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Determine what type of search this is based on the query
    const query = searchQuery.trim();
    
    // Check if it's a transaction hash (64 hex characters)
    if (/^[a-fA-F0-9]{64}$/.test(query)) {
      navigate(`/tx/${query}`);
    }
    // Check if it's a block number (numeric)
    else if (/^\d+$/.test(query)) {
      navigate(`/block/${query}`);
    }
    // Check if it's an address (starts with stellaris prefix or hex)
    else if (query.startsWith('stellaris') || /^[a-fA-F0-9]{40,}$/.test(query)) {
      navigate(`/address/${query}`);
    }
    // Fallback to transaction search
    else {
      navigate(`/tx/${query}`);
    }
    
    setSearchQuery('');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo and Brand */}
          <Link to="/" className="brand">
            <div className="brand-icon">
              <div className="stellaris-logo">⭐</div>
            </div>
            <div className="brand-text">
              <h1 className="brand-name">Stellaris</h1>
              <span className="brand-subtitle">Explorer</span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="search-container">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-wrapper">
                <Search className="search-icon" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search blocks, transactions, addresses..."
                  className="search-input"
                />
              </div>
              <button type="submit" className="search-button">
                Search
              </button>
            </form>
          </div>

          {/* Navigation */}
          <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/blocks" className="nav-link">
              Blocks
            </Link>
            <Link to="/transactions" className="nav-link">
              Transactions
            </Link>
            <Link to="/validators" className="nav-link">
              Validators
            </Link>
            <Link to="/stats" className="nav-link">
              Statistics
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
