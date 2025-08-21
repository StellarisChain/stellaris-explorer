import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import stellarisAPI from '../../services/api';
import './NetworkChart.scss';

interface ChartDataPoint {
  time: string;
  transactions: number;
  blocks: number;
  hour: number;
}

const NetworkChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNetworkActivity = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching network activity data...');
        const activityData = await stellarisAPI.getNetworkActivity24h();
        
        console.log('Network activity data received:', activityData);
        setChartData(activityData);
        
      } catch (err: any) {
        console.error('Failed to fetch network activity data:', err);
        
        // Provide more specific error messages
        let errorMessage = 'Failed to load network activity data';
        if (err.response?.status === 429) {
          errorMessage = 'Rate limit exceeded. Using fallback data.';
        } else if (err.response?.status === 422) {
          errorMessage = 'Server request limit exceeded. Using fallback data.';
        }
        
        setError(errorMessage);
        
        // Fallback to mock data in case of error
        const fallbackData: ChartDataPoint[] = [];
        for (let i = 0; i < 24; i++) {
          const hour = (new Date().getHours() - 23 + i + 24) % 24;
          fallbackData.push({
            time: `${hour.toString().padStart(2, '0')}:00`,
            transactions: Math.floor(Math.random() * 50) + 10,
            blocks: Math.floor(Math.random() * 10) + 1,
            hour: hour
          });
        }
        setChartData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkActivity();
    
    // Refresh every 10 minutes instead of 5 to reduce API load
    const interval = setInterval(fetchNetworkActivity, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="network-chart">
        <div className="chart-header">
          <h3 className="chart-title">Network Activity</h3>
          <div className="loading-spinner">Loading...</div>
        </div>
        <div className="chart-container">
          <div className="loading-placeholder">
            <p>Loading network activity data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && chartData.length === 0) {
    return (
      <div className="network-chart">
        <div className="chart-header">
          <h3 className="chart-title">Network Activity</h3>
          <div className="error-message">{error}</div>
        </div>
        <div className="chart-container">
          <div className="error-placeholder">
            <p>Unable to load network activity data</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="network-chart">
      <div className="chart-header">
        <h3 className="chart-title">Network Activity</h3>
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color transactions"></div>
            <span>Transactions</span>
          </div>
          <div className="legend-item">
            <div className="legend-color blocks"></div>
            <span>Blocks</span>
          </div>
        </div>
        {error && (
          <div className="chart-error">
            <small>⚠ {error} (showing fallback data)</small>
          </div>
        )}
      </div>
      
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis 
              dataKey="time" 
              stroke="#9ca3af"
              fontSize={12}
            />
            <YAxis 
              stroke="#9ca3af"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#2a2a2a',
                border: '1px solid #3a3a3a',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value: number, name: string) => {
                const label = name === 'transactions' ? 'Transactions' : 'Blocks';
                return [value, label];
              }}
              labelFormatter={(label: string) => `Time: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="transactions" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#a855f7' }}
            />
            <Line 
              type="monotone" 
              dataKey="blocks" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#34d399' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NetworkChart;
