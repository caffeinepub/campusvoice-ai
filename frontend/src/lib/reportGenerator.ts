import { type Complaint, ComplaintStatus, Priority } from '../backend';

interface ComplaintWithMeta extends Complaint {
  category?: string;
  department?: string;
  isAnonymous?: boolean;
  studentName?: string;
}

function formatDate(timestamp: bigint): string {
  return new Date(Number(timestamp) / 1_000_000).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusLabel(status: ComplaintStatus): string {
  switch (status) {
    case ComplaintStatus.registered: return 'Registered';
    case ComplaintStatus.inProgress: return 'In Progress';
    case ComplaintStatus.resolved: return 'Resolved';
    default: return 'Unknown';
  }
}

function getPriorityLabel(priority: Priority): string {
  switch (priority) {
    case Priority.high: return 'High';
    case Priority.medium: return 'Medium';
    case Priority.low: return 'Low';
    default: return 'Unknown';
  }
}

export function downloadComplaintsAsJSON(complaints: ComplaintWithMeta[], filename = 'complaints-report'): void {
  const reportData = {
    generatedAt: new Date().toISOString(),
    totalComplaints: complaints.length,
    summary: {
      registered: complaints.filter((c) => c.status === ComplaintStatus.registered).length,
      inProgress: complaints.filter((c) => c.status === ComplaintStatus.inProgress).length,
      resolved: complaints.filter((c) => c.status === ComplaintStatus.resolved).length,
      highPriority: complaints.filter((c) => c.priority === Priority.high).length,
      mediumPriority: complaints.filter((c) => c.priority === Priority.medium).length,
      lowPriority: complaints.filter((c) => c.priority === Priority.low).length,
    },
    complaints: complaints.map((c) => ({
      id: c.id,
      category: c.category || 'Uncategorized',
      department: c.department || 'General',
      description: c.description,
      status: getStatusLabel(c.status),
      priority: getPriorityLabel(c.priority),
      submittedAt: formatDate(c.createdAt),
      studentId: c.isAnonymous ? 'Anonymous' : c.studentId.toString(),
    })),
  };

  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadComplaintsAsCSV(complaints: ComplaintWithMeta[], filename = 'complaints-report'): void {
  const headers = ['Complaint ID', 'Category', 'Department', 'Description', 'Status', 'Priority', 'Submitted At', 'Student'];
  const rows = complaints.map((c) => [
    c.id,
    c.category || 'Uncategorized',
    c.department || 'General',
    `"${c.description.replace(/"/g, '""')}"`,
    getStatusLabel(c.status),
    getPriorityLabel(c.priority),
    formatDate(c.createdAt),
    c.isAnonymous ? 'Anonymous' : c.studentId.toString(),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
