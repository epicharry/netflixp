import { Movie, TorrentSearchResponse, TorrentResult } from '../types';
import { realDebridService } from './realDebridService';

class MovieService {
  private async fetchTMDBData(endpoint: string): Promise<any> {
    // Mock TMDB data for demonstration
    const mockMovies: Movie[] = [
      {
        id: '1',
        title: 'The Dark Knight',
        overview: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham...',
        posterUrl: 'https://images.unsplash.com/photo-1489599211381-1b0b5bacdaa8?w=300&h=450&fit=crop',
        backdropUrl: 'https://images.unsplash.com/photo-1489599211381-1b0b5bacdaa8?w=1200&h=675&fit=crop',
        releaseDate: '2008-07-18',
        rating: 9.0,
        genre: ['Action', 'Crime', 'Drama'],
        duration: 152
      },
      {
        id: '2',
        title: 'Inception',
        overview: 'A thief who steals corporate secrets through dream-sharing technology...',
        posterUrl: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300&h=450&fit=crop',
        backdropUrl: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1200&h=675&fit=crop',
        releaseDate: '2010-07-16',
        rating: 8.8,
        genre: ['Action', 'Sci-Fi', 'Thriller'],
        duration: 148
      },
      {
        id: '3',
        title: 'Interstellar',
        overview: 'A team of explorers travel through a wormhole in space...',
        posterUrl: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=300&h=450&fit=crop',
        backdropUrl: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1200&h=675&fit=crop',
        releaseDate: '2014-11-07',
        rating: 8.6,
        genre: ['Adventure', 'Drama', 'Sci-Fi'],
        duration: 169
      },
      {
        id: '4',
        title: 'The Matrix',
        overview: 'A computer hacker learns from mysterious rebels about the true nature of his reality...',
        posterUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=300&h=450&fit=crop',
        backdropUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=1200&h=675&fit=crop',
        releaseDate: '1999-03-31',
        rating: 8.7,
        genre: ['Action', 'Sci-Fi'],
        duration: 136
      },
      {
        id: '5',
        title: 'Pulp Fiction',
        overview: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine...',
        posterUrl: 'https://images.unsplash.com/photo-1489599211381-1b0b5bacdaa8?w=300&h=450&fit=crop',
        backdropUrl: 'https://images.unsplash.com/photo-1489599211381-1b0b5bacdaa8?w=1200&h=675&fit=crop',
        releaseDate: '1994-10-14',
        rating: 8.9,
        genre: ['Crime', 'Drama'],
        duration: 154
      },
      {
        id: '6',
        title: 'Fight Club',
        overview: 'An insomniac office worker and a devil-may-care soapmaker form an underground fight club...',
        posterUrl: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=300&h=450&fit=crop',
        backdropUrl: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1200&h=675&fit=crop',
        releaseDate: '1999-10-15',
        rating: 8.8,
        genre: ['Drama'],
        duration: 139
      }
    ];
    
    return mockMovies;
  }

  async getTrendingMovies(): Promise<Movie[]> {
    try {
      return await this.fetchTMDBData('trending/movie/week');
    } catch (error) {
      console.error('Error fetching trending movies:', error);
      return [];
    }
  }

  async searchTorrents(query: string, page: number = 1): Promise<TorrentResult[]> {
    try {
      const response = await fetch(`https://valradiant.xyz/rarbg.php?q=${encodeURIComponent(query)}&page=${page}`, {
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Search request failed');
      }
      
      const data: TorrentSearchResponse = await response.json();
      
      // Fix the API response mapping based on your provided structure
      const mappedResults: TorrentResult[] = (data.results || []).map(result => ({
        name: result.name,
        detailUrl: result.detailUrl,
        size: result.seeds, // API returns size in seeds field
        seeds: result.leech, // API returns seeds in leech field  
        leech: result.size, // API returns leech in size field
        magnet: result.magnet,
        date: result.size // API returns date in size field
      }));
      
      return mappedResults;
    } catch (error) {
      console.error('Error searching torrents:', error);
      // Return mock data for demonstration
      return [
        {
          name: `${query} 2024 1080p BluRay x264-EXAMPLE`,
          detailUrl: 'https://example.com/torrent/1',
          size: '8.5 GB',
          seeds: '150',
          leech: '23',
          magnet: 'magnet:?xt=urn:btih:example123456789',
          date: '2024-01-15'
        },
        {
          name: `${query} 2024 2160p UHD BluRay x265-SAMPLE`,
          detailUrl: 'https://example.com/torrent/2',
          size: '15.2 GB',
          seeds: '89',
          leech: '12',
          magnet: 'magnet:?xt=urn:btih:sample987654321',
          date: '2024-01-14'
        }
      ];
    }
  }

  async addMagnetToRD(magnetLink: string, title: string): Promise<void> {
    try {
      await realDebridService.processAndStream(magnetLink, title);
    } catch (error) {
      console.error('Error adding magnet to Real-Debrid:', error);
      throw new Error('Failed to add magnet link to Real-Debrid');
    }
  }

  async getRealDebridFiles(): Promise<any[]> {
    try {
      const torrents = await realDebridService.getTorrents();
      return torrents.map(torrent => ({
        id: torrent.id,
        filename: torrent.filename,
        size: torrent.bytes,
        download: torrent.links[0] || '',
        streamable: torrent.status === 'downloaded'
      }));
    } catch (error) {
      console.error('Error fetching Real-Debrid files:', error);
      // Return mock data if API fails
      return [
        {
          id: '1',
          filename: 'Avengers.Endgame.2019.2160p.BluRay.x265.mkv',
          size: 8589934592,
          download: 'https://example.com/stream/1',
          streamable: true
        }
      ];
    }
  }

  async checkInstantAvailability(magnetLink: string): Promise<boolean> {
    try {
      return await realDebridService.checkInstantAvailability(magnetLink);
    } catch (error) {
      console.error('Error checking instant availability:', error);
      return false;
    }
  }
}

export const movieService = new MovieService();