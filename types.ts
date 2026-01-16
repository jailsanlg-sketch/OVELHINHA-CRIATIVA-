
export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  ANIMATING = 'ANIMATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface PosterConfig {
  format: '1:1' | '9:16' | '4:3';
  style: string;
  extraPrompt: string;
}

export interface GeneratedPoster {
  url: string;
  videoUrl?: string;
  prompt: string;
}

export interface SavedItem extends GeneratedPoster {
  id: string;
  timestamp: number;
}
