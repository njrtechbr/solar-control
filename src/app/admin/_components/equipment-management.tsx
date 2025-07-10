
"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  MoreHorizontal,
  PlusCircle,
  HardDrive,
  CircuitBoard,
  PanelTop,
  Edit,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

import { Inverter, Panel } from "../_lib/data";

interface EquipmentManagementProps {
  inverters: Inverter[];
  panels: Panel[];
}

const InverterColumns: ColumnDef<Inverter>[] = [
    { accessorKey: "brand", header: "Marca" },
    { accessorKey: "model", header: "Modelo" },
    { accessorKey: "serialNumber", header: "Nº de Série" },
    { accessorKey: "dataloggerId", header: "ID Datalogger" },
    { accessorKey: "warranty", header: "Garantia" },
    // In a real app, you would have a cell to show which client/installation it's assigned to.
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled><Edit className="mr-2 h-4 w-4" /> Editar (Em breve)</DropdownMenuItem>
            <DropdownMenuItem disabled className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Excluir (Em breve)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
];

const PanelColumns: ColumnDef<Panel>[] = [
    { accessorKey: "brand", header: "Marca" },
    { accessorKey: "model", header: "Modelo" },
    { accessorKey: "power", header: "Potência (Wp)" },
    { accessorKey: "quantity", header: "Quantidade" },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled><Edit className="mr-2 h-4 w-4" /> Editar (Em breve)</DropdownMenuItem>
            <DropdownMenuItem disabled className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Excluir (Em breve)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
];

export function EquipmentManagement({ inverters, panels }: EquipmentManagementProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredInverters = React.useMemo(() => 
    inverters.filter(inv => 
      inv.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.model?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [inverters, searchQuery]);

  const filteredPanels = React.useMemo(() => 
    panels.filter(p => 
      p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.model?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [panels, searchQuery]);

  const inverterTable = useReactTable({
    data: filteredInverters,
    columns: InverterColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  
  const panelTable = useReactTable({
    data: filteredPanels,
    columns: PanelColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Tabs defaultValue="inverters" className="w-full">
      <div className="flex items-center justify-between py-4">
        <TabsList>
          <TabsTrigger value="inverters" className="flex items-center gap-2"><CircuitBoard size={16}/>Inversores</TabsTrigger>
          <TabsTrigger value="panels" className="flex items-center gap-2"><PanelTop size={16}/>Painéis Solares</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-4">
            <Input
              placeholder="Buscar equipamento..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="max-w-sm"
            />
             <Button disabled>
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Equipamento (Em breve)
            </Button>
        </div>
      </div>
      <TabsContent value="inverters">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {inverterTable.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {inverterTable.getRowModel().rows?.length ? (
                inverterTable.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={InverterColumns.length} className="h-24 text-center">Nenhum inversor encontrado.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm" onClick={() => inverterTable.previousPage()} disabled={!inverterTable.getCanPreviousPage()}>Anterior</Button>
            <Button variant="outline" size="sm" onClick={() => inverterTable.nextPage()} disabled={!inverterTable.getCanNextPage()}>Próximo</Button>
        </div>
      </TabsContent>
      <TabsContent value="panels">
         <div className="rounded-md border">
          <Table>
            <TableHeader>
              {panelTable.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {panelTable.getRowModel().rows?.length ? (
                panelTable.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={PanelColumns.length} className="h-24 text-center">Nenhum painel encontrado.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
         <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm" onClick={() => panelTable.previousPage()} disabled={!panelTable.getCanPreviousPage()}>Anterior</Button>
            <Button variant="outline" size="sm" onClick={() => panelTable.nextPage()} disabled={!panelTable.getCanNextPage()}>Próximo</Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}
