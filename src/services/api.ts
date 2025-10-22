import axios from 'axios';

// Obtener variable de entorno de forma segura
const getApiUrl = (): string => {
  // @ts-ignore - Vite define import.meta.env en runtime
  return import.meta.env?.VITE_API_URL || 'http://localhost:3000/api';
};

const API_BASE_URL = getApiUrl();

// Log para debugging (solo en desarrollo)
// @ts-ignore
if (import.meta.env?.DEV) {
  console.log('🔌 API conectando a:', API_BASE_URL);
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Helper para verificar conexión
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const baseUrl = API_BASE_URL.replace('/api', '');
    const response = await axios.get(`${baseUrl}/health`, { timeout: 5000 });
    return response.data.status === 'ok';
  } catch (error) {
    console.error('❌ API no disponible:', error);
    return false;
  }
};