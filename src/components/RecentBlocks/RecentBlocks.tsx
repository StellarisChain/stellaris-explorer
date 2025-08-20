import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, HardDrive } from 'lucide-react';
import stellarisAPI, { Block } from '../../services/api';
import './RecentBlocks.scss';

interface RecentBlocksProps {
  blocks: Block[];
}

const RecentBlocks: React.FC<RecentBlocksProps> = ({ blocks }) => {
  const formatHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  if (blocks.length === 0) {
    return (
      <div className="recent-blocks">
        <div className="loading-state">
          <p>Loading recent blocks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-blocks">
      <div className="recent-blocks-list">
        {blocks.map((block) => (
          <Link 
            key={block.id} 
            to={`/block/${block.id}`}
            className="recent-block-item"
          >
            <div className="block-header">
              <div className="block-height">
                #{block.id.toLocaleString()}
              </div>
              <div className="block-time">
                <Clock size={14} />
                {stellarisAPI.formatTimeAgo(block.timestamp)}
              </div>
            </div>
            
            <div className="block-details">
              <div className="block-hash">
                <span className="hash-label">Hash:</span>
                <span className="hash-value">{formatHash(block.hash)}</span>
              </div>
              
              <div className="block-meta">
                <div className="meta-item">
                  <Users size={14} />
                  <span>{block.transactions?.length || 0} txs</span>
                </div>
                <div className="meta-item">
                  <HardDrive size={14} />
                  <span>Reward: {stellarisAPI.formatSTR(block.reward)} STR</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentBlocks;
