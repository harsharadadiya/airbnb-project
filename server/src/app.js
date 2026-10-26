// Builds the Express app: security, logging, routes and error handling.
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { env, isProduction } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import hostRoutes from './routes/hostRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { AppError } from './utils/AppError.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1); // needed behind hosts like Render so rate limiting sees the real IP

  // ---- Security & parsing ----
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        // Allow tools like Postman/curl (no origin) and our own frontend URLs
        if (!origin || env.CLIENT_URLS.includes(origin)) return callback(null, true);
        return callback(new AppError(`CORS: ${origin} is not allowed. Add it to CLIENT_URL in server/.env`, 403));
      },
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan(isProduction ? 'combined' : 'dev'));

  // ---- Health check (useful for deployment platforms) ----
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      time: new Date().toISOString(),
    });
  });

  // ---- API routes ----
  app.use('/api/auth', authRoutes);
  app.use('/api/listings', listingRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/host', hostRoutes);

  // ---- 404 + error handler (must be last) ----
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
