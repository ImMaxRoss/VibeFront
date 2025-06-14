// API Configuration for AWS Deployment

// PLACEHOLDER: Replace {{EC2_PUBLIC_IP}} with actual EC2 instance public IP after deployment
const getApiBaseUrl = (): string => {
  // Use environment variable in production, fallback to EC2 instance for AWS deployment
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Development fallback
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8080/api';
  }
  
  // AWS deployment fallback - replace with actual EC2 public IP
  return 'http://34.238.172.6:5000/api';
};

export const API_BASE_URL = getApiBaseUrl();

// AWS Configuration
export const AWS_CONFIG = {
  region: 'us-east-1',
  s3: {
    bucket: 'improvcoach-assets',
    // PLACEHOLDER: Replace {{CLOUDFRONT_DOMAIN}} with actual CloudFront distribution domain
    cdnUrl: 'https://{{CLOUDFRONT_DOMAIN}}'
  }
};

// API Configuration
export const API_CONFIG = {
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
  USE_MOCK_FALLBACKS: process.env.NODE_ENV === 'development'
};

// Helper function to determine if we should use mocks
export const shouldUseMockFallback = (error: Error): boolean => {
  // Only use mocks in development when explicitly enabled
  if (!API_CONFIG.USE_MOCK_FALLBACKS) {
    return false;
  }
  
  // Use mocks for connection errors (API not running)
  const connectionErrors = [
    'fetch', 
    'ECONNREFUSED', 
    'NetworkError',
    'Failed to fetch'
  ];
  
  return connectionErrors.some(errorType => 
    error.message.toLowerCase().includes(errorType.toLowerCase())
  );
};

// Environment-specific settings
export const ENVIRONMENT = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  apiUrl: API_BASE_URL,
  enableLogging: process.env.NODE_ENV === 'development'
};

console.log('API Configuration:', {
  environment: process.env.NODE_ENV,
  apiBaseUrl: API_BASE_URL,
  awsRegion: AWS_CONFIG.region
});
