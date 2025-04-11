import React from 'react';
import './WasteVisualization.css';

interface QuickStatsProps {
  stats: {
    totalItems: number;
    biodegradableItems: number;
    nonBiodegradableItems: number;
    biodegradableRate: string;
  };
}

const QuickStats: React.FC<QuickStatsProps> = ({ stats }) => {
  // Calculate percentages for the mini pie chart
  const biodegradablePercentage = (stats.biodegradableItems / stats.totalItems) * 100;
  const nonBiodegradablePercentage = 100 - biodegradablePercentage;
  
  // Create pie chart background
  const pieChartBackground = `conic-gradient(
    #27ae60 0% ${biodegradablePercentage}%, 
    #c0392b ${biodegradablePercentage}% 100%
  )`;
  
  return (
    <div className="chart-container">
      <h3>Quick Stats</h3>
      
      <div className="stats-container">
        <div className="stats-left">
          <table className="stats-table">
            <tbody>
              <tr>
                <td>Total Items:</td>
                <td><strong>{stats.totalItems}</strong></td>
              </tr>
              <tr>
                <td>Biodegradable:</td>
                <td><strong>{stats.biodegradableItems}</strong></td>
              </tr>
              <tr>
                <td>Non-Biodegradable:</td>
                <td><strong>{stats.nonBiodegradableItems}</strong></td>
              </tr>
              <tr>
                <td>Biodegradable Rate:</td>
                <td><strong>{stats.biodegradableRate}%</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="stats-right">
          <div 
            className="mini-pie-chart" 
            style={{ background: pieChartBackground }}
          />
          <div className="mini-legend">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#27ae60' }}></div>
              <div>Biodegradable: {biodegradablePercentage.toFixed(1)}%</div>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#c0392b' }}></div>
              <div>Non-biodegradable: {nonBiodegradablePercentage.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStats; 