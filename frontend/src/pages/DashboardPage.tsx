import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useGetMyComplaints, useGetAllComplaints } from '../hooks/useQueries';
import { getAllLocalMeta } from '../lib/localComplaintStore';
import { ComplaintStatus, Priority } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FilePlus,
  FileSearch,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Users,
  Shield,
  Briefcase,
} from 'lucide-react';

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

interface DashboardPageProps {
  onNavigate: (view: View) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { extendedProfile, campusRole } = useAppContext();
  const myComplaintsQuery = useGetMyComplaints();
  const allComplaintsQuery = useGetAllComplaints();

  const localMeta = getAllLocalMeta();

  const isAdmin = campusRole === 'admin';
  const isHOD = campusRole === 'hod';
  const isStaff = campusRole === 'staff';
  const isStudent = campusRole === 'student';

  const allComplaints = allComplaintsQuery.data || [];
  const myComplaints = myComplaintsQuery.data || [];

  const complaints = isAdmin
    ? allComplaints
    : isHOD || isStaff
    ? allComplaints.filter((c) => {
        const meta = localMeta[c.id];
        return meta?.department === extendedProfile?.department;
      })
    : myComplaints;

  const isLoading =
    isAdmin || isHOD || isStaff ? allComplaintsQuery.isLoading : myComplaintsQuery.isLoading;

  const registered = complaints.filter((c) => c.status === ComplaintStatus.registered).length;
  const inProgress = complaints.filter((c) => c.status === ComplaintStatus.inProgress).length;
  const resolved = complaints.filter((c) => c.status === ComplaintStatus.resolved).length;
  const highPriority = complaints.filter((c) => c.priority === Priority.high).length;
  const resolutionRate =
    complaints.length > 0 ? Math.round((resolved / complaints.length) * 100) : 0;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const stats = isStudent
    ? [
        {
          label: 'Total Complaints',
          value: complaints.length,
          icon: <ClipboardList className="w-5 h-5" />,
          color: 'text-primary',
          bg: 'bg-primary/10',
        },
        {
          label: 'Registered',
          value: registered,
          icon: <Clock className="w-5 h-5" />,
          color: 'text-blue-600',
          bg: 'bg-blue-50 dark:bg-blue-950/30',
        },
        {
          label: 'In Progress',
          value: inProgress,
          icon: <TrendingUp className="w-5 h-5" />,
          color: 'text-amber-600',
          bg: 'bg-amber-50 dark:bg-amber-950/30',
        },
        {
          label: 'Resolved',
          value: resolved,
          icon: <CheckCircle2 className="w-5 h-5" />,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50 dark:bg-emerald-950/30',
        },
      ]
    : [
        {
          label: 'Total Complaints',
          value: complaints.length,
          icon: <ClipboardList className="w-5 h-5" />,
          color: 'text-primary',
          bg: 'bg-primary/10',
        },
        {
          label: 'Pending',
          value: registered + inProgress,
          icon: <Clock className="w-5 h-5" />,
          color: 'text-amber-600',
          bg: 'bg-amber-50 dark:bg-amber-950/30',
        },
        {
          label: 'Resolved',
          value: resolved,
          icon: <CheckCircle2 className="w-5 h-5" />,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50 dark:bg-emerald-950/30',
        },
        {
          label: 'High Priority',
          value: highPriority,
          icon: <AlertTriangle className="w-5 h-5" />,
          color: 'text-red-600',
          bg: 'bg-red-50 dark:bg-red-950/30',
        },
      ];

