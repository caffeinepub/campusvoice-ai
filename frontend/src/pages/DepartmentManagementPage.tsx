import React, { useState } from 'react';
import { useListDepartments } from '../hooks/useQueries';
import { type Department } from '../backend';
import DepartmentFormDialog from '../components/DepartmentFormDialog';
import DeleteDepartmentDialog from '../components/DeleteDepartmentDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Plus, Pencil, Trash2 } from 'lucide-react';

export default function DepartmentManagementPage() {
  const { data: departments, isLoading } = useListDepartments();
  const [formOpen, setFormOpen] = useState(false);
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [deleteDept, setDeleteDept] = useState<Department | null>(null);

  const handleEdit = (dept: Department) => {
    setEditDept(dept);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditDept(null);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditDept(null);
  };

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            Department Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create and manage academic departments in the system.
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Department
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading ? '—' : (departments?.length ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Departments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading ? '—' : (departments?.filter((d) => d.headOfDepartment).length ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground">With HOD Assigned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading ? '—' : (departments?.filter((d) => !d.headOfDepartment).length ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground">Without HOD</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Departments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : !departments || departments.length === 0 ? (
            <div className="py-16 text-center">
              <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No departments yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Click "Add Department" to create the first one.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead>HOD Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept) => (
                  <TableRow key={dept.id.toString()}>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm max-w-xs truncate">
                      {dept.description || '—'}
                    </TableCell>
                    <TableCell>
                      {dept.headOfDepartment ? (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Assigned
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Unassigned
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(dept)}
                          title="Edit department"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteDept(dept)}
                          title="Delete department"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <DepartmentFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        department={editDept}
      />

      {deleteDept && (
        <DeleteDepartmentDialog
          open={!!deleteDept}
          onOpenChange={(open) => { if (!open) setDeleteDept(null); }}
          department={deleteDept}
        />
      )}
    </div>
  );
}
