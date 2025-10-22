import express, { Express } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

// Importar rutas
import clientesRoutes from './routes/clientes.routes';
import serviciosRoutes from './routes/servicios.routes';
import empleadosRoutes from './routes/empleados.routes';
import citasRoutes from './routes/citas.routes';
import transaccionesRoutes from './routes/transacciones.routes';
import cierreCajaRoutes from './routes/cierrecaja.routes';
import reportesRoutes from './routes/reportes.routes';

export const prisma = new PrismaClient();

export async function startServer(): Promise<any> {
  const app: Express = express();
  const PORT = 3001;

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Ruta de prueba
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'API funcionando correctamente' });
  });

  // Rutas de API
  app.use('/api/clientes', clientesRoutes);
  app.use('/api/servicios', serviciosRoutes); 
  app.use('/api/empleados', empleadosRoutes);
  app.use('/api/citas', citasRoutes); 
  app.use('/api/transacciones', transaccionesRoutes);
  app.use('/api/cierre-caja', cierreCajaRoutes);
  app.use('/api/reportes', reportesRoutes);

  // Iniciar servidor
  const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
  });

  return server;
}