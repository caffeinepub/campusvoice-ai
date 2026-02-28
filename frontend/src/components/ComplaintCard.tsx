import React from 'react';
import { type Complaint, ComplaintStatus, Priority } from '../backend';
import { type LocalComplaintMeta } from '../lib/localComplaintStore';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatTimestamp, isOverdue } from '../lib/complaintHelpers';
import { Clock, AlertTriangle, Eye, Image, Mic, Video } from 'lucide-react';
import type { CampusRole } from '../constants/appRoles';

interface ComplaintCardProps {
  complaint: Complaint;
  meta?: LocalComplaintMeta | null;
  currentRole?: CampusRole | null;
  onView?: (complaint: Complaint) => void;
  onUpdateStatus?: (id: string, status: ComplaintStatus) => void;
  isUpdating?: boolean;
}

function StatusBadge({ status }: { status: ComplaintStatus }) {
  const config = {
    [ComplaintStatus.registered]: { label: 'Registered', className: 'status-badge-registered' },
    [ComplaintStatus.inProgress]: { label: 'In Progress', className: 'status-badge-inprogress' },
    [ComplaintStatus.resolved]: { label: 'Resolved', className: 'status-badge-resolved' },
  };
  const { label, className } = config[status] || { label: 'Unknown', className: '' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const config = {
    [Priority.high]: { label: 'High', className: 'priority-high' },
    [Priority.medium]: { label: 'Medium', className: 'priority-medium' },
    [Priority.low]: { label: 'Low', className: 'priority-low' },
  };
  const { label, className } = config[priority] || { label: 'Unknown', className: '' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

export { StatusBadge, PriorityBadge };

export default function ComplaintCard({
  complaint,
  meta,
  currentRole,
  onView,
  onUpdateStatus,
  isUpdating,
}: ComplaintCardProps) {
  const overdue = isOverdue(complaint.createdAt, complaint.priority);
  const isAnonymous = meta?.isAnonymous || false;

  // Determine displayed student name based on role
  const displayStudent =
    isAnonymous && (currentRole === 'staff' || currentRole === 'hod')
      ? 'Anonymous Student'
      : meta?.studentName || complaint.studentId.toString().slice(0, 12) + '...';

  const mediaCount = meta?.mediaItems?.length || 0;
  const imageCount = meta?.mediaItems?.filter((m) => m.type === 'image').length || 0;
  const videoCount = meta?.mediaItems?.filter((m) => m.type === 'video').length || 0;
  const audioCount = meta?.mediaItems?.filter((m) => m.type === 'audio').length || 0;

  return (
    <Card className="hover:shadow-card-hover transition-shadow duration-200 cursor-pointer group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono text-muted-foreground">{complaint.id}</span>
              {overdue && complaint.status !== ComplaintStatus.resolved && (
                <span className="flex items-center gap-1 text-xs text-destructive">
                  <AlertTriangle className="w-3 h-3" />
                  Overdue
                </span>
              )}
            </div>
            {meta?.category && (
              <Badge variant="secondary" className="text-xs mb-2">
                {meta.category}
              </Badge>
            )}
            <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
              {complaint.description}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimestamp(complaint.createdAt)}
            </span>
            {mediaCount > 0 && (
              <span className="flex items-center gap-1.5">
                {imageCount > 0 && (
                  <span className="flex items-center gap-0.5">
                    <Image className="w-3 h-3" />
                    {imageCount}
                  </span>
                )}
                {videoCount > 0 && (
                  <span className="flex items-center gap-0.5">
                    <Video className="w-3 h-3" />
                    {videoCount}
                  </span>
                )}
                {audioCount > 0 && (
                  <span className="flex items-center gap-0.5">
                    <Mic className="w-3 h-3" />
                    {audioCount}
                  </span>
                )}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {(currentRole === 'hod' || currentRole === 'admin' || currentRole === 'staff') && (
              <span className="text-xs text-muted-foreground">{displayStudent}</span>
            )}
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(complaint);
                }}
              >
                <Eye className="w-3 h-3" />
                View
              </Button>
            )}
          </div>
        </div>

        {/* Status update buttons for staff/hod/admin */}
        {onUpdateStatus && complaint.status !== ComplaintStatus.resolved && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-border">
            {complaint.status === ComplaintStatus.registered && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7 flex-1"
                disabled={isUpdating}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus(complaint.id, ComplaintStatus.inProgress);
                }}
              >
                Mark In Progress
              </Button>
            )}
            {complaint.status === ComplaintStatus.inProgress && (
              <Button
                size="sm"
                className="text-xs h-7 flex-1 bg-emerald-600 hover:bg-emerald-700"
                disabled={isUpdating}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus(complaint.id, ComplaintStatus.resolved);
                }}
              >
                Mark Resolved
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
