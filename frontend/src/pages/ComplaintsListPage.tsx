import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useGetAllComplaints, useUpdateComplaintStatus } from '../hooks/useQueries';
import { getAllLocalMeta, getLocalMeta, addNotification } from '../lib/localComplaintStore';
import { ComplaintStatus, type Complaint } from '../backend';
import ComplaintCard from '../components/ComplaintCard';
import FeedbackForm from '../components/FeedbackForm';
import { StatusBadge, PriorityBadge } from '../components/ComplaintCard';
import { formatTimestamp, formatDeadline } from '../lib/complaintHelpers';
import { downloadComplaintsAsCSV } from '../lib/reportGenerator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  ClipboardList,
  Search,
  Download,
  Video,
  FileAudio,
  Clock,
  Star,
  AlertTriangle,
} from 'lucide-react';
import { SENSITIVE_CATEGORIES } from '../constants/complaintCategories';

export default function ComplaintsListPage() {
  const { extendedProfile, campusRole } = useAppContext();
  const { data: allComplaints = [], isLoading } = useGetAllComplaints();
  const updateStatus = useUpdateComplaintStatus();
  const localMeta = getAllLocalMeta();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const isAdmin = campusRole === 'admin';
  const isHOD = campusRole === 'hod';

  // Filter by department for HOD/Staff
  const departmentComplaints =
    isAdmin
      ? allComplaints
      : allComplaints.filter((c) => {
          const meta = localMeta[c.id];
          if (!meta) return false;
          // HOD sees all dept complaints including sensitive ones
          // Staff sees non-sensitive only
          if (campusRole === 'staff' && SENSITIVE_CATEGORIES.includes(meta.category as (typeof SENSITIVE_CATEGORIES)[number])) {
            return false;
          }
          return meta.department === extendedProfile?.department;
        });

  const filtered = departmentComplaints.filter((c) => {
    const meta = localMeta[c.id];
    const matchesSearch =
      !search ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      meta?.category?.toLowerCase().includes(search.toLowerCase()) ||
      meta?.studentName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || c.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleUpdateStatus = async (id: string, status: ComplaintStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      const meta = localMeta[id];
      addNotification({
        message: `Complaint ${id} status updated to ${status === ComplaintStatus.inProgress ? 'In Progress' : 'Resolved'}`,
        type: 'success',
        complaintId: id,
      });
      if (meta?.studentName && meta.studentName !== 'Anonymous') {
        addNotification({
          message: `📧 Email notification sent to student for complaint ${id}`,
          type: 'info',
          complaintId: id,
        });
      }
    } catch {
      // Silently fail
    }
  };

  const handleDownload = () => {
    const withMeta = filtered.map((c) => ({
      ...c,
      category: localMeta[c.id]?.category,
      department: localMeta[c.id]?.department,
      isAnonymous: localMeta[c.id]?.isAnonymous,
      studentName: localMeta[c.id]?.studentName,
    }));
    downloadComplaintsAsCSV(withMeta, `${campusRole}-complaints`);
  };

  const selectedMeta = selectedComplaint ? getLocalMeta(selectedComplaint.id) : null;
  const isAnonymousForRole =
    selectedMeta?.isAnonymous && (campusRole === 'staff' || campusRole === 'hod');

  const title = isAdmin
    ? 'All Complaints'
    : isHOD
    ? 'Department Complaints'
    : 'Department Complaints';

  return (
    <div className="page-enter space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-primary" />
            {title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} complaint{filtered.length !== 1 ? 's' : ''}
            {!isAdmin && extendedProfile?.department && ` in ${extendedProfile.department}`}
          </p>
        </div>
        {filtered.length > 0 && (
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
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value={ComplaintStatus.registered}>Registered</SelectItem>
            <SelectItem value={ComplaintStatus.inProgress}>In Progress</SelectItem>
            <SelectItem value={ComplaintStatus.resolved}>Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
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
            <ClipboardList className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium text-foreground">No complaints found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {departmentComplaints.length === 0
                ? 'No complaints have been submitted yet.'
                : 'Try adjusting your filters.'}
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
              currentRole={campusRole}
              onView={setSelectedComplaint}
              onUpdateStatus={handleUpdateStatus}
              isUpdating={updateStatus.isPending}
            />
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={(o) => !o && setSelectedComplaint(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
              {selectedComplaint?.id}
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
                  {selectedMeta?.category && (
                    SENSITIVE_CATEGORIES.includes(selectedMeta.category as (typeof SENSITIVE_CATEGORIES)[number]) && (
                      <Badge className="text-xs bg-red-100 text-red-800">Sensitive</Badge>
                    )
                  )}
                </div>

                {selectedMeta?.category && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Category</p>
                    <Badge variant="outline">{selectedMeta.category}</Badge>
                  </div>
                )}

                {/* Student identity */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Submitted by</p>
                  <p className="text-sm font-medium">
                    {isAnonymousForRole
                      ? 'Anonymous Student'
                      : selectedMeta?.studentName || 'Unknown'}
                  </p>
                  {isAdmin && selectedMeta?.isAnonymous && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      (Admin view: {selectedMeta.studentName})
                    </p>
                  )}
                </div>

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

                {selectedMeta?.mediaItems && selectedMeta.mediaItems.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Attachments ({selectedMeta.mediaItems.length})
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedMeta.mediaItems.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-lg overflow-hidden border border-border bg-muted aspect-square flex items-center justify-center cursor-pointer hover:opacity-80"
                          onClick={() => {
                            const w = window.open();
                            if (w && item.type === 'image') {
                              w.document.write(`<img src="${item.dataUrl}" style="max-width:100%" />`);
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

                {/* Feedback */}
                {selectedMeta?.feedback && (
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      <p className="text-sm font-semibold">Student Feedback</p>
                    </div>
                    <FeedbackForm
                      complaintId={selectedComplaint.id}
                      existingFeedback={selectedMeta.feedback}
                      readOnly={true}
                    />
                  </div>
                )}

                {/* Status update */}
                {selectedComplaint.status !== ComplaintStatus.resolved && (
                  <div className="border-t border-border pt-4 flex gap-2">
                    {selectedComplaint.status === ComplaintStatus.registered && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        disabled={updateStatus.isPending}
                        onClick={() => {
                          handleUpdateStatus(selectedComplaint.id, ComplaintStatus.inProgress);
                          setSelectedComplaint(null);
                        }}
                      >
                        Mark In Progress
                      </Button>
                    )}
                    {selectedComplaint.status === ComplaintStatus.inProgress && (
                      <Button
                        size="sm"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        disabled={updateStatus.isPending}
                        onClick={() => {
                          handleUpdateStatus(selectedComplaint.id, ComplaintStatus.resolved);
                          setSelectedComplaint(null);
                        }}
                      >
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                )}

                {/* HOD Escalate */}
                {isHOD && selectedComplaint.priority === 'high' && (
                  <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/20 rounded-lg p-3">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-red-700 dark:text-red-400">High Priority</p>
                      <p className="text-xs text-red-600 dark:text-red-400">
                        This complaint requires immediate attention.
                      </p>
                    </div>
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
