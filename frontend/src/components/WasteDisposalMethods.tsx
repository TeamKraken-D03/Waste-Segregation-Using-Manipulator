import React from 'react';
import './WasteVisualization.css';

interface WasteDisposalMethodsProps {
  items: string[];
  methods: Record<string, string>;
}

const WasteDisposalMethods: React.FC<WasteDisposalMethodsProps> = ({ items, methods }) => {
  // Count occurrences of each disposal method
  const methodCounts: Record<string, number> = {};
  
  items.forEach(item => {
    const method = methods[item] || 'Unknown';
    methodCounts[method] = (methodCounts[method] || 0) + 1;
  });
  
  // Define colors for each disposal method
  const methodColors: Record<string, string> = {
    'Recycle': '#27ae60',
    'Compost': '#d35400',
    'Recycle or Compost': '#2980b9',
    'Compost or Textile Recycling': '#8e44ad',
    'Special Recycling': '#16a085',
    'E-Waste Recycling': '#2c3e50',
    'Hazardous Waste': '#c0392b',
    'Landfill': '#7f8c8d',
    'Unknown': '#95a5a6'
  };
  
  // Create a map of unique items and their disposal methods
  const uniqueItemsWithMethods = Array.from(new Set(items)).map(item => ({
    item,
    method: methods[item] || 'Unknown'
  }));
  
  // Sort methods by count (descending)
  const sortedMethods = Object.entries(methodCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([method, count]) => ({ method, count }));
  
  return (
    <div className="chart-container full-width-container">
      <h3>Waste Disposal Methods</h3>
      
      <div className="disposal-content-wrapper">
        <div className="disposal-content">
          <div className="disposal-methods">
            <table className="disposal-table">
              <thead>
                <tr>
                  <th>Waste Type</th>
                  <th>Disposal Method</th>
                </tr>
              </thead>
              <tbody>
                {uniqueItemsWithMethods.map(({ item, method }, index) => (
                  <tr key={index}>
                    <td title={item}>{item}</td>
                    <td>
                      <span 
                        className="method-tag"
                        style={{ backgroundColor: methodColors[method] || '#95a5a6' }}
                        title={`Recommended method: ${method}`}
                      >
                        {method}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="method-summary">
            <h4>Disposal Summary</h4>
            <div className="method-bars">
              {sortedMethods.map(({ method, count }) => (
                <div key={method} className="method-bar-container">
                  <div className="method-label">
                    <span>{method}</span>
                    <span>{count}</span>
                  </div>
                  <div 
                    className="method-bar" 
                    style={{ 
                      width: `${(count / items.length) * 100}%`,
                      backgroundColor: methodColors[method] || '#95a5a6'
                    }}
                    title={`${method}: ${count} items (${((count / items.length) * 100).toFixed(1)}%)`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteDisposalMethods; 