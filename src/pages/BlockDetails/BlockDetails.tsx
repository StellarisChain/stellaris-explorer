import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarClock, Copy, Hash, Wallet, Gauge } from 'lucide-react';
import stellarisAPI, { Block } from '../../services/api';
import './BlockDetails.scss';

const BlockDetails: React.FC = () => {
  const { blockId } = useParams<{ blockId: string }>();
  const navigate = useNavigate();
  const [block, setBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const numericBlockId = useMemo(() => {
    if (!blockId) return null;
    const n = Number(blockId);
    return Number.isFinite(n) ? n : null;
  }, [blockId]);

  useEffect(() => {
    let isMounted = true;
    const fetchBlock = async () => {
      if (numericBlockId == null) {
        setError('Invalid block ID');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await stellarisAPI.getBlock(numericBlockId, false);
        if (isMounted) setBlock(data);
      } catch (e: any) {
        console.error('Failed to fetch block:', e);
        if (isMounted) setError('Failed to load block. It may not exist.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchBlock();
    return () => {
      isMounted = false;
    };
  }, [numericBlockId]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // noop
    }
  };

  return (
    <div className="container">
      <h1>Block Details</h1>
      {loading && <p>Loading block...</p>}
      {error && <p style={{ color: 'var(--danger, #ef4444)' }}>{error}</p>}

      {!loading && !error && block && (
        <div className="details-card">
          <div className="details-row">
            <div className="details-item">
              <span className="label">Height</span>
              <div className="value">#{block.id.toLocaleString()}</div>
            </div>
            <div className="details-item">
              <span className="label">Timestamp</span>
              <div className="value">
                <CalendarClock size={14} style={{ marginRight: 6 }} />
                {stellarisAPI.formatTime(block.timestamp)}
              </div>
            </div>
            <div className="details-item">
              <span className="label">Difficulty</span>
              <div className="value">
                <Gauge size={14} style={{ marginRight: 6 }} />
                {stellarisAPI.formatSTR(block.difficulty)}
              </div>
            </div>
          </div>

          <div className="details-row">
            <div className="details-item" style={{ flex: 1 }}>
              <span className="label">Hash</span>
              <div className="mono value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Hash size={14} />
                <span style={{ wordBreak: 'break-all' }}>{block.hash}</span>
                <button aria-label="Copy block hash" onClick={() => copyToClipboard(block.hash)} className="icon-button">
                  <Copy size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="details-row">
            <div className="details-item">
              <span className="label">Reward</span>
              <div className="value">{stellarisAPI.formatSTR(block.reward)} STR</div>
            </div>
            <div className="details-item" style={{ minWidth: 0, flex: 1 }}>
              <span className="label">Miner</span>
              <div className="value" style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <Wallet size={14} />
                {block.address ? (
                  <Link to={`/address/${block.address}`} className="mono" style={{ wordBreak: 'break-all' }}>
                    {block.address}
                  </Link>
                ) : (
                  <span>Unknown</span>
                )}
              </div>
            </div>
          </div>

          <div className="details-row" style={{ marginTop: 12, gap: 12 }}>
            <button
              className="btn"
              onClick={() => navigate(`/block/${Math.max(0, (block.id || 1) - 1)}`)}
              disabled={block.id <= 0}
            >
              <ArrowLeft size={14} /> Previous
            </button>
            <button className="btn" onClick={() => navigate(`/block/${block.id + 1}`)}>
              Next <ArrowRight size={14} />
            </button>
          </div>

          <div className="section" style={{ marginTop: 24 }}>
            <h2>Transactions</h2>
            <p>For now, only coinbase is shown to avoid API rate limits.</p>
            <div className="tx-card">
              <div className="tx-row">
                <span className="label">Type</span>
                <span className="value">Coinbase</span>
              </div>
              <div className="tx-row">
                <span className="label">To</span>
                {block.address ? (
                  <Link to={`/address/${block.address}`} className="mono">
                    {block.address}
                  </Link>
                ) : (
                  <span className="value">Unknown</span>
                )}
              </div>
              <div className="tx-row">
                <span className="label">Amount</span>
                <span className="value">{stellarisAPI.formatSTR(block.reward)} STR</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockDetails;
