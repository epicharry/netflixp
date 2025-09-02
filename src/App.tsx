import React, { useState, useEffect } from 'react';
import { Search, Plus, Home, Library, Download, Settings as SettingsIcon } from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MovieGrid from './components/MovieGrid';
import TorrentSearch from './components/TorrentSearch';
import LibraryView from './components/LibraryView';
import VideoPlayer from './components/VideoPlayer';
import AddMagnetModal from './components/AddMagnetModal';
import Settings from './components/Settings';
import { Movie, TorrentResult } from './types';
import { movieService } from './services/movieService';

type ViewType = 'home' | 'search' | 'library' | 'player';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<TorrentResult[]>([]);
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);
  const [showAddMagnet, setShowAddMagnet] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  const loadTrendingMovies = async () => {
    setLoading(true);
    try {
      const trending = await movieService.getTrendingMovies();
      setMovies(trending);
    } catch (error) {
      console.error('Failed to load trending movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string, page = 1) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setCurrentView('search');
    
    try {
      const results = await movieService.searchTorrents(query, page);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayMovie = (movie: Movie) => {
    setCurrentMovie(movie);
    setCurrentView('player');
  };

  const handleAddMagnet = async (magnetLink: string, title: string) => {
    try {
      // Add to Real-Debrid and local library
      await movieService.addMagnetToRD(magnetLink, title);
      setShowAddMagnet(false);
      // Refresh library if currently viewing
      if (currentView === 'library') {
        // Trigger library refresh
      }
    } catch (error) {
      console.error('Failed to add magnet:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header onSearch={handleSearch} />
      
      <div className="flex">
        <Sidebar 
          currentView={currentView}
          onViewChange={setCurrentView}
          onAddMagnet={() => setShowAddMagnet(true)}
          onOpenSettings={() => setShowSettings(true)}
        />
        
        <main className="flex-1 ml-64">
          {currentView === 'home' && (
            <div className="p-8">
              <MovieGrid 
                movies={movies}
                loading={loading}
                onPlayMovie={handlePlayMovie}
                title="Trending Movies"
              />
            </div>
          )}
          
          {currentView === 'search' && (
            <TorrentSearch 
              results={searchResults}
              loading={loading}
              onSearch={handleSearch}
              onPlayMovie={handlePlayMovie}
            />
          )}
          
          {currentView === 'library' && (
            <LibraryView onPlayMovie={handlePlayMovie} />
          )}
          
          {currentView === 'player' && currentMovie && (
            <VideoPlayer 
              movie={currentMovie}
              onBack={() => setCurrentView('home')}
            />
          )}
        </main>
      </div>
      
      {showAddMagnet && (
        <AddMagnetModal
          onAdd={handleAddMagnet}
          onClose={() => setShowAddMagnet(false)}
        />
      )}
      
      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

export default App;