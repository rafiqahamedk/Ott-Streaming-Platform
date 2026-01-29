import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Channel } from '../types';
import { useFavorites } from '../hooks/useFavorites';
import { useM3UParser } from '../hooks/useM3UParser';
import { ChannelCard } from '../components/ChannelCard';
import { Heart, ArrowLeft, Trash2, AlertCircle } from 'lucide-react';

export const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const { favorites, clearFavorites } = useFavorites();
  const { playlist, loading } = useM3UParser();

  // Get favorite channels with full channel data
  const favoriteChannels = useMemo(() => {
    if (!playlist || !favorites.length) return [];

    return favorites
      .map(fav => playlist.channels.find(channel => channel.id === fav.id))
      .filter((channel): channel is Channel => channel !== undefined)
      .sort((a, b) => {
        // Sort by favorite added date (most recent first)
        const favA = favorites.find(f => f.id === a.id);
        const favB = favorites.find(f => f.id === b.id);
        if (!favA || !favB) return 0;
        return new Date(favB.addedAt).getTime() - new Date(favA.addedAt).getTime();
      });
  }, [playlist, favorites]);

  const handleChannelPlay = (channel: Channel) => {
    navigate(`/player/${encodeURIComponent(channel.id)}`, { 
      state: { channel } 
    });
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove all favorites?')) {
      clearFavorites();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading favorites...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>

              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
                  <Heart className="w-8 h-8 text-red-500 fill-current" />
                  <span>Favorite Channels</span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {favoriteChannels.length} favorite{favoriteChannels.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {favoriteChannels.length > 0 && (
              <button
                onClick={handleClearAll}
                className="inline-flex items-center space-x-2 px-4 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {favoriteChannels.length === 0 ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-gray-400" />
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                No Favorite Channels
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start adding channels to your favorites by clicking the heart icon on any channel card.
              </p>
              
              <button
                onClick={handleBack}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Browse Channels</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    {favoriteChannels.length}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Total Favorites
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {new Set(favoriteChannels.map(c => c.group)).size}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Categories
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {new Set(favoriteChannels.map(c => c.country).filter(Boolean)).size}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Countries
                  </div>
                </div>
              </div>
            </div>

            {/* Favorites Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {favoriteChannels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  onPlay={handleChannelPlay}
                />
              ))}
            </div>

            {/* Categories Breakdown */}
            {favoriteChannels.length > 0 && (
              <div className="mt-12">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Favorites by Category
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(
                    favoriteChannels.reduce((acc, channel) => {
                      acc[channel.group] = (acc[channel.group] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  )
                    .sort(([, a], [, b]) => b - a)
                    .map(([group, count]) => (
                      <div
                        key={group}
                        className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {group}
                          </h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                            {count}
                          </span>
                        </div>
                        <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{
                              width: `${(count / favoriteChannels.length) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};