import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useGetAllComplaints } from '../hooks/useQueries';
import { Complaint, ComplaintStatus, Priority } from '../backend';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, Download, Loader2, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { runPredictiveAnalysis } from '../lib/geminiService';
import { toast } from 'sonner';

const STATUS_COLORS = {
  Registered: '#3b82f6',
  'In Progress': '#f59e0b',
  Resolved: '#22c55e',
};

const PRIORITY_COLORS = {
  High: '#ef4444',
  Medium: '#f97316',
  Low: '#6b7280',
};

export default function AnalyticsPage() {
  const { campusRole, extendedProfile } = useAppContext();
  const { data: allComplaints, isLoading } = useGetAllComplaints();
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Filter complaints based on role
  let complaints: Complaint[] = allComplaints || [];

  if ((campusRole === 'staff' || campusRole === 'hod') && extendedProfile?.department) {
    const dept = extendedProfile.department;
    if (dept) {
      complaints = complaints.filter((c) =>
        c.description.toLowerCase().includes(dept.toLowerCase())
      );
    }
  }

  // Status distribution
  const statusData = [
    { name: 'Registered', value: complaints.filter((c) => c.status === ComplaintStatus.registered).length },
    { name: 'In Progress', value: complaints.filter((c) => c.status === ComplaintStatus.inProgress).length },
    { name: 'Resolved', value: complaints.filter((c) => c.status === ComplaintStatus.resolved).length },
  ];

  // Priority distribution
  const priorityData = [
    { name: 'High', value: complaints.filter((c) => c.priority === Priority.high).length },
    { name: 'Medium', value: complaints.filter((c) => c.priority === Priority.medium).length },
    { name: 'Low', value: complaints.filter((c) => c.priority === Priority.low).length },
  ];

  // Monthly trend (last 6 months)
  const monthlyData = getMonthlyData(complaints);

  const handleAiAnalysis = async () => {
    setAiLoading(true);
    try {
      const summary = `
Total complaints: ${complaints.length}
Registered: ${statusData[0].value}
In Progress: ${statusData[1].value}
Resolved: ${statusData[2].value}
High priority: ${priorityData[0].value}
Medium priority: ${priorityData[1].value}
Low priority: ${priorityData[2].value}
Role: ${campusRole}
${extendedProfile?.department ? `Department: ${extendedProfile.department}` : ''}
      `.trim();
      const analysis = await runPredictiveAnalysis(summary);
      setAiAnalysis(analysis);
    } catch (error) {
      toast.error('Failed to generate AI analysis');
    } finally {
      setAiLoading(false);
    }
  };

  const handleExportJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      role: campusRole,
      totalComplaints: complaints.length,
      statusDistribution: statusData,
      priorityDistribution: priorityData,
      monthlyTrend: monthlyData,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${campusRole}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPageTitle = () => {
    switch (campusRole) {
      case 'admin': return 'System Analytics';
      case 'hod': return 'Department Analytics';
      case 'staff': return 'Department Analytics';
      default: return 'Analytics';
    }
  };

  const getPageSubtitle = () => {
    switch (campusRole) {
      case 'admin': return 'System-wide complaint statistics and trends';
      case 'hod': return `Analytics for ${extendedProfile?.department || 'your department'}`;
      case 'staff': return `Analytics for ${extendedProfile?.department || 'your department'}`;
      default: return 'Complaint statistics and trends';
    }
  };

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            {getPageTitle()}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{getPageSubtitle()}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportJSON}>
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <Button
            size="sm"
            onClick={handleAiAnalysis}
            disabled={aiLoading || complaints.length === 0}
            className="gap-2"
          >
            {aiLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Brain className="w-4 h-4" />
            )}
            AI Analysis
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: complaints.length, color: 'text-primary' },
          { label: 'Registered', value: statusData[0].value, color: 'text-blue-600' },
          { label: 'In Progress', value: statusData[1].value, color: 'text-amber-600' },
          { label: 'Resolved', value: statusData[2].value, color: 'text-emerald-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
            {isLoading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <p className={`text-2xl font-bold font-display ${stat.color}`}>{stat.value}</p>
            )}
            <p className="text-muted-foreground text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Status Distribution</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Priority Distribution */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Priority Distribution</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Trend */}
          <div className="bg-card border border-border rounded-xl p-5 lg:col-span-2">
            <h3 className="font-semibold text-foreground mb-4">Monthly Trend (Last 6 Months)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="registered" name="Registered" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#22c55e" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* AI Analysis */}
      {aiAnalysis && (
        <div className="bg-card border border-primary/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">AI Predictive Analysis</h3>
          </div>
          <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {aiAnalysis}
          </div>
        </div>
      )}
    </div>
  );
}

function getMonthlyData(complaints: Complaint[]) {
  const months: { month: string; registered: number; resolved: number }[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleString('default', { month: 'short' });

    const monthComplaints = complaints.filter((c) => {
      const created = new Date(Number(c.createdAt) / 1_000_000);
      return created.getMonth() === date.getMonth() && created.getFullYear() === date.getFullYear();
    });

    months.push({
      month: monthName,
      registered: monthComplaints.length,
      resolved: monthComplaints.filter((c) => c.status === ComplaintStatus.resolved).length,
    });
  }

  return months;
}
