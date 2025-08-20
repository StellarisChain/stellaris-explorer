import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './NetworkChart.scss';

// Mock data for the chart
const mockData = [
  { time: '00:00', transactions: 120, blocks: 5 },
  { time: '02:00', transactions: 180, blocks: 8 },
  { time: '04:00', transactions: 95, blocks: 4 },
  { time: '06:00', transactions: 240, blocks: 12 },
  { time: '08:00', transactions: 350, blocks: 18 },
  { time: '10:00', transactions: 420, blocks: 22 },
  { time: '12:00', transactions: 380, blocks: 19 },
  { time: '14:00', transactions: 450, blocks: 25 },
  { time: '16:00', transactions: 520, blocks: 28 },
  { time: '18:00', transactions: 480, blocks: 24 },
  { time: '20:00', transactions: 390, blocks: 20 },
  { time: '22:00', transactions: 280, blocks: 14 },
];

const NetworkChart: React.FC = () => {
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
      </div>
      
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mockData}>
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
