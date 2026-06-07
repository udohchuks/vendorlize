const http = require('https');

const images = [
  "/images/phasion-sense/ps1.jpg",
  "/images/phasion-sense/ps2.jpg",
  "/images/phasion-sense/ps3.jpg",
  "/images/phasion-sense/ps4.jpg",
  "/images/phasion-sense/ps5.jpg",
  "/images/phasion-sense/ps6.jpeg",
  "/images/phasion-sense/ps7.jpeg",
  "/images/phasion-sense/ps8.jpeg",
  "/images/phasion-sense/ps9.jpeg",
  "/images/phasion-sense/ps10.jpeg",
  "/images/phasion-sense/ps11.jpeg",
  "/images/phasion-sense/ps12.jpeg",
  "/images/phasion-sense/ps13.jpeg",
  "/images/phasion-sense/ps14.jpeg",
  "/images/phasion-sense/ps15.jpeg"
];

const host = 'api-hackathon.codedematrixtech.com';

function testPath(path) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: host,
      port: 443,
      path: path,
      method: 'HEAD',
      timeout: 3000
    }, (res) => {
      resolve({ path, statusCode: res.statusCode });
    });

    req.on('error', (err) => {
      resolve({ path, error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ path, error: 'timeout' });
    });

    req.end();
  });
}

async function run() {
  console.log('Testing all Phasion Sense images...');
  for (const img of images) {
    const res = await testPath(img);
    console.log(`${res.path} -> ${res.statusCode || ('ERROR: ' + res.error)}`);
  }
}

run();
