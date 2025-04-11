import { useState, useEffect } from 'react'
import './App.css'
import WasteVisualization from './components/WasteVisualization.tsx'

// Interface for API responses
interface BiodegradabilityResult {
  itemName: string;
  isBiodegradable: boolean;
  confidence: number;
}

interface WasteData {
  labels: string[];
  boundingBoxes: any[];
}

function App() {
  const [loading, setLoading] = useState(false)
  const [wasteData, setWasteData] = useState<WasteData | null>(null)
  const [biodegradabilityData, setBiodegradabilityData] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)

  const fetchWasteData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch the waste.json file
      const response = await fetch('/waste.json')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch waste.json: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json() as WasteData
      console.log('Successfully loaded waste data:', data)
      
      // Get unique waste types for biodegradability check
      const uniqueWasteTypes = Array.from(new Set(data.labels));
      
      // Check biodegradability with Groq API for each unique waste type
      const biodegradabilityInfo = await checkBiodegradability(uniqueWasteTypes);
      
      // Update state with both waste data and biodegradability information
      setWasteData(data)
      setBiodegradabilityData(biodegradabilityInfo)
    } catch (err) {
      console.error('Error during analysis:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  // Function to check biodegradability using Groq API
  const checkBiodegradability = async (wasteItems: string[]): Promise<Record<string, boolean>> => {
    try {
      // Create a prompt for the LLM to analyze biodegradability
      const prompt = `
        For each of the following waste items, determine if it is biodegradable or non-biodegradable.
        Consider scientific facts about decomposition rates in natural conditions.
        
        Return the results as a JSON object with a "results" array containing objects with properties:
        - "itemName" (string): Exactly as provided in the input
        - "isBiodegradable" (boolean): true if biodegradable, false if not
        - "confidence" (number): Between 0 and 1
        - "explanation" (string): Brief explanation of your decision
        
        Waste items to analyze: ${wasteItems.join(', ')}
        
        Response must be in this exact format:
        {
          "results": [
            {
              "itemName": "paper",
              "isBiodegradable": true,
              "confidence": 0.95,
              "explanation": "Paper is made from wood pulp and decomposes naturally in 2-6 weeks in proper conditions."
            },
            {
              "itemName": "plastic bottle",
              "isBiodegradable": false,
              "confidence": 0.98,
              "explanation": "Most plastic bottles are made from PET which doesn't biodegrade for hundreds of years."
            }
          ]
        }
        
        Only respond with valid JSON. Do not include any other text outside the JSON structure.
      `;
      
      // Call the Groq API
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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'
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: 'You are a waste management expert with deep knowledge of biodegradability. Analyze waste items using scientific facts and determine if they are biodegradable. Respond only with properly formatted JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          response_format: { type: "json_object" }
        })
      });
      
      if (!groqResponse.ok) {
        const errorText = await groqResponse.text();
        throw new Error(`Groq API error: ${groqResponse.status}. Details: ${errorText}`);
      }
      
      const groqData = await groqResponse.json();
      let analysisResults;
      
      try {
        // Try to parse the JSON response
        analysisResults = JSON.parse(groqData.choices[0].message.content);
      } catch (parseError) {
        // If parsing fails, use the response directly (Groq might already return parsed JSON)
        analysisResults = groqData.choices[0].message.content;
      }
      
      // Convert array of results to a map of itemName -> isBiodegradable
      const biodegradabilityMap: Record<string, boolean> = {};
      
      // Handle different possible response formats
      if (analysisResults.results && Array.isArray(analysisResults.results)) {
        // Expected format
        analysisResults.results.forEach((result: BiodegradabilityResult) => {
          biodegradabilityMap[result.itemName] = result.isBiodegradable;
        });
      } else if (Array.isArray(analysisResults)) {
        // Alternative format: direct array
        analysisResults.forEach((result: BiodegradabilityResult) => {
          biodegradabilityMap[result.itemName] = result.isBiodegradable;
        });
      } else {
        // Fallback for unexpected format
        console.warn('Unexpected response format from biodegradability API:', analysisResults);
        throw new Error('Invalid response format from biodegradability API');
      }
      
      console.log('Biodegradability analysis results:', biodegradabilityMap);
      return biodegradabilityMap;
    } catch (error) {
      console.error('Error in biodegradability check:', error);
      // Return default values for common items if API fails
      const defaultMap: Record<string, boolean> = {};
      wasteItems.forEach(item => {
        const itemLower = item.toLowerCase();
        // More comprehensive defaults based on common knowledge
        if (
          itemLower.includes('paper') || 
          itemLower.includes('cardboard') || 
          itemLower.includes('food') || 
          itemLower.includes('organic') || 
          itemLower.includes('wood') || 
          itemLower.includes('plant') || 
          itemLower.includes('fruit') || 
          itemLower.includes('vegetable') ||
          itemLower.includes('leaf') ||
          itemLower.includes('cotton')
        ) {
          defaultMap[item] = true;
        } else if (
          itemLower.includes('plastic') || 
          itemLower.includes('metal') || 
          itemLower.includes('glass') || 
          itemLower.includes('aluminum') || 
          itemLower.includes('synthetic') ||
          itemLower.includes('polyester') ||
          itemLower.includes('nylon')
        ) {
          defaultMap[item] = false;
        } else {
          // For unknown items, make a best guess
          defaultMap[item] = Math.random() > 0.7; // 30% chance of being biodegradable for unknown items
        }
      });
      console.log('Using default biodegradability values:', defaultMap);
      return defaultMap;
    }
  };

  return (
    <div className="hero-section">
      <div className="hero-content">
        <h1>Waste Segregation Using Manipulator</h1>
        <button 
          className="analyze-button" 
          onClick={fetchWasteData}
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Analyze Waste'}
        </button>
        
        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
          </div>
        )}

        {wasteData && <WasteVisualization wasteData={wasteData} biodegradabilityData={biodegradabilityData} />}
      </div>
    </div>
  )
}

export default App
