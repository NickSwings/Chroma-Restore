export interface ProcessedImage {
  original: string; // Base64
  processed: string | null; // Base64
  originalFile: File | null;
}

export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}

export interface ProcessingError {
  message: string;
  details?: string;
}
