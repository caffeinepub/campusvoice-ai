import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { encodeProfile } from '../lib/userProfileHelpers';
import { DEPARTMENTS } from '../constants/complaintCategories';
import { CAMPUS_ROLE_LABELS, type CampusRole } from '../constants/appRoles';
import { GraduationCap, Loader2 } from 'lucide-react';

interface ProfileSetupModalProps {
  open: boolean;
}

export default function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [campusRole, setCampusRole] = useState<CampusRole>('student');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');

  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!displayName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if ((campusRole === 'staff' || campusRole === 'hod') && !department) {
      setError('Please select your department.');
      return;
    }

    try {
      const profile = encodeProfile({
        displayName: displayName.trim(),
        email: email.trim(),
        campusRole,
        department: department || '',
      });
      await saveProfile.mutateAsync(profile);
    } catch {
      setError('Failed to save profile. Please try again.');
    }
  };

  const needsDepartment = campusRole === 'staff' || campusRole === 'hod';

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-display">Welcome to CampusVoice AI</DialogTitle>
              <DialogDescription className="text-sm">Set up your profile to get started</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="displayName">Full Name</Label>
            <Input
              id="displayName"
              placeholder="e.g., Priya Sharma"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role">Your Role</Label>
            <Select value={campusRole} onValueChange={(v) => setCampusRole(v as CampusRole)}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(CAMPUS_ROLE_LABELS) as [CampusRole, string][]).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {needsDepartment && (
            <div className="space-y-1.5">
              <Label htmlFor="department">Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {campusRole === 'student' && (
            <div className="space-y-1.5">
              <Label htmlFor="dept-student">Department / Program</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger id="dept-student">
                  <SelectValue placeholder="Select your program" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={saveProfile.isPending}>
            {saveProfile.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Complete Setup'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
