import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { getEmergencies, clearEmergencies, acknowledgeEmergency } from '../lib/localComplaintStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, MapPin, User, Clock, CheckCircle2, Trash2 } from 'lucide-react';

export default function EmergencyLogsPage() {
  const { refreshNotifications } = useAppContext();
  const [emergencies, setEmergencies] = useState(() => getEmergencies());

  const handleAcknowledge = (id: string) => {
    acknowledgeEmergency(id);
    setEmergencies(getEmergencies());
    refreshNotifications();
  };

  const handleClearAll = () => {
    clearEmergencies();
    setEmergencies([]);
    refreshNotifications();
  };

  return (
    <div className="page-enter space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            Emergency Logs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {emergencies.length} emergency alert{emergencies.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
        {emergencies.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-2">
                <Trash2 className="w-4 h-4" />
                Clear All Logs
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear All Emergency Logs?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all emergency log records. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground"
                  onClick={handleClearAll}
                >
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {emergencies.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <p className="font-medium text-foreground">No emergency alerts</p>
            <p className="text-sm text-muted-foreground mt-1">
              All clear — no emergency alerts have been recorded.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {emergencies.map((alert) => (
            <Card
              key={alert.id}
              className={`border-l-4 ${alert.acknowledged ? 'border-l-emerald-500' : 'border-l-destructive'}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        className={
                          alert.acknowledged
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {alert.acknowledged ? 'Acknowledged' : 'Active'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Student</p>
                          <p className="font-medium">{alert.studentName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Location</p>
                          <p className="font-medium">{alert.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Time</p>
                          <p className="font-medium">
                            {new Date(alert.timestamp).toLocaleString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {alert.department && (
                      <p className="text-xs text-muted-foreground">
                        Department: <span className="font-medium">{alert.department}</span>
                      </p>
                    )}
                  </div>

                  {!alert.acknowledged && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 flex-shrink-0"
                      onClick={() => handleAcknowledge(alert.id)}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Acknowledge
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
