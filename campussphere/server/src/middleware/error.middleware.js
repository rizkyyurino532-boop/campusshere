import { env } from '../utils/env.js';

// Middleware untuk rute API yang tidak ditemukan (404)
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      code: 'ENDPOINT_NOT_FOUND',
      message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan di server CampusSphere.`,
    },
  });
}

// Middleware penanganan error terpusat (Centralized Error Handler)
export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const message =
    statusCode === 500 && env.NODE_ENV === 'production'
      ? 'Terjadi kesalahan internal pada server.'
      : err.message || 'Terjadi kesalahan pada server.';

  if (env.NODE_ENV !== 'production') {
    if (statusCode >= 500) {
      console.error('[SERVER ERROR 500]:', err);
    } else {
      console.warn(
        `[API ${statusCode} ${errorCode}]: ${req.method} ${req.originalUrl} — ${message}`
      );
    }
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(err.details ? { details: err.details } : {}),
    },
  });
}
