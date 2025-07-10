
"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Archive, ArchiveRestore } from "lucide-react"
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Installation } from "../_lib/data"
import { cn } from "@/lib/utils"

export const getColumns = (
  onArchiveToggle: (id: number) => void
): ColumnDef<Installation>[] => [
  {
    accessorKey: "clientName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Cliente
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
        <div className="flex flex-col">
          <span className={cn("font-medium", row.original.archived && "text-muted-foreground line-through")}>
            {row.getValue("clientName")}
          </span>
          <span className="text-xs text-muted-foreground">{row.original.city} / {row.original.state}</span>
        </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Instalação",
    cell: ({ row }) => <Badge variant="secondary">{row.getValue("status")}</Badge>,
  },
  {
    accessorKey: "projectStatus",
    header: "Projeto",
    cell: ({ row }) => <Badge variant="secondary">{row.getValue("projectStatus")}</Badge>,
  },
  {
    accessorKey: "homologationStatus",
    header: "Homologação",
    cell: ({ row }) => <Badge variant="secondary">{row.getValue("homologationStatus")}</Badge>,
  },
  {
    accessorKey: "reportSubmitted",
    header: "Relatório",
    cell: ({ row }) => (
      row.original.reportSubmitted ? (
          <Badge className="bg-blue-600 hover:bg-blue-700">Enviado</Badge>
      ) : (
          <Badge variant="outline">Pendente</Badge>
      )
    ),
  },
   {
    accessorKey: "scheduledDate",
    header: "Agendamento",
    cell: ({ row }) => {
        const date = row.getValue("scheduledDate") as string;
        return date ? format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR }) : 'N/A';
    }
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const installation = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
             <Link href={`/admin/installation/${installation.id}`}>
                <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
             </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onArchiveToggle(installation.id!)}>
              {installation.archived ? <ArchiveRestore className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}
              {installation.archived ? 'Desarquivar' : 'Arquivar'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]


interface InstallationTableProps {
    data: Installation[];
    columns: ColumnDef<Installation>[];
    onSearch: (value: string) => void;
    onFilterChange: (key: keyof Installation, value: string) => void;
    onResetFilters: () => void;
    filters: { [key: string]: string };
}

export function InstallationTable({ data, columns, onSearch, onFilterChange, onResetFilters, filters }: InstallationTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Buscar por cliente ou cidade..."
          value={(filters['global'] as string) ?? ""}
          onChange={(event) => onSearch(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onResetFilters}>Limpar Filtros</Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(row.original.archived && "bg-muted/50")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} de{" "}
          {data.length} instalação(ões)
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Próximo
          </Button>
        </div>
      </div>
    </div>
  )
}
