import React from 'react';
import {
  GraduationCap,
  Users,
  Shield,
  Briefcase,
  MessageSquare,
  BarChart3,
  Bell,
  Lock,
  ChevronRight,
  Heart,
  ArrowRight,
} from 'lucide-react';

type PublicView = 'select' | 'student-login' | 'hod-login' | 'admin-login' | 'staff-login';

interface LandingPageProps {
  onNavigate: (view: PublicView) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const roles = [
    {
      id: 'student-login' as PublicView,
      title: 'Student',
      description: 'Submit complaints, track status, and get AI-powered support for your campus issues.',
      icon: GraduationCap,
      iconBg: 'bg-teal-500/20',
      iconColor: 'text-teal-300',
      hoverBorder: 'hover:border-teal-400/60',
      focusRing: 'focus:ring-teal-400/50',
      badgeBg: 'bg-teal-500/10',
      badgeBorder: 'border-teal-400/20',
      badgeColor: 'text-teal-300',
      dotColor: 'bg-teal-400',
      badgeLabel: 'Student Portal',
    },
    {
      id: 'hod-login' as PublicView,
      title: 'Head of Department',
      description: 'Review department complaints, manage resolutions, and monitor analytics.',
      icon: Users,
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-300',
      hoverBorder: 'hover:border-amber-400/60',
      focusRing: 'focus:ring-amber-400/50',
      badgeBg: 'bg-amber-500/10',
      badgeBorder: 'border-amber-400/20',
      badgeColor: 'text-amber-300',
      dotColor: 'bg-amber-400',
      badgeLabel: 'HOD Portal',
    },
    {
      id: 'staff-login' as PublicView,
      title: 'Staff',
      description: 'Handle department-level complaints, update statuses, and view department analytics.',
      icon: Briefcase,
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-300',
      hoverBorder: 'hover:border-purple-400/60',
      focusRing: 'focus:ring-purple-400/50',
      badgeBg: 'bg-purple-500/10',
      badgeBorder: 'border-purple-400/20',
      badgeColor: 'text-purple-300',
      dotColor: 'bg-purple-400',
      badgeLabel: 'Staff Portal',
    },
    {
      id: 'admin-login' as PublicView,
      title: 'Admin',
      description: 'System-wide oversight, user management, emergency alerts, and full analytics access.',
      icon: Shield,
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-300',
      hoverBorder: 'hover:border-red-400/60',
      focusRing: 'focus:ring-red-400/50',
      badgeBg: 'bg-red-500/10',
      badgeBorder: 'border-red-400/20',
      badgeColor: 'text-red-300',
      dotColor: 'bg-red-400',
      badgeLabel: 'Admin Portal',
    },
  ];

  const features = [
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: 'AI-Powered Complaints',
      desc: 'Auto-categorize and route complaints using Gemini AI',
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Role-Based Access',
      desc: 'Student, Staff, HOD, and Admin dashboards',
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: 'Analytics Dashboard',
      desc: 'Real-time charts and predictive analysis',
    },
    {
      icon: <Bell className="w-5 h-5" />,
      title: 'Emergency Alerts',
      desc: 'Instant real-time alerts to HOD and Admin',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div
        className="relative flex-1 flex items-center justify-center min-h-screen"
        style={{
          backgroundImage: 'url(/assets/generated/campus-bg.dim_1920x1080.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-navy-900/70 backdrop-blur-[2px]" />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-12">
          {/* Logo + Title */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <img
                  src="/assets/generated/campusvoice-logo.dim_256x256.png"
                  alt="CampusVoice AI"
                  className="w-14 h-14 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-3 leading-tight">
              CampusVoice <span className="text-teal-300">AI</span>
            </h1>
            <p className="text-lg text-white/75 max-w-xl mx-auto leading-relaxed">
              AI-powered campus complaint management. Submit, track, and resolve issues faster than ever.
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="mb-6">
            <p className="text-center text-white/60 text-sm font-medium uppercase tracking-widest mb-6">
              Sign in as
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    onClick={() => onNavigate(role.id)}
                    className={`group relative bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 ${role.hoverBorder} rounded-2xl p-6 text-left transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 ${role.focusRing}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${role.iconBg} border border-white/10 flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${role.iconColor}`} />
                      </div>
                      <ArrowRight className={`w-5 h-5 text-white/30 group-hover:${role.iconColor} group-hover:translate-x-1 transition-all duration-200`} />
                    </div>
                    <h2 className="text-lg font-display font-bold text-white mb-1.5">{role.title}</h2>
                    <p className="text-xs text-white/60 leading-relaxed mb-4">
                      {role.description}
                    </p>
                    <div className={`inline-flex items-center gap-1.5 text-xs font-medium ${role.badgeColor} ${role.badgeBg} border ${role.badgeBorder} rounded-full px-3 py-1`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${role.dotColor}`} />
                      {role.badgeLabel}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-center text-white/40 text-xs">
            Secure, decentralized authentication powered by the Internet Computer
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="bg-background py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-center text-foreground mb-10">
            Everything you need to manage campus issues
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className="glass-card p-5 text-center hover:shadow-card-hover transition-shadow"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 text-primary">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-1 text-sm">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-6 px-4 text-center">
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
          © {new Date().getFullYear()} CampusVoice AI. Built with{' '}
          <Heart className="w-4 h-4 text-red-500 fill-red-500 mx-0.5" /> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'campusvoice-ai')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
