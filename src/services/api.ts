import axios from 'axios';

// Obtener variable de entorno de forma segura
const getApiUrl = (): string => {
  // En tiempo de build, Vite reemplaza import.meta.env.VITE_API_URL con el valor real
  const viteApiUrl = import.meta.env.VITE_API_URL;
  
  // Fallback para desarrollo local
  const fallbackUrl = 'http://localhost:3000/api';
  
  return viteApiUrl || fallbackUrl;
};

const API_BASE_URL = getApiUrl();

// Log para debugging (solo en desarrollo)
if (import.meta.env.DEV) {
  console.log('🔌 API conectando a:', API_BASE_URL);
} else {
  console.log('🚀 Producción - API conectando a:', API_BASE_URL);
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos de timeout
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('❌ Error de red - No se puede conectar al servidor:', API_BASE_URL);
    } else {
      console.error('❌ API Error:', error.response?.data || error.message);
    }
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

// Exportar la URL para debugging
export const getApiBaseUrl = () => API_BASE_URL;