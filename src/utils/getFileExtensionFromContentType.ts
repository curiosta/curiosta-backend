// Define a mapping of content types to file extensions
const contentTypeToExtension: { [contentType: string]: string } = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/bmp': '.bmp',
  'image/tiff': '.tiff',
  'image/svg+xml': '.svg',
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav',
  'audio/ogg': '.ogg',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  // Add more content types and their corresponding extensions as needed
};

// Function to get the file extension based on the content type
export const getFileExtensionFromContentType = (contentType: string): string | undefined => {
  return contentTypeToExtension[contentType];
}