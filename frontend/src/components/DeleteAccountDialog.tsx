import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { useDeleteAccount } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Loader2, Trash2 } from 'lucide-react';

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LOCAL_STORAGE_KEYS = [
  'campusvoice_complaints',
  'campusvoice_notifications',
  'campusvoice_emergencies',
  'campusvoice_profile',
  'campusvoice_alerts',
  'complaints_metadata',
  'notifications',
  'emergencies',
  'userProfile',
];

export default function DeleteAccountDialog({ open, onOpenChange }: DeleteAccountDialogProps) {
  const { clear } = useInternetIdentity();
  const deleteAccountMutation = useDeleteAccount();
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setError(null);
    try {
      await deleteAccountMutation.mutateAsync();

      // Clear all local storage keys related to the user
      LOCAL_STORAGE_KEYS.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch {
          // ignore
        }
      });

      // Clear everything in localStorage that starts with known prefixes
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('campusvoice') || key.startsWith('complaints') || key.startsWith('notifications') || key.startsWith('emergencies'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      // Log out the user
      await clear();

      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete account. Please try again.';
      setError(message);
    }
  };

  const isPending = deleteAccountMutation.isPending;

  return (
    <AlertDialog open={open} onOpenChange={(val) => { if (!isPending) onOpenChange(val); }}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Delete Account Permanently
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">
              This action <strong>cannot be undone</strong>. Your account and all associated profile
              data will be permanently removed from the system.
            </span>
            <span className="block text-sm">
              Your submitted complaints will remain in the system for record-keeping purposes, but
              will no longer be linked to your identity.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Yes, Delete My Account
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
