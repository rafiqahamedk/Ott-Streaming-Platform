import { useState, useEffect, useCallback } from 'react';

interface LiveStatusCache {
  [channelId: string]: {
    isLive: boolean;
    lastChecked: number;
    checkCount: number;
  };
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CHECKS = 3; // Maximum retry attempts

export const useLiveStatus = () => {
  const [statusCache, setStatusCache] = useState<LiveStatusCache>({});
  const [checking, setChecking] = useState<Set<string>>(new Set());

  const checkStreamStatus = useCallback(async (url: string): Promise<boolean> => {
    try {
      // For HLS streams, check if the playlist is accessible
      if (url.includes('.m3u8')) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        clearTimeout(timeoutId);
        return response.ok;
      }

      // For other streams, assume they're live (we can't easily check without CORS issues)
      return true;
    } catch (error) {
      console.warn('Stream check failed:', error);
      return false;
    }
  }, []);

  const checkChannelStatus = useCallback(async (channelId: string, url: string) => {
    const now = Date.now();
    const cached = statusCache[channelId];

    // Check if we have recent cached data
    if (cached && (now - cached.lastChecked) < CACHE_DURATION) {
      return cached.isLive;
    }

    // Check if we've exceeded max attempts
    if (cached && cached.checkCount >= MAX_CHECKS) {
      return cached.isLive;
    }

    // Avoid duplicate checks
    if (checking.has(channelId)) {
      return cached?.isLive ?? true;
    }

    setChecking(prev => new Set(prev).add(channelId));

    try {
      const isLive = await checkStreamStatus(url);
      
      setStatusCache(prev => ({
        ...prev,
        [channelId]: {
          isLive,
          lastChecked: now,
          checkCount: (cached?.checkCount ?? 0) + 1
        }
      }));

      return isLive;
    } catch (error) {
      console.error('Failed to check channel status:', error);
      return cached?.isLive ?? true;
    } finally {
      setChecking(prev => {
        const newSet = new Set(prev);
        newSet.delete(channelId);
        return newSet;
      });
    }
  }, [statusCache, checking, checkStreamStatus]);

  const getChannelStatus = useCallback((channelId: string): boolean | undefined => {
    const cached = statusCache[channelId];
    if (!cached) return undefined;

    const now = Date.now();
    if ((now - cached.lastChecked) > CACHE_DURATION) {
      return undefined;
    }

    return cached.isLive;
  }, [statusCache]);

  const isChecking = useCallback((channelId: string): boolean => {
    return checking.has(channelId);
  }, [checking]);

  // Cleanup old cache entries
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      setStatusCache(prev => {
        const cleaned: LiveStatusCache = {};
        Object.entries(prev).forEach(([id, status]) => {
          if ((now - status.lastChecked) < CACHE_DURATION * 2) {
            cleaned[id] = status;
          }
        });
        return cleaned;
      });
    };

    const interval = setInterval(cleanup, CACHE_DURATION);
    return () => clearInterval(interval);
  }, []);

  return {
    checkChannelStatus,
    getChannelStatus,
    isChecking
  };
};