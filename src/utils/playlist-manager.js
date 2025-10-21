/**
 * Playlist Manager
 * Manages YouTube playlists and automatically categorizes videos
 */
class PlaylistManager {
  constructor(youtubeService) {
    this.youtubeService = youtubeService;
    this.playlistCache = null;
    this.cacheExpiry = null;
  }

  /**
   * Get or create playlist by name
   * @param {string} playlistName - Name of the playlist
   * @param {string} description - Playlist description
   * @param {string} privacyStatus - Privacy status (public, unlisted, private)
   * @returns {Promise<string>} Playlist ID
   */
  async getOrCreatePlaylist(playlistName, description = '', privacyStatus = 'public') {
    try {
      // Check cache first
      await this.refreshPlaylistCache();

      // Look for existing playlist
      const existing = this.playlistCache.find(
        p => p.title.toLowerCase() === playlistName.toLowerCase()
      );

      if (existing) {
        console.log(`Found existing playlist: ${playlistName} (${existing.id})`);
        return existing.id;
      }

      // Create new playlist
      console.log(`Creating new playlist: ${playlistName}`);
      const playlist = await this.youtubeService.createPlaylist(
        playlistName,
        description,
        privacyStatus
      );

      // Update cache
      this.playlistCache.push({
        id: playlist.id,
        title: playlist.title,
        description: description,
        itemCount: 0
      });

      return playlist.id;

    } catch (error) {
      console.error('Failed to get or create playlist:', error.message);
      throw error;
    }
  }

  /**
   * Refresh playlist cache
   */
  async refreshPlaylistCache() {
    const now = Date.now();
    const cacheDuration = 5 * 60 * 1000; // 5 minutes

    if (!this.playlistCache || !this.cacheExpiry || now > this.cacheExpiry) {
      console.log('Refreshing playlist cache...');
      this.playlistCache = await this.youtubeService.getPlaylists();
      this.cacheExpiry = now + cacheDuration;
    }
  }

  /**
   * Add video to appropriate playlists based on metadata
   * @param {string} videoId - YouTube video ID
   * @param {Object} metadata - Video metadata
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} Array of playlist IDs video was added to
   */
  async categorizeAndAdd(videoId, metadata, options = {}) {
    const {
      personaName,
      videoType,
      topic,
      tradingPairs = [],
      forceCreate = false
    } = options;

    const playlistsToAdd = [];

    try {
      // 1. Add to persona-specific playlist
      if (personaName) {
        const personaPlaylistName = `${personaName} - كل الفيديوهات`;
        const personaPlaylistId = await this.getOrCreatePlaylist(
          personaPlaylistName,
          `جميع الفيديوهات من ${personaName} على قناة Seekapa`,
          'public'
        );
        playlistsToAdd.push(personaPlaylistId);
      }

      // 2. Add to video type playlist
      const typePlaylistMap = {
        'market_update': {
          name: 'تحديثات السوق اليومية',
          description: 'تحديثات يومية لأسواق الفوركس والعملات المشفرة'
        },
        'educational': {
          name: 'تعليم التداول',
          description: 'دروس تعليمية حول تداول الفوركس والأسواق المالية'
        },
        'trading_tips': {
          name: 'نصائح التداول',
          description: 'نصائح واستراتيجيات التداول من خبراء Seekapa'
        },
        'market_analysis': {
          name: 'تحليل السوق',
          description: 'تحليلات فنية ومالية للأسواق'
        }
      };

      if (videoType && typePlaylistMap[videoType]) {
        const playlistConfig = typePlaylistMap[videoType];
        const typePlaylistId = await this.getOrCreatePlaylist(
          playlistConfig.name,
          playlistConfig.description,
          'public'
        );
        playlistsToAdd.push(typePlaylistId);
      }

      // 3. Add to trading pair specific playlists (if applicable)
      for (const pair of tradingPairs) {
        if (pair.pair) {
          const pairPlaylistName = `تحليل ${pair.pair}`;
          const pairPlaylistId = await this.getOrCreatePlaylist(
            pairPlaylistName,
            `تحليلات وتحديثات لزوج ${pair.pair}`,
            'public'
          );
          playlistsToAdd.push(pairPlaylistId);
        }
      }

      // 4. Add to "All Videos" master playlist
      const allVideosPlaylistId = await this.getOrCreatePlaylist(
        'Seekapa - كل الفيديوهات',
        'جميع فيديوهات قناة Seekapa للتداول',
        'public'
      );
      playlistsToAdd.push(allVideosPlaylistId);

      // Remove duplicates
      const uniquePlaylists = [...new Set(playlistsToAdd)];

      // Add video to all playlists
      for (const playlistId of uniquePlaylists) {
        await this.youtubeService.addToPlaylist(videoId, playlistId);
      }

      console.log(`Video ${videoId} added to ${uniquePlaylists.length} playlists`);
      return uniquePlaylists;

    } catch (error) {
      console.error('Failed to categorize and add video to playlists:', error.message);
      throw error;
    }
  }

