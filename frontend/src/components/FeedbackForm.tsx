import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { updateLocalMeta, type FeedbackData } from '../lib/localComplaintStore';

interface FeedbackFormProps {
  complaintId: string;
  existingFeedback?: FeedbackData;
  readOnly?: boolean;
  onSubmit?: () => void;
}

export default function FeedbackForm({
  complaintId,
  existingFeedback,
  readOnly = false,
  onSubmit,
}: FeedbackFormProps) {
  const [rating, setRating] = useState(existingFeedback?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingFeedback?.comment || '');
  const [submitted, setSubmitted] = useState(!!existingFeedback);

  const handleSubmit = () => {
    if (rating === 0) return;
    const feedback: FeedbackData = {
      rating,
      comment: comment.trim(),
      submittedAt: Date.now(),
    };
    updateLocalMeta(complaintId, { feedback });
    setSubmitted(true);
    onSubmit?.();
  };

  if (submitted || readOnly) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 ${
                star <= (existingFeedback?.rating || rating)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-muted-foreground'
              }`}
            />
          ))}
          <span className="text-sm text-muted-foreground ml-1">
            {existingFeedback?.rating || rating}/5
          </span>
        </div>
        {(existingFeedback?.comment || comment) && (
          <p className="text-sm text-muted-foreground italic">
            "{existingFeedback?.comment || comment}"
          </p>
        )}
        {submitted && !readOnly && (
          <p className="text-xs text-emerald-600 font-medium">✓ Feedback submitted</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Rate the Resolution</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="feedback-comment">Comments (Optional)</Label>
        <Textarea
          id="feedback-comment"
          placeholder="Share your experience with the resolution..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="resize-none"
        />
      </div>

      <Button
        size="sm"
        onClick={handleSubmit}
        disabled={rating === 0}
        className="gap-2"
      >
        <Star className="w-4 h-4" />
        Submit Feedback
      </Button>
    </div>
  );
}
