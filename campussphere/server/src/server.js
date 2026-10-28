import app from './app.js';
import { env } from './utils/env.js';

app.listen(env.PORT, () => {
  console.log('============================================================');
  console.log(`🚀 CampusSphere Backend API berjalan di http://localhost:${env.PORT}`);
  console.log(`🏫 Kampus        : ${env.CAMPUS_NAME}`);
  console.log(`📧 Domain Resmi  : ${env.ALLOWED_CAMPUS_DOMAINS.map((d) => `@${d}`).join(', ')}`);
  console.log(`🌐 Client Origin : ${env.CLIENT_ORIGIN}`);
  console.log(`💾 Mode Data     : In-Memory (Data di-reset saat server restart)`);
  console.log('============================================================');
});
