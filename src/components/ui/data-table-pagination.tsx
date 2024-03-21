'use client'

import React from "react";
import type { Table } from "@tanstack/react-table"
import { Button } from '@nextui-org/button';
import { Icon } from '@iconify/react';
import { Select, SelectItem } from "@nextui-org/select";

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

const paginationValues = [
  { value: 10, text: "10" },
  { value: 20, text: "20" },
  { value: 30, text: "30" },
  { value: 40, text: "40" },
  { value: 50, text: "50" },
]

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  const [value, setValue] = React.useState<string>("10");

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(e.target.value);
  };

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex w-[100px] items-center justify-center text-sm font-medium">
        Page {table.getState().pagination.pageIndex + 1} of{" "}
        {table.getPageCount()}
      </div>
      <div className="flex items-center space-x-6">
        <Select
          label="Rows"
          labelPlacement="outside-left"
          selectedKeys={[value]}
          items={paginationValues}
          variant="bordered"
          onChange={handleSelectionChange}
          className="items-center"
          classNames={{
            mainWrapper: 'w-20'
          }}
        >
          {(paginationValue) => (
            <SelectItem key={paginationValue.value}>
              {paginationValue.text}
            </SelectItem>
          )}
        </Select>
        <div className="flex items-center">
          <Button
            className="hidden rounded-l-md lg:flex border-r-0"
            variant="bordered"
            onPress={() => table.setPageIndex(0)}
            isDisabled={!table.getCanPreviousPage()}
            radius="none"
            isIconOnly
          >
            <span className="sr-only">Go to first page</span>
            <Icon icon={"ant-design:double-left-outlined"} width={16} height={16} />
          </Button>
          <Button
            className="border-r-0"
            variant="bordered"
            onPress={() => table.previousPage()}
            isDisabled={!table.getCanPreviousPage()}
            radius="none"
            isIconOnly
          >
            <span className="sr-only">Go to previous page</span>
            <Icon icon={"ant-design:left-outlined"} width={16} height={16} />
          </Button>
          <Button
            className="border-r-0"
            variant="bordered"
            onPress={() => table.nextPage()}
            isDisabled={!table.getCanNextPage()}
            radius="none"
            isIconOnly
          >
            <span className="sr-only">Go to next page</span>
            <Icon icon={"ant-design:right-outlined"} width={16} height={16} />
          </Button>
          <Button
            className="hidden rounded-r-md lg:flex"
            variant="bordered"
            onPress={() => table.setPageIndex(table.getPageCount() - 1)}
            isDisabled={!table.getCanNextPage()}
            radius="none"
            isIconOnly
          >
            <span className="sr-only">Go to last page</span>
            <Icon icon={"ant-design:double-right-outlined"} width={16} height={16} />
          </Button>
        </div>

      </div>
    </div>
  )
}