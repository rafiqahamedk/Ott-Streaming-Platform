# 📺 OTT Streaming Platform

A modern, full-stack web application for streaming live TV channels from IPTV M3U playlists. Built with React 18, TypeScript, and Video.js for seamless HLS streaming.

![OTT Streaming Platform](https://via.placeholder.com/1200x600/1f2937/ffffff?text=OTT+Streaming+Platform)

## ✨ Features

### 🎯 Core Functionality
- **Live TV Streaming**: Support for HLS (.m3u8) streams with Video.js
- **Channel Management**: Parse and categorize channels from M3U playlists
- **Smart Search**: Filter channels by name, category, country, and language
- **Favorites System**: Save and manage favorite channels with localStorage
- **Responsive Design**: Mobile-first design that works on all devices

### 🚀 Advanced Features
- **PWA Support**: Install as a native app with offline channel list access
- **Live Status Checking**: Real-time stream availability detection
- **Infinite Scroll**: Lazy loading for large channel lists (8000+ channels)
- **Error Handling**: Graceful handling of dead streams and network issues
- **Caching**: Server-side playlist caching to reduce load times

### 🎨 User Experience
- **Theater Mode**: Full-screen video player with channel info overlay
- **Category Tabs**: Quick navigation between channel groups
- **Quality Indicators**: Display resolution and stream quality info
- **Dark Mode**: Automatic dark/light theme support
- **Accessibility**: WCAG compliant with keyboard navigation

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for responsive styling
- **React Router** for client-side routing
- **Video.js** with HLS plugin for video streaming

### Backend
- **Node.js/Express** API server
- **CORS** handling for cross-origin requests
- **Caching** system for playlist data
- **Stream proxying** for protected content

### Development Tools
- **ESLint** for code linting
- **TypeScript** for static type checking
- **Concurrently** for running dev servers
- **PWA Plugin** for progressive web app features

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern web browser with HLS support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ott-streaming-platform.git
   cd ott-streaming-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```
   This starts both the frontend (http://localhost:5173) and backend (http://localhost:3001)

4. **Open in browser**
   Navigate to http://localhost:5173 to see the application

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
ott-streaming-platform/
├── public/                 # Static assets
│   ├── manifest.json      # PWA manifest
│   └── icons/             # App icons
├── src/
│   ├── components/        # React components
│   │   ├── ChannelCard.tsx
│   │   ├── ChannelGrid.tsx
│   │   ├── VideoPlayer.tsx
│   │   ├── SearchBar.tsx
│   │   └── CategoryTabs.tsx
│   ├── hooks/             # Custom React hooks
│   │   ├── useM3UParser.ts
│   │   ├── useFavorites.ts
│   │   └── useLiveStatus.ts
│   ├── pages/             # Page components
│   │   ├── Home.tsx
│   │   ├── Player.tsx
│   │   └── Favorites.tsx
│   ├── types/             # TypeScript definitions
│   │   └── index.ts
│   ├── App.tsx            # Main app component
│   └── main.tsx           # App entry point
├── server/                # Backend API
│   └── index.js           # Express server
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Development
VITE_API_URL=http://localhost:3001
NODE_ENV=development

# Production
VITE_API_URL=https://your-api-domain.com
NODE_ENV=production
```

### M3U Playlist Source

The application uses the IPTV-org community playlist by default:
```
https://iptv-org.github.io/iptv/index.m3u
```

To use a different playlist, modify the `M3U_URL` in `server/index.js`.

## 📱 PWA Installation

The app can be installed as a Progressive Web App:

1. **Desktop**: Click the install button in the address bar
2. **Mobile**: Use "Add to Home Screen" from the browser menu
3. **Features**: Offline channel list, native app experience

## 🎯 Usage Examples

### Basic Channel Browsing
```typescript
// Search for news channels
const newsChannels = channels.filter(channel => 
  channel.group.toLowerCase().includes('news')
);

// Filter by country
const usChannels = channels.filter(channel => 
  channel.country === 'US'
);
```

### Favorites Management
```typescript
// Add channel to favorites
const { toggleFavorite } = useFavorites();
toggleFavorite(channel.id);

// Check if channel is favorite
const { isFavorite } = useFavorites();
const isLiked = isFavorite(channel.id);
```

### Stream Status Checking
```typescript
// Check if stream is live
const { checkChannelStatus } = useLiveStatus();
const isLive = await checkChannelStatus(channel.id, channel.url);
```

## 🔍 API Endpoints

### GET /api/playlist
Fetch and parse the M3U playlist with caching.

**Response**: Raw M3U8 content
**Cache**: 30 minutes TTL

### GET /api/health
Health check endpoint for monitoring.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600
}
```

### GET /api/cache/status
Get cache information and statistics.

**Response**:
```json
{
  "hasData": true,
  "lastFetch": "2024-01-01T00:00:00.000Z",
  "age": 1800000,
  "ttl": 1800000,
  "isValid": true,
  "dataSize": 2048576
}
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Configure Environment**
   Set environment variables in Vercel dashboard

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### Netlify

1. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

2. **Redirects** (netlify.toml)
   ```toml
   [[redirects]]
   from = "/api/*"
   to = "https://your-api-domain.com/api/:splat"
   status = 200
   ```

## 🔧 Troubleshooting

### Common Issues

**Streams not playing**
- Check CORS configuration
- Verify stream URLs are accessible
- Try using the stream proxy endpoint

**Slow loading**
- Enable server-side caching
- Use CDN for static assets
- Implement service worker caching

**Mobile playback issues**
- Ensure HLS.js is properly loaded
- Check Video.js mobile configuration
- Test on different devices/browsers

### Debug Mode

Enable debug logging:
```javascript
// In browser console
localStorage.setItem('debug', 'ott:*');
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Ensure mobile compatibility
- Test with different M3U sources

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [IPTV-org](https://github.com/iptv-org/iptv) for the community playlist
- [Video.js](https://videojs.com/) for the video player
- [Tailwind CSS](https://tailwindcss.com/) for the styling system
- [React](https://reactjs.org/) team for the amazing framework

## 📊 Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **Bundle Size**: < 500KB gzipped
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s

## 🔮 Roadmap

- [ ] **EPG Integration**: Electronic Program Guide support
- [ ] **Recording**: DVR functionality for supported streams
- [ ] **Chromecast**: Cast to TV support
- [ ] **Multi-language**: Internationalization (i18n)
- [ ] **User Accounts**: Cloud sync for favorites
- [ ] **Analytics**: Usage statistics and insights

---

**Made with ❤️ for the streaming community**

For questions or support, please open an issue on GitHub.