import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Copy, Wallet, Coins, ListTree, ArrowDownRight, Clock } from 'lucide-react';
import stellarisAPI, { AddressInfo, SpendableOutput } from '../../services/api';
import './AddressDetails.scss';

const AddressDetails: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const [info, setInfo] = useState<AddressInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const valid = useMemo(() => !!address && /^[A-Za-z0-9]+$/.test(address), [address]);

  useEffect(() => {
    let isMounted = true;
    const fetchInfo = async () => {
      if (!address || !valid) {
        setError('Invalid address');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await stellarisAPI.getAddressInfo(address, 20);
        if (isMounted) setInfo(data as any);
      } catch (e) {
        console.error('Failed to fetch address info:', e);
        if (isMounted) setError('Failed to load address info. It may not exist.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchInfo();
    return () => { isMounted = false; };
  }, [address, valid]);

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  const utxos: SpendableOutput[] = (info?.spendable_outputs || []) as any;

  return (
    <div className="container">
      <h1>Address Details</h1>
      {loading && <p>Loading address...</p>}
      {error && <p style={{ color: 'var(--danger, #ef4444)' }}>{error}</p>}
      {!loading && !error && info && (
        <div className="details-card">
          <div className="details-row">
            <div className="details-item" style={{ flex: 1 }}>
              <span className="label">Address</span>
              <div className="mono value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wallet size={14} />
                <span style={{ wordBreak: 'break-all' }}>{address}</span>
                <button aria-label="Copy address" onClick={() => copy(address!)} className="icon-button">
                  <Copy size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="details-row">
            <div className="details-item">
              <span className="label">Balance</span>
              <div className="value"><Coins size={14} style={{ marginRight: 6 }} />{stellarisAPI.formatSTR(info.balance)} STR</div>
            </div>
            <div className="details-item">
              <span className="label">Spendable UTXOs</span>
              <div className="value"><ListTree size={14} style={{ marginRight: 6 }} />{utxos.length}</div>
            </div>
          </div>

          <div className="section" style={{ marginTop: 24 }}>
            <h2>Spendable Outputs</h2>
            {utxos.length === 0 && <p>No spendable outputs</p>}
            {utxos.map((o, i) => (
              <div key={`${o.tx_hash}-${o.index}-${i}`} className="tx-card">
                <div className="tx-row">
                  <span className="label">From Tx</span>
                  <Link to={`/tx/${o.tx_hash}`} className="mono value">
                    {o.tx_hash.slice(0, 10)}...{o.tx_hash.slice(-8)}
                  </Link>
                </div>
                <div className="tx-row">
                  <span className="label">Index</span>
                  <span className="value">{o.index}</span>
                </div>
                <div className="tx-row">
                  <span className="label">Amount</span>
                  <span className="value">{stellarisAPI.formatSTR(o.amount)} STR</span>
                </div>
              </div>
            ))}
          </div>

          <div className="section" style={{ marginTop: 24 }}>
            <h2>Recent Transactions</h2>
            {(info.transactions || []).length === 0 && <p>No transactions</p>}
            {(info.transactions || []).map((tx) => (
              <Link key={tx.hash} to={`/tx/${tx.hash}`} className="tx-card" style={{ textDecoration: 'none' }}>
                <div className="tx-row">
                  <span className="label">Hash</span>
                  <span className="mono value">{tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}</span>
                </div>
                <div className="tx-row">
                  <span className="label">Type</span>
                  <span className="value">{tx.is_coinbase ? 'Coinbase' : 'Transfer'}</span>
                </div>
                <div className="tx-row">
                  <span className="label">Time</span>
                  <span className="value">
                    <Clock size={14} style={{ marginRight: 6 }} />
                    {tx.time_mined ? stellarisAPI.formatTime(tx.time_mined) : 'Unknown'}
                  </span>
                </div>
                <div className="tx-row">
                  <span className="label">Outputs</span>
                  <div className="value" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {(tx.outputs || []).map((o, i) => (
                      <span key={i} className="pill">
                        <ArrowDownRight size={12} /> {stellarisAPI.formatSTR(o.amount)} STR
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressDetails;
