import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './StatsCard.scss';

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  icon, 
  title, 
  value, 
  change, 
  trend = 'neutral' 
}) => {
  return (
    <div className="stats-card">
      <div className="stats-card-header">
        <div className="stats-card-icon">
          {icon}
        </div>
        <h3 className="stats-card-title">{title}</h3>
      </div>
      
      <div className="stats-card-content">
        <div className="stats-card-value">{value}</div>
        {change && (
          <div className={`stats-card-change ${trend}`}>
            {trend === 'up' && <TrendingUp size={16} />}
            {trend === 'down' && <TrendingDown size={16} />}
            <span>{change}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
