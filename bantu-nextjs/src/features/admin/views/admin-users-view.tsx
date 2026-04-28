"use client";

import { PageHeader } from "@/components/page-header";
import { UsersTable } from "../components/users-table";

export function AdminUsersView() {
  return (
    <div>
      <PageHeader title="User Management" className="lg:hidden" />
      <div className="space-y-6 p-4 lg:p-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-sm text-muted-foreground">
            View, search, and manage platform users
          </p>
        </div>
        <UsersTable />
      </div>
    </div>
  );
}
