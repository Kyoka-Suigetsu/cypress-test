"use client";

import { type ColumnDef } from "@tanstack/react-table";
import DeleteUserModal from "./delete-user-modal";
import EditUserModal from "./edit-user-modal";

export type User = {
  id: string;
  name: string;
  email: string;
  role: "MANAGER" | "PARTICIPANT" | "ADMIN";
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    id: "actions",
    cell: ({ row: { original } }) => {
      return (
        <div>
          <EditUserModal user={original} />
          <DeleteUserModal user={original} />
        </div>
      );
    },
  },
];
