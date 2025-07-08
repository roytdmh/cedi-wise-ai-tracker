import { useEffect } from 'react';
import { processFaviconImage, updateFavicon } from '@/utils/faviconProcessor';

export const useFavicon = () => {
  useEffect(() => {
    const initializeFavicon = async () => {
      try {
        // Process the uploaded wallet icon with background removal
        const processedDataUrl = await processFaviconImage('/lovable-uploads/4966834b-c4d9-4b4c-a956-17ee2d3e7237.png');
        
        // Update the favicon
        updateFavicon(processedDataUrl);
      } catch (error) {
        console.error('Failed to process favicon:', error);
        // Fallback to original image if processing fails
        updateFavicon('/lovable-uploads/4966834b-c4d9-4b4c-a956-17ee2d3e7237.png');
      }
    };

    initializeFavicon();
  }, []);
};