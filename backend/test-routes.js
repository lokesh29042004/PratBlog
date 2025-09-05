// Test if routes are accessible
const BASE_URL = 'http://localhost:3000';

async function testRoutes() {
  console.log('🧪 Testing blog routes...\n');

  try {
    // Test 1: Test route
    console.log('1. Testing GET /api/test');
    const testResponse = await fetch(`${BASE_URL}/api/test`);
    const testData = await testResponse.json();
    console.log(`   Status: ${testResponse.status}`);
    console.log(`   Response:`, testData);

    // Test 2: Blog likes route (should work without auth for GET)
    console.log('\n2. Testing GET /api/blogs/1/likes');
    const likesResponse = await fetch(`${BASE_URL}/api/blogs/1/likes`);
    const likesData = await likesResponse.json();
    console.log(`   Status: ${likesResponse.status}`);
    console.log(`   Response:`, likesData);

    // Test 3: Blog like POST (should fail without auth)
    console.log('\n3. Testing POST /api/blogs/1/like (without auth)');
    const likeResponse = await fetch(`${BASE_URL}/api/blogs/1/like`, {
      method: 'POST',
      credentials: 'include'
    });
    const likeData = await likeResponse.json();
    console.log(`   Status: ${likeResponse.status}`);
    console.log(`   Response:`, likeData);

    console.log('\n✅ Route tests completed!');
  } catch (error) {
    console.error('❌ Route test failed:', error.message);
  }
}

testRoutes();