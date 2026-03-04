import React, { useState, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useCreateComplaint, useListDepartments } from '../hooks/useQueries';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Loader2,
  Sparkles,
  CheckCircle2,
  Clock,
  Info,
  FilePlus,
  Building2,
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
  | 'admin-departments'
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
  const { data: departments, isLoading: depsLoading } = useListDepartments();

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
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

  // Resolve department name for display/storage
  const selectedDeptName = (() => {
    if (selectedDeptId && departments) {
      const found = departments.find((d) => d.id.toString() === selectedDeptId);
      return found?.name || '';
    }
    return extendedProfile?.department || 'General';
  })();

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
        department: selectedDeptName,
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
                <span className="text-muted-foreground">Department</span>
                <span className="font-medium">{selectedDeptName}</span>
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
                  setSelectedDeptId('');
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
                  <div className="text-xs text-amber-800 dark:text-amber-300">
                    <span className="font-semibold">Image: </span>{aiResult.imageAnalysis}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category & Department */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Category & Department</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Category */}
            <div className="space-y-2">
              <Label>Complaint Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="max-h-64 overflow-y-auto">
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

            {/* Department */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                Department
                <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              {depsLoading ? (
                <Skeleton className="h-10 w-full rounded-md" />
              ) : departments && departments.length > 0 ? (
                <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department (optional)" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 overflow-y-auto">
                    {departments.map((dept) => (
                      <SelectItem key={dept.id.toString()} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-muted/40 text-sm text-muted-foreground">
                  <Building2 className="w-4 h-4 flex-shrink-0" />
                  {extendedProfile?.department
                    ? `Using your department: ${extendedProfile.department}`
                    : 'No departments configured yet'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Priority */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Priority Level</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={priority}
              onValueChange={(val) => setPriority(val as Priority)}
              className="grid grid-cols-3 gap-3"
            >
              {[
                { value: Priority.low, label: 'Low', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' },
                { value: Priority.medium, label: 'Medium', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800' },
                { value: Priority.high, label: 'High', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800' },
              ].map(({ value, label, color, bg }) => (
                <div key={value} className={`relative flex items-center justify-center rounded-xl border-2 p-3 cursor-pointer transition-all ${priority === value ? bg + ' border-current' : 'border-border hover:border-muted-foreground/30'}`}>
                  <RadioGroupItem value={value} id={`priority-${value}`} className="sr-only" />
                  <label htmlFor={`priority-${value}`} className={`text-sm font-semibold cursor-pointer ${priority === value ? color : 'text-muted-foreground'}`}>
                    {label}
                  </label>
                </div>
              ))}
            </RadioGroup>
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              Deadline: {formatDeadline(priority)}
            </div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Attachments</CardTitle>
          </CardHeader>
          <CardContent>
            <MediaUploader mediaItems={mediaItems} onChange={setMediaItems} />
          </CardContent>
        </Card>

        {/* Anonymous */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="anonymous" className="text-sm font-medium">
                  Submit Anonymously
                </Label>
                <p className="text-xs text-muted-foreground">
                  Your identity will not be revealed to staff
                </p>
              </div>
              <Switch
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
            </div>
            {isAnonymous && (
              <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5">
                <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>Your complaint will be submitted without your name or identity.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive flex items-center gap-2">
            <Info className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={createComplaint.isPending}
        >
          {createComplaint.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <FilePlus className="w-4 h-4 mr-2" />
              Submit Complaint
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
