import React from 'react';
import './WasteVisualization.css';

interface ReusableMeasureProps {
  items: string[];
  reusabilityData: Record<string, boolean | null>;
}

const ReusableMeasure: React.FC<ReusableMeasureProps> = ({ items, reusabilityData }) => {
  const uniqueItems = Array.from(new Set(items));
  
  // Define status style classes
  const getStatusClass = (status: boolean | null) => {
    if (status === true) return 'status-positive';
    if (status === false) return 'status-negative';
    return 'status-unknown';
  };
  
  // Get human-readable status text
  const getStatusText = (status: boolean | null) => {
    if (status === true) return 'Reusable';
    if (status === false) return 'Not Reusable';
    return 'Unknown';
  };

  return (
    <div className="chart-container full-width-container">
      <h3>Reusable Measure</h3>
      
      <div className="reusability-content">
        <table className="reusability-table">
          <thead>
            <tr>
              <th>Waste Type</th>
              <th>Reusability Status</th>
              <th>Potential Reuse Ideas</th>
            </tr>
          </thead>
          <tbody>
            {uniqueItems.map((item, index) => {
              const isReusable = reusabilityData[item];
              
              // Generate reuse ideas based on the waste type and reusability
              let reuseIdeas = '';
              if (isReusable) {
                if (item.toLowerCase().includes('plastic')) {
                  reuseIdeas = 'Storage containers, planters, craft projects';
                } else if (item.toLowerCase().includes('glass')) {
                  reuseIdeas = 'Storage jars, vases, decorative items';
                } else if (item.toLowerCase().includes('paper')) {
                  reuseIdeas = 'Crafts, packaging material, compost';
                } else if (item.toLowerCase().includes('aluminum') || item.toLowerCase().includes('can')) {
                  reuseIdeas = 'DIY projects, planters, organizers';
                } else if (item.toLowerCase().includes('coconut')) {
                  reuseIdeas = 'Planters, craft materials, bird feeders';
                } else {
                  reuseIdeas = 'Various DIY projects';
                }
              } else {
                reuseIdeas = 'Not recommended for reuse';
              }
              
              return (
                <tr key={index}>
                  <td>{item}</td>
                  <td>
                    <span className={`status-tag ${getStatusClass(isReusable)}`}>
                      {getStatusText(isReusable)}
                    </span>
                  </td>
                  <td>{reuseIdeas}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReusableMeasure; 