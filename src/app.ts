import express from 'express';
import type { Application } from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import sequelize from './config/database.js';
import { configurePassport } from './config/passport.js';
import './models/index.js';
import userRoutes from './routes/userRoutes.js';
import { logger } from './utils/logger.js';

const app: Application = express();

configurePassport();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'change-me-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

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
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK' });
});

export default app;
