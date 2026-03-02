import React, { useState, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useCreateComplaint } from '../hooks/useQueries';
import { Priority } from '../backend';
import { generateComplaintId, formatDeadline } from '../lib/complaintHelpers';
import { saveLocalMeta, type MediaItem } from '../lib/localComplaintStore';
import { analyzeComplaintText, analyzeImage } from '../lib/geminiService';
import { COMPLAINT_CATEGORIES, CATEGORY_GROUPS } from '../constants/complaintCategories';
import MediaUploader from '../components/MediaUploader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Sparkles,
  CheckCircle2,
  Clock,
  Info,
  FilePlus,
} from 'lucide-react';
import { addNotification } from '../lib/localComplaintStore';

type View =
  | 'dashboard'
  | 'submit'
  | 'track'
  | 'chatbot'
  | 'admin-complaints'
  | 'admin-users'
  | 'admin-emergencies'
  | 'admin-analytics'
  | 'hod-complaints'
  | 'hod-analytics'
  | 'staff-complaints'
  | 'staff-analytics';

interface SubmitComplaintPageProps {
  onNavigate: (view: View) => void;
}

export default function SubmitComplaintPage({ onNavigate }: SubmitComplaintPageProps) {
  const { extendedProfile } = useAppContext();
  const createComplaint = useCreateComplaint();

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.medium);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{
    category?: string;
    priority?: string;
    estimatedDays?: number;
    reasoning?: string;
    imageAnalysis?: string;
  } | null>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleAnalyzeWithAI = useCallback(async () => {
    if (!description.trim()) return;
    setAiAnalyzing(true);
    setAiResult(null);
    try {
      const result = await analyzeComplaintText(description);
      if (result) {
        setAiResult(result);
        setCategory(result.category);
        if (result.priority === 'high') setPriority(Priority.high);
        else if (result.priority === 'medium') setPriority(Priority.medium);
        else setPriority(Priority.low);
      }

      const firstImage = mediaItems.find((m) => m.type === 'image');
      if (firstImage) {
        const imgAnalysis = await analyzeImage(firstImage.dataUrl);
        if (imgAnalysis) {
          setAiResult((prev) => ({ ...prev, imageAnalysis: imgAnalysis }));
        }
      }
    } catch {
      // Silently fail
    } finally {
      setAiAnalyzing(false);
    }
  }, [description, mediaItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Please describe your complaint.');
      return;
    }
    if (!category) {
      setError('Please select a complaint category.');
      return;
    }

    const complaintId = generateComplaintId();

    try {
      await createComplaint.mutateAsync({ id: complaintId, description: description.trim(), priority });

      saveLocalMeta({
        id: complaintId,
        category,
        department: extendedProfile?.department || 'General',
        isAnonymous,
        studentName: isAnonymous ? 'Anonymous' : extendedProfile?.displayName || 'Unknown',
        studentPrincipal: '',
        mediaItems,
        aiEstimatedDays: aiResult?.estimatedDays,
        aiReasoning: aiResult?.reasoning,
        createdAt: Date.now(),
      });

      addNotification({
        message: `✅ Complaint ${complaintId} submitted successfully`,
        type: 'success',
        complaintId,
      });

      setSubmitted(complaintId);
    } catch (err) {
      setError('Failed to submit complaint. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="page-enter max-w-lg mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground mb-2">
              Complaint Submitted!
            </h2>
            <p className="text-muted-foreground mb-4">Your complaint has been registered successfully.</p>
            <div className="bg-muted rounded-xl p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Complaint ID</span>
                <span className="font-mono font-semibold text-primary">{submitted}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{category}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Priority</span>
                <span className="font-medium capitalize">{priority}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deadline</span>
                <span className="font-medium">{formatDeadline(priority)}</span>
              </div>
              {aiResult?.estimatedDays && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">AI Estimate</span>
                  <span className="font-medium">{aiResult.estimatedDays} days</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => onNavigate('track')}>
                Track Status
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setSubmitted(null);
                  setDescription('');
                  setCategory('');
                  setPriority(Priority.medium);
                  setIsAnonymous(false);
                  setMediaItems([]);
                  setAiResult(null);
                }}
              >
                New Complaint
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-enter max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <FilePlus className="w-6 h-6 text-primary" />
          Submit a Complaint
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Describe your issue and our AI will help categorize it automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Description */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Complaint Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Describe your complaint in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="resize-none"
              required
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleAnalyzeWithAI}
              disabled={!description.trim() || aiAnalyzing}
            >
              {aiAnalyzing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-500" />
              )}
              {aiAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
            </Button>

            {aiResult && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-semibold">AI Analysis</span>
                </div>
                {aiResult.reasoning && (
                  <p className="text-xs text-amber-800 dark:text-amber-300">{aiResult.reasoning}</p>
                )}
                {aiResult.estimatedDays && (
                  <div className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400">
                    <Clock className="w-3 h-3" />
                    Estimated resolution: {aiResult.estimatedDays} days
                  </div>
                )}
                {aiResult.imageAnalysis && (
                  <div className="text-xs text-amber-800 dark:text-amber-300 border-t border-amber-200 dark:border-amber-800 pt-2">
                    <strong>Image Analysis:</strong> {aiResult.imageAnalysis}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category & Priority */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Category & Priority</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="category">Complaint Category *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {Object.entries(CATEGORY_GROUPS).map(([group, cats]) => (
                    <SelectGroup key={group}>
                      <SelectLabel>{group}</SelectLabel>
                      {cats.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority Level</Label>
              <RadioGroup
                value={priority}
                onValueChange={(v) => setPriority(v as Priority)}
                className="flex gap-4"
              >
                {[
                  { value: Priority.high, label: 'High', color: 'text-red-600', desc: '1 day' },
                  { value: Priority.medium, label: 'Medium', color: 'text-amber-600', desc: '3 days' },
                  { value: Priority.low, label: 'Low', color: 'text-green-600', desc: '7 days' },
                ].map((p) => (
                  <div key={p.value} className="flex items-center gap-2">
                    <RadioGroupItem value={p.value} id={`priority-${p.value}`} />
                    <Label htmlFor={`priority-${p.value}`} className="cursor-pointer">
                      <span className={`font-medium ${p.color}`}>{p.label}</span>
                      <span className="text-xs text-muted-foreground ml-1">({p.desc})</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
                <Clock className="w-3.5 h-3.5" />
                Deadline: <strong>{formatDeadline(priority)}</strong>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Evidence & Media</CardTitle>
          </CardHeader>
          <CardContent>
            <MediaUploader mediaItems={mediaItems} onChange={setMediaItems} />
          </CardContent>
        </Card>

        {/* Anonymous Mode */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="anonymous" className="text-sm font-medium cursor-pointer">
                  Anonymous Submission
                </Label>
                <p className="text-xs text-muted-foreground">
                  Hide your identity from Staff and HOD
                </p>
              </div>
              <Switch
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
            </div>
            {isAnonymous && (
              <div className="mt-3 flex items-start gap-2 text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 rounded-lg px-3 py-2">
                <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                Your identity will be hidden from Staff and HOD. Admin can view your identity if required for investigation.
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={createComplaint.isPending}
        >
          {createComplaint.isPending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Complaint'
          )}
        </Button>
      </form>
    </div>
  );
}