  const quickActions = isStudent
    ? [
        {
          label: 'Submit Complaint',
          icon: <FilePlus className="w-5 h-5" />,
          view: 'submit' as View,
          desc: 'Report a new campus issue',
          color: 'bg-primary text-primary-foreground hover:bg-primary/90',
        },
        {
          label: 'Track Complaints',
          icon: <FileSearch className="w-5 h-5" />,
          view: 'track' as View,
          desc: 'View status of your complaints',
          color: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        },
        {
          label: 'AI Assistant',
          icon: <MessageSquare className="w-5 h-5" />,
          view: 'chatbot' as View,
          desc: 'Get help from AI chatbot',
          color: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        },
      ]
    : isAdmin
    ? [
        {
          label: 'All Complaints',
          icon: <ClipboardList className="w-5 h-5" />,
          view: 'admin-complaints' as View,
          desc: 'View and manage all complaints',
          color: 'bg-primary text-primary-foreground hover:bg-primary/90',
        },
        {
          label: 'Analytics',
          icon: <BarChart3 className="w-5 h-5" />,
          view: 'admin-analytics' as View,
          desc: 'Charts and predictive analysis',
          color: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        },
        {
          label: 'User Management',
          icon: <Users className="w-5 h-5" />,
          view: 'admin-users' as View,
          desc: 'Manage users and roles',
          color: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        },
        {
          label: 'Emergency Logs',
          icon: <AlertTriangle className="w-5 h-5" />,
          view: 'admin-emergencies' as View,
          desc: 'View emergency alerts',
          color: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        },
      ]
    : isHOD
    ? [
        {
          label: 'Department Complaints',
          icon: <ClipboardList className="w-5 h-5" />,
          view: 'hod-complaints' as View,
          desc: 'Manage your department complaints',
          color: 'bg-primary text-primary-foreground hover:bg-primary/90',
        },
        {
          label: 'Analytics',
          icon: <BarChart3 className="w-5 h-5" />,
          view: 'hod-analytics' as View,
          desc: 'Department statistics',
          color: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        },
      ]
    : [
        // Staff
        {
          label: 'Department Complaints',
          icon: <ClipboardList className="w-5 h-5" />,
          view: 'staff-complaints' as View,
          desc: 'View and update complaints',
          color: 'bg-primary text-primary-foreground hover:bg-primary/90',
        },
        {
          label: 'Analytics',
          icon: <BarChart3 className="w-5 h-5" />,
          view: 'staff-analytics' as View,
          desc: 'Department statistics',
          color: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        },
      ];

  return (
    <div className="page-enter space-y-6">
      {/* Welcome header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {greeting()}, {extendedProfile?.displayName?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {isStudent && "Here's an overview of your complaints."}
            {isHOD && `Managing complaints for ${extendedProfile?.department}`}
            {isStaff && `Department: ${extendedProfile?.department}`}
            {isAdmin && 'System-wide complaint overview'}
          </p>
        </div>
        {resolutionRate > 0 && (
          <div className="flex flex-col items-end">
            <span className="text-2xl font-bold text-emerald-600">{resolutionRate}%</span>
            <span className="text-xs text-muted-foreground">Resolution Rate</span>
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-20 mb-3" />
                  <Skeleton className="h-8 w-12" />
                </CardContent>
              </Card>
            ))
          : stats.map((stat, i) => (
              <Card key={i} className="hover:shadow-card-hover transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                    <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color}`}>
                      {stat.icon}
                    </div>
                  </div>
                  <p className={`text-3xl font-bold font-display ${stat.color}`}>{stat.value}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => onNavigate(action.view)}
              className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-150 hover:scale-[1.01] ${action.color}`}
            >
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                {action.icon}
              </div>
              <div>
                <p className="font-semibold text-sm">{action.label}</p>
                <p className="text-xs opacity-80">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent complaints preview */}
      {complaints.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Complaints</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() =>
                  onNavigate(
                    isAdmin
                      ? 'admin-complaints'
                      : isHOD
                      ? 'hod-complaints'
                      : isStaff
                      ? 'staff-complaints'
                      : 'track'
                  )
                }
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {complaints.slice(0, 3).map((c) => {
                const meta = localMeta[c.id];
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-muted-foreground">{c.id}</p>
                      {meta?.category && (
                        <p className="text-xs text-primary font-medium">{meta.category}</p>
                      )}
                      <p className="text-sm text-foreground truncate">{c.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          c.status === ComplaintStatus.resolved
                            ? 'bg-emerald-100 text-emerald-700'
                            : c.status === ComplaintStatus.inProgress
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {c.status === ComplaintStatus.resolved
                          ? 'Resolved'
                          : c.status === ComplaintStatus.inProgress
                          ? 'In Progress'
                          : 'Registered'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
