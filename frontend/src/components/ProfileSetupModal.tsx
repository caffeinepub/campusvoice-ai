import React, { useState, useEffect } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { encodeUserProfile } from '../lib/userProfileHelpers';

type CampusRole = 'student' | 'hod' | 'staff' | 'admin';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<CampusRole>('student');
  const [department, setDepartment] = useState('');
  const saveProfileMutation = useSaveCallerUserProfile();

  // Pre-fill role from localStorage pending role
  useEffect(() => {
    const pendingRole = localStorage.getItem('campusvoice_pending_role') as CampusRole | null;
    if (pendingRole && ['student', 'hod', 'staff', 'admin'].includes(pendingRole)) {
      setRole(pendingRole);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    if ((role === 'hod' || role === 'staff') && !department.trim()) {
      toast.error('Please enter your department');
      return;
    }

    try {
      const encodedName = encodeUserProfile({ name: name.trim(), role, department: department.trim() });
      await saveProfileMutation.mutateAsync({
        name: encodedName,
        email: email.trim(),
      });
      localStorage.removeItem('campusvoice_pending_role');
      toast.success('Profile saved successfully!');
    } catch (error: any) {
      toast.error('Failed to save profile: ' + (error?.message || 'Unknown error'));
    }
  };

  const showDepartmentField = role === 'hod' || role === 'staff';

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Complete Your Profile</DialogTitle>
              <DialogDescription>Set up your CampusVoice account</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(val) => setRole(val as CampusRole)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="hod">Head of Department (HOD)</SelectItem>
                <SelectItem value="staff">Staff Member</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showDepartmentField && (
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                placeholder="e.g. Computer Science, Engineering"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={saveProfileMutation.isPending}
          >
            {saveProfileMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
