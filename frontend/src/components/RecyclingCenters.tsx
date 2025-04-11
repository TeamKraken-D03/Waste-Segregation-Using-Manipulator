import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import './WasteVisualization.css';

interface RecyclingCentersProps {
  items: string[];
  apiKey: string;
}

interface RecyclingCenter {
  id: string;
  name: string;
  address: string;
  position: {
    lat: number;
    lng: number;
  };
  wasteTypes: string[];
  distance: string;
}

// Map subcomponent
const RecyclingLocationsMap: React.FC<{
  recyclingCenters: RecyclingCenter[];
  userLocation: { lat: number; lng: number } | null;
  selectedCenter: RecyclingCenter | null;
  setSelectedCenter: (center: RecyclingCenter | null) => void;
  apiKey: string;
}> = ({ recyclingCenters, userLocation, selectedCenter, setSelectedCenter, apiKey }) => {
  const containerStyle = {
    width: '100%',
    height: '380px',
    borderRadius: '0 0 8px 8px'
  };

  // Custom marker icons
  const userMarkerIcon = {
    path: "M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z",
    fillColor: '#4285F4',
    fillOpacity: 1,
    strokeColor: '#FFFFFF',
    strokeWeight: 2,
    scale: 1.5
  };
  
  // Create a custom marker for recycling centers
  const getRecyclingMarkerIcon = (isSelected: boolean) => ({
    path: "M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z",
    fillColor: isSelected ? '#1e8449' : '#27ae60',
    fillOpacity: 1,
    strokeColor: '#FFFFFF',
    strokeWeight: 2,
    scale: isSelected ? 1.8 : 1.5
  });

  return (
    <div className="recycling-map-container">
      <h3>Recycling Locations Map</h3>
      <div className="map-container">
        <LoadScript googleMapsApiKey={apiKey} loadingElement={<div className="loading-indicator">Loading Maps...</div>}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={selectedCenter?.position || userLocation || undefined}
            zoom={12}
            options={{
              styles: [
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }]
                },
                {
                  featureType: "transit",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }]
                },
                {
                  featureType: "water",
                  elementType: "geometry",
                  stylers: [{ color: "#e0f7fa" }]
                },
                {
                  featureType: "poi.park",
                  elementType: "geometry",
                  stylers: [{ color: "#c8e6c9" }]
                }
              ],
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
              zoomControl: true,
              zoomControlOptions: {
                position: 3 // RIGHT_TOP
              }
            }}
          >
            {/* User location marker */}
            {userLocation && (
              <Marker
                position={userLocation}
                icon={userMarkerIcon}
                title="Your location"
                zIndex={1000}
                label={{
                  text: "You",
                  color: "#FFFFFF",
                  fontSize: "11px",
                  fontWeight: "bold"
                }}
              />
            )}
            
            {/* Recycling center markers */}
            {recyclingCenters.map((center) => {
              const isSelected = selectedCenter?.id === center.id;
              return (
                <Marker
                  key={center.id}
                  position={center.position}
                  onClick={() => setSelectedCenter(center)}
                  icon={getRecyclingMarkerIcon(isSelected)}
                  title={center.name}
                  zIndex={isSelected ? 100 : 10}
                />
              );
            })}
            
            {/* Info window for selected center */}
            {selectedCenter && (
              <InfoWindow
                position={selectedCenter.position}
                onCloseClick={() => setSelectedCenter(null)}
              >
                <div className="info-window">
                  <h4>{selectedCenter.name}</h4>
                  <p><strong>Address:</strong> {selectedCenter.address}</p>
                  <p><strong>Distance:</strong> {selectedCenter.distance}</p>
                  <p>
                    <strong>Accepts:</strong> 
                    <div className="center-types" style={{ marginTop: '5px' }}>
                      {selectedCenter.wasteTypes.map((type, index) => (
                        <span key={index} className="waste-type-tag">{type}</span>
                      ))}
                    </div>
                  </p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
};

// Centers list subcomponent
const AvailableCenters: React.FC<{
  recyclingCenters: RecyclingCenter[];
  selectedCenter: RecyclingCenter | null;
  setSelectedCenter: (center: RecyclingCenter | null) => void;
}> = ({ recyclingCenters, selectedCenter, setSelectedCenter }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const centersPerPage = 3;
  
  // Calculate pagination
  const indexOfLastCenter = currentPage * centersPerPage;
  const indexOfFirstCenter = indexOfLastCenter - centersPerPage;
  const currentCenters = recyclingCenters.slice(indexOfFirstCenter, indexOfLastCenter);
  const totalPages = Math.ceil(recyclingCenters.length / centersPerPage);
  
  // Handle page changes
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="recycling-centers-container">
      <h3>Available Centers</h3>
      
      {recyclingCenters.length > 0 ? (
        <>
          <div className="recycling-centers-list-container">
            {currentCenters.map((center) => (
              <div 
                key={center.id} 
                className={`recycling-center-item ${selectedCenter?.id === center.id ? 'selected' : ''}`}
                onClick={() => setSelectedCenter(center)}
              >
                <h5>{center.name}</h5>
                <p className="center-distance">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                  </svg>
                  Distance: <strong>{center.distance}</strong>
                </p>
                <p className="center-types">
                  {center.wasteTypes.map((type, index) => (
                    <span key={index} className="waste-type-tag">{type}</span>
                  ))}
                </p>
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="paginated-controls">
              <span className="page-indicator">
                Page {currentPage} of {totalPages}
              </span>
              <div className="page-controls">
                <button 
                  className="page-button" 
                  onClick={goToPreviousPage} 
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  ‹
                </button>
                <button 
                  className="page-button" 
                  onClick={goToNextPage} 
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="no-centers">No recycling centers found in your area</div>
      )}
    </div>
  );
};

const RecyclingCenters: React.FC<RecyclingCentersProps> = ({ items, apiKey }) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [recyclingCenters, setRecyclingCenters] = useState<RecyclingCenter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<RecyclingCenter | null>(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          setError('Unable to retrieve your location');
          // Default to a location if geolocation fails
          setUserLocation({ lat: 40.7128, lng: -74.0060 }); // New York as default
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setUserLocation({ lat: 40.7128, lng: -74.0060 }); // New York as default
      setLoading(false);
    }
  }, []);

  // Search for recycling centers when user location and waste items are available
  useEffect(() => {
    if (userLocation && items.length > 0) {
      setLoading(true);
      searchRecyclingCenters();
    }
  }, [userLocation, items]);

  // Function to search for nearby recycling centers based on waste types
  const searchRecyclingCenters = async () => {
    if (!userLocation) return;

    try {
      // Create search queries based on waste types
      const searchQueries = generateSearchQueries(items);
      const uniqueQueries = Array.from(new Set(searchQueries));
      
      // Simulate API calls for each query (replace with actual Places API calls)
      const centers = await Promise.all(
        uniqueQueries.map(async (query) => {
          return fetchNearbyPlaces(query);
        })
      );

      // Flatten and filter results
      const allCenters = centers.flat().filter(Boolean);
      
      // Remove duplicates based on place ID
      const uniqueCenters = Array.from(
        new Map(allCenters.map(center => [center.id, center])).values()
      );
      
      // Sort centers by distance (closest first)
      const sortedCenters = uniqueCenters.sort((a, b) => {
        const distanceA = parseFloat(a.distance.replace(' km', ''));
        const distanceB = parseFloat(b.distance.replace(' km', ''));
        return distanceA - distanceB;
      });
      
      setRecyclingCenters(sortedCenters);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch recycling centers');
      setLoading(false);
      console.error('Error fetching recycling centers:', err);
    }
  };

  // Generate appropriate search queries based on waste types
  const generateSearchQueries = (wasteItems: string[]): string[] => {
    const queryMap: Record<string, string[]> = {
      'plastic': ['plastic recycling center', 'recycling facility'],
      'bottle': ['bottle recycling center', 'recycling drop-off'],
      'aluminum': ['metal recycling center', 'aluminum recycling'],
      'can': ['can recycling center', 'metal recycling'],
      'paper': ['paper recycling center', 'cardboard recycling'],
      'glass': ['glass recycling center', 'bottle recycling'],
      'food': ['compost facility', 'organic waste disposal'],
      'coconut': ['organic waste disposal', 'compost facility'],
      'shell': ['organic waste disposal', 'compost facility']
    };

    return wasteItems.flatMap(item => {
      const lowerItem = item.toLowerCase();
      
      // Check for matches in our query map
      for (const [key, queries] of Object.entries(queryMap)) {
        if (lowerItem.includes(key)) {
          return queries;
        }
      }
      
      // Default query if no specific match
      return ['recycling center', 'waste disposal'];
    });
  };

  // Simulate fetching nearby places (replace with actual Google Places API)
  const fetchNearbyPlaces = async (query: string): Promise<RecyclingCenter[]> => {
    // This is a simulation - in a real app, you would call the Google Places API
    // using the provided apiKey and query parameters
    
    // For demo purposes, we'll return mock data based on query and location
    return generateMockRecyclingCenters(query);
  };

  // Generate mock data for demonstration purposes
  const generateMockRecyclingCenters = (query: string): RecyclingCenter[] => {
    const mockCenters: RecyclingCenter[] = [];
    const centerCount = Math.floor(Math.random() * 3) + 1; // 1-3 centers per query
    
    for (let i = 0; i < centerCount; i++) {
      // Generate a location within ~5km of user location
      const latOffset = (Math.random() - 0.5) * 0.1;
      const lngOffset = (Math.random() - 0.5) * 0.1;
      
      const mockLat = userLocation!.lat + latOffset;
      const mockLng = userLocation!.lng + lngOffset;
      
      // Distance calculation (simplified)
      const distance = Math.sqrt(latOffset * latOffset + lngOffset * lngOffset) * 111; // rough km conversion
      
      // Determine supported waste types based on query
      const supportedWasteTypes: string[] = [];
      
      if (query.includes('plastic')) supportedWasteTypes.push('Plastic');
      if (query.includes('glass')) supportedWasteTypes.push('Glass');
      if (query.includes('paper')) supportedWasteTypes.push('Paper');
      if (query.includes('metal') || query.includes('aluminum') || query.includes('can')) {
        supportedWasteTypes.push('Metal');
      }
      if (query.includes('compost') || query.includes('organic') || query.includes('food')) {
        supportedWasteTypes.push('Organic Waste');
      }
      
      // If no specific types matched, add a default
      if (supportedWasteTypes.length === 0) {
        supportedWasteTypes.push('General Recycling');
      }
      
      // Generate names based on query
      let namePrefixes = ['City', 'Green', 'Eco', 'Community', 'Regional'];
      let nameSuffixes = ['Recycling Center', 'Waste Management', 'Environmental Center', 'Recycling Facility'];
      
      if (query.includes('compost')) {
        namePrefixes = [...namePrefixes, 'Organic', 'Garden'];
        nameSuffixes = [...nameSuffixes, 'Compost Facility', 'Organic Processing Center'];
      }
      
      const randomPrefix = namePrefixes[Math.floor(Math.random() * namePrefixes.length)];
      const randomSuffix = nameSuffixes[Math.floor(Math.random() * nameSuffixes.length)];
      
      mockCenters.push({
        id: `mock-${query}-${i}-${Math.random().toString(36).substring(2, 9)}`,
        name: `${randomPrefix} ${randomSuffix}`,
        address: `${Math.floor(Math.random() * 1000) + 100} Main St, City, State ${Math.floor(Math.random() * 90000) + 10000}`,
        position: { lat: mockLat, lng: mockLng },
        wasteTypes: supportedWasteTypes,
        distance: `${distance.toFixed(1)} km`
      });
    }
    
    return mockCenters;
  };

  if (loading) {
    return (
      <div className="recycling-centers loading">
        <h3>Nearest Recycling Centers</h3>
        <div className="loading-indicator">Locating recycling centers near you...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recycling-centers error">
        <h3>Nearest Recycling Centers</h3>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="recycling-centers">
      <h3>Nearest Recycling Centers</h3>
      
      {recyclingCenters.length > 0 ? (
        <div className="recycling-twin-layout">
          <AvailableCenters 
            recyclingCenters={recyclingCenters}
            selectedCenter={selectedCenter}
            setSelectedCenter={setSelectedCenter}
          />
          <RecyclingLocationsMap 
            recyclingCenters={recyclingCenters}
            userLocation={userLocation}
            selectedCenter={selectedCenter}
            setSelectedCenter={setSelectedCenter}
            apiKey={apiKey}
          />
        </div>
      ) : (
        <div className="no-results">
          No recycling centers found for the detected waste items. Try expanding your search radius.
        </div>
      )}
    </div>
  );
};

export default RecyclingCenters; 