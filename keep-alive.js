import https from 'https';

// Substitua pela URL gerada pelo Render (ex: https://seu-app.onrender.com)
const RENDER_URL = process.env.APP_URL || 'http://localhost:3000';

console.log(`[Keep-Alive] Configurado para pingar: ${RENDER_URL} a cada 10 minutos`);

setInterval(() => {
  https.get(`${RENDER_URL}/api/health`, (res) => {
    console.log(`[Keep-Alive] Ping em ${RENDER_URL} | Status: ${res.statusCode} | Horário: ${new Date().toISOString()}`);
  }).on('error', (err) => {
    console.error(`[Keep-Alive] Erro ao pingar: ${err.message}`);
  });
}, 10 * 60 * 1000); // 10 minutos (600.000 ms)
