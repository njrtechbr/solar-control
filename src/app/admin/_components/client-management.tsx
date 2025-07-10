
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
  Users,
  Edit,
  Trash2,
  Building,
  User,
  List,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

import { Client, clientSchema, type Installation } from "../_lib/data";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface ClientManagementProps {
  clients: Client[];
  installations: Installation[];
  onSave: (clientData: Client) => void;
  onDelete: (clientId: number) => void;
}

const ClientDialog: React.FC<{
  client?: Client | null;
  onSave: (clientData: Client) => void;
  children: React.ReactNode;
}> = ({ client, onSave, children }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const form = useForm<Client>({
    resolver: zodResolver(clientSchema),
    defaultValues: client || {
      name: "",
      clientType: "pessoa_fisica",
      document: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset(client || {
        name: "",
        clientType: "pessoa_fisica",
        document: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
      });
    }
  }, [isOpen, client, form]);

  const handleSubmit = (values: Client) => {
    onSave(values);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {client ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
          <DialogDescription>
            {client ? "Atualize os dados do cliente." : "Preencha os dados para cadastrar um novo cliente."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="client-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4"
          >
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome / Razão Social</FormLabel>
                  <FormControl><Input placeholder="Nome completo ou razão social" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="clientType" render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Tipo de Cliente</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-x-4">
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="pessoa_fisica" /></FormControl>
                        <FormLabel className="font-normal flex items-center gap-2"><User size={16}/> Pessoa Física</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="pessoa_juridica" /></FormControl>
                        <FormLabel className="font-normal flex items-center gap-2"><Building size={16}/> Pessoa Jurídica</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField control={form.control} name="document" render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF / CNPJ</FormLabel>
                  <FormControl><Input placeholder="000.000.000-00 ou 00.000.000/0000-00" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl><Input placeholder="contato@email.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl><Input placeholder="(00) 90000-0000" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl><Input placeholder="Rua, Número, Bairro" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>Cidade</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="state" render={({ field }) => (<FormItem><FormLabel>Estado</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="zipCode" render={({ field }) => (<FormItem><FormLabel>CEP</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
          <Button type="submit" form="client-form">Salvar Cliente</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export function ClientManagement({ clients, installations, onSave, onDelete }: ClientManagementProps) {
    const [searchQuery, setSearchQuery] = React.useState("");

    const getColumns = (
        installations: Installation[]
    ): ColumnDef<Client>[] => [
        {
          accessorKey: "name",
          header: "Nome / Razão Social",
        },
        {
          accessorKey: "document",
          header: "CPF / CNPJ",
        },
        {
          accessorKey: "city",
          header: "Cidade",
          cell: ({ row }) => `${row.original.city} - ${row.original.state}`
        },
        {
          id: 'installations',
          header: "Instalações Vinculadas",
          cell: ({ row }) => {
            const client = row.original;
            const count = installations.filter(inst => inst.clientId === client.id).length;
            if (count === 0) {
              return <Badge variant="outline">Nenhuma</Badge>;
            }
            return <Link href={`/admin/installations?clientId=${client.id}`}><Badge variant="secondary" className="hover:bg-primary/10">{count} {count > 1 ? 'instalações' : 'instalação'}</Badge></Link>
          }
        },
        {
          accessorKey: "phone",
          header: "Telefone",
        },
        {
          id: "actions",
          cell: ({ row }) => {
            const client = row.original;
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <ClientDialog client={client} onSave={onSave}>
                        <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full">
                            <Edit className="mr-2 h-4 w-4" /> Editar
                        </button>
                    </ClientDialog>
                    <Link href={`/admin/installations?clientId=${client.id}`}>
                        <DropdownMenuItem>
                            <List className="mr-2 h-4 w-4" /> Ver Instalações
                        </DropdownMenuItem>
                    </Link>
                  <DropdownMenuItem onClick={() => onDelete(client.id!)} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          },
        },
    ];

  const columns = React.useMemo(() => getColumns(installations), [installations]);

  const filteredClients = React.useMemo(() => {
    return clients.filter(client =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.document.includes(searchQuery)
    );
  }, [clients, searchQuery]);

  const table = useReactTable({
    data: filteredClients,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="w-full">
        <div className="flex items-center justify-between py-4">
            <Input
              placeholder="Buscar por nome ou documento..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="max-w-sm"
            />
            <ClientDialog onSave={onSave}>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Novo Cliente
                </Button>
            </ClientDialog>
        </div>
        <div className="rounded-md border">
            <Table>
            <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                    ))}
                </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                    Nenhum cliente encontrado.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
         <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Anterior</Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Próximo</Button>
        </div>
    </div>
  );
}
