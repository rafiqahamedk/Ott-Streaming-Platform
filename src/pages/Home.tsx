import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Channel, SearchFilters } from '../types';
import { useM3UParser } from '../hooks/useM3UParser';
import { SearchBar } from '../components/SearchBar';
import { CategoryTabs } from '../components/CategoryTabs';
import { ChannelGrid } from '../components/ChannelGrid';
import { Tv, RefreshCw, AlertCircle, TrendingUp, Users, Globe } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { playlist, loading, error, refetch } = useM3UParser();
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    group: undefined,
    country: undefined,
    language: undefined
  });

  // Update filters when group changes
  const handleGroupChange = (group: string | null) => {
    setActiveGroup(group);
    setFilters(prev => ({ ...prev, group: group || undefined }));
  };

  // Get channels for display
  const displayChannels = useMemo(() => {
    if (!playlist) return [];
    
    if (activeGroup) {
      const group = playlist.groups.find(g => g.name === activeGroup);
      return group?.channels || [];
    }
    
    return playlist.channels;
  }, [playlist, activeGroup]);

  const handleChannelPlay = (channel: Channel) => {
    navigate(`/player/${encodeURIComponent(channel.id)}`, { 
      state: { channel } 
    });
  };

  const handleRetry = () => {
    refetch();
  };

  // Stats for dashboard
  const stats = useMemo(() => {
    if (!playlist) return null;

    const totalChannels = playlist.totalChannels;
    const totalGroups = playlist.groups.length;
    const topGroup = playlist.groups[0];
    const countries = new Set(
      playlist.channels
        .map(c => c.country)
        .filter(Boolean)
    ).size;

    return {
      totalChannels,
      totalGroups,
      topGroup: topGroup?.name || 'N/A',
      topGroupCount: topGroup?.count || 0,
      countries
    };
  }, [playlist]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Loading Channel Playlist
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Fetching and parsing IPTV channels...
              </p>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-md mx-auto">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Tv className="w-4 h-4" />
                  <span>This may take a few moments for large playlists</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Failed to Load Playlist
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error}
              </p>
              <button
                onClick={handleRetry}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
                <Tv className="w-8 h-8 text-primary-600" />
                <span>OTT Streaming Platform</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Live TV channels from around the world
              </p>
            </div>
            
            <button
              onClick={handleRetry}
              className="inline-flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Refresh playlist"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Dashboard */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Tv className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalChannels.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Channels</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalGroups}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
                    {stats.topGroup}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Top Category ({stats.topGroupCount})
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.countries}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Countries</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <SearchBar
          filters={filters}
          onFiltersChange={setFilters}
          groups={playlist.groups}
          totalResults={displayChannels.length}
        />

        {/* Category Tabs */}
        <CategoryTabs
          groups={playlist.groups}
          activeGroup={activeGroup}
          onGroupChange={handleGroupChange}
        />

        {/* Channel Grid */}
        <ChannelGrid
          channels={displayChannels}
          onChannelPlay={handleChannelPlay}
          filters={filters}
        />
      </main>
    </div>
  );
};