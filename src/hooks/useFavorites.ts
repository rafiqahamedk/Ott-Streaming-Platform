import { useState, useEffect } from 'react';
import { FavoriteChannel } from '../types';

const FAVORITES_KEY = 'ott_favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteChannel[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse favorites from localStorage:', error);
        localStorage.removeItem(FAVORITES_KEY);
      }
    }
  }, []);

  const saveFavorites = (newFavorites: FavoriteChannel[]) => {
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
  };

  const addFavorite = (channelId: string) => {
    const newFavorite: FavoriteChannel = {
      id: channelId,
      addedAt: new Date().toISOString()
    };
    
    const updated = [...favorites.filter(f => f.id !== channelId), newFavorite];
    saveFavorites(updated);
  };

  const removeFavorite = (channelId: string) => {
    const updated = favorites.filter(f => f.id !== channelId);
    saveFavorites(updated);
  };

  const toggleFavorite = (channelId: string) => {
    if (isFavorite(channelId)) {
      removeFavorite(channelId);
    } else {
      addFavorite(channelId);
    }
  };

  const isFavorite = (channelId: string): boolean => {
    return favorites.some(f => f.id === channelId);
  };

  const clearFavorites = () => {
    saveFavorites([]);
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    favoriteCount: favorites.length
  };
};