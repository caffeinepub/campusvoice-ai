import React, { useState, useEffect } from 'react';
import { useCreateDepartment, useUpdateDepartment } from '../hooks/useQueries';
import { type Department } from '../backend';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface DepartmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: Department | null;
}

export default function DepartmentFormDialog({
  open,
  onOpenChange,
  department,
}: DepartmentFormDialogProps) {
  const isEdit = !!department;
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (open) {
      setName(department?.name ?? '');
      setDescription(department?.description ?? '');
    }
  }, [open, department]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Department name is required');
      return;
    }
    if (!description.trim()) {
      toast.error('Department description is required');
      return;
    }

    try {
      if (isEdit && department) {
        await updateMutation.mutateAsync({
          id: department.id,
          name: name.trim(),
          description: description.trim(),
          headOfDepartment: department.headOfDepartment ?? null,
        });
        toast.success('Department updated successfully');
      } else {
        // Generate a unique ID based on timestamp
        const newId = BigInt(Date.now());
        await createMutation.mutateAsync({
          id: newId,
          name: name.trim(),
          description: description.trim(),
          headOfDepartment: null,
        });
        toast.success('Department created successfully');
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save department');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!isPending) onOpenChange(val); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>{isEdit ? 'Edit Department' : 'Create Department'}</DialogTitle>
              <DialogDescription>
                {isEdit ? 'Update the department details below.' : 'Fill in the details to create a new department.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dept-name">Department Name <span className="text-destructive">*</span></Label>
            <Input
              id="dept-name"
              placeholder="e.g. Computer Science"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dept-description">Description <span className="text-destructive">*</span></Label>
            <Textarea
              id="dept-description"
              placeholder="Brief description of the department..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
              disabled={isPending}
              required
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEdit ? 'Update Department' : 'Create Department'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
