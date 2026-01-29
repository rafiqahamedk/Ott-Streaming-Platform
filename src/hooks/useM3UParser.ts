import { useState, useEffect } from 'react';
import axios from 'axios';
import { Channel, M3UPlaylist, ChannelGroup } from '../types';

const M3U_URL = '/api/playlist';

export const useM3UParser = () => {
  const [playlist, setPlaylist] = useState<M3UPlaylist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parseM3U = (content: string): M3UPlaylist => {
    const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
    const channels: Channel[] = [];
    const groupMap = new Map<string, Channel[]>();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('#EXTINF:')) {
        const nextLine = lines[i + 1];
        if (!nextLine || nextLine.startsWith('#')) continue;

        // Parse EXTINF line
        const extinf = line.substring(8); // Remove '#EXTINF:'
        const commaIndex = extinf.indexOf(',');
        const attributes = extinf.substring(0, commaIndex);
        const title = extinf.substring(commaIndex + 1);

        // Extract attributes
        const tvgId = extractAttribute(attributes, 'tvg-id');
        const tvgLogo = extractAttribute(attributes, 'tvg-logo');
        const groupTitle = extractAttribute(attributes, 'group-title') || 'General';
        const tvgLanguage = extractAttribute(attributes, 'tvg-language');
        const tvgCountry = extractAttribute(attributes, 'tvg-country');

        // Generate unique ID
        const id = `${tvgId || title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}_${Math.random()}`;

        const channel: Channel = {
          id,
          name: title.trim(),
          logo: tvgLogo,
          group: groupTitle,
          url: nextLine.trim(),
          tvgId,
          language: tvgLanguage,
          country: tvgCountry,
          resolution: extractResolution(title),
          isLive: true
        };

        channels.push(channel);

        // Group channels
        if (!groupMap.has(groupTitle)) {
          groupMap.set(groupTitle, []);
        }
        groupMap.get(groupTitle)!.push(channel);

        i++; // Skip the URL line
      }
    }

    // Create groups array
    const groups: ChannelGroup[] = Array.from(groupMap.entries()).map(([name, channels]) => ({
      name,
      channels,
      count: channels.length
    }));

    // Sort groups by channel count (descending)
    groups.sort((a, b) => b.count - a.count);

    return {
      channels,
      groups,
      totalChannels: channels.length
    };
  };

  const extractAttribute = (attributes: string, name: string): string | undefined => {
    const regex = new RegExp(`${name}="([^"]*)"`, 'i');
    const match = attributes.match(regex);
    return match ? match[1] : undefined;
  };

  const extractResolution = (title: string): string | undefined => {
    const resolutionMatch = title.match(/(\d{3,4}p?|\d{3,4}x\d{3,4}|HD|FHD|4K|UHD)/i);
    return resolutionMatch ? resolutionMatch[0] : undefined;
  };

  const fetchPlaylist = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(M3U_URL, {
        timeout: 30000,
        headers: {
          'Accept': 'application/x-mpegURL, text/plain, */*'
        }
      });

      const parsedPlaylist = parseM3U(response.data);
      setPlaylist(parsedPlaylist);
    } catch (err) {
      console.error('Failed to fetch M3U playlist:', err);
      setError(err instanceof Error ? err.message : 'Failed to load playlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylist();
  }, []);

  const refetch = () => {
    fetchPlaylist();
  };

  return {
    playlist,
    loading,
    error,
    refetch
  };
};