import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarClock, Copy, Hash, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import stellarisAPI, { Transaction } from '../../services/api';
import './TransactionDetails.scss';

const TransactionDetails: React.FC = () => {
  const { txId } = useParams<{ txId: string }>();
  const [tx, setTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isHash = useMemo(() => !!txId && /^[a-fA-F0-9]{64}$/.test(txId), [txId]);

  useEffect(() => {
    let isMounted = true;
    const fetchTx = async () => {
      if (!txId) return;
      try {
        setLoading(true);
        setError(null);
        if (isHash) {
          const data = await stellarisAPI.getTransaction(txId);
          if (isMounted) setTx(data);
        } else {
          // Could be a coinbase pseudo-hash (from recent list). Show minimal info.
          if (isMounted) setError('Invalid transaction hash');
        }
      } catch (e: any) {
        console.error('Failed to fetch transaction:', e);
        if (isMounted) setError('Failed to load transaction. It may not exist.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchTx();
    return () => {
      isMounted = false;
    };
  }, [txId, isHash]);

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  return (
    <div className="container">
      <h1>Transaction Details</h1>
      {loading && <p>Loading transaction...</p>}
      {error && <p style={{ color: 'var(--danger, #ef4444)' }}>{error}</p>}
      {!loading && !error && tx && (
        <div className="details-card">
          <div className="details-row">
            <div className="details-item" style={{ flex: 1 }}>
              <span className="label">Hash</span>
              <div className="mono value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Hash size={14} />
                <span style={{ wordBreak: 'break-all' }}>{tx.hash}</span>
                <button aria-label="Copy tx hash" onClick={() => copy(tx.hash)} className="icon-button">
                  <Copy size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="details-row">
            <div className="details-item">
              <span className="label">Type</span>
              <div className="value">{tx.is_coinbase ? 'Coinbase' : 'Transfer'}</div>
            </div>
            <div className="details-item">
              <span className="label">Included in Block</span>
              {tx.block_hash ? (
                <span className="mono value">{tx.block_hash.slice(0, 10)}...{tx.block_hash.slice(-8)}</span>
              ) : (
                <span className="value">Unknown</span>
              )}
            </div>
            <div className="details-item">
              <span className="label">Mined</span>
              <div className="value">
                <CalendarClock size={14} style={{ marginRight: 6 }} />
                {tx.time_mined ? stellarisAPI.formatTime(tx.time_mined) : 'Unknown'}
              </div>
            </div>
          </div>

          <div className="section" style={{ marginTop: 24 }}>
            <h2>Outputs</h2>
            {(tx.outputs || []).length === 0 && <p>No outputs</p>}
            {(tx.outputs || []).map((o, i) => (
              <div key={i} className="tx-card">
                <div className="tx-row">
                  <ArrowDownRight size={14} />
                  <span className="label" style={{ marginLeft: 6 }}>To</span>
                  {o.address ? (
                    <Link to={`/address/${o.address}`} className="mono" style={{ marginLeft: 8 }}>
                      {o.address}
                    </Link>
                  ) : (
                    <span className="value">Unknown</span>
                  )}
                </div>
                <div className="tx-row">
                  <span className="label">Amount</span>
                  <span className="value">{stellarisAPI.formatSTR(o.amount)} STR</span>
                </div>
              </div>
            ))}
          </div>

          {tx.inputs && (
            <div className="section" style={{ marginTop: 24 }}>
              <h2>Inputs</h2>
              {tx.inputs.length === 0 && <p>No inputs (coinbase)</p>}
              {tx.inputs.map((input: any, i: number) => (
                <div key={i} className="tx-card">
                  <div className="tx-row">
                    <ArrowUpRight size={14} />
                    <span className="label" style={{ marginLeft: 6 }}>From</span>
                    {input.address ? (
                      <Link to={`/address/${input.address}`} className="mono" style={{ marginLeft: 8 }}>
                        {input.address}
                      </Link>
                    ) : (
                      <span className="value">Unknown</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionDetails;
