import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { GraduationCap, Loader2, ArrowLeft, CheckCircle2, MessageSquare, BarChart3, Bot } from 'lucide-react';

interface StudentLoginFlowProps {
  onBack: () => void;
}

const PENDING_ROLE_KEY = 'campusvoice_pending_role';

export default function StudentLoginFlow({ onBack }: StudentLoginFlowProps) {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();

  const handleLogin = async () => {
    // Store the intended role before triggering Internet Identity login
    localStorage.setItem(PENDING_ROLE_KEY, 'student');
    try {
      await login();
    } catch (err) {
      // If login fails, clear the pending role
      localStorage.removeItem(PENDING_ROLE_KEY);
    }
  };

  const benefits = [
    { icon: <MessageSquare className="w-4 h-4" />, text: 'Submit and track complaints easily' },
    { icon: <Bot className="w-4 h-4" />, text: 'AI chatbot for instant support' },
    { icon: <BarChart3 className="w-4 h-4" />, text: 'Real-time status updates' },
    { icon: <CheckCircle2 className="w-4 h-4" />, text: 'Anonymous submission option' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div
        className="relative flex-1 flex items-center justify-center min-h-screen"
        style={{
          backgroundImage: 'url(/assets/generated/campus-bg.dim_1920x1080.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-navy-900/75 backdrop-blur-[2px]" />

        <div className="relative z-10 w-full max-w-md mx-auto px-4 py-12">
          {/* Back button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to role selection
          </button>

          {/* Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-teal-300" />
              </div>
              <h1 className="text-2xl font-display font-bold text-white mb-2">Student Login</h1>
              <p className="text-white/60 text-sm leading-relaxed">
                Sign in with your Internet Identity to access the student portal
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-2.5 mb-8">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-3 text-white/70 text-sm">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/15 border border-teal-400/20 flex items-center justify-center text-teal-300 flex-shrink-0">
                    {b.icon}
                  </div>
                  <span>{b.text}</span>
                </div>
              ))}
            </div>

            {/* Login Button */}
            <Button
              size="lg"
              onClick={handleLogin}
              disabled={isLoggingIn || isInitializing}
              className="w-full bg-teal-500 hover:bg-teal-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 gap-2.5 h-12"
            >
              {isLoggingIn || isInitializing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <GraduationCap className="w-5 h-5" />
                  Sign In as Student
                </>
              )}
            </Button>

            <p className="text-center text-white/40 text-xs mt-4">
              Secure authentication via Internet Computer
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-5 px-4 text-center">
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
