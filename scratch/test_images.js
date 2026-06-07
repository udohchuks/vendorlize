const http = require('https');

const paths = [
  '/images/phasion-sense/logo.png',
  '/images/phasion-sense/logo.jpg',
  '/images/phasion-sense/logo.jpeg',
  '/images/phasion-sense/logo.gif'
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
  console.log('Testing logo paths...');
  for (const p of paths) {
    const result = await testPath(p);
    console.log(`${result.path} -> ${result.statusCode}`);
  }
}

run();
