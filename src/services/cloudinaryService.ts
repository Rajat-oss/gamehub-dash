export const cloudinaryService = {
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'gamehub_avatars'); // You'll need to create this preset in Cloudinary
    formData.append('cloud_name', 'dvygl2rgf'); // Replace with your Cloudinary cloud name

    try {
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dvygl2rgf/image/upload', // Replace with your cloud name
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },
};