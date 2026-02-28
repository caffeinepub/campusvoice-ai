import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function UserManagementPage() {
  return (
    <div className="page-enter space-y-5">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          User Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage campus users and their roles.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registered Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-foreground">User management via ICP</p>
            <p className="text-sm mt-1 max-w-sm mx-auto">
              Users are authenticated via Internet Identity. User profiles are stored on-chain and managed through the decentralized backend.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
