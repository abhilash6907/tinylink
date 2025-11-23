import http from 'http';

const BASE_URL = 'http://localhost:3000';
let testsPassed = 0;
let testsFailed = 0;
let createdCode = '';

// Helper function for HTTP requests
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error(`Request failed: ${err.message}`));
    });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Test helper
function test(name, fn) {
  return fn()
    .then(() => {
      console.log(`✅ ${name}`);
      testsPassed++;
    })
    .catch((err) => {
      console.error(`❌ ${name}`);
      console.error(`   Error: ${err.message}`);
      testsFailed++;
    });
}

// Run all tests
async function runTests() {
  console.log('🧪 Starting TinyLink Test Suite\n');

  // Test 1: Health Check
  await test('1️⃣ /healthz returns 200', async () => {
    const res = await makeRequest('GET', '/healthz');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.data.ok) throw new Error('Health check failed');
  });

  // Test 2: Create a link
  await test('2️⃣ Creating a link works', async () => {
    const res = await makeRequest('POST', '/api/links', {
      longURL: 'https://example.com/test',
      code: 'TEST99',
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    if (!res.data.success) throw new Error('Link creation failed');
    if (res.data.data.code !== 'TEST99') throw new Error('Wrong code returned');
    createdCode = res.data.data.code;
  });

  // Test 3: Duplicate code returns 409
  await test('3️⃣ Duplicate codes return 409', async () => {
    const res = await makeRequest('POST', '/api/links', {
      longURL: 'https://example.com/another',
      code: 'TEST99',
    });
    if (res.status !== 409) throw new Error(`Expected 409, got ${res.status}`);
    if (res.data.success) throw new Error('Should fail for duplicate');
  });

  // Test 4: Get link details (verify clicks = 0)
  await test('4️⃣ Get link returns correct data', async () => {
    const res = await makeRequest('GET', `/api/links/${createdCode}`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.data.data.clicks !== 0) throw new Error('Initial clicks should be 0');
  });

  // Test 5: Redirect works (follow manually, check location header)
  await test('5️⃣ Redirect returns 302 with location header', async () => {
    const res = await makeRequest('GET', `/${createdCode}`);
    if (res.status !== 302) throw new Error(`Expected 302, got ${res.status}`);
    if (!res.headers.location) throw new Error('No location header found');
  });

  // Test 6: Click count incremented
  await test('6️⃣ Click count increments after redirect', async () => {
    // Wait a bit for DB to update
    await new Promise(resolve => setTimeout(resolve, 100));
    const res = await makeRequest('GET', `/api/links/${createdCode}`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.data.data.clicks !== 1) throw new Error(`Expected 1 click, got ${res.data.data.clicks}`);
  });

  // Test 7: Get all links
  await test('7️⃣ Get all links works', async () => {
    const res = await makeRequest('GET', '/api/links');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!Array.isArray(res.data.data)) throw new Error('Should return array');
    if (res.data.data.length === 0) throw new Error('Should have at least one link');
  });

  // Test 8: Delete link
  await test('8️⃣ Deletion works', async () => {
    const res = await makeRequest('DELETE', `/api/links/${createdCode}`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.data.success) throw new Error('Deletion failed');
  });

  // Test 9: Redirect after deletion returns 404
  await test('9️⃣ Redirect after deletion returns 404', async () => {
    const res = await makeRequest('GET', `/${createdCode}`);
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
  });

  // Test 10: Get deleted link returns 404
  await test('🔟 Get deleted link returns 404', async () => {
    const res = await makeRequest('GET', `/api/links/${createdCode}`);
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
  });

  // Test 11: Auto-generate code works
  await test('1️⃣1️⃣ Auto-generated code creation works', async () => {
    const res = await makeRequest('POST', '/api/links', {
      longURL: 'https://example.com/auto',
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    if (!res.data.data.code) throw new Error('No code generated');
    if (res.data.data.code.length < 6 || res.data.data.code.length > 8) {
      throw new Error('Generated code should be 6-8 characters');
    }
    // Clean up
    await makeRequest('DELETE', `/api/links/${res.data.data.code}`);
  });

  // Test 12: Invalid URL returns 400
  await test('1️⃣2️⃣ Invalid URL returns 400', async () => {
    const res = await makeRequest('POST', '/api/links', {
      longURL: 'not-a-url',
      code: 'INVALID',
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  // Test 13: Invalid code format returns 400
  await test('1️⃣3️⃣ Invalid code format returns 400', async () => {
    const res = await makeRequest('POST', '/api/links', {
      longURL: 'https://example.com',
      code: 'AB', // Too short
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Tests Passed: ${testsPassed}`);
  console.log(`❌ Tests Failed: ${testsFailed}`);
  console.log('='.repeat(50));

  if (testsFailed === 0) {
    console.log('\n🎉 All tests passed! Your app is ready for deployment!\n');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.\n');
    process.exit(1);
  }
}

// Run tests
runTests().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
