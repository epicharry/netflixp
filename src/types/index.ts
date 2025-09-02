export interface Movie {
  id: string;
  title: string;
  overview: string;
  posterUrl: string;
  backdropUrl: string;
  releaseDate: string;
  rating: number;
  genre: string[];
  duration: number;
  streamUrl?: string;
  magnetLink?: string;
}

export interface TorrentResult {
  name: string;
  detailUrl: string;
  size: string;
  seeds: string;
  leech: string;
  magnet: string;
  date?: string;
}

export interface TorrentSearchResponse {
  query: string;
  page: number;
  limit: number;
  totalPages: number;
  results: TorrentResult[];
}

export interface RealDebridFile {
  id: string;
  filename: string;
  size: number;
  download: string;
  streamable: boolean;
}