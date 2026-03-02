import React, { useState } from 'react';
import { useGetMyComplaints } from '../hooks/useQueries';
import { useAppContext } from '../contexts/AppContext';
import { getAllLocalMeta, getLocalMeta } from '../lib/localComplaintStore';
import { ComplaintStatus, Priority, type Complaint } from '../backend';
import ComplaintCard from '../components/ComplaintCard';
import FeedbackForm from '../components/FeedbackForm';
import { downloadComplaintsAsCSV } from '../lib/reportGenerator';
import { formatTimestamp, formatDeadline } from '../lib/complaintHelpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StatusBadge, PriorityBadge } from '../components/ComplaintCard';
import {
  FileSearch,
  Download,
  Search,
  Video,
  FileAudio,
  Clock,
  Star,
} from 'lucide-react';

export default function TrackComplaintsPage() {
  const { extendedProfile } = useAppContext();
  const { data: complaints = [], isLoading } = useGetMyComplaints();
  const localMeta = getAllLocalMeta();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const filtered = complaints.filter((c) => {
    const meta = localMeta[c.id];
    const matchesSearch =
      !search ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      meta?.category?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDownload = () => {
    const withMeta = complaints.map((c) => ({
      ...c,
      category: localMeta[c.id]?.category,
      department: localMeta[c.id]?.department,
      isAnonymous: localMeta[c.id]?.isAnonymous,
      studentName: extendedProfile?.displayName,
    }));
    downloadComplaintsAsCSV(withMeta, 'my-complaints');
  };

  const selectedMeta = selectedComplaint ? getLocalMeta(selectedComplaint.id) : null;

  return (
    <div className="page-enter space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <FileSearch className="w-6 h-6 text-primary" />
            Track Complaints
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {complaints.length} complaint{complaints.length !== 1 ? 's' : ''} submitted
          </p>
        </div>
        {complaints.length > 0 && (
          <Button variant="outline" size="sm" className="gap-2" onClick={handleDownload}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search complaints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value={ComplaintStatus.registered}>Registered</SelectItem>
            <SelectItem value={ComplaintStatus.inProgress}>In Progress</SelectItem>
            <SelectItem value={ComplaintStatus.resolved}>Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FileSearch className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium text-foreground">No complaints found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {complaints.length === 0
                ? 'You have not submitted any complaints yet.'
                : 'Try adjusting your search or filters.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <ComplaintCard
              key={c.id}
              complaint={c}
              meta={localMeta[c.id]}
              currentRole="student"
              onView={setSelectedComplaint}
            />
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={(o) => !o && setSelectedComplaint(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="font-mono text-sm text-muted-foreground">
                {selectedComplaint?.id}
              </span>
            </DialogTitle>
          </DialogHeader>

          {selectedComplaint && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-4 pr-2">
                <div className="flex gap-2 flex-wrap">
                  <StatusBadge status={selectedComplaint.status} />
                  <PriorityBadge priority={selectedComplaint.priority} />
                  {selectedMeta?.isAnonymous && (
                    <Badge variant="secondary" className="text-xs">Anonymous</Badge>
                  )}
                </div>

                {selectedMeta?.category && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Category</p>
                    <Badge variant="outline">{selectedMeta.category}</Badge>
                  </div>
                )}

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {selectedComplaint.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Submitted</p>
                    <p className="font-medium">{formatTimestamp(selectedComplaint.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Deadline</p>
                    <p className="font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDeadline(selectedComplaint.priority)}
                    </p>
                  </div>
                </div>

                {selectedMeta?.aiEstimatedDays && (
                  <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 text-sm">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                      AI Prediction
                    </p>
                    <p className="text-amber-800 dark:text-amber-300">
                      Estimated {selectedMeta.aiEstimatedDays} days to resolve
                    </p>
                    {selectedMeta.aiReasoning && (
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                        {selectedMeta.aiReasoning}
                      </p>
                    )}
                  </div>
                )}

                {selectedMeta?.mediaItems && selectedMeta.mediaItems.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Attachments ({selectedMeta.mediaItems.length})
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedMeta.mediaItems.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-lg overflow-hidden border border-border bg-muted aspect-square flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            const w = window.open();
                            if (w) {
                              if (item.type === 'image') {
                                w.document.write(`<img src="${item.dataUrl}" style="max-width:100%" />`);
                              } else {
                                w.document.write(`<p>${item.name}</p>`);
                              }
                            }
                          }}
                        >
                          {item.type === 'image' ? (
                            <img src={item.dataUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : item.type === 'video' ? (
                            <Video className="w-6 h-6 text-muted-foreground" />
                          ) : (
                            <FileAudio className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedComplaint.status === ComplaintStatus.resolved && (
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-amber-500" />
                      <p className="text-sm font-semibold">Rate the Resolution</p>
                    </div>
                    <FeedbackForm
                      complaintId={selectedComplaint.id}
                      existingFeedback={selectedMeta?.feedback}
                    />
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
