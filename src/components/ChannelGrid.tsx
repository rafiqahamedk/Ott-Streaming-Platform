import React, { useState, useEffect, useMemo } from 'react';
import { Channel, SearchFilters } from '../types';
import { ChannelCard } from './ChannelCard';
import { Loader2, AlertCircle } from 'lucide-react';

interface ChannelGridProps {
  channels: Channel[];
  onChannelPlay: (channel: Channel) => void;
  filters: SearchFilters;
  loading?: boolean;
  error?: string;
}

const ITEMS_PER_PAGE = 24;

export const ChannelGrid: React.FC<ChannelGridProps> = ({
  channels,
  onChannelPlay,
  filters,
  loading = false,
  error
}) => {
  const [displayedItems, setDisplayedItems] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filter channels based on search criteria
  const filteredChannels = useMemo(() => {
    return channels.filter(channel => {
      // Text search
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const matchesName = channel.name.toLowerCase().includes(query);
        const matchesGroup = channel.group.toLowerCase().includes(query);
        if (!matchesName && !matchesGroup) return false;
      }

      // Group filter
      if (filters.group && channel.group !== filters.group) {
        return false;
      }

      // Country filter
      if (filters.country) {
        const country = filters.country.toLowerCase();
        if (!channel.country?.toLowerCase().includes(country)) {
          return false;
        }
      }

      // Language filter
      if (filters.language) {
        const language = filters.language.toLowerCase();
        if (!channel.language?.toLowerCase().includes(language)) {
          return false;
        }
      }

      return true;
    });
  }, [channels, filters]);

  // Reset displayed items when filters change
  useEffect(() => {
    setDisplayedItems(ITEMS_PER_PAGE);
  }, [filters]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [displayedItems, filteredChannels.length]);

  const loadMore = async () => {
    if (isLoadingMore || displayedItems >= filteredChannels.length) return;

    setIsLoadingMore(true);
    
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setDisplayedItems(prev => Math.min(prev + ITEMS_PER_PAGE, filteredChannels.length));
    setIsLoadingMore(false);
  };

  const visibleChannels = filteredChannels.slice(0, displayedItems);
  const hasMore = displayedItems < filteredChannels.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading channels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-2">Failed to load channels</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (filteredChannels.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-2">No channels found</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            Try adjusting your search criteria or filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {visibleChannels.length} of {filteredChannels.length} channels
        {filteredChannels.length !== channels.length && (
          <span className="ml-1">
            (filtered from {channels.length} total)
          </span>
        )}
      </div>

      {/* Channel Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
        {visibleChannels.map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            onPlay={onChannelPlay}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center">
          {isLoadingMore ? (
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading more channels...</span>
            </div>
          ) : (
            <button
              onClick={loadMore}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Load More Channels
            </button>
          )}
        </div>
      )}

      {/* End of Results */}
      {!hasMore && filteredChannels.length > ITEMS_PER_PAGE && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            You've reached the end of the results
          </p>
        </div>
      )}
    </div>
  );
};