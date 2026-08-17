const https = require('https');

const API_KEY = process.env.RENDER_API_KEY;
const SERVICE_ID = process.env.RENDER_SERVICE_ID;

if (!API_KEY || !SERVICE_ID) {
  console.error('Please set RENDER_API_KEY and RENDER_SERVICE_ID environment variables');
  process.exit(2);
}

const data = JSON.stringify({});

const options = {
  hostname: 'api.render.com',
  path: `/v1/services/${SERVICE_ID}/deploys`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Render API response:', res.statusCode, body);
  });
});

req.on('error', (e) => { console.error('Request error:', e); });
req.write(data);
req.end();
