import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowDownRight, CheckCircle } from 'lucide-react';
import stellarisAPI, { Transaction } from '../../services/api';
import './RecentTransactions.scss';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  const formatHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 12)}...${address.slice(-8)}`;
  };

  const getStatusIcon = (isCoinbase: boolean) => {
    if (isCoinbase) {
      return <CheckCircle size={14} className="status-success" />;
    }
    return <CheckCircle size={14} className="status-success" />;
  };

  if (transactions.length === 0) {
    return (
      <div className="recent-transactions">
        <div className="loading-state">
          <p>Loading recent transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-transactions">
      <div className="recent-transactions-list">
        {transactions.filter(tx => tx && tx.hash && !tx.is_coinbase).map((tx) => (
          <Link 
            key={tx.hash} 
            to={`/tx/${tx.hash}`}
            className="recent-transaction-item"
          >
            <div className="transaction-header">
              <div className="transaction-hash">
                {tx.hash ? formatHash(tx.hash) : 'Unknown'}
              </div>
              <div className="transaction-time">
                <Clock size={14} />
                {tx.time_mined ? stellarisAPI.formatTimeAgo(tx.time_mined) : 'Unknown time'}
              </div>
            </div>
            
            <div className="transaction-details">
              <div className="transaction-type">
                <span className="transfer-badge">Transfer</span>
              </div>
              
              <div className="transaction-outputs">
                {(tx.outputs || []).map((output, index) => (
                  <div key={index} className="transaction-output">
                    <ArrowDownRight size={14} className="address-icon to" />
                    <span className="address-text">{output?.address ? formatAddress(output.address) : 'Unknown'}</span>
                    <span className="amount-text">{output?.amount ? stellarisAPI.formatSTR(output.amount) : '0'} STR</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="transaction-footer">
              <div className="transaction-status">
                {getStatusIcon(tx.is_coinbase)}
                <span className="status-text success">
                  Confirmed
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;
