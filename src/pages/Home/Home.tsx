import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Clock, 
  Activity, 
  Users, 
  Zap,
  ExternalLink,
  ArrowUpRight
} from 'lucide-react';
import SearchWidget from '../../components/SearchWidget/SearchWidget';
import StatsCard from '../../components/StatsCard/StatsCard';
import RecentBlocks from '../../components/RecentBlocks/RecentBlocks';
import RecentTransactions from '../../components/RecentTransactions/RecentTransactions';
import NetworkChart from '../../components/NetworkChart/NetworkChart';
import stellarisAPI, { MiningInfo, Block, Transaction } from '../../services/api';
import './Home.scss';

const Home: React.FC = () => {
  const [miningInfo, setMiningInfo] = useState<MiningInfo | null>(null);
  const [recentBlocks, setRecentBlocks] = useState<Block[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch mining info
        const info = await stellarisAPI.getMiningInfo();
        setMiningInfo(info);
        
        // Fetch recent blocks
        const blocks = await stellarisAPI.getLatestBlocks(10);
        console.log('Received blocks in Home component:', blocks);
        setRecentBlocks(blocks);
        
        // Fetch recent transactions
        const transactions = await stellarisAPI.getRecentTransactions(10);
        console.log('Received transactions in Home component:', transactions);
        setRecentTransactions(transactions);
        
      } catch (err) {
        console.error('Failed to fetch network data:', err);
        setError('Failed to load network data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchNetworkData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatLastBlockTime = () => {
    if (!miningInfo) return 'Loading...';
    return stellarisAPI.formatTimeAgo(miningInfo.last_block.timestamp);
  };

  return (
    <div className="home">
      <div className="container">
        {/* Error Message */}
        {error && (
          <div className="error-banner">
            <p>{error}</p>
          </div>
        )}

        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-title">
              Explore the <span className="gradient-text">Stellaris</span> Blockchain
            </h1>
            <p className="hero-description">
              The leading blockchain explorer for Stellaris network. 
              Search transactions, blocks, addresses and monitor network activity in real-time.
            </p>
            
            <SearchWidget />
            
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-value">
                  {loading ? 'Loading...' : (miningInfo?.last_block?.id?.toLocaleString() || 'N/A')}
                </span>
                <span className="hero-stat-label">Latest Block</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-value">
                  {loading ? 'Loading...' : `${stellarisAPI.formatSTR(miningInfo?.last_block?.reward || 0)} STR`}
                </span>
                <span className="hero-stat-label">Block Reward</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-value">
                  {loading ? 'Loading...' : (miningInfo ? stellarisAPI.calculateHashRate(miningInfo.difficulty) : 'N/A')}
                </span>
                <span className="hero-stat-label">Hash Rate</span>
              </div>
            </div>
          </div>
        </section>

        {/* Network Statistics */}
        <section className="network-stats">
          <h2 className="section-title">Network Overview</h2>
          <div className="stats-grid">
            <StatsCard
              icon={<Activity className="stats-icon" />}
              title="Block Height"
              value={loading ? 'Loading...' : (miningInfo?.last_block?.id?.toLocaleString() || 'N/A')}
              change={loading ? '' : formatLastBlockTime()}
              trend="up"
            />
            <StatsCard
              icon={<Zap className="stats-icon" />}
              title="Hash Rate"
              value={loading ? 'Loading...' : (miningInfo ? stellarisAPI.calculateHashRate(miningInfo.difficulty) : 'N/A')}
              change="Estimated"
              trend="up"
            />
            <StatsCard
              icon={<Users className="stats-icon" />}
              title="Difficulty"
              value={loading ? 'Loading...' : (miningInfo ? stellarisAPI.formatSTR(miningInfo.difficulty) : 'N/A')}
              change="Current mining difficulty"
              trend="neutral"
            />
            <StatsCard
              icon={<Clock className="stats-icon" />}
              title="Block Reward"
              value={loading ? 'Loading...' : (miningInfo ? `${stellarisAPI.formatSTR(miningInfo.last_block?.reward)} STR` : 'N/A')}
              change="Per block"
              trend="neutral"
            />
            <StatsCard
              icon={<TrendingUp className="stats-icon" />}
              title="Recent Blocks"
              value={recentBlocks.length.toString()}
              change="Last 10 blocks"
              trend="up"
            />
            <StatsCard
              icon={<ExternalLink className="stats-icon" />}
              title="Recent Transactions"
              value={recentTransactions.length.toString()}
              change="Latest activity"
              trend="up"
            />
          </div>
        </section>

        {/* Recent Activity */}
        <section className="recent-activity">
          <div className="activity-grid">
            <div className="activity-section">
              <div className="section-header">
                <h3 className="section-subtitle">Recent Blocks</h3>
                <Link to="/blocks" className="section-link">
                  View all <ArrowUpRight size={16} />
                </Link>
              </div>
              <RecentBlocks blocks={recentBlocks} />
            </div>
            
            <div className="activity-section">
              <div className="section-header">
                <h3 className="section-subtitle">Recent Transactions</h3>
                <Link to="/transactions" className="section-link">
                  View all <ArrowUpRight size={16} />
                </Link>
              </div>
              <RecentTransactions transactions={recentTransactions} />
            </div>
          </div>
        </section>

        {/* Network Activity Chart */}
        <section className="network-chart">
          <h2 className="section-title">Network Activity (24h)</h2>
          <div className="chart-container">
            <NetworkChart />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
