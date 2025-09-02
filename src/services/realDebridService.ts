interface RealDebridConfig {
  apiToken: string;
  baseUrl: string;
}

interface TorrentInfo {
  id: string;
  filename: string;
  original_filename: string;
  hash: string;
  bytes: number;
  original_bytes: number;
  host: string;
  split: number;
  progress: number;
  status: string;
  added: string;
  files: RealDebridFile[];
  links: string[];
  ended?: string;
  speed?: number;
  seeders?: number;
}

interface RealDebridFile {
  id: number;
  path: string;
  bytes: number;
  selected: number;
}

interface UnrestrictedLink {
  id: string;
  filename: string;
  mimeType: string;
  filesize: number;
  link: string;
  host: string;
  chunks: number;
  crc: number;
  download: string;
  streamable: number;
}

interface InstantAvailability {
  [hash: string]: {
    [quality: string]: {
      [fileId: string]: {
        filename: string;
        filesize: number;
      };
    };
  };
}

class RealDebridService {
  private config: RealDebridConfig;

  constructor() {
    this.config = {
      apiToken: '', // Will be set by user
      baseUrl: 'https://api.real-debrid.com/rest/1.0'
    };
  }

  setApiToken(token: string) {
    this.config.apiToken = token;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.config.apiToken}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    };
  }

  private extractHashFromMagnet(magnetLink: string): string {
    const match = magnetLink.match(/btih:([a-fA-F0-9]{40})/);
    return match ? match[1].toLowerCase() : '';
  }

  async checkInstantAvailability(magnetLink: string): Promise<boolean> {
    if (!this.config.apiToken) {
      throw new Error('Real-Debrid API token not configured');
    }

    const hash = this.extractHashFromMagnet(magnetLink);
    if (!hash) {
      throw new Error('Invalid magnet link - could not extract hash');
    }

    try {
      const response = await fetch(
        `${this.config.baseUrl}/torrents/instantAvailability/${hash}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: InstantAvailability = await response.json();
      
      // Check if any files are available for this hash
      return Object.keys(data[hash] || {}).length > 0;
    } catch (error) {
      console.error('Error checking instant availability:', error);
      return false;
    }
  }

  async addMagnet(magnetLink: string): Promise<string> {
    if (!this.config.apiToken) {
      throw new Error('Real-Debrid API token not configured');
    }

    try {
      const formData = new URLSearchParams();
      formData.append('magnet', magnetLink);

      const response = await fetch(`${this.config.baseUrl}/torrents/addMagnet`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Failed to add magnet: ${response.status}`);
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Error adding magnet:', error);
      throw new Error('Failed to add magnet to Real-Debrid');
    }
  }

  async selectFiles(torrentId: string, fileIds: string = 'all'): Promise<void> {
    if (!this.config.apiToken) {
      throw new Error('Real-Debrid API token not configured');
    }

    try {
      const formData = new URLSearchParams();
      formData.append('files', fileIds);

      const response = await fetch(
        `${this.config.baseUrl}/torrents/selectFiles/${torrentId}`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to select files: ${response.status}`);
      }
    } catch (error) {
      console.error('Error selecting files:', error);
      throw new Error('Failed to select torrent files');
    }
  }

  async getTorrentInfo(torrentId: string): Promise<TorrentInfo> {
    if (!this.config.apiToken) {
      throw new Error('Real-Debrid API token not configured');
    }

    try {
      const response = await fetch(
        `${this.config.baseUrl}/torrents/info/${torrentId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get torrent info: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting torrent info:', error);
      throw new Error('Failed to get torrent information');
    }
  }

  async unrestrictLink(fileUrl: string): Promise<UnrestrictedLink> {
    if (!this.config.apiToken) {
      throw new Error('Real-Debrid API token not configured');
    }

    try {
      const formData = new URLSearchParams();
      formData.append('link', fileUrl);

      const response = await fetch(`${this.config.baseUrl}/unrestrict/link`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Failed to unrestrict link: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error unrestricting link:', error);
      throw new Error('Failed to get streamable link');
    }
  }

  async getTorrents(): Promise<TorrentInfo[]> {
    if (!this.config.apiToken) {
      throw new Error('Real-Debrid API token not configured');
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/torrents`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get torrents: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting torrents:', error);
      throw new Error('Failed to get Real-Debrid torrents');
    }
  }

  async processAndStream(magnetLink: string, title: string): Promise<string> {
    try {
      // Check if instantly available
      const isInstant = await this.checkInstantAvailability(magnetLink);
      
      if (isInstant) {
        console.log('Torrent is instantly available!');
      }

      // Add magnet to Real-Debrid
      const torrentId = await this.addMagnet(magnetLink);
      
      // Select all files
      await this.selectFiles(torrentId);
      
      // Wait for processing and get torrent info
      let torrentInfo = await this.getTorrentInfo(torrentId);
      
      // Wait for download to complete if not instant
      while (torrentInfo.status !== 'downloaded' && !isInstant) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        torrentInfo = await this.getTorrentInfo(torrentId);
      }
      
      // Get the largest video file (usually the main movie)
      const videoFiles = torrentInfo.files.filter(file => 
        file.path.match(/\.(mp4|mkv|avi|mov|wmv)$/i)
      );
      
      if (videoFiles.length === 0) {
        throw new Error('No video files found in torrent');
      }
      
      // Select the largest file
      const largestFile = videoFiles.reduce((prev, current) => 
        current.bytes > prev.bytes ? current : prev
      );
      
      // Get the file URL from torrent links
      const fileUrl = torrentInfo.links[largestFile.id - 1];
      
      // Unrestrict the link to get direct streaming URL
      const unrestrictedLink = await this.unrestrictLink(fileUrl);
      
      return unrestrictedLink.download;
    } catch (error) {
      console.error('Error processing torrent for streaming:', error);
      throw error;
    }
  }
}

export const realDebridService = new RealDebridService();