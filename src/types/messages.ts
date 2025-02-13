import type { ImageSize } from '../utils/pinterest';

// Types for message passing between content script and background script
export interface DownloadPinMessage {
  type: 'DOWNLOAD_PIN';
  pinId: string;
  size?: ImageSize;
}

// Base response type for all messages
export interface BaseResponse {
  success: boolean;
  error?: string;
}

// Response type specifically for download operations
export interface DownloadResponse extends BaseResponse {
  data?: never;
}

export type MessageResponse = DownloadResponse; 
