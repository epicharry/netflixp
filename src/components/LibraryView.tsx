import React, { useState, useEffect } from 'react';
import { Play, Download, Trash2, Calendar, HardDrive } from 'lucide-react';
import { Movie, RealDebridFile } from '../types';

interface LibraryViewProps {
  onPlayMovie: (movie: Movie) => void;
}

function LibraryView({ onPlayMovie }: LibraryViewProps) {
  const [files, setFiles] = useState<RealDebridFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRealDebridFiles();
  }, []);

  const loadRealDebridFiles = async () => {
    setLoading(true);
    try {
      // Mock Real-Debrid files for demonstration
      const mockFiles: RealDebridFile[] = [
        {
          id: '1',
          filename: 'Avengers.Endgame.2019.2160p.BluRay.x265-SUPERB.mkv',
          size: 8589934592, // 8GB
          download: 'https://example.com/download/1',
          streamable: true
        },
        {
          id: '2',
          filename: 'The.Matrix.1999.1080p.BluRay.x264-CLASSIC.mkv',
          size: 4294967296, // 4GB
          download: 'https://example.com/download/2',
          streamable: true
        },
        {
          id: '3',
          filename: 'Inception.2010.720p.BluRay.x264-MIND.mkv',
          size: 2147483648, // 2GB
          download: 'https://example.com/download/3',
          streamable: true
        }
      ];
      
      setFiles(mockFiles);
    } catch (error) {
      console.error('Failed to load Real-Debrid files:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  const extractMovieInfo = (filename: string) => {
    const parts = filename.split('.');
    const title = parts[0].replace(/\./g, ' ');
    const year = filename.match(/(\d{4})/)?.[1] || '';
    const quality = filename.match(/(2160p|1080p|720p|480p)/i)?.[1] || 'Unknown';
    
    return { title, year, quality };
  };

  const handlePlayFile = (file: RealDebridFile) => {
    const { title, year, quality } = extractMovieInfo(file.filename);
    
    const movieData: Movie = {
      id: file.id,
      title: title,
      overview: `High-quality ${quality} version from your Real-Debrid library`,
      posterUrl: 'https://images.unsplash.com/photo-1489599211381-1b0b5bacdaa8?w=300&h=450&fit=crop',
      backdropUrl: 'https://images.unsplash.com/photo-1489599211381-1b0b5bacdaa8?w=1200&h=675&fit=crop',
      releaseDate: year ? `${year}-01-01` : '2024-01-01',
      rating: 8.5,
      genre: ['Action'],
      duration: 120,
      streamUrl: file.download
    };
    
    onPlayMovie(movieData);
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">My Library</h1>
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-800 rounded mb-3 w-3/4"></div>
              <div className="h-4 bg-gray-800 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-800 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Library</h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-400">
            {files.length} files • {formatFileSize(files.reduce((acc, file) => acc + file.size, 0))} total
          </div>
          <button
            onClick={loadRealDebridFiles}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Refresh Library
          </button>
        </div>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-16">
          <HardDrive className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            Your library is empty
          </h3>
          <p className="text-gray-500">
            Add some torrents to your Real-Debrid account to see them here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {files.map((file) => {
            const { title, year, quality } = extractMovieInfo(file.filename);
            
            return (
              <div
                key={file.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all duration-200 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">{title}</h3>
                      {year && (
                        <span className="bg-gray-700 px-2 py-1 rounded text-xs font-semibold">
                          {year}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded text-xs font-semibold text-white ${
                        quality === '2160p' ? 'bg-purple-600' :
                        quality === '1080p' ? 'bg-blue-600' :
                        quality === '720p' ? 'bg-green-600' : 'bg-gray-600'
                      }`}>
                        {quality}
                      </span>
                      {file.streamable && (
                        <span className="bg-green-600 px-2 py-1 rounded text-xs font-semibold text-white">
                          Streamable
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <HardDrive className="w-4 h-4" />
                        <span>{formatFileSize(file.size)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Added today</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2 font-mono">
                      {file.filename}
                    </p>
                  </div>
                  
                  <div className="flex space-x-3 ml-6">
                    {file.streamable && (
                      <button
                        onClick={() => handlePlayFile(file)}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                      >
                        <Play className="w-4 h-4" />
                        <span>Stream</span>
                      </button>
                    )}
                    
                    <a
                      href={file.download}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </a>
                    
                    <button className="bg-gray-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LibraryView;