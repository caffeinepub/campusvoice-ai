import React from 'react';
import { useDeleteDepartment } from '../hooks/useQueries';
import { type Department } from '../backend';
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
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeleteDepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: Department;
}

export default function DeleteDepartmentDialog({
  open,
  onOpenChange,
  department,
}: DeleteDepartmentDialogProps) {
  const deleteMutation = useDeleteDepartment();

  const handleConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(department.id);
      toast.success(`Department "${department.name}" deleted`);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete department');
    }
  };

  const isPending = deleteMutation.isPending;

  return (
    <AlertDialog open={open} onOpenChange={(val) => { if (!isPending) onOpenChange(val); }}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Delete Department
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">
              Are you sure you want to delete{' '}
              <strong className="text-foreground">"{department.name}"</strong>?
            </span>
            <span className="block text-sm">
              This action <strong>cannot be undone</strong>. Users assigned to this department will
              no longer have a department association.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

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
                Delete Department
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
