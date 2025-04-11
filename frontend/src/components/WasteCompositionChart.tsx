import React from 'react';
import './WasteVisualization.css';

interface WasteCompositionChartProps {
  composition: Record<string, number>;
  biodegradabilityData: Record<string, boolean>;
}

const WasteCompositionChart: React.FC<WasteCompositionChartProps> = ({ composition, biodegradabilityData }) => {
  // Calculate total for percentages
  const total = Object.values(composition).reduce((sum, count) => sum + count, 0);
  
  // Dynamically generate colors for each waste type
  const generateColors = (items: string[]): Record<string, string> => {
    const colors: Record<string, string> = {};
    const baseColors = [
      '#3498db', // blue
      '#e74c3c', // red
      '#2ecc71', // green
      '#f1c40f', // yellow
      '#9b59b6', // purple
      '#e67e22', // orange
      '#1abc9c', // turquoise
      '#d35400', // pumpkin
      '#27ae60', // nephritis
      '#2980b9', // belize hole
      '#8e44ad', // wisteria
      '#16a085', // green sea
      '#f39c12'  // orange
    ];
    
    items.forEach((item, index) => {
      // Use base colors if available, otherwise generate from the item name
      if (index < baseColors.length) {
        colors[item] = baseColors[index];
      } else {
        // Generate a color based on the item's name
        let hash = 0;
        for (let i = 0; i < item.length; i++) {
          hash = item.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        let color = '#';
        for (let i = 0; i < 3; i++) {
          const value = (hash >> (i * 8)) & 0xFF;
          color += ('00' + value.toString(16)).substr(-2);
        }
        
        colors[item] = color;
      }
    });
    
    return colors;
  };
  
  // Get unique waste types and generate colors
  const uniqueWasteTypes = Object.keys(composition);
  const colors = generateColors(uniqueWasteTypes);

  // Generate pie chart segments
  const segments = Object.entries(composition).map(([label, count], index) => {
    const percentage = (count / total) * 100;
    const color = colors[label];
    const isBiodegradable = biodegradabilityData[label];
    const biodegradabilityLabel = isBiodegradable ? 'Biodegradable' : 'Non-biodegradable';
    
    return (
      <div key={label} className="pie-segment-container">
        <div 
          className="pie-segment" 
          style={{ 
            backgroundColor: color,
            width: '20px',
            height: '20px'
          }} 
          title={`${label}: ${biodegradabilityLabel}`}
        />
        <div className="pie-label">
          {label}: {count} ({percentage.toFixed(1)}%)
          <span className="biodegradability-tag" style={{ backgroundColor: isBiodegradable ? '#27ae60' : '#c0392b' }}>
            {biodegradabilityLabel}
          </span>
        </div>
      </div>
    );
  });

  // Function to create pie chart segments with hover data
  const createPieChartSegments = () => {
    // First, we need to calculate the segments
    type Segment = {
      label: string;
      startAngle: number;
      endAngle: number;
      percentage: number;
      color: string;
      isBiodegradable: boolean;
    };
    
    const segments: Segment[] = [];
    let startPercentage = 0;
    
    Object.entries(composition).forEach(([label, count]) => {
      const percentage = (count / total) * 100;
      const endPercentage = startPercentage + percentage;
      
      segments.push({
        label,
        startAngle: startPercentage * 3.6, // Convert percentage to degrees (360 / 100 = 3.6)
        endAngle: endPercentage * 3.6,
        percentage,
        color: colors[label],
        isBiodegradable: biodegradabilityData[label] || false
      });
      
      startPercentage = endPercentage;
    });
    
    return segments;
  };

  // Generate pie chart style with conic gradient
  const pieChartBackground = () => {
    let gradientString = '';
    let startPercentage = 0;
    
    Object.entries(composition).forEach(([label, count]) => {
      const color = colors[label];
      const percentage = (count / total) * 100;
      const endPercentage = startPercentage + percentage;
      
      gradientString += `${color} ${startPercentage}% ${endPercentage}%, `;
      startPercentage = endPercentage;
    });
    
    // Remove trailing comma and space
    gradientString = gradientString.slice(0, -2);
    
    return `conic-gradient(${gradientString})`;
  };

  // Get pie chart segments for hover effect
  const pieSegments = createPieChartSegments();

  return (
    <div className="chart-container">
      <h3>Waste Composition</h3>
      
      <div className="pie-chart-container">
        <div 
          className="pie-chart" 
          style={{ background: pieChartBackground() }}
        >
          {/* Invisible overlays for hover effects */}
          {pieSegments.map((segment, index) => {
            // Create a conic gradient for just this segment with a transparent color
            const hoverGradient = `conic-gradient(
              transparent ${segment.startAngle}deg, 
              rgba(0, 0, 0, 0.1) ${segment.startAngle}deg, 
              rgba(0, 0, 0, 0.1) ${segment.endAngle}deg, 
              transparent ${segment.endAngle}deg
            )`;
            
            const biodegradabilityText = segment.isBiodegradable ? 'Biodegradable' : 'Non-biodegradable';
            
            return (
              <div 
                key={index}
                className="pie-segment-overlay"
                style={{ background: hoverGradient }}
                title={`${segment.label}: ${segment.percentage.toFixed(1)}% - ${biodegradabilityText}`}
              />
            );
          })}
        </div>
      </div>
      
      <div className="legend">
        {segments}
      </div>
    </div>
  );
};

export default WasteCompositionChart; 