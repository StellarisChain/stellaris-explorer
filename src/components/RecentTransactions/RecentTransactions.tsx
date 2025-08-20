import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowUpRight, ArrowDownRight, CheckCircle, XCircle } from 'lucide-react';
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
        {transactions.map((tx) => (
          <Link 
            key={tx.hash} 
            to={`/tx/${tx.hash}`}
            className="recent-transaction-item"
          >
            <div className="transaction-header">
              <div className="transaction-hash">
                {formatHash(tx.hash)}
              </div>
              <div className="transaction-time">
                <Clock size={14} />
                {stellarisAPI.formatTimeAgo(tx.time_mined)}
              </div>
            </div>
            
            <div className="transaction-details">
              <div className="transaction-type">
                {tx.is_coinbase ? (
                  <span className="coinbase-badge">Coinbase</span>
                ) : (
                  <span className="transfer-badge">Transfer</span>
                )}
              </div>
              
              <div className="transaction-outputs">
                {tx.outputs.map((output, index) => (
                  <div key={index} className="transaction-output">
                    <ArrowDownRight size={14} className="address-icon to" />
                    <span className="address-text">{formatAddress(output.address)}</span>
                    <span className="amount-text">{stellarisAPI.formatSTR(output.amount)} STR</span>
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
