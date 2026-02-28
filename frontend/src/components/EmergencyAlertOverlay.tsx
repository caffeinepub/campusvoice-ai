import React, { useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { acknowledgeEmergency } from '../lib/localComplaintStore';
import { playEmergencySiren } from '../lib/audioService';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, MapPin, User, Clock } from 'lucide-react';

export default function EmergencyAlertOverlay() {
  const { activeEmergency, setActiveEmergency, campusRole, refreshNotifications } = useAppContext();

  useEffect(() => {
    if (activeEmergency && (campusRole === 'hod' || campusRole === 'admin')) {
      playEmergencySiren(5);
    }
  }, [activeEmergency, campusRole]);

  if (!activeEmergency || (campusRole !== 'hod' && campusRole !== 'admin')) return null;

  const handleAcknowledge = () => {
    acknowledgeEmergency(activeEmergency.id);
    setActiveEmergency(null);
    refreshNotifications();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-emergency-flash">
      <div className="relative bg-red-600 text-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border-4 border-red-300">
        {/* Pulsing icon */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center animate-pulse-ring">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-display font-bold text-center mb-1">🚨 EMERGENCY ALERT</h2>
        <p className="text-red-100 text-center text-sm mb-6">Immediate attention required</p>

        <div className="space-y-3 bg-red-700/50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-red-200 flex-shrink-0" />
            <div>
              <p className="text-xs text-red-200">Student</p>
              <p className="font-semibold">{activeEmergency.studentName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-red-200 flex-shrink-0" />
            <div>
              <p className="text-xs text-red-200">Location</p>
              <p className="font-semibold">{activeEmergency.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-red-200 flex-shrink-0" />
            <div>
              <p className="text-xs text-red-200">Time</p>
              <p className="font-semibold">
                {new Date(activeEmergency.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
          {activeEmergency.department && (
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-red-200 flex-shrink-0" />
              <div>
                <p className="text-xs text-red-200">Department</p>
                <p className="font-semibold">{activeEmergency.department}</p>
              </div>
            </div>
          )}
        </div>

        <Button
          onClick={handleAcknowledge}
          className="w-full bg-white text-red-600 hover:bg-red-50 font-bold gap-2"
          size="lg"
        >
          <CheckCircle className="w-5 h-5" />
          Acknowledge & Dismiss
        </Button>
      </div>
    </div>
  );
}
