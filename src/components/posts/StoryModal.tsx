import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { storyService } from '@/services/storyService';
import { cloudinaryService } from '@/services/cloudinaryService';
import { FaImage, FaVideo, FaTimes } from 'react-icons/fa';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: () => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({ isOpen, onClose, onStoryCreated }) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Please select an image or video file');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);
    try {
      const mediaUrl = await cloudinaryService.uploadImage(selectedFile);
      const mediaType = selectedFile.type.startsWith('image/') ? 'image' : 'video';

      await storyService.createStory(user.uid, {
        mediaUrl,
        mediaType
      });

      toast.success('Story uploaded successfully!');
      onStoryCreated();
      onClose();
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Error uploading story:', error);
      toast.error('Failed to upload story');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-black border-white/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Add to Story</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!selectedFile ? (
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="story-upload"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <motion.label
                  htmlFor="story-upload"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:border-white/40 transition-colors"
                >
                  <FaImage className="w-8 h-8 text-white mb-2" />
                  <span className="text-white text-sm">Photo</span>
                </motion.label>
                
                <motion.label
                  htmlFor="story-upload"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:border-white/40 transition-colors"
                >
                  <FaVideo className="w-8 h-8 text-white mb-2" />
                  <span className="text-white text-sm">Video</span>
                </motion.label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                {selectedFile.type.startsWith('image/') ? (
                  <img
                    src={previewUrl!}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-2xl"
                  />
                ) : (
                  <video
                    src={previewUrl!}
                    className="w-full h-64 object-cover rounded-2xl"
                    controls
                  />
                )}
                
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex-1 bg-white text-black hover:bg-white/90"
                >
                  {isUploading ? 'Uploading...' : 'Share Story'}
                </Button>
                <Button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  variant="outline"
                  className="border-white/20 text-[#9A9A9A] hover:text-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};