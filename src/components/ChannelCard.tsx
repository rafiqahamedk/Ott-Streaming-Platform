import React, { useState, useEffect } from 'react';
import { Play, Heart, Wifi, WifiOff, Monitor, Globe, Volume2 } from 'lucide-react';
import { Channel } from '../types';
import { useFavorites } from '../hooks/useFavorites';
import { useLiveStatus } from '../hooks/useLiveStatus';

interface ChannelCardProps {
  channel: Channel;
  onPlay: (channel: Channel) => void;
  className?: string;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  onPlay,
  className = ''
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { checkChannelStatus, getChannelStatus, isChecking } = useLiveStatus();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const isChannelFavorite = isFavorite(channel.id);
  const liveStatus = getChannelStatus(channel.id);
  const checkingStatus = isChecking(channel.id);

  useEffect(() => {
    // Check live status when component mounts
    if (liveStatus === undefined && !checkingStatus) {
      checkChannelStatus(channel.id, channel.url);
    }
  }, [channel.id, channel.url, liveStatus, checkingStatus, checkChannelStatus]);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handlePlay = () => {
    onPlay(channel);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(channel.id);
  };

  const getStatusIcon = () => {
    if (checkingStatus) {
      return <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />;
    }
    
    if (liveStatus === false) {
      return <WifiOff className="w-3 h-3 text-red-500" />;
    }
    
    if (liveStatus === true) {
      return <Wifi className="w-3 h-3 text-green-500" />;
    }
    
    return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
  };

  return (
    <div
      className={`group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer ${className}`}
      onClick={handlePlay}
    >
      {/* Channel Logo */}
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {!imageError && channel.logo ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <img
              src={channel.logo}
              alt={channel.name}
              onLoad={handleImageLoad}
              onError={handleImageError}
              className={`w-full h-full object-contain p-4 transition-opacity duration-200 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <Monitor className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
          <div className="transform scale-0 group-hover:scale-100 transition-transform duration-200">
            <div className="bg-white bg-opacity-90 rounded-full p-3">
              <Play className="w-6 h-6 text-gray-900 ml-0.5" />
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="absolute top-2 left-2 flex items-center space-x-1">
          {getStatusIcon()}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 p-1.5 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70"
        >
          <Heart
            className={`w-4 h-4 ${
              isChannelFavorite
                ? 'text-red-500 fill-current'
                : 'text-white'
            }`}
          />
        </button>

        {/* Resolution Badge */}
        {channel.resolution && (
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-70 text-white text-xs font-medium rounded">
            {channel.resolution}
          </div>
        )}
      </div>

      {/* Channel Info */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-2">
          {channel.name}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span className="truncate">{channel.group}</span>
          
          <div className="flex items-center space-x-2 ml-2">
            {channel.country && (
              <div className="flex items-center space-x-1">
                <Globe className="w-3 h-3" />
                <span>{channel.country}</span>
              </div>
            )}
            
            {channel.language && (
              <div className="flex items-center space-x-1">
                <Volume2 className="w-3 h-3" />
                <span>{channel.language}</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Status Text */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {checkingStatus ? (
              <span className="text-xs text-yellow-600 dark:text-yellow-400">Checking...</span>
            ) : liveStatus === false ? (
              <span className="text-xs text-red-600 dark:text-red-400">Offline</span>
            ) : liveStatus === true ? (
              <span className="text-xs text-green-600 dark:text-green-400">Live</span>
            ) : (
              <span className="text-xs text-gray-500 dark:text-gray-400">Unknown</span>
            )}
          </div>
          
          {isChannelFavorite && (
            <Heart className="w-3 h-3 text-red-500 fill-current" />
          )}
        </div>
      </div>
    </div>
  );
};