import { Priority } from '../backend';

export function generateComplaintId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CMP-${timestamp}-${random}`;
}

export function getDeadlineDays(priority: Priority): number {
  switch (priority) {
    case Priority.high: return 1;
    case Priority.medium: return 3;
    case Priority.low: return 7;
    default: return 7;
  }
}

export function calculateDeadline(priority: Priority): Date {
  const days = getDeadlineDays(priority);
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + days);
  return deadline;
}

export function formatDeadline(priority: Priority): string {
  const deadline = calculateDeadline(priority);
  return deadline.toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTimestamp(timestamp: bigint): string {
  return new Date(Number(timestamp) / 1_000_000).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isOverdue(createdAt: bigint, priority: Priority): boolean {
  const days = getDeadlineDays(priority);
  const deadline = new Date(Number(createdAt) / 1_000_000);
  deadline.setDate(deadline.getDate() + days);
  return new Date() > deadline;
}
