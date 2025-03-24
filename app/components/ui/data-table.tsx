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
import { Input } from "./input";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  CircleDot,
  SquareStack,
  Building2,
  Cable,
  Hammer,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { Badge } from "./badge";
import { NewEntryModal } from "./new-entry-modal";
import { cn } from "@/lib/utils";

export type VanStatus =
  | "Chassis In"
  | "Walls Up"
  | "Building"
  | "Wiring"
  | "Cladding"
  | "Finishing"
  | "Not Started";

// Function to get status icon and color
function getStatusConfig(status: VanStatus): { icon: JSX.Element; color: string } {
  switch (status) {
    case "Chassis In":
      return {
        icon: <CircleDot className="h-4 w-4" />,
        color: "text-blue-500 dark:text-blue-400"
      };
    case "Walls Up":
      return {
        icon: <SquareStack className="h-4 w-4" />,
        color: "text-yellow-500 dark:text-yellow-400"
      };
    case "Building":
      return {
        icon: <Building2 className="h-4 w-4" />,
        color: "text-orange-500 dark:text-orange-400"
      };
    case "Wiring":
      return {
        icon: <Cable className="h-4 w-4" />,
        color: "text-purple-500 dark:text-purple-400"
      };
    case "Cladding":
      return {
        icon: <Hammer className="h-4 w-4" />,
        color: "text-pink-500 dark:text-pink-400"
      };
    case "Finishing":
      return {
        icon: <CheckCircle2 className="h-4 w-4" />,
        color: "text-green-500 dark:text-green-400"
      };
    default:
      return {
        icon: <CircleDot className="h-4 w-4" />,
        color: "text-gray-500 dark:text-gray-400"
      };
  }
}

export interface VanData {
  vanNumber: string;
  customerName: string;
  model: string;
  status: VanStatus;
  location: string;
}

export interface DataTableProps {
  data: VanData[];
  onVanSelect?: (vanNumber: string) => void;
}

export function DataTable({ data, onVanSelect }: DataTableProps) {
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Filter data based on search query
  const filteredData = React.useMemo(() => {
    if (!searchQuery) return data;
    
    const query = searchQuery.toLowerCase();
    return data.filter(
      (row) =>
        row.vanNumber.toLowerCase().includes(query) ||
        row.customerName.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Reset to first page when search query changes
  React.useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
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
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search van number or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[250px]"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="default"
            size="sm"
            className="text-xs"
          >
            <Plus className="h-4 w-4" />
            Add New Entry
          </Button>
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
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Van Number</TableHead>
              <TableHead>Customer Name</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No results found
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((row, index) => {
                const statusConfig = getStatusConfig(row.status);
                return (
                  <TableRow key={row.vanNumber + index} className="group">
                    <TableCell 
                      className="font-medium cursor-pointer group-hover:text-primary transition-colors group-hover:underline"
                      onClick={() => onVanSelect?.(row.vanNumber)}
                    >
                      {row.vanNumber}
                    </TableCell>
                    <TableCell 
                      className="font-medium cursor-pointer group-hover:text-primary transition-colors group-hover:underline"
                      onClick={() => onVanSelect?.(row.vanNumber)}
                    >
                      {row.customerName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="border-muted-foreground/30">{row.model}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "border-muted-foreground/30",
                            statusConfig.color
                          )}
                        >
                          <span className="flex items-center gap-1">
                            {statusConfig.icon}
                            {row.status}
                          </span>
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <NewEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => {
          console.log("Form submitted:", data);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
