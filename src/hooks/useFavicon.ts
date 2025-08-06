import { useEffect } from 'react';

export const useFavicon = () => {
  useEffect(() => {
    // Directly use the cedi icon without processing to avoid memory issues
    const updateFavicon = (imagePath: string) => {
      // Remove existing favicon links
      const existingLinks = document.querySelectorAll('link[rel*="icon"]');
      existingLinks.forEach(link => link.remove());
      
      // Create new favicon link
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.href = imagePath;
      
      // Add to document head
      document.head.appendChild(link);
      console.log('Favicon updated successfully');
    };

    // Use the existing cedi icon directly
    updateFavicon('/lovable-uploads/4966834b-c4d9-4b4c-a956-17ee2d3e7237.png');
  }, []);
};