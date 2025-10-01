import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import './CollapsibleList.scss';

interface CollapsibleListProps<T> {
  items: T[];
  threshold?: number;
  searchKey?: keyof T | ((item: T) => string);
  children: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
  searchPlaceholder?: string;
}

function CollapsibleList<T>({
  items,
  threshold = 10,
  searchKey,
  children,
  emptyMessage = 'No items',
  searchPlaceholder = 'Search items...'
}: CollapsibleListProps<T>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchTerm || !searchKey) return items;

    return items.filter(item => {
      const searchValue = typeof searchKey === 'function' 
        ? searchKey(item)
        : String(item[searchKey] || '');
      
      return searchValue.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [items, searchTerm, searchKey]);

  const shouldShowDropdown = items.length > threshold;
  const displayItems = shouldShowDropdown && !isExpanded ? items.slice(0, threshold) : filteredItems;

  if (items.length === 0) {
    return <p>{emptyMessage}</p>;
  }

  return (
    <div className="collapsible-list">
      {displayItems.map((item, index) => children(item, index))}
      
      {shouldShowDropdown && (
        <div className="collapsible-controls">
          <button
            className="collapsible-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp size={16} />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                Show More ({items.length - threshold} more items)
              </>
            )}
          </button>
          
          {isExpanded && searchKey && (
            <div className="search-container">
              <div className="search-input-wrapper">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              {searchTerm && (
                <div className="search-results-info">
                  {filteredItems.length} of {items.length} items
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CollapsibleList;