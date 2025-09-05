// Test authentication endpoints
const BASE_URL = 'http://localhost:3000';

async function testAuth() {
  console.log('🧪 Testing authentication...\n');

  try {
    // Test 1: Check current auth status
    console.log('1. Testing GET /me');
    const meResponse = await fetch(`${BASE_URL}/me`, { credentials: 'include' });
    const meData = await meResponse.json();
    console.log(`   Status: ${meResponse.status}`);
    console.log(`   Response:`, meData);
    console.log(`   Authenticated: ${meData.success}\n`);

    // Test 2: Try to post a comment without auth
    console.log('2. Testing POST comment without auth');
    const commentResponse = await fetch(`${BASE_URL}/api/blogs/1/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ content: 'Test comment' })
    });
    const commentData = await commentResponse.json();
    console.log(`   Status: ${commentResponse.status}`);
    console.log(`   Response:`, commentData);

    console.log('\n✅ Auth tests completed!');
    console.log('💡 If not authenticated, please login at: http://localhost:5173/login');
  } catch (error) {
    console.error('❌ Auth test failed:', error.message);
  }
}

testAuth();