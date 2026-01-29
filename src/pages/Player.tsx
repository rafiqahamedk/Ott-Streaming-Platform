import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Channel, PlayerState } from '../types';
import { VideoPlayer } from '../components/VideoPlayer';
import { useFavorites } from '../hooks/useFavorites';
import { useM3UParser } from '../hooks/useM3UParser';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Info, 
  Monitor,
  Globe,
  Volume2,
  Wifi,
  WifiOff,
  MoreVertical
} from 'lucide-react';

export const Player: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { playlist } = useM3UParser();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const [channel, setChannel] = useState<Channel | null>(
    location.state?.channel || null
  );
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Find channel if not provided in state
  useEffect(() => {
    if (!channel && channelId && playlist) {
      const decodedId = decodeURIComponent(channelId);
      const foundChannel = playlist.channels.find(c => c.id === decodedId);
      if (foundChannel) {
        setChannel(foundChannel);
      } else {
        // Channel not found, redirect to home
        navigate('/', { replace: true });
      }
    }
  }, [channelId, playlist, channel, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleFavoriteToggle = () => {
    if (channel) {
      toggleFavorite(channel.id);
    }
  };

  const handleShare = async () => {
    if (!channel) return;

    const shareData = {
      title: `${channel.name} - OTT Streaming Platform`,
      text: `Watch ${channel.name} live on OTT Streaming Platform`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handlePlayerError = (error: string) => {
    console.error('Player error:', error);
  };

  const handlePlayerStateChange = (state: PlayerState) => {
    setPlayerState(state);
  };

  if (!channel) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading channel...</p>
        </div>
      </div>
    );
  }

  const isChannelFavorite = isFavorite(channel.id);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="relative z-10 bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="inline-flex items-center space-x-2 text-white hover:text-primary-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-2 text-white hover:text-primary-400 transition-colors"
                title="Channel info"
              >
                <Info className="w-5 h-5" />
              </button>

              <button
                onClick={handleFavoriteToggle}
                className="p-2 text-white hover:text-primary-400 transition-colors"
                title={isChannelFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart 
                  className={`w-5 h-5 ${
                    isChannelFavorite ? 'text-red-500 fill-current' : ''
                  }`} 
                />
              </button>

              <button
                onClick={handleShare}
                className="p-2 text-white hover:text-primary-400 transition-colors"
                title="Share channel"
              >
                <Share2 className="w-5 h-5" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 text-white hover:text-primary-400 transition-colors"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20">
                    <button
                      onClick={() => {
                        setShowInfo(!showInfo);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <Info className="w-4 h-4" />
                      <span>Channel Info</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        handleShare();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share Channel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-3">
            <VideoPlayer
              channel={channel}
              onError={handlePlayerError}
              onStateChange={handlePlayerStateChange}
              className="w-full"
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Channel Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-4">
                {channel.logo ? (
                  <img
                    src={channel.logo}
                    alt={channel.name}
                    className="w-16 h-16 object-contain rounded-lg bg-gray-100 dark:bg-gray-700 p-2"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <Monitor className="w-8 h-8 text-gray-400" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {channel.name}
                  </h1>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Monitor className="w-4 h-4" />
                      <span>{channel.group}</span>
                    </div>

                    {channel.country && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Globe className="w-4 h-4" />
                        <span>{channel.country}</span>
                      </div>
                    )}

                    {channel.language && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Volume2 className="w-4 h-4" />
                        <span>{channel.language}</span>
                      </div>
                    )}

                    {channel.resolution && (
                      <div className="inline-block px-2 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 text-xs font-medium rounded">
                        {channel.resolution}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Player Status */}
              {playerState && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      {playerState.hasError ? (
                        <>
                          <WifiOff className="w-4 h-4 text-red-500" />
                          <span className="text-red-600 dark:text-red-400">Error</span>
                        </>
                      ) : playerState.isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-yellow-600 dark:text-yellow-400">Loading</span>
                        </>
                      ) : (
                        <>
                          <Wifi className="w-4 h-4 text-green-500" />
                          <span className="text-green-600 dark:text-green-400">
                            {playerState.isPlaying ? 'Playing' : 'Ready'}
                          </span>
                        </>
                      )}
                    </div>

                    {!playerState.hasError && !playerState.isLoading && (
                      <div className="text-gray-600 dark:text-gray-400">
                        Volume: {Math.round(playerState.volume * 100)}%
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Extended Info */}
            {showInfo && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Technical Details
                </h3>
                
                <div className="space-y-3 text-sm">
                  {channel.tvgId && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">TVG ID:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">{channel.tvgId}</span>
                    </div>
                  )}
                  
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Stream Type:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {channel.url.includes('.m3u8') ? 'HLS (M3U8)' : 'Direct Stream'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Category:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{channel.group}</span>
                  </div>

                  {playerState && !playerState.hasError && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {playerState.isLoading ? 'Loading...' : 'Connected'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={handleFavoriteToggle}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isChannelFavorite
                      ? 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300'
                      : 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isChannelFavorite ? 'fill-current' : ''}`} />
                  <span>
                    {isChannelFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  </span>
                </button>

                <button
                  onClick={handleShare}
                  className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share Channel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};