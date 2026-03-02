import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useGetAllComplaints, useUpdateComplaintStatus } from '../hooks/useQueries';
import { Complaint, ComplaintStatus, Priority } from '../backend';
import {
  Search,
  Download,
  Eye,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function ComplaintsListPage() {
  const { campusRole, extendedProfile } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data: allComplaints, isLoading } = useGetAllComplaints();
  const updateStatusMutation = useUpdateComplaintStatus();

  // Filter complaints based on role
  let complaints = allComplaints || [];

  // Staff: filter by department
  if (campusRole === 'staff' && extendedProfile?.department) {
    const dept = extendedProfile.department;
    complaints = complaints.filter((c) =>
      c.description.toLowerCase().includes(dept.toLowerCase())
    );
  }

  // HOD: filter by department too
  if (campusRole === 'hod' && extendedProfile?.department) {
    const dept = extendedProfile.department;
    complaints = complaints.filter((c) =>
      c.description.toLowerCase().includes(dept.toLowerCase())
    );
  }

  // Apply search and filters
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'registered' && c.status === ComplaintStatus.registered) ||
      (statusFilter === 'inProgress' && c.status === ComplaintStatus.inProgress) ||
      (statusFilter === 'resolved' && c.status === ComplaintStatus.resolved);

    const matchesPriority =
      priorityFilter === 'all' ||
      (priorityFilter === 'high' && c.priority === Priority.high) ||
      (priorityFilter === 'medium' && c.priority === Priority.medium) ||
      (priorityFilter === 'low' && c.priority === Priority.low);

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleStatusUpdate = async (complaintId: string, newStatus: ComplaintStatus) => {
    setUpdatingId(complaintId);
    try {
      await updateStatusMutation.mutateAsync({ id: complaintId, status: newStatus });
      toast.success('Complaint status updated successfully');
      if (selectedComplaint?.id === complaintId) {
        setSelectedComplaint((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error: any) {
      toast.error('Failed to update status: ' + (error?.message || 'Unknown error'));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Description', 'Status', 'Priority', 'Created At'];
    const rows = filteredComplaints.map((c) => [
      c.id,
      `"${c.description.replace(/"/g, '""')}"`,
      c.status,
      c.priority,
      new Date(Number(c.createdAt) / 1_000_000).toLocaleDateString(),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complaints-${campusRole}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.resolved:
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20">Resolved</Badge>;
      case ComplaintStatus.inProgress:
        return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20">In Progress</Badge>;
      default:
        return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20">Registered</Badge>;
    }
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case Priority.high:
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20">High</Badge>;
      case Priority.medium:
        return <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20">Medium</Badge>;
      default:
        return <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/20 hover:bg-gray-500/20">Low</Badge>;
    }
  };

  const getPageTitle = () => {
    switch (campusRole) {
      case 'admin': return 'All Complaints';
      case 'hod': return 'Department Complaints';
      case 'staff': return 'Department Complaints';
      default: return 'Complaints';
    }
  };

  const canUpdateStatus = campusRole === 'admin' || campusRole === 'hod' || campusRole === 'staff';

  return (
    <div className="page-enter space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            {getPageTitle()}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isLoading ? 'Loading...' : `${filteredComplaints.length} complaint${filteredComplaints.length !== 1 ? 's' : ''} found`}
            {!isLoading && campusRole !== 'admin' && extendedProfile?.department && ` in ${extendedProfile.department}`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={filteredComplaints.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search complaints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="registered">Registered</SelectItem>
            <SelectItem value="inProgress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Complaints List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl border-dashed">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-foreground font-medium">No complaints found</p>
          <p className="text-muted-foreground text-sm mt-1">
            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'No complaints have been submitted yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredComplaints.map((complaint) => (
            <div
              key={complaint.id}
              className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {complaint.id}
                    </span>
                    {getStatusBadge(complaint.status)}
                    {getPriorityBadge(complaint.priority)}
                  </div>
                  <p className="text-sm text-foreground line-clamp-2">{complaint.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Submitted: {new Date(Number(complaint.createdAt) / 1_000_000).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {canUpdateStatus && (
                    <Select
                      value={complaint.status}
                      onValueChange={(val) => handleStatusUpdate(complaint.id, val as ComplaintStatus)}
                      disabled={updatingId === complaint.id}
                    >
                      <SelectTrigger className="w-36 h-8 text-xs">
                        {updatingId === complaint.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <SelectValue />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ComplaintStatus.registered}>Registered</SelectItem>
                        <SelectItem value={ComplaintStatus.inProgress}>In Progress</SelectItem>
                        <SelectItem value={ComplaintStatus.resolved}>Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSelectedComplaint(complaint)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={(open) => !open && setSelectedComplaint(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Complaint Details</DialogTitle>
            <DialogDescription>
              Full details for complaint {selectedComplaint?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  {selectedComplaint.id}
                </span>
                {getStatusBadge(selectedComplaint.status)}
                {getPriorityBadge(selectedComplaint.priority)}
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3">
                  {selectedComplaint.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Submitted</p>
                  <p className="text-foreground">
                    {new Date(Number(selectedComplaint.createdAt) / 1_000_000).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Student ID</p>
                  <p className="text-foreground font-mono text-xs truncate">
                    {selectedComplaint.studentId.toString().substring(0, 20)}...
                  </p>
                </div>
              </div>
              {canUpdateStatus && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Update Status</p>
                  <div className="flex gap-2">
                    {[
                      { status: ComplaintStatus.registered, label: 'Registered', icon: FileText },
                      { status: ComplaintStatus.inProgress, label: 'In Progress', icon: Clock },
                      { status: ComplaintStatus.resolved, label: 'Resolved', icon: CheckCircle },
                    ].map(({ status, label, icon: Icon }) => (
                      <Button
                        key={status}
                        variant={selectedComplaint.status === status ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusUpdate(selectedComplaint.id, status)}
                        disabled={updatingId === selectedComplaint.id}
                        className="flex-1 text-xs"
                      >
                        {updatingId === selectedComplaint.id ? (
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        ) : (
                          <Icon className="w-3 h-3 mr-1" />
                        )}
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
