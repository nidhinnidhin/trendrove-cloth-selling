const axios = require('axios');

// Enhanced delivery charges with more granular pricing
const deliveryCharges = {
  // Metro Cities (Tier 1) - ₹50
  'mumbai': 50,
  'delhi': 50,
  'bangalore': 50,
  'kolkata': 50,
  'chennai': 50,
  'hyderabad': 50,
  'new delhi': 50,

  // Tier 2 Cities - ₹70
  'pune': 70,
  'ahmedabad': 70,
  'surat': 70,
  'lucknow': 70,
  'jaipur': 70,
  'kochi': 70,
  'coimbatore': 70,
  'indore': 70,
  'nagpur': 70,
  'bhopal': 70,
  'visakhapatnam': 70,
  'vadodara': 70,
  'thiruvananthapuram': 70,
  'gurugram': 70,
  'noida': 70,
  'kaniyapuram': 20,

  // States - for fallback when city isn't in database
  'kerala': 80,
  'maharashtra': 80,
  'tamil nadu': 80,
  'karnataka': 75,
  'telangana': 75,
  'andhra pradesh': 85,
  'uttar pradesh': 85,
  'gujarat': 80,
  'west bengal': 85,
  'rajasthan': 90,
  'madhya pradesh': 90,
  'bihar': 95,
  'odisha': 95,
  'assam': 100,
  'punjab': 85,
  'haryana': 80,
  'jharkhand': 95,
  'chhattisgarh': 95,
  'uttarakhand': 90,
  'himachal pradesh': 100,
  'goa': 85,

  // Special combined locations - for more specific delivery charges
  'kaniyapuram, kerala': 60,
  'mumbai, maharashtra': 50,
  'bangalore, karnataka': 50,
  
  // State Capitals & Major Cities - ₹80
  'panaji': 80,
  'shimla': 80,
  'dehradun': 80,
  'itanagar': 80,
  'dispur': 80,
  'patna': 80,
  'raipur': 80,
  'gandhinagar': 80,
  'chandigarh': 80,
  'ranchi': 80,
  'imphal': 80,
  'shillong': 80,
  'aizawl': 80,
  'kohima': 80,
  'bhubaneswar': 80,
  'gangtok': 80,
  'agartala': 80,
  'port blair': 80,
  'silvassa': 80,
  'kavaratti': 80,
  'puducherry': 80,

  // Regional Cities - ₹90
  'vijayawada': 90,
  'guntur': 90,
  'nellore': 90,
  'kurnool': 90,
  'rajahmundry': 90,
  'tirupati': 90,
  'kadapa': 90,
  'anantapur': 90,
  'kakinada': 90,
  'guwahati': 90,
  'dibrugarh': 90,
  'silchar': 90,
  'jorhat': 90,
  'tezpur': 90,
  'gaya': 90,
  'bhagalpur': 90,
  'muzaffarpur': 90,
  'darbhanga': 90,
  'bilaspur': 90,
  'bhilai': 90,
  'durg': 90,
  'korba': 90,
  'margao': 90,
  'mapusa': 90,
  'ponda': 90,
  'vasco da gama': 90,
  
  // Default for other cities
  'DEFAULT': 100
};

// More sophisticated delivery charge calculation with fallbacks
const getDeliveryCharge = (location, orderAmount = 0) => {
  // Free delivery for orders above ₹5000
  if (orderAmount >= 5000) {
    return {
      charge: 0,
      message: 'Free Delivery on orders above ₹5000'
    };
  }

  if (!location) {
    return {
      charge: null,
      message: 'Please select a delivery location'
    };
  }

  // Try more specific location matches first
  const normalizedLocation = location.trim().toLowerCase();
  
  // Check for direct match
  if (deliveryCharges[normalizedLocation]) {
    return {
      charge: deliveryCharges[normalizedLocation],
      message: `Delivery charge for ${location}: ₹${deliveryCharges[normalizedLocation]}`
    };
  }
  
  // Try matching just the city part
  const locationParts = normalizedLocation.split(',');
  const city = locationParts[0].trim();
  
  if (deliveryCharges[city]) {
    return {
      charge: deliveryCharges[city],
      message: `Delivery charge for ${city}: ₹${deliveryCharges[city]}`
    };
  }
  
  // If city not found, try matching the state part
  let state = null;
  if (locationParts.length > 1) {
    state = locationParts[1].trim();
    if (deliveryCharges[state]) {
      return {
        charge: deliveryCharges[state],
        message: `Delivery charge for ${state}: ₹${deliveryCharges[state]}`
      };
    }
  }
  
  // If all else fails, use default charge
  return {
    charge: deliveryCharges.DEFAULT,
    message: `Standard delivery charge: ₹${deliveryCharges.DEFAULT}`
  };
};

// Location cache to prevent repeated API calls
const locationCache = new Map();

