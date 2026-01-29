#!/usr/bin/env node

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001';

async function testEndpoint(endpoint, description) {
  try {
    console.log(`\n🧪 Testing ${description}...`);
    const response = await fetch(`${API_BASE}${endpoint}`);
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log(`✅ ${description} - Status: ${response.status}`);
        console.log(`📄 Response:`, JSON.stringify(data, null, 2));
      } else {
        const text = await response.text();
        console.log(`✅ ${description} - Status: ${response.status}`);
        console.log(`📄 Content-Type: ${contentType}`);
        console.log(`📄 Content Length: ${text.length} characters`);
        
        // Show first 200 characters for M3U content
        if (text.length > 200) {
          console.log(`📄 Preview: ${text.substring(0, 200)}...`);
        } else {
          console.log(`📄 Content: ${text}`);
        }
      }
    } else {
      console.log(`❌ ${description} - Status: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ ${description} - Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Starting API Tests...');
  console.log(`🌐 Base URL: ${API_BASE}`);
  
  await testEndpoint('/api/health', 'Health Check');
  await testEndpoint('/api/cache/status', 'Cache Status');
  await testEndpoint('/api/playlist', 'M3U Playlist');
  
  console.log('\n✨ Tests completed!');
  console.log('\n💡 Next steps:');
  console.log('   1. Start the frontend: npm run dev');
  console.log('   2. Open http://localhost:5173 in your browser');
  console.log('   3. Browse and play live TV channels!');
}

runTests().catch(console.error);