import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Shield, MessageSquare, BarChart3, AlertTriangle, Loader2, GraduationCap } from 'lucide-react';

export default function LandingPage() {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();

  const features = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'AI-Powered Complaints',
      desc: 'Auto-categorize and route complaints using Gemini AI',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Role-Based Access',
      desc: 'Student, Staff, HOD, and Admin dashboards',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Analytics Dashboard',
      desc: 'Real-time charts and predictive analysis',
    },
    {
      icon: <AlertTriangle className="w-6 h-6" />,
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

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <img
                src="/assets/generated/campusvoice-logo.dim_256x256.png"
                alt="CampusVoice AI"
                className="w-14 h-14 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    const icon = document.createElement('div');
                    icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/></svg>';
                    parent.appendChild(icon);
                  }
                }}
              />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-white mb-4 leading-tight">
            CampusVoice <span className="text-teal-300">AI</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-xl mx-auto leading-relaxed">
            AI-powered campus complaint management. Submit, track, and resolve issues faster than ever.
          </p>

          <Button
            size="lg"
            onClick={login}
            disabled={isLoggingIn || isInitializing}
            className="bg-teal-500 hover:bg-teal-400 text-white font-semibold px-8 py-3 text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 gap-3"
          >
            {isLoggingIn || isInitializing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <GraduationCap className="w-5 h-5" />
                Sign In with Internet Identity
              </>
            )}
          </Button>

          <p className="text-white/50 text-sm mt-4">
            Secure, decentralized authentication powered by the Internet Computer
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="bg-background py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-center text-foreground mb-10">
            Everything you need to manage campus issues
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="glass-card p-5 text-center hover:shadow-card-hover transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 text-primary">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-6 px-4 text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} CampusVoice AI. Built with{' '}
          <span className="text-red-500">♥</span> using{' '}
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
