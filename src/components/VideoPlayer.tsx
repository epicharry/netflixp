import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, ArrowLeft, Settings, SkipBack, SkipForward } from 'lucide-react';
import { Movie } from '../types';

interface VideoPlayerProps {
  movie: Movie;
  onBack: () => void;
}

function VideoPlayer({ movie, onBack }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setError('Failed to load video stream');
      setIsLoading(false);
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleSeek = (newTime: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden" onMouseMove={handleMouseMove}>
      {/* Video Element */}
      {movie.streamUrl && (
        <video
          ref={videoRef}
          src={movie.streamUrl}
          className="absolute inset-0 w-full h-full object-contain"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          crossOrigin="anonymous"
        />
      )}
      
      {/* Loading/Error State */}
      {(isLoading || error || !movie.streamUrl) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center">
            {error ? (
              <>
                <div className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Play className="w-16 h-16 text-white ml-2" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-red-400">Playback Error</h2>
                <p className="text-gray-400 mb-4">{error}</p>
                <button
                  onClick={onBack}
                  className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Go Back
                </button>
              </>
            ) : (
              <>
                <div className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center mb-6 mx-auto animate-pulse">
                  <Play className="w-16 h-16 text-white ml-2" />
                </div>
                <h2 className="text-2xl font-bold mb-2">{movie.title}</h2>
                <p className="text-gray-400 mb-4">
                  {movie.streamUrl ? 'Loading video stream...' : 'Preparing stream from Real-Debrid...'}
                </p>
                <div className="bg-gray-800 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-gray-300">
                    This may take a few moments while the stream is prepared
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between">
          <button
            onClick={onBack}
            className="bg-black/50 hover:bg-black/70 rounded-full p-3 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-4">
            <button className="bg-black/50 hover:bg-black/70 rounded-full p-3 transition-colors">
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Center Controls */}
        {!isLoading && !error && movie.streamUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center space-x-8">
              <button className="bg-black/50 hover:bg-black/70 rounded-full p-4 transition-colors">
                <SkipBack className="w-8 h-8" />
              </button>
              
              <button
                onClick={togglePlay}
                className="bg-red-600 hover:bg-red-700 rounded-full p-6 transition-colors shadow-2xl"
              >
                {isPlaying ? <Pause className="w-12 h-12" /> : <Play className="w-12 h-12 ml-1" />}
              </button>
              
              <button className="bg-black/50 hover:bg-black/70 rounded-full p-4 transition-colors">
                <SkipForward className="w-8 h-8" />
              </button>
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="mb-4">
            <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
            <p className="text-gray-300 max-w-2xl">{movie.overview}</p>
          </div>
          
          {/* Progress Bar */}
          {!isLoading && !error && movie.streamUrl && (
            <div className="mb-4">
              <div className="flex items-center space-x-4 mb-2">
                <span className="text-sm font-medium">{formatTime(currentTime)}</span>
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={(e) => handleSeek(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <span className="text-sm font-medium">{formatTime(duration)}</span>
              </div>
            </div>
          )}
          
          {/* Control Buttons */}
          {!isLoading && !error && movie.streamUrl && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={togglePlay}
                  className="bg-white text-black rounded-full p-3 hover:bg-gray-200 transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                
                <div className="flex items-center space-x-2">
                  <button onClick={toggleMute} className="p-2 hover:bg-white/10 rounded transition-colors">
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-20 h-1 bg-gray-700 rounded appearance-none cursor-pointer"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-400">
                  Via Real-Debrid
                </div>
                <button className="p-2 hover:bg-white/10 rounded transition-colors">
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;