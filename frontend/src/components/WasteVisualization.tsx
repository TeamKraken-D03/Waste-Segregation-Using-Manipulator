import React, { useEffect, useState } from 'react';
import './WasteVisualization.css';
import WasteCompositionChart from './WasteCompositionChart';
import WasteDisposalMethods from './WasteDisposalMethods';
import QuickStats from './QuickStats';
import ReusableMeasure from './ReusableMeasure';
import WasteComposition from './WasteComposition';
import RecyclingCenters from './RecyclingCenters';

interface WasteData {
  labels?: string[];
  boundingBoxes?: any[];
}

interface WasteVisualizationProps {
  wasteData: WasteData | null;
  biodegradabilityData: Record<string, boolean>;
}

const WasteVisualization: React.FC<WasteVisualizationProps> = ({ wasteData, biodegradabilityData }) => {
  // State for reusability and composition data
  const [reusabilityData, setReusabilityData] = useState<Record<string, boolean | null>>({});
  const [compositionData, setCompositionData] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Define Google Maps API key
  const googleMapsApiKey = 'AIzaSyDDDAJ4XIdudPWJKPY8aUC9EViuHAwSjQg';

  useEffect(() => {
    // Fetch reusability and composition data when wasteData changes
    if (wasteData && wasteData.labels && wasteData.labels.length > 0) {
      setIsLoading(true);
      
      // Function to fetch reusability data
      const fetchReusabilityData = async () => {
        try {
          // This should be your actual API endpoint with better prompting
          const response = await fetch('/api/reusability', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              items: wasteData.labels || [],
              instructions: "Analyze each waste item for reusability potential. Provide boolean values (true/false) based on whether the item can be reused in its current form or repurposed. For each item, consider material durability, safety for reuse, potential contamination, and typical condition after disposal. Avoid returning null values by making an educated assessment based on the waste category."
            }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch reusability data');
          }
          
          const data = await response.json();
          setReusabilityData(data);
        } catch (error) {
          console.error('Error fetching reusability data:', error);
          
          // Fallback: Generate more detailed mock data based on waste type
          const mockData: Record<string, boolean | null> = {};
          if (wasteData.labels) {
            wasteData.labels.forEach(label => {
              const labelLower = label.toLowerCase();
              // More comprehensive reusability assessment
              if (
                labelLower.includes('plastic') && 
                (labelLower.includes('bottle') || labelLower.includes('container'))
              ) {
                mockData[label] = true; // Plastic bottles/containers are typically reusable
              } else if (
                labelLower.includes('glass') || 
                labelLower.includes('jar')
              ) {
                mockData[label] = true; // Glass is highly reusable
              } else if (
                labelLower.includes('aluminum') || 
                labelLower.includes('can') || 
                labelLower.includes('tin')
              ) {
                mockData[label] = true; // Metal containers can be repurposed
              } else if (
                labelLower.includes('coconut') || 
                labelLower.includes('shell')
              ) {
                mockData[label] = true; // Natural hard materials like shells can be repurposed
              } else if (
                labelLower.includes('paper') && 
                !labelLower.includes('soiled') && 
                !labelLower.includes('wet')
              ) {
                mockData[label] = false; // Paper isn't typically reusable in its original form
              } else if (
                labelLower.includes('food') || 
                labelLower.includes('organic') || 
                labelLower.includes('waste')
              ) {
                mockData[label] = false; // Food waste isn't reusable
              } else if (
                labelLower.includes('plastic') && 
                (labelLower.includes('bag') || labelLower.includes('film') || labelLower.includes('wrapper'))
              ) {
                mockData[label] = false; // Thin plastics are generally not reusable
              } else {
                // Make an educated guess instead of returning null
                mockData[label] = labelLower.includes('container') || 
                                  labelLower.includes('box') || 
                                  labelLower.includes('durable');
              }
            });
          }
          setReusabilityData(mockData);
        }
      };
      
      // Function to fetch composition data
      const fetchCompositionData = async () => {
        try {
          // This should be your actual API endpoint with better prompting
          const response = await fetch('/api/composition', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              items: wasteData.labels || [],
              instructions: "Provide detailed material composition and environmental impact data for each waste item. For impact assessment, never return 'Unknown' - instead analyze the waste type and provide an educated assessment based on similar materials. Consider biodegradability, toxicity, resource intensity, production energy, recyclability, and ecological footprint in your analysis."
            }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch composition data');
          }
          
          const data = await response.json();
          setCompositionData(data);
        } catch (error) {
          console.error('Error fetching composition data:', error);
          
          // Fallback: Generate more detailed mock data based on waste type
          const mockData: Record<string, string[]> = {};
          if (wasteData.labels) {
            wasteData.labels.forEach(label => {
              const labelLower = label.toLowerCase();
              if (labelLower.includes('plastic')) {
                mockData[label] = [
                  'PET (Polyethylene Terephthalate)',
                  'Synthetic polymers', 
                  'Possible additives: plasticizers, colorants',
                  'UV stabilizers and flame retardants'
                ];
              } else if (labelLower.includes('glass')) {
                mockData[label] = [
                  'Silica (70-74%)',
                  'Sodium oxide (12-16%)',
                  'Calcium oxide (5-11%)',
                  'Magnesium and aluminum oxides (trace)'
                ];
              } else if (labelLower.includes('aluminum') || labelLower.includes('can')) {
                mockData[label] = [
                  'Aluminum (94-97%)',
                  'Iron and silicon (0.2-0.8%)',
                  'Copper and zinc (trace amounts)',
                  'Polymer lining (for food/beverage cans)'
                ];
              } else if (labelLower.includes('paper')) {
                mockData[label] = [
                  'Cellulose fibers (primary component)',
                  'Lignin binders',
                  'Calcium carbonate or clay (fillers)',
                  'Sizing agents and possible dyes'
                ];
              } else if (labelLower.includes('coconut')) {
                mockData[label] = [
                  'Lignin (20-30%)',
                  'Cellulose (40-50%)',
                  'Hemicellulose (15-25%)',
                  'Natural waxes and oils (3-5%)'
                ];
              } else if (labelLower.includes('food')) {
                mockData[label] = [
                  'Organic matter (varied composition)',
                  'Carbohydrates, proteins, and lipids',
                  'Water content (variable percentage)',
                  'Micronutrients and natural compounds'
                ];
              } else {
                // Even for unknown items, provide some educated composition guess
                mockData[label] = [
                  'Mixed materials (composition varies)',
                  'Potential synthetic and natural components',
                  'Possible adhesives or binding agents'
                ];
              }
            });
          }
          setCompositionData(mockData);
        }
        
        setIsLoading(false);
      };
      
      // Fetch both types of data
      Promise.all([fetchReusabilityData(), fetchCompositionData()])
        .finally(() => setIsLoading(false));
    }
  }, [wasteData]);

  if (!wasteData || !wasteData.labels) {
    return null;
  }

  // Calculate stats based on API-provided biodegradability data
  const totalItems = wasteData.labels.length;
  const biodegradableItems = wasteData.labels.filter(
    label => biodegradabilityData[label] === true
  ).length;
  const nonBiodegradableItems = totalItems - biodegradableItems;
  const biodegradableRate = totalItems > 0 ? (biodegradableItems / totalItems) * 100 : 0;

  // Prepare data for charts
  const stats = {
    totalItems,
    biodegradableItems,
    nonBiodegradableItems,
    biodegradableRate: biodegradableRate.toFixed(1)
  };

  // Count occurrences of each waste type
  const wasteComposition = wasteData.labels.reduce((acc: Record<string, number>, label: string) => {
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  // Define disposal methods for each type of waste based on biodegradability
  const disposalMethods: Record<string, string> = {};
  
  // Assign disposal methods based on biodegradability
  for (const wasteType of Object.keys(biodegradabilityData)) {
    const wasteTypeLower = wasteType.toLowerCase();
    
    if (biodegradabilityData[wasteType]) {
      // For biodegradable items
      if (wasteTypeLower.includes('paper') || wasteTypeLower.includes('cardboard') || wasteTypeLower.includes('newspaper')) {
        disposalMethods[wasteType] = 'Recycle or Compost';
      } else if (
        wasteTypeLower.includes('food') || 
        wasteTypeLower.includes('organic') || 
        wasteTypeLower.includes('fruit') || 
        wasteTypeLower.includes('vegetable') ||
        wasteTypeLower.includes('plant') ||
        wasteTypeLower.includes('leaf') ||
        wasteTypeLower.includes('coffee') ||
        wasteTypeLower.includes('tea')
      ) {
        disposalMethods[wasteType] = 'Compost';
      } else if (wasteTypeLower.includes('wood') || wasteTypeLower.includes('bamboo')) {
        disposalMethods[wasteType] = 'Recycle or Compost';
      } else if (wasteTypeLower.includes('cotton') || wasteTypeLower.includes('jute') || wasteTypeLower.includes('hemp')) {
        disposalMethods[wasteType] = 'Compost or Textile Recycling';
      } else {
        disposalMethods[wasteType] = 'Compost';
      }
    } else {
      // For non-biodegradable items
      if (
        wasteTypeLower.includes('plastic') || 
        wasteTypeLower.includes('pet') || 
        wasteTypeLower.includes('bottle') || 
        wasteTypeLower.includes('container')
      ) {
        if (wasteTypeLower.includes('bag') || wasteTypeLower.includes('wrapper') || wasteTypeLower.includes('film')) {
          // Soft plastics often need special recycling
          disposalMethods[wasteType] = 'Special Recycling';
        } else {
          disposalMethods[wasteType] = 'Recycle';
        }
      } else if (
        wasteTypeLower.includes('glass') || 
        wasteTypeLower.includes('jar') || 
        wasteTypeLower.includes('bottle')
      ) {
        disposalMethods[wasteType] = 'Recycle';
      } else if (
        wasteTypeLower.includes('metal') ||
        wasteTypeLower.includes('aluminum') ||
        wasteTypeLower.includes('tin') ||
        wasteTypeLower.includes('steel') ||
        wasteTypeLower.includes('can')
      ) {
        disposalMethods[wasteType] = 'Recycle';
      } else if (
        wasteTypeLower.includes('electronic') ||
        wasteTypeLower.includes('battery') ||
        wasteTypeLower.includes('device') ||
        wasteTypeLower.includes('phone') ||
        wasteTypeLower.includes('computer')
      ) {
        disposalMethods[wasteType] = 'E-Waste Recycling';
      } else if (
        wasteTypeLower.includes('hazard') ||
        wasteTypeLower.includes('chemical') ||
        wasteTypeLower.includes('paint') ||
        wasteTypeLower.includes('oil') ||
        wasteTypeLower.includes('solvent')
      ) {
        disposalMethods[wasteType] = 'Hazardous Waste';
      } else {
        disposalMethods[wasteType] = 'Landfill';
      }
    }
  }

  return (
    <div className="waste-visualization">
      <h2>Waste Visualization</h2>
      
      <div className="visualization-layout">
        {/* Top row with two equal columns */}
        <div className="top-row">
          <WasteCompositionChart composition={wasteComposition} biodegradabilityData={biodegradabilityData} />
          <QuickStats stats={stats} />
        </div>
        
        {/* Bottom row spanning full width */}
        <div className="bottom-row">
          <WasteDisposalMethods items={wasteData.labels} methods={disposalMethods} />
          
          {/* New components */}
          {isLoading ? (
            <div className="loading-indicator">Loading additional data...</div>
          ) : (
            <>
              <ReusableMeasure items={wasteData.labels} reusabilityData={reusabilityData} />
              <WasteComposition items={wasteData.labels} compositionData={compositionData} />
              <RecyclingCenters items={wasteData.labels} apiKey={googleMapsApiKey} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WasteVisualization; 