import { env } from '../utils/env.js';

export function getHealthStatus(req, res) {
  res.status(200).json({
    success: true,
    message: 'Server backend CampusSphere berjalan normal.',
    data: {
      service: 'campussphere-api',
      status: 'OK',
      environment: env.NODE_ENV,
      campusName: env.CAMPUS_NAME,
      allowedEmailDomains: env.ALLOWED_CAMPUS_DOMAINS.map((d) => `@${d}`),
      storageMode: 'in-memory (development prototype — data resets on server restart)',
      timestamp: new Date().toISOString(),
    },
  });
}
