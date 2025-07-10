
"use client";

import * as React from "react";
import Link from 'next/link';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  MoreHorizontal,
  PlusCircle,
  HardDrive,
  CircuitBoard,
  PanelTop,
  Edit,
  Trash2,
  CheckCircle,
  Warehouse,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { Inverter, Panel, inverterSchema, panelSchema, type Installation } from "../_lib/data";


const EquipmentDialog: React.FC<{
  type: "inverter" | "panel";
  equipment?: Inverter | Panel | null;
  onSave: (data: Inverter | Panel) => void;
  children: React.ReactNode;
}> = ({ type, equipment, onSave, children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const schema = type === 'inverter' ? inverterSchema : panelSchema;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  React.useEffect(() => {
    if (isOpen) {
      const defaultValues = type === 'inverter' 
        ? { brand: "", model: "", serialNumber: "", warranty: "", dataloggerId: "" }
        : { brand: "", model: "", power: 0, quantity: 0 };
      form.reset(equipment || defaultValues);
    }
  }, [isOpen, equipment, form, type]);

  const handleSubmit = (values: z.infer<typeof schema>) => {
    onSave(values);
    setIsOpen(false);
  };
  
  const title = type === 'inverter' ? 'Inversor' : 'Painel Solar';
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            {equipment ? `Editar ${title}` : `Novo ${title}`}
          </DialogTitle>
           <DialogDescription>
            {equipment ? "Atualize os dados do equipamento." : `Preencha os dados para cadastrar um novo ${title.toLowerCase()}.`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form id="equipment-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                {type === 'inverter' && (
                    <>
                        <FormField control={form.control} name="brand" render={({ field }) => (<FormItem><FormLabel>Marca</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)} />
                        <FormField control={form.control} name="model" render={({ field }) => (<FormItem><FormLabel>Modelo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)} />
                        <FormField control={form.control} name="serialNumber" render={({ field }) => (<FormItem><FormLabel>Nº de Série</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)} />
                        <FormField control={form.control} name="warranty" render={({ field }) => (<FormItem><FormLabel>Garantia</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)} />
                        <FormField control={form.control} name="dataloggerId" render={({ field }) => (<FormItem><FormLabel>ID Datalogger</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)} />
                    </>
                )}
                {type === 'panel' && (
                     <>
                        <FormField control={form.control} name="brand" render={({ field }) => (<FormItem><FormLabel>Marca</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)} />
                        <FormField control={form.control} name="model" render={({ field }) => (<FormItem><FormLabel>Modelo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)} />
                        <FormField control={form.control} name="power" render={({ field }) => (<FormItem><FormLabel>Potência (Wp)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>)} />
                        <FormField control={form.control} name="quantity" render={({ field }) => (<FormItem><FormLabel>Quantidade</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>)} />
                    </>
                )}
            </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
          <Button type="submit" form="equipment-form">Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


interface EquipmentManagementProps {
  inverters: Inverter[];
  panels: Panel[];
  installations: Installation[];
  onSaveInverter: (data: Inverter) => void;
  onSavePanel: (data: Panel) => void;
  onDeleteInverter: (id: string) => void;
  onDeletePanel: (id: string) => void;
}

export function EquipmentManagement({ 
    inverters, panels, installations, onSaveInverter, onSavePanel, onDeleteInverter, onDeletePanel 
}: EquipmentManagementProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  
  const inverterInstallationMap = React.useMemo(() => {
    const map = new Map<string, Installation>();
    installations.forEach(inst => {
      inst.inverters?.forEach(inv => {
        map.set(inv.id!, inst);
      });
    });
    return map;
  }, [installations]);

  const panelInstallationMap = React.useMemo(() => {
    const map = new Map<string, Installation>();
    installations.forEach(inst => {
      inst.panels?.forEach(panel => {
        map.set(panel.id!, inst);
      });
    });
    return map;
  }, [installations]);

  const getInverterColumns = (onSave: (data: Inverter) => void, onDelete: (id: string) => void): ColumnDef<Inverter>[] => [
    { accessorKey: "brand", header: "Marca" },
    { accessorKey: "model", header: "Modelo" },
    { accessorKey: "serialNumber", header: "Nº de Série" },
    { id: "allocation", header: "Alocado Em", cell: ({ row }) => {
        const installation = inverterInstallationMap.get(row.original.id!);
        if (!installation) {
            return <Badge variant="secondary" className="flex items-center gap-1.5"><Warehouse size={14}/>Disponível em estoque</Badge>;
        }
        return (
            <Link href={`/admin/installation/${installation.id}`}>
                <Badge variant="outline" className="hover:bg-primary/10">{installation.clientName} ({installation.city})</Badge>
            </Link>
        );
    }},
    { accessorKey: "warranty", header: "Garantia" },
    {
      id: "actions",
      cell: ({ row }) => {
          const inverter = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                 <EquipmentDialog type="inverter" equipment={inverter} onSave={onSave}>
                    <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full">
                        <Edit className="mr-2 h-4 w-4" /> Editar
                    </button>
                </EquipmentDialog>
                <DropdownMenuItem onClick={() => onDelete(inverter.id!)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
      },
    },
  ];

  const getPanelColumns = (onSave: (data: Panel) => void, onDelete: (id: string) => void): ColumnDef<Panel>[] => [
    { accessorKey: "brand", header: "Marca" },
    { accessorKey: "model", header: "Modelo" },
    { accessorKey: "power", header: "Potência (Wp)" },
    { id: "allocation", header: "Alocado Em", cell: ({ row }) => {
        const installation = panelInstallationMap.get(row.original.id!);
         if (!installation) {
            return <Badge variant="secondary" className="flex items-center gap-1.5"><Warehouse size={14}/>Disponível em estoque</Badge>;
        }
        return (
            <Link href={`/admin/installation/${installation.id}`}>
                <Badge variant="outline" className="hover:bg-primary/10">{installation.clientName} ({installation.city})</Badge>
            </Link>
        );
    }},
    { accessorKey: "quantity", header: "Quantidade" },
    {
      id: "actions",
      cell: ({ row }) => {
          const panel = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <EquipmentDialog type="panel" equipment={panel} onSave={onSave}>
                     <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full">
                        <Edit className="mr-2 h-4 w-4" /> Editar
                    </button>
                </EquipmentDialog>
                <DropdownMenuItem onClick={() => onDelete(panel.id!)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
      },
    },
  ];
  
  const inverterColumns = React.useMemo(() => getInverterColumns(onSaveInverter, onDeleteInverter), [inverterInstallationMap]);
  const panelColumns = React.useMemo(() => getPanelColumns(onSavePanel, onDeletePanel), [panelInstallationMap]);

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
    columns: inverterColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  
  const panelTable = useReactTable({
    data: filteredPanels,
    columns: panelColumns,
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
        </div>
      </div>
      <TabsContent value="inverters">
        <div className="flex justify-end mb-4">
             <EquipmentDialog type="inverter" onSave={onSaveInverter}>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Novo Inversor</Button>
             </EquipmentDialog>
        </div>
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
                <TableRow><TableCell colSpan={inverterColumns.length} className="h-24 text-center">Nenhum inversor encontrado.</TableCell></TableRow>
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
        <div className="flex justify-end mb-4">
            <EquipmentDialog type="panel" onSave={onSavePanel}>
                 <Button><PlusCircle className="mr-2 h-4 w-4" /> Novo Painel</Button>
            </EquipmentDialog>
        </div>
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
                <TableRow><TableCell colSpan={panelColumns.length} className="h-24 text-center">Nenhum painel encontrado.</TableCell></TableRow>
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
