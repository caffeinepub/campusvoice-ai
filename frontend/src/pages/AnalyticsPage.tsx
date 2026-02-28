import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useGetAllComplaints } from '../hooks/useQueries';
import { getAllLocalMeta } from '../lib/localComplaintStore';
import { ComplaintStatus, Priority } from '../backend';
import { runPredictiveAnalysis } from '../lib/geminiService';
import { downloadComplaintsAsJSON } from '../lib/reportGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { BarChart3, Sparkles, Download, Loader2, TrendingUp } from 'lucide-react';

const STATUS_COLORS = ['#3b82f6', '#f59e0b', '#10b981'];
const PRIORITY_COLORS = ['#ef4444', '#f59e0b', '#10b981'];

export default function AnalyticsPage() {
  const { extendedProfile, campusRole } = useAppContext();
  const { data: allComplaints = [], isLoading } = useGetAllComplaints();
  const localMeta = getAllLocalMeta();
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const isAdmin = campusRole === 'admin';

  const complaints = isAdmin
    ? allComplaints
    : allComplaints.filter((c) => localMeta[c.id]?.department === extendedProfile?.department);

  // Category distribution
  const categoryCount: Record<string, number> = {};
  complaints.forEach((c) => {
    const cat = localMeta[c.id]?.category || 'Uncategorized';
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });
  const categoryData = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 18) + '…' : name, value }));

  // Status distribution
  const statusData = [
    { name: 'Registered', value: complaints.filter((c) => c.status === ComplaintStatus.registered).length },
    { name: 'In Progress', value: complaints.filter((c) => c.status === ComplaintStatus.inProgress).length },
    { name: 'Resolved', value: complaints.filter((c) => c.status === ComplaintStatus.resolved).length },
  ].filter((d) => d.value > 0);

  // Priority distribution
  const priorityData = [
    { name: 'High', value: complaints.filter((c) => c.priority === Priority.high).length },
    { name: 'Medium', value: complaints.filter((c) => c.priority === Priority.medium).length },
    { name: 'Low', value: complaints.filter((c) => c.priority === Priority.low).length },
  ].filter((d) => d.value > 0);

  const resolutionRate =
    complaints.length > 0
      ? Math.round(
          (complaints.filter((c) => c.status === ComplaintStatus.resolved).length / complaints.length) * 100
        )
      : 0;

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    const summary = `
Total complaints: ${complaints.length}
Registered: ${statusData.find((s) => s.name === 'Registered')?.value || 0}
In Progress: ${statusData.find((s) => s.name === 'In Progress')?.value || 0}
Resolved: ${statusData.find((s) => s.name === 'Resolved')?.value || 0}
Resolution rate: ${resolutionRate}%
High priority: ${priorityData.find((p) => p.name === 'High')?.value || 0}
Top categories: ${categoryData
      .slice(0, 5)
      .map((c) => `${c.name} (${c.value})`)
      .join(', ')}
${!isAdmin ? `Department: ${extendedProfile?.department}` : ''}
    `.trim();

    const result = await runPredictiveAnalysis(summary);
    setAiAnalysis(result);
    setAnalyzing(false);
  };

  const handleExport = () => {
    const withMeta = complaints.map((c) => ({
      ...c,
      category: localMeta[c.id]?.category,
      department: localMeta[c.id]?.department,
      isAnonymous: localMeta[c.id]?.isAnonymous,
      studentName: localMeta[c.id]?.studentName,
    }));
    downloadComplaintsAsJSON(withMeta, 'analytics-report');
  };

  return (
    <div className="page-enter space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin ? 'System-wide complaint analytics' : `Analytics for ${extendedProfile?.department}`}
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
          <Download className="w-4 h-4" />
          Export JSON
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: complaints.length, color: 'text-primary' },
          { label: 'Pending', value: complaints.filter((c) => c.status !== ComplaintStatus.resolved).length, color: 'text-amber-600' },
          { label: 'Resolved', value: complaints.filter((c) => c.status === ComplaintStatus.resolved).length, color: 'text-emerald-600' },
          { label: 'Resolution Rate', value: `${resolutionRate}%`, color: 'text-emerald-600' },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category bar chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Complaints by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={categoryData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.02 220)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Status pie chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {statusData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {statusData.map((_, index) => (
                        <Cell key={index} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Priority pie chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Priority Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {priorityData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {priorityData.map((_, index) => (
                        <Cell key={index} fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* AI Predictive Analysis */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                AI Predictive Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!aiAnalysis ? (
                <div className="text-center py-6">
                  <Sparkles className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Run AI analysis to get insights, trend predictions, and recommendations.
                  </p>
                  <Button
                    onClick={handleRunAnalysis}
                    disabled={analyzing || complaints.length === 0}
                    className="gap-2"
                  >
                    {analyzing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {analyzing ? 'Analyzing...' : 'Run Analysis'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 text-sm text-amber-900 dark:text-amber-200 leading-relaxed whitespace-pre-wrap">
                    {aiAnalysis}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRunAnalysis}
                    disabled={analyzing}
                    className="gap-2"
                  >
                    {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Re-run Analysis
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
