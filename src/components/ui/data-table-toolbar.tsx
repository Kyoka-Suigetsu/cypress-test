"use client";

import { type Table } from "@tanstack/react-table";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Icon } from "@iconify/react";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center space-x-2 bg-content1 rounded-sm px-2 mt-4">
      <Input
        placeholder="Filter..."
        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("name")?.setFilterValue(event.target.value)
        }
        size="sm"
        variant="underlined"
        className="group w-full lg:w-1/3"
        endContent={<Icon icon="carbon:search" height={20} className="opacity-50 group-focus-within:opacity-100" />}
      />

      {isFiltered && (
        <Button
          radius="sm"
          variant="ghost"
          onClick={() => table.resetColumnFilters()}
          className="h-8 px-2 lg:px-3"
        >
          Reset
        </Button>
      )}
    </div>
  );
}
