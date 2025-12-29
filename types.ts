export interface AppConfig {
  name: string;
  url: string;
  description: string;
  color: string;
  iconUrl: string;
  splashUrl: string;
  permissions: {
    camera: boolean;
    microphone: boolean;
    geolocation: boolean;
    notifications: boolean;
    fullscreen: boolean;
  };
}

export type GeneratedFile = {
  name: string;
  content: string;
  language: string;
};

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}