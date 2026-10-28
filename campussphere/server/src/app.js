import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './utils/env.js';
import { seedInitialData } from './data/seed.js';
import { attachSessionUser } from './middleware/auth.middleware.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import postsRoutes from './routes/posts.routes.js';
import commentsRoutes from './routes/comments.routes.js';
import usersRoutes from './routes/users.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

// Inisialisasi data awal (Seed Data) ke dalam In-Memory Store
seedInitialData();

const app = express();

// 1. Konfigurasi CORS secara ketat (hanya mengizinkan origin frontend kita)
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  })
);

// 2. Parser body JSON (dibatasi 1MB untuk mencegah payload raksasa), Cookie, dan Sesi
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(attachSessionUser);

// 3. Pendaftaran Rute REST API
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/admin', adminRoutes);

// 4. Penanganan rute tidak ditemukan & error terpusat
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
