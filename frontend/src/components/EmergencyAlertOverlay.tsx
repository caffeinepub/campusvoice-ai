import React, { useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { acknowledgeEmergency } from '../lib/localComplaintStore';
import { playEmergencySiren } from '../lib/audioService';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, MapPin, User, Clock } from 'lucide-react';

export default function EmergencyAlertOverlay() {
  const { activeEmergency, setActiveEmergency, campusRole, refreshNotifications } = useAppContext();

  useEffect(() => {
    if (activeEmergency && (campusRole === 'hod' || campusRole === 'admin' || campusRole === 'staff')) {
      playEmergencySiren(5);
    }
  }, [activeEmergency, campusRole]);

  if (!activeEmergency || (campusRole !== 'hod' && campusRole !== 'admin' && campusRole !== 'staff')) {
    return null;
  }

  const handleAcknowledge = () => {
    acknowledgeEmergency(activeEmergency.id);
    setActiveEmergency(null);
    refreshNotifications();
  };

  // Access extended fields that may exist on the stored emergency object
  const extAlert = activeEmergency as any;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative bg-red-600 text-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border-4 border-red-300 animate-pulse">
        {/* Pulsing icon */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-display font-bold text-center mb-1">🚨 EMERGENCY ALERT</h2>
        <p className="text-red-100 text-center text-sm mb-6">Immediate attention required</p>

        <div className="space-y-3 bg-red-700/50 rounded-xl p-4 mb-6">
          {extAlert.studentName && (
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-red-200 flex-shrink-0" />
              <div>
                <p className="text-xs text-red-200">Student</p>
                <p className="font-semibold">{extAlert.studentName}</p>
              </div>
            </div>
          )}

          {extAlert.location && (
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-red-200 flex-shrink-0" />
              <div>
                <p className="text-xs text-red-200">Location</p>
                <p className="font-semibold">{extAlert.location}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-red-200 flex-shrink-0" />
            <div>
              <p className="text-xs text-red-200">Time</p>
              <p className="font-semibold">
                {new Date(extAlert.timestamp || Date.now()).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {extAlert.department && (
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-red-200 flex-shrink-0" />
              <div>
                <p className="text-xs text-red-200">Department</p>
                <p className="font-semibold">{extAlert.department}</p>
              </div>
            </div>
          )}
        </div>

        <Button
          onClick={handleAcknowledge}
          className="w-full bg-white text-red-600 hover:bg-red-50 font-bold gap-2 h-12"
          size="lg"
        >
          <CheckCircle className="w-5 h-5" />
          Acknowledge Alert
        </Button>
      </div>
    </div>
  );
}
