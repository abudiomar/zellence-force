"use client";

import React from "react";
import { DataTable, StatusBadge } from "@zellforce/ui";

const users = [
  { id: "owner", name: "Operations Owner", email: "owner@example.com", role: "owner", status: "active" },
  { id: "finance", name: "Finance Review", email: "finance@example.com", role: "finance", status: "active" }
];

export function UsersTable() {
  return (
    <DataTable
      rows={users}
      getRowId={(row) => row.id}
      columns={[
        { id: "name", header: "Name", cell: (row) => row.name, sortable: true },
        { id: "email", header: "Email", cell: (row) => <span dir="ltr">{row.email}</span> },
        { id: "role", header: "Role", cell: (row) => row.role },
        { id: "status", header: "Status", cell: (row) => <StatusBadge tone="success" label={row.status} /> }
      ]}
    />
  );
}
