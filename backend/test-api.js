// Simple API test script
// Run with: node test-api.js

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing PratBlog API endpoints...\n');

  try {
    // Test 1: Get all blogs
    console.log('1. Testing GET /blogs');
    const blogsResponse = await fetch(`${BASE_URL}/blogs`);
    const blogsData = await blogsResponse.json();
    console.log(`   Status: ${blogsResponse.status}`);
    console.log(`   Blogs count: ${blogsData.blogs?.length || 0}\n`);

    // Test 2: Test user endpoint (should work even without auth)
    console.log('2. Testing GET /me (without auth)');
    const meResponse = await fetch(`${BASE_URL}/me`);
    const meData = await meResponse.json();
    console.log(`   Status: ${meResponse.status}`);
    console.log(`   Authenticated: ${meData.success}\n`);

    // Test 3: Test comments endpoint (if blogs exist)
    if (blogsData.blogs && blogsData.blogs.length > 0) {
      const firstBlogId = blogsData.blogs[0].id;
      console.log(`3. Testing GET /api/blogs/${firstBlogId}/comments`);
      const commentsResponse = await fetch(`${BASE_URL}/api/blogs/${firstBlogId}/comments`);
      const commentsData = await commentsResponse.json();
      console.log(`   Status: ${commentsResponse.status}`);
      console.log(`   Comments count: ${commentsData.comments?.length || 0}\n`);
    }

    console.log('✅ API tests completed successfully!');
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPI();