import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3001;

// IPTV playlist URL
const M3U_URL = 'https://iptv-org.github.io/iptv/index.m3u';

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] // Replace with your actual domain
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Cache for playlist data
let playlistCache = {
  data: null,
  lastFetch: 0,
  ttl: 30 * 60 * 1000 // 30 minutes
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Playlist endpoint with caching
app.get('/api/playlist', async (req, res) => {
  try {
    const now = Date.now();
    
    // Check if we have valid cached data
    if (playlistCache.data && (now - playlistCache.lastFetch) < playlistCache.ttl) {
      console.log('Serving cached playlist data');
      return res.set({
        'Content-Type': 'application/x-mpegURL',
        'Cache-Control': 'public, max-age=1800', // 30 minutes
        'X-Cache': 'HIT'
      }).send(playlistCache.data);
    }

    console.log('Fetching fresh playlist data from:', M3U_URL);
    
    // Fetch fresh data
    const response = await fetch(M3U_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/x-mpegURL, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 30000 // 30 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    console.log('Response content-type:', contentType);

    const data = await response.text();
    
    if (!data || data.trim().length === 0) {
      throw new Error('Empty response received');
    }

    // Basic validation - check if it looks like an M3U file
    if (!data.includes('#EXTM3U') && !data.includes('#EXTINF')) {
      console.warn('Response does not appear to be a valid M3U file');
      console.log('First 200 characters:', data.substring(0, 200));
    }

    // Update cache
    playlistCache = {
      data: data,
      lastFetch: now,
      ttl: playlistCache.ttl
    };

    console.log(`Successfully fetched playlist: ${data.length} characters`);
    
    res.set({
      'Content-Type': 'application/x-mpegURL',
      'Cache-Control': 'public, max-age=1800', // 30 minutes
      'X-Cache': 'MISS',
      'X-Content-Length': data.length.toString()
    }).send(data);

  } catch (error) {
    console.error('Error fetching playlist:', error);
    
    // If we have cached data, serve it even if stale
    if (playlistCache.data) {
      console.log('Serving stale cached data due to fetch error');
      return res.set({
        'Content-Type': 'application/x-mpegURL',
        'Cache-Control': 'public, max-age=300', // 5 minutes for stale data
        'X-Cache': 'STALE'
      }).send(playlistCache.data);
    }

    // No cached data available, return error
    res.status(500).json({
      error: 'Failed to fetch playlist',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Stream proxy endpoint (for streams that require specific headers)
app.get('/api/stream/:encodedUrl', async (req, res) => {
  try {
    const streamUrl = decodeURIComponent(req.params.encodedUrl);
    
    console.log('Proxying stream:', streamUrl);
    
    const response = await fetch(streamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.google.com/',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive'
      },
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(`Stream not available: ${response.status}`);
    }

    // Forward headers
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.set('Content-Type', contentType);
    }

    // Set CORS headers for video streaming
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
      'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges'
    });

    // Pipe the stream
    response.body.pipe(res);

  } catch (error) {
    console.error('Stream proxy error:', error);
    res.status(500).json({
      error: 'Stream not available',
      message: error.message
    });
  }
});

// Cache management endpoints
app.post('/api/cache/clear', (req, res) => {
  playlistCache = {
    data: null,
    lastFetch: 0,
    ttl: playlistCache.ttl
  };
  
  res.json({ 
    message: 'Cache cleared successfully',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/cache/status', (req, res) => {
  const now = Date.now();
  const age = playlistCache.lastFetch ? now - playlistCache.lastFetch : null;
  const isValid = age !== null && age < playlistCache.ttl;
  
  res.json({
    hasData: !!playlistCache.data,
    lastFetch: playlistCache.lastFetch ? new Date(playlistCache.lastFetch).toISOString() : null,
    age: age,
    ttl: playlistCache.ttl,
    isValid: isValid,
    dataSize: playlistCache.data ? playlistCache.data.length : 0
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📺 Playlist URL: ${M3U_URL}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Cache TTL: ${playlistCache.ttl / 1000 / 60} minutes`);
});