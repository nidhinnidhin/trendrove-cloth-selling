import axios from 'axios';

export const setupAxios = () => {
  // const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.trendrove.shop/api";
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.trendrove.shop/api";
  
  // Set default configs
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = API_URL;
  
  // Add global request interceptor 
  axios.interceptors.request.use(
    async (config) => {
      if (config.method !== 'get') {
        try {
          const response = await axios.get(`${API_URL}/csrf-token`, {
            withCredentials: true
          });
          config.headers["x-csrf-token"] = response.data.csrfToken;
        } catch (error) {
          console.error('Error fetching CSRF token:', error);
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // Add global response interceptor
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('Response error:', error);
      return Promise.reject(error);
    }
  );
};