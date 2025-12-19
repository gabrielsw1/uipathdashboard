import express, { Express } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { validateFolderId } from './middleware/auth';

// Routes
import statsRoutes from './routes/stats';
import jobsRoutes from './routes/jobs';
import processesRoutes from './routes/processes';
import robotsRoutes from './routes/robots';
import sessionsRoutes from './routes/sessions';
import foldersRoutes from './routes/folders';
import releasesRoutes from './routes/releases';
import machinesRoutes from './routes/machines';
import roiRoutes from './routes/roi';
import monitoringRoutes from './routes/monitoring';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
});

app.use(limiter);

// CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas que não precisam de validação de folderId
app.use('/api/roi', roiRoutes);

// Middleware para validar folderId (aplica-se às outras rotas)
app.use(validateFolderId);

// Rotas que precisam de folderId (após o middleware)
app.use('/api/monitoring', monitoringRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/stats', statsRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/processes', processesRoutes);
app.use('/api/robots', robotsRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/folders', foldersRoutes);
app.use('/api/releases', releasesRoutes);
app.use('/api/machines', machinesRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

export default app;

