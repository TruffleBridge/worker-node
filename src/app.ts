import express from 'express';
import type { Application } from 'express';
import cors from 'cors';
import sequelize from './config/database.js';
import userRoutes from './routes/userRoutes.js';
import { logger } from './utils/logger.js';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Database connection
sequelize
  .authenticate()
  .then(() => {
    logger.info('Database connected successfully');
  })
  .catch((error) => {
    logger.error('Database connection failed', error);
  });

// Sync models with database
sequelize.sync({ alter: true }).catch((error) => {
  logger.error('Error syncing database', error);
});

// Routes
app.use('/api/auth', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

export default app;