  /**
   * Get recommended playlists for a video
   * @param {Object} videoData - Video metadata
   * @returns {Array} Array of recommended playlist configurations
   */
  static getRecommendedPlaylists(videoData) {
    const {
      personaName,
      videoType,
      tradingPairs = [],
      topic
    } = videoData;

    const recommendations = [];

    // Persona playlist
    if (personaName) {
      recommendations.push({
        name: `${personaName} - كل الفيديوهات`,
        description: `جميع الفيديوهات من ${personaName}`,
        priority: 1
      });
    }

    // Type-based playlists
    const typeMap = {
      'market_update': { name: 'تحديثات السوق اليومية', priority: 2 },
      'educational': { name: 'تعليم التداول', priority: 2 },
      'trading_tips': { name: 'نصائح التداول', priority: 2 },
      'market_analysis': { name: 'تحليل السوق', priority: 2 }
    };

    if (videoType && typeMap[videoType]) {
      recommendations.push({
        name: typeMap[videoType].name,
        description: `فيديوهات ${typeMap[videoType].name}`,
        priority: typeMap[videoType].priority
      });
    }

    // Trading pair playlists
    tradingPairs.forEach(pair => {
      if (pair.pair) {
        recommendations.push({
          name: `تحليل ${pair.pair}`,
          description: `تحليلات ${pair.pair}`,
          priority: 3
        });
      }
    });

    // Master playlist (always included)
    recommendations.push({
      name: 'Seekapa - كل الفيديوهات',
      description: 'جميع فيديوهات Seekapa',
      priority: 4
    });

    // Sort by priority
    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Create standard Seekapa playlists
   * @returns {Promise<Object>} Created playlist IDs
   */
  async createStandardPlaylists() {
    const standardPlaylists = [
      {
        name: 'Seekapa - كل الفيديوهات',
        description: 'جميع فيديوهات قناة Seekapa للتداول والأسواق المالية'
      },
      {
        name: 'تحديثات السوق اليومية',
        description: 'تحديثات يومية لأسواق الفوركس والعملات المشفرة'
      },
      {
        name: 'تعليم التداول',
        description: 'دروس تعليمية شاملة حول تداول الفوركس والأسواق المالية'
      },
      {
        name: 'نصائح التداول',
        description: 'نصائح واستراتيجيات التداول من خبراء Seekapa'
      },
      {
        name: 'تحليل السوق',
        description: 'تحليلات فنية ومالية متعمقة للأسواق'
      },
      {
        name: 'فاطمة الراشد - كل الفيديوهات',
        description: 'جميع الفيديوهات من المحللة فاطمة الراشد'
      },
      {
        name: 'أحمد المنصوري - كل الفيديوهات',
        description: 'جميع الفيديوهات من المحلل أحمد المنصوري'
      }
    ];

    const createdPlaylists = {};

    for (const playlist of standardPlaylists) {
      try {
        const playlistId = await this.getOrCreatePlaylist(
          playlist.name,
          playlist.description,
          'public'
        );
        createdPlaylists[playlist.name] = playlistId;
        console.log(`✓ ${playlist.name}: ${playlistId}`);
      } catch (error) {
        console.error(`✗ Failed to create ${playlist.name}:`, error.message);
      }
    }

    return createdPlaylists;
  }

  /**
   * Get playlist statistics
   * @param {string} playlistId - Playlist ID
   * @returns {Promise<Object>} Playlist statistics
   */
  async getPlaylistStats(playlistId) {
    try {
      await this.refreshPlaylistCache();
      const playlist = this.playlistCache.find(p => p.id === playlistId);

      if (!playlist) {
        throw new Error(`Playlist ${playlistId} not found`);
      }

      return {
        id: playlist.id,
        title: playlist.title,
        description: playlist.description,
        videoCount: playlist.itemCount
      };
    } catch (error) {
      console.error('Failed to get playlist stats:', error.message);
      throw error;
    }
  }

  /**
   * Remove video from playlist
   * @param {string} videoId - Video ID
   * @param {string} playlistId - Playlist ID
   */
  async removeFromPlaylist(videoId, playlistId) {
    try {
      // Note: YouTube API requires playlist item ID, not video ID
      // This is a simplified version - full implementation would need to
      // find the playlist item ID first
      console.log(`Removing video ${videoId} from playlist ${playlistId}`);
      // Implementation would go here
    } catch (error) {
      console.error('Failed to remove from playlist:', error.message);
      throw error;
    }
  }

  /**
   * Organize all channel videos into playlists
   * This is a batch operation for organizing existing videos
   */
  async organizeAllVideos() {
    console.log('Starting batch organization of all videos...');
    console.log('Note: This feature requires additional implementation');
    console.log('It would fetch all channel videos and categorize them based on their metadata');
  }
}

module.exports = PlaylistManager;
