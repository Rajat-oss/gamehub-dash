import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { discussionService } from '@/services/discussionService';
import { userService } from '@/services/userService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { toast } from 'sonner';

interface CreateDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDiscussionCreated: () => void;
}

export const CreateDiscussionModal: React.FC<CreateDiscussionModalProps> = ({ isOpen, onClose, onDiscussionCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      userService.getUserProfile(user.uid).then(profile => {
        setUserProfile(profile);
      }).catch(console.error);
    }
  }, [user]);

  const categories = [
    { id: 'general', name: 'General Gaming' },
    { id: 'reviews', name: 'Game Reviews' },
    { id: 'tips', name: 'Tips & Tricks' },
    { id: 'news', name: 'Gaming News' },
    { id: 'help', name: 'Help & Support' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title.trim() || !formData.content.trim() || !formData.category) return;

    setLoading(true);
    try {
      await discussionService.createDiscussion(
        user.uid, 
        userProfile?.username || user.displayName || 'User', 
        userProfile?.photoURL || user.photoURL, 
        formData
      );
      toast.success('Discussion created successfully!');
      onDiscussionCreated();
      setFormData({ title: '', content: '', category: '', tags: [] });
    } catch (error) {
      console.error('Error creating discussion:', error);
      toast.error('Failed to create discussion');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Start a New Discussion</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="What would you like to discuss?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Share your thoughts, ask questions, or start a conversation..."
              className="min-h-[120px]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags (optional)</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm" disabled={!newTag.trim() || formData.tags.length >= 5}>
                <FaPlus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  #{tag}
                  <FaTimes className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.title.trim() || !formData.content.trim() || !formData.category || loading}>
              {loading ? 'Creating...' : 'Create Discussion'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};