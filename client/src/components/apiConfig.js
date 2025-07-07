// apiConfig.js
// Central configuration for API endpoints using environment variables

// Get configuration from environment variables with fallbacks
const API_PROTOCOL = process.env.REACT_APP_API_PROTOCOL || 'http';
const API_HOST = process.env.REACT_APP_API_HOST || 'localhost';
const API_PORT = process.env.REACT_APP_API_PORT || '8800';

// Build the complete API base URL
export const API_BASE_URL = `${API_PROTOCOL}://${API_HOST}:${API_PORT}`;

// Export individual components for flexibility
export const HOST = API_HOST;
export const PORT = API_PORT;
export const PROTOCOL = API_PROTOCOL;

// Function to build API URLs
export const buildApiUrl = (endpoint) => {
  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

// Common endpoints
export const API_ENDPOINTS = {
  // Main entity endpoints
  OT: '/ot',
  CMD: '/cmd',
  UTILISATEUR: '/utilisateur',
  LOCATION: '/location',
  EQUIPMENT: '/equipment',
  
  // Special endpoints
  ASSIGNMENTS: '/assignments',
  KPIS: '/kpis',
  
  // Action endpoints
  VALIDATE_OT: '/validate-ot',
  ASSIGN_CMD_TO_OT: '/assign-cmd-to-ot',
  UNASSIGN_CMD_FROM_OT: '/unassign-cmd-from-ot',
  
  // Dynamic endpoints (functions that return URLs)
  OT_BY_ID: (id) => `/ot/${id}`,
  CMD_BY_ID: (id) => `/cmd/${id}`,
  UTILISATEUR_BY_ID: (id) => `/utilisateur/${id}`,
  LOCATION_BY_ID: (id) => `/location/${id}`,
};

// Helper function for complete URLs (useful for axios)
export const getApiUrl = (endpoint, params = {}) => {
  let url = buildApiUrl(endpoint);
  
  // Add query parameters if provided
  if (Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }
  
  return url;
};

// Debug function to log current configuration
export const logApiConfig = () => {
  console.log('API Configuration:', {
    protocol: PROTOCOL,
    host: HOST,
    port: PORT,
    baseUrl: API_BASE_URL,
    environment: process.env.NODE_ENV
  });
};

// Default export
export default {
  HOST,
  PORT,
  PROTOCOL,
  API_BASE_URL,
  buildApiUrl,
  getApiUrl,
  API_ENDPOINTS,
  logApiConfig
};