// Get user's location with better error handling
const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    // Check if we have a cached location in localStorage
    const cachedLocation = localStorage.getItem('userLocation');
    if (cachedLocation) {
      try {
        const parsedLocation = JSON.parse(cachedLocation);
        // Check if the cached location is not too old (within 24 hours)
        const cacheTimestamp = localStorage.getItem('locationTimestamp');
        const isRecent = cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < 24 * 60 * 60 * 1000;
        
        if (isRecent) {
          return resolve(parsedLocation);
        }
      } catch (error) {
        console.warn('Failed to parse cached location', error);
        localStorage.removeItem('userLocation');
      }
    }

    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const location = await reverseGeocode(latitude, longitude);
          
          // Cache the fresh location data
          localStorage.setItem('userLocation', JSON.stringify(location));
          localStorage.setItem('locationTimestamp', Date.now().toString());
          
          resolve(location);
        } catch (error) {
          reject(error);
        }
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        
        // Provide more helpful error messages
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access was denied. Please allow location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please try again later.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
};

// Enhanced reverse geocoding with better error handling and alternative API options
const reverseGeocode = async (latitude, longitude) => {
  const cacheKey = `${latitude},${longitude}`;
  
  if (locationCache.has(cacheKey)) {
    return locationCache.get(cacheKey);
  }

  // Try multiple geocoding services in case one fails
  const services = [
    // Primary service - OpenStreetMap Nominatim
    async () => {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
        { headers: { 'User-Agent': 'YourAppName/1.0' } }
      );
      
      if (!response.ok) throw new Error('Nominatim service failed');
      
      const data = await response.json();
      
      const city = data.address?.city || 
                   data.address?.town || 
                   data.address?.village || 
                   data.address?.suburb ||
                   data.address?.state_district;
                   
      const state = data.address?.state;
      const country = data.address?.country;
      
      return { city, state, country };
    },
    
    // Fallback service - could be replaced with an alternative geocoding API
    async () => {
      // This is a placeholder for an alternative geocoding service
      // In a real implementation, you would integrate another provider like Google Maps, MapBox, etc.
      
      // For now, we'll just throw an error to move to the next service
      throw new Error('No fallback service configured');
    }
  ];
  
  // Try each service in sequence until one succeeds
  for (const service of services) {
    try {
      const result = await service();
      
      // If we got a valid result with at least a city, cache and return it
      if (result && result.city) {
        locationCache.set(cacheKey, result);
        return result;
      }
    } catch (error) {
      console.warn('Geocoding service failed, trying next:', error);
      // Continue to the next service
    }
  }
  
  // If all services failed, throw an error
  throw new Error('Failed to get location data from all available services');
};

// Distance-based delivery charge calculation (for future enhancements)
const calculateDistanceBasedCharge = (userCoords, storeCoords) => {
  // Haversine formula to calculate distance between two coordinates
  const getDistanceInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };
  
  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };
  
  const distance = getDistanceInKm(
    userCoords.latitude, 
    userCoords.longitude, 
    storeCoords.latitude, 
    storeCoords.longitude
  );
  
  // Define charge based on distance
  let charge;
  if (distance <= 5) {
    charge = 40;
  } else if (distance <= 10) {
    charge = 60;
  } else if (distance <= 20) {
    charge = 80;
  } else if (distance <= 50) {
    charge = 100;
  } else {
    charge = 120;
  }
  
  return {
    charge,
    distance: Math.round(distance),
    message: `Delivery charge for ${Math.round(distance)} km: ₹${charge}`
  };
};

// Check if delivery is available for a location
const isDeliveryAvailable = (location) => {
  // Logic to determine if delivery is available for the location
  // This could check against a list of serviceable areas or use other criteria
  
  // For now, let's assume delivery is available everywhere except a few locations
  const nonServiceableLocations = ['andaman', 'nicobar', 'lakshadweep'];
  
  const normalizedLocation = location.toLowerCase();
  
  return !nonServiceableLocations.some(loc => normalizedLocation.includes(loc));
};

// Get estimated delivery date based on location
const getEstimatedDeliveryDate = (location) => {
  // Base delivery time in days
  let baseDeliveryDays = 3;
  
  // Adjust based on location
  const normalizedLocation = location.toLowerCase();
  
  // Metro cities - faster delivery
  if (['mumbai', 'delhi', 'bangalore', 'kolkata', 'chennai', 'hyderabad'].some(
    city => normalizedLocation.includes(city)
  )) {
    baseDeliveryDays = 1;
  } 
  // Tier 2 cities - medium delivery time
  else if (['pune', 'jaipur', 'lucknow', 'kochi', 'ahmedabad'].some(
    city => normalizedLocation.includes(city)
  )) {
    baseDeliveryDays = 2;
  }
  // Remote locations - longer delivery time
  else if (['himachal', 'uttarakhand', 'northeast', 'jammu', 'kashmir'].some(
    region => normalizedLocation.includes(region)
  )) {
    baseDeliveryDays = 5;
  }
  
  // Calculate the delivery date
  const today = new Date();
  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + baseDeliveryDays);
  
  // Format the date
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  return {
    date: deliveryDate.toLocaleDateString('en-IN', options),
    days: baseDeliveryDays
  };
};

module.exports = {
  getDeliveryCharge,
  getUserLocation,
  reverseGeocode,
  deliveryCharges,
  calculateDistanceBasedCharge,
  isDeliveryAvailable,
  getEstimatedDeliveryDate
};