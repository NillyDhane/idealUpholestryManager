"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Button } from "./button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Badge } from "./badge";

export type VanStatus =
  | "Chassis In"
  | "Walls Up"
  | "Building"
  | "Wiring"
  | "Cladding"
  | "Finishing";

export interface VanData {
  vanNumber: string;
  customerName: string;
  model: string;
  status: VanStatus;
}

interface DataTableProps {
  data: VanData[];
}

const getStatusColor = (status: VanStatus) => {
  switch (status) {
    case "Chassis In":
      return "bg-slate-500 hover:bg-slate-500/80";
    case "Walls Up":
      return "bg-blue-500 hover:bg-blue-500/80";
    case "Building":
      return "bg-yellow-500 hover:bg-yellow-500/80";
    case "Wiring":
      return "bg-purple-500 hover:bg-purple-500/80";
    case "Cladding":
      return "bg-orange-500 hover:bg-orange-500/80";
    case "Finishing":
      return "bg-green-500 hover:bg-green-500/80";
    default:
      return "bg-gray-500 hover:bg-gray-500/80";
  }
};

export function DataTable({ data }: DataTableProps) {
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page</span>
          <Select
            value={rowsPerPage.toString()}
            onValueChange={(value) => {
              setRowsPerPage(parseInt(value));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="40">40</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Van Number</TableHead>
              <TableHead>Customer Name</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((row, index) => (
              <TableRow key={row.vanNumber + index}>
                <TableCell className="font-medium">{row.vanNumber}</TableCell>
                <TableCell>{row.customerName}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{row.model}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(row.status)}>
                    {row.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
