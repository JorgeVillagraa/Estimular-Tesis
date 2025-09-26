const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  if (hostname === 'pps.fdrach.pp.ua') {
    return 'https://ppsb.fdrach.pp.ua';
  }
  // Default para desarrollo local
  return 'http://localhost:3001';
};

const API_BASE_URL = getApiBaseUrl();

export default API_BASE_URL;
