export interface Channel {
  id: string;
  name: string;
  logo?: string;
  group: string;
  url: string;
  resolution?: string;
  tvgId?: string;
  language?: string;
  country?: string;
  isLive?: boolean;
}

export interface ChannelGroup {
  name: string;
  channels: Channel[];
  count: number;
}

export interface M3UPlaylist {
  channels: Channel[];
  groups: ChannelGroup[];
  totalChannels: number;
}

export interface PlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
}

export interface FavoriteChannel {
  id: string;
  addedAt: string;
}

export interface SearchFilters {
  query: string;
  group?: string;
  country?: string;
  language?: string;
}