import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaReply } from 'react-icons/fa';
import { Button } from '@/components/ui/button';

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  replies?: Comment[];
}

interface AnimatedCommentThreadProps {
  comment: Comment;
  level?: number;
}

export const AnimatedCommentThread: React.FC<AnimatedCommentThreadProps> = ({
  comment,
  level = 0
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const hasReplies = comment.replies && comment.replies.length > 0;
  const maxLevel = 3; // Limit nesting depth

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${level > 0 ? 'ml-6 border-l-2 border-border/30 pl-4' : ''}`}
    >
      <div className="bg-gradient-card border border-border/50 rounded-lg p-4 mb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold">
                {comment.author.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <span className="font-semibold text-sm">{comment.author}</span>
              <span className="text-xs text-muted-foreground ml-2">
                {comment.timestamp}
              </span>
            </div>
          </div>
        </div>
        
        <p className="text-sm mb-3">{comment.content}</p>
        
        <div className="flex items-center gap-2">
          {level < maxLevel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-xs"
            >
              <FaReply className="w-3 h-3 mr-1" />
              Reply
            </Button>
          )}
          
          {hasReplies && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs"
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaChevronDown className="w-3 h-3 mr-1" />
                </motion.div>
                {isExpanded ? 'Hide' : 'Show'} {comment.replies?.length} replies
              </Button>
            </motion.div>
          )}
        </div>
        
        {/* Reply Form */}
        <AnimatePresence>
          {showReplyForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 pt-3 border-t border-border/30"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Write a reply..."
                  className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <Button size="sm" className="px-4">
                  Reply
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Replies */}
      <AnimatePresence>
        {isExpanded && hasReplies && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {comment.replies?.map((reply, index) => (
              <motion.div
                key={reply.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.1 
                }}
              >
                <AnimatedCommentThread 
                  comment={reply} 
                  level={level + 1} 
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};