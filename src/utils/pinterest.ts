// Interface for handling Pinterest API responses
export interface PinterestApiResponse {
  status: number;
  data: {
    id: string;
    url: string;
    mainImage: {
      src: string;
      alt: string;
      srcset: Record<ImageSizeType, string>;
    }
  }
}

// Available image size options from Pinterest
export type ImageSizeType = 'x236' | 'x474' | 'x736';

// Image size enum including original size option
export enum ImageSize {
  X236 = 'x236',   // Small thumbnail
  X474 = 'x474',   // Medium size
  X736 = 'x736',   // Large size
  ORIGINAL = 'original'  // Original upload size
}

// Base URL for the Pinterest API, change this to your own API
export const BASE_URL = 'https://pin.krnl.my.id/pin';

// Fetch pin details from API
export async function getPinInfo(pinId: string): Promise<PinterestApiResponse> {
  const response = await fetch(`${BASE_URL}/${pinId}`);
  const data = await response.json();
  return data;
}

// Build download URL based on selected size
export function getDownloadUrl(pinId: string, size?: ImageSize): string {
  const baseDownloadUrl = `${BASE_URL}/${pinId}/download`;
  return size ? `${baseDownloadUrl}?size=${size}` : baseDownloadUrl;
}

// Download image with specified size
export async function downloadImage(pinId: string, size?: ImageSize): Promise<Blob> {
  try {
    const downloadUrl = getDownloadUrl(pinId, size);
    const response = await fetch(downloadUrl);
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
} 
