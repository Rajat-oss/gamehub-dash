export const cloudinaryService = {
  async uploadImage(file: File): Promise<string> {
    return this.uploadMedia(file);
  },

  async uploadMedia(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'gamehub_avatars');
    formData.append('cloud_name', 'dvygl2rgf');

    try {
      const isVideo = file.type.startsWith('video/');
      const endpoint = isVideo 
        ? 'https://api.cloudinary.com/v1_1/dvygl2rgf/video/upload'
        : 'https://api.cloudinary.com/v1_1/dvygl2rgf/image/upload';

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Upload failed:', errorData);
        throw new Error(`Failed to upload ${isVideo ? 'video' : 'image'}`);
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },
};