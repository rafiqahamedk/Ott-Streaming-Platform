import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { Channel, PlayerState } from '../types';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  RotateCcw,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface VideoPlayerProps {
  channel: Channel;
  onError?: (error: string) => void;
  onStateChange?: (state: PlayerState) => void;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  channel,
  onError,
  onStateChange,
  className = ''
}) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    isLoading: true,
    hasError: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    isFullscreen: false
  });
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const updateState = (updates: Partial<PlayerState>) => {
    setPlayerState(prev => {
      const newState = { ...prev, ...updates };
      onStateChange?.(newState);
      return newState;
    });
  };

  const initializePlayer = () => {
    if (!videoRef.current || playerRef.current) return;

    const videoElement = document.createElement('video-js');
    videoElement.className = 'vjs-default-skin w-full h-full';
    videoRef.current.appendChild(videoElement);

    const options = {
      controls: true,
      responsive: true,
      fluid: true,
      preload: 'auto',
      html5: {
        hls: {
          enableLowInitialPlaylist: true,
          smoothQualityChange: true,
          overrideNative: true
        }
      },
      sources: [{
        src: channel.url,
        type: channel.url.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'
      }],
      techOrder: ['html5'],
      userActions: {
        hotkeys: true
      }
    };

    playerRef.current = videojs(videoElement, options);

    // Event listeners
    playerRef.current.ready(() => {
      console.log('Player ready for channel:', channel.name);
      updateState({ isLoading: false });
    });

    playerRef.current.on('loadstart', () => {
      updateState({ isLoading: true, hasError: false });
    });

    playerRef.current.on('canplay', () => {
      updateState({ isLoading: false });
    });

    playerRef.current.on('play', () => {
      updateState({ isPlaying: true });
    });

    playerRef.current.on('pause', () => {
      updateState({ isPlaying: false });
    });

    playerRef.current.on('timeupdate', () => {
      if (playerRef.current) {
        updateState({
          currentTime: playerRef.current.currentTime() || 0,
          duration: playerRef.current.duration() || 0
        });
      }
    });

    playerRef.current.on('volumechange', () => {
      if (playerRef.current) {
        updateState({
          volume: playerRef.current.volume(),
          isMuted: playerRef.current.muted()
        });
      }
    });

    playerRef.current.on('fullscreenchange', () => {
      if (playerRef.current) {
        updateState({
          isFullscreen: playerRef.current.isFullscreen()
        });
      }
    });

    playerRef.current.on('error', (e: any) => {
      const error = playerRef.current?.error();
      const errorMessage = error ? 
        `Player error (${error.code}): ${error.message}` : 
        'Unknown playback error';
      
      console.error('Video player error:', errorMessage, e);
      updateState({ 
        hasError: true, 
        isLoading: false, 
        errorMessage 
      });
      onError?.(errorMessage);
    });

    // Auto-play attempt
    const playPromise = playerRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch((error: any) => {
        console.warn('Auto-play failed:', error);
        // Auto-play failed, but this is often expected
      });
    }
  };

  const destroyPlayer = () => {
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.innerHTML = '';
    }
  };

  const retryPlayback = () => {
    if (retryCount >= maxRetries) return;
    
    setRetryCount(prev => prev + 1);
    updateState({ hasError: false, isLoading: true });
    
    destroyPlayer();
    setTimeout(() => {
      initializePlayer();
    }, 1000);
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    
    if (playerState.isPlaying) {
      playerRef.current.pause();
    } else {
      playerRef.current.play();
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    playerRef.current.muted(!playerState.isMuted);
  };

  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    
    if (playerState.isFullscreen) {
      playerRef.current.exitFullscreen();
    } else {
      playerRef.current.requestFullscreen();
    }
  };

  // Initialize player when component mounts or channel changes
  useEffect(() => {
    setRetryCount(0);
    updateState({ 
      isLoading: true, 
      hasError: false, 
      errorMessage: undefined 
    });
    
    destroyPlayer();
    setTimeout(() => {
      initializePlayer();
    }, 100);

    return () => {
      destroyPlayer();
    };
  }, [channel.url]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      destroyPlayer();
    };
  }, []);

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      {/* Video Container */}
      <div 
        ref={videoRef} 
        className="w-full h-full min-h-[300px] md:min-h-[400px] lg:min-h-[500px]"
      />

      {/* Loading Overlay */}
      {playerState.isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="text-center text-white">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-sm">Loading {channel.name}...</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {playerState.hasError && (
        <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="text-center text-white max-w-md px-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Playback Error</h3>
            <p className="text-sm text-gray-300 mb-4">
              {playerState.errorMessage || 'Unable to play this stream'}
            </p>
            <p className="text-xs text-gray-400 mb-6">
              This could be due to geo-restrictions, server issues, or an incompatible stream format.
            </p>
            
            {retryCount < maxRetries && (
              <button
                onClick={retryPlayback}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry ({retryCount + 1}/{maxRetries})</span>
              </button>
            )}
            
            {retryCount >= maxRetries && (
              <p className="text-sm text-gray-400">
                Maximum retry attempts reached. Please try a different channel.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Custom Controls Overlay (for mobile/touch) */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black bg-opacity-50 rounded-lg p-2 md:hidden">
        <button
          onClick={togglePlay}
          className="p-2 text-white hover:text-primary-400 transition-colors"
        >
          {playerState.isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="p-2 text-white hover:text-primary-400 transition-colors"
          >
            {playerState.isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 text-white hover:text-primary-400 transition-colors"
          >
            {playerState.isFullscreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Channel Info Overlay */}
      <div className="absolute top-4 left-4 right-4">
        <div className="bg-black bg-opacity-50 rounded-lg p-3 text-white">
          <h2 className="font-semibold text-lg truncate">{channel.name}</h2>
          <p className="text-sm text-gray-300">{channel.group}</p>
          {channel.resolution && (
            <span className="inline-block mt-1 px-2 py-1 bg-primary-600 text-xs font-medium rounded">
              {channel.resolution}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};