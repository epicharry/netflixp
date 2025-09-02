import React from 'react';
import { Play, Info, Plus } from 'lucide-react';
import { Movie } from '../types';

interface MovieGridProps {
  movies: Movie[];
  loading: boolean;
  onPlayMovie: (movie: Movie) => void;
  title: string;
}

function MovieGrid({ movies, loading, onPlayMovie, title }: MovieGridProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">{title}</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="group relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-900 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:z-10"
          >
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 flex flex-col justify-end p-4">
                <h3 className="font-bold text-sm mb-2 line-clamp-2">{movie.title}</h3>
                
                <div className="flex items-center space-x-1 mb-3">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full mr-1 ${
                          i < Math.floor(movie.rating / 2) ? 'bg-yellow-400' : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-300 ml-2">{movie.rating}/10</span>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => onPlayMovie(movie)}
                    className="flex-1 bg-white text-black rounded-md py-2 px-3 flex items-center justify-center space-x-2 hover:bg-gray-200 transition-colors text-sm font-semibold"
                  >
                    <Play className="w-4 h-4" />
                    <span>Play</span>
                  </button>
                  
                  <button className="bg-gray-700 hover:bg-gray-600 rounded-md p-2 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                  
                  <button className="bg-gray-700 hover:bg-gray-600 rounded-md p-2 transition-colors">
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="absolute top-2 right-2">
              <div className="bg-black/80 rounded-full px-2 py-1 text-xs font-semibold">
                {movie.releaseDate.split('-')[0]}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MovieGrid;