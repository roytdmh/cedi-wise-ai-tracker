import { removeBackground, loadImageFromUrl } from './backgroundRemoval';

export const processFaviconImage = async (imageUrl: string): Promise<string> => {
  try {
    console.log('Processing favicon image...');
    
    // Load the image
    const imageElement = await loadImageFromUrl(imageUrl);
    
    // Remove the background
    const processedBlob = await removeBackground(imageElement);
    
    // Convert blob to base64 data URL for favicon use
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert blob to data URL'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(processedBlob);
    });
  } catch (error) {
    console.error('Error processing favicon:', error);
    throw error;
  }
};

export const updateFavicon = (dataUrl: string) => {
  // Remove existing favicon links
  const existingLinks = document.querySelectorAll('link[rel*="icon"]');
  existingLinks.forEach(link => link.remove());
  
  // Create new favicon link
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png';
  link.href = dataUrl;
  
  // Add to document head
  document.head.appendChild(link);
  console.log('Favicon updated successfully');
};