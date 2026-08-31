"use client";

import React from "react";
import { StatusBadge } from "@zellforce/ui/components/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@zellforce/ui/components/table";

const users = [
  { id: "owner", name: "Operations Owner", email: "owner@example.com", role: "owner", status: "active" },
  { id: "finance", name: "Finance Review", email: "finance@example.com", role: "finance", status: "active" }
];

export function UsersTable() {
  return (
    <div className="table-shell">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.name}</TableCell>
              <TableCell><span dir="ltr">{row.email}</span></TableCell>
              <TableCell>{row.role}</TableCell>
              <TableCell><StatusBadge tone="success" label={row.status} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
