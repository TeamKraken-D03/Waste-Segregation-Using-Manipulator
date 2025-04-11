import React from 'react';
import './WasteVisualization.css';

interface WasteCompositionProps {
  items: string[];
  compositionData: Record<string, string[]>;
}

const WasteComposition: React.FC<WasteCompositionProps> = ({ items, compositionData }) => {
  const uniqueItems = Array.from(new Set(items));
  
  // Function to determine environmental impact based on waste type when composition data is not available
  const getPredictedImpact = (itemName: string): string => {
    const itemLower = itemName.toLowerCase();
    
    if (
      itemLower.includes('plastic') || 
      itemLower.includes('styrofoam') || 
      itemLower.includes('pvc')
    ) {
      return 'High Impact - Non-biodegradable petroleum product, potential for microplastics';
    } else if (
      itemLower.includes('electronic') || 
      itemLower.includes('battery') || 
      itemLower.includes('device')
    ) {
      return 'High Impact - Contains heavy metals and hazardous materials';
    } else if (
      itemLower.includes('aluminum') || 
      itemLower.includes('can') || 
      itemLower.includes('metal')
    ) {
      return 'Medium Impact - Energy-intensive to produce, but highly recyclable';
    } else if (
      itemLower.includes('glass') || 
      itemLower.includes('bottle')
    ) {
      return 'Medium Impact - Energy-intensive to produce, but infinitely recyclable';
    } else if (
      itemLower.includes('paper') || 
      itemLower.includes('cardboard')
    ) {
      return 'Low Impact - Biodegradable material from renewable resources';
    } else if (
      itemLower.includes('food') || 
      itemLower.includes('organic') || 
      itemLower.includes('fruit') || 
      itemLower.includes('vegetable')
    ) {
      return 'Low Impact - Biodegradable but can produce methane in landfills';
    } else if (
      itemLower.includes('coconut') || 
      itemLower.includes('natural') || 
      itemLower.includes('plant')
    ) {
      return 'Low Impact - Natural material, generally biodegradable';
    }
    
    return 'Medium Impact - Based on typical waste patterns for this item';
  };
  
  return (
    <div className="chart-container full-width-container">
      <h3>Material Composition</h3>
      
      <div className="composition-content">
        <table className="composition-table">
          <thead>
            <tr>
              <th>Waste Type</th>
              <th>Material Composition</th>
              <th>Environmental Impact</th>
            </tr>
          </thead>
          <tbody>
            {uniqueItems.map((item, index) => {
              const materials = compositionData[item] || [];
              
              // Generate environmental impact assessment based on composition
              let impact = getPredictedImpact(item); // Default to predicted impact
              const materialString = materials.join(', ').toLowerCase();
              
              if (materials.length > 0) {
                if (
                  materialString.includes('pvc') || 
                  materialString.includes('polystyrene') || 
                  materialString.includes('polyvinyl chloride')
                ) {
                  impact = 'High Impact - Difficult to recycle, contains harmful chemicals';
                } else if (
                  materialString.includes('pet') || 
                  materialString.includes('polyethylene terephthalate') || 
                  materialString.includes('hdpe') || 
                  materialString.includes('high-density polyethylene')
                ) {
                  impact = 'Medium Impact - Recyclable but petroleum-based';
                } else if (
                  materialString.includes('paper') || 
                  materialString.includes('cardboard') || 
                  materialString.includes('plant') || 
                  materialString.includes('organic')
                ) {
                  impact = 'Low Impact - Biodegradable materials';
                } else if (
                  materialString.includes('aluminum') || 
                  materialString.includes('glass') || 
                  materialString.includes('steel') || 
                  materialString.includes('metal')
                ) {
                  impact = 'Medium Impact - Highly recyclable but energy-intensive to produce';
                }
              }
              
              return (
                <tr key={index}>
                  <td>{item}</td>
                  <td>
                    {materials.length > 0 ? (
                      <ul className="material-list">
                        {materials.map((material, idx) => (
                          <li key={idx}>{material}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="no-data">Composition data unavailable</span>
                    )}
                  </td>
                  <td className={`impact-${impact.split(' ')[0].toLowerCase()}`}>
                    {impact}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WasteComposition; 