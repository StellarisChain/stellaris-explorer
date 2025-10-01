import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Copy, Wallet, Coins, ListTree, ArrowDownRight, Clock } from 'lucide-react';
import stellarisAPI, { AddressInfo, SpendableOutput } from '../../services/api';
import CollapsibleList from '../../components/CollapsibleList';
import './AddressDetails.scss';

const AddressDetails: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const [info, setInfo] = useState<AddressInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [strPrice, setStrPrice] = useState<number | null>(null);

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
        const [data, priceData] = await Promise.all([
          stellarisAPI.getAddressInfo(address, 20),
          stellarisAPI.getCoinPrice()
        ]);
        if (isMounted) {
          setInfo(data as any);
          setStrPrice(priceData.price);
        }
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

  const formatUSD = (strAmount: string | number, price: number | null): string => {
    if (price === null) return 'N/A';
    const numAmount = typeof strAmount === 'string' ? parseFloat(strAmount) : strAmount;
    if (isNaN(numAmount)) return '$0.00';
    const usdValue = numAmount * price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(usdValue);
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
              <div className="value">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Coins size={14} />
                  <span>{stellarisAPI.formatSTR(info.balance)} STR</span>
                </div>
                {strPrice !== null && (
                  <div style={{ fontSize: '0.9em', color: 'var(--text-secondary, #666)', marginTop: 4 }}>
                    {formatUSD(info.balance, strPrice)}
                  </div>
                )}
              </div>
            </div>
            <div className="details-item">
              <span className="label">Spendable UTXOs</span>
              <div className="value"><ListTree size={14} style={{ marginRight: 6 }} />{utxos.length}</div>
            </div>
          </div>

          <div className="section" style={{ marginTop: 24 }}>
            <h2>Spendable Outputs</h2>
            <CollapsibleList
              items={utxos}
              searchKey={(utxo) => utxo.tx_hash}
              emptyMessage="No spendable outputs"
              searchPlaceholder="Search by transaction hash..."
            >
              {(o, i) => (
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
                    <div className="value">
                      <div>{stellarisAPI.formatSTR(o.amount)} STR</div>
                      {strPrice !== null && (
                        <div style={{ fontSize: '0.9em', color: 'var(--text-secondary, #666)' }}>
                          {formatUSD(o.amount, strPrice)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CollapsibleList>
          </div>

          <div className="section" style={{ marginTop: 24 }}>
            <h2>Recent Transactions</h2>
            <CollapsibleList
              items={info.transactions || []}
              searchKey={(tx) => tx.hash}
              emptyMessage="No transactions"
              searchPlaceholder="Search by transaction hash..."
            >
              {(tx) => (
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
                        <div key={i} className="pill" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <ArrowDownRight size={12} /> {stellarisAPI.formatSTR(o.amount)} STR
                          </div>
                          {strPrice !== null && (
                            <div style={{ fontSize: '0.8em', color: 'var(--text-secondary, #666)', marginTop: 2 }}>
                              {formatUSD(o.amount, strPrice)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>
              )}
            </CollapsibleList>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressDetails;
