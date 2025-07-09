
"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from 'next/link';
import { Link as LinkIcon, User, SunMedium, Copy, Home, Building, Bolt, FileText, Trash2, Edit, AlertTriangle, FileCheck2, PlusCircle, CheckCircle, XCircle, Clock, Sparkles, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Extended Installation type for CRM features
const installationSchema = z.object({
  id: z.number().optional(),
  clientName: z.string().min(2, "O nome do cliente é obrigatório."),
  address: z.string().min(5, "O endereço é obrigatório."),
  city: z.string().min(2, "A cidade é obrigatória."),
  state: z.string().min(2, "O estado é obrigatório."),
  zipCode: z.string().min(8, "O CEP é obrigatório."),
  installationType: z.enum(["residencial", "comercial"], {
    required_error: "Selecione o tipo de instalação.",
  }),
  utilityCompany: z.string().min(2, "O nome da concessionária é obrigatório."),
  status: z.enum(["Pendente", "Agendado", "Em Andamento", "Concluído", "Cancelado"]).default("Pendente"),
  reportSubmitted: z.boolean().default(false),
  events: z.array(z.object({
    id: z.string(),
    date: z.string(),
    type: z.string(),
    description: z.string(),
    attachments: z.array(z.object({ name: z.string(), dataUrl: z.string() })).optional(),
  })).default([]),
});

export type Installation = z.infer<typeof installationSchema>;

const initialInstallations: Installation[] = [
    { id: 1, clientName: "Condomínio Sol Nascente", address: "Rua A, 123", city: "Campinas", state: "SP", zipCode: "13000-001", installationType: "comercial", utilityCompany: "CPFL", status: "Agendado", reportSubmitted: false, events: [
      { id: '1', date: new Date(Date.now() - 86400000 * 2).toISOString(), type: 'Agendamento', description: 'Visita técnica agendada com o cliente.'}
    ] },
    { id: 2, clientName: "Maria Silva", address: "Rua B, 456", city: "São Paulo", state: "SP", zipCode: "01000-002", installationType: "residencial", utilityCompany: "Enel", status: "Concluído", reportSubmitted: true, events: [
      { id: '1', date: new Date(Date.now() - 86400000 * 5).toISOString(), type: 'Agendamento', description: 'Instalação agendada.'},
      { id: '2', date: new Date(Date.now() - 86400000 * 3).toISOString(), type: 'Problema', description: 'Atraso na entrega do inversor.'},
      { id: '3', date: new Date(Date.now() - 86400000 * 1).toISOString(), type: 'Conclusão', description: 'Instalação finalizada e comissionada com sucesso.'}
    ]},
    { id: 3, clientName: "Supermercado Economia", address: "Av. C, 789", city: "Valinhos", state: "SP", zipCode: "13270-003", installationType: "comercial", utilityCompany: "CPFL", status: "Cancelado", reportSubmitted: false, events: [
      { id: '1', date: new Date(Date.now() - 86400000 * 10).toISOString(), type: 'Nota', description: 'Cliente solicitou cancelamento por motivos financeiros.'}
    ] },
];

const createSampleReport = () => {
  return {
      clientName: "Maria Silva",
      panelPower: 550,
      strings: [
          { voltage: 450, plates: 10 },
          { voltage: 452, plates: 10 },
      ],
      phase1Neutro: 220,
      phase2Neutro: 219,
      phase1phase2: 380,
      phaseTerra: 220,
      neutroTerra: 0.5,
      cableMeterToBreaker: "16mm",
      cableBreakerToInverter: "10mm",
      generalBreaker: "63A",
      inverterBreaker: "50A",
      dataloggerConnected: true,
      observations: "Instalação realizada com sucesso, sem intercorrências. Cliente orientado sobre o monitoramento pelo aplicativo.",
      photo_uploads: [
          { dataUrl: "https://placehold.co/400x400.png", annotation: "Visão geral dos painéis" },
          { dataUrl: "https://placehold.co/400x400.png", annotation: "Inversor instalado" },
      ],
      installationVideoDataUrl: "https://placehold.co/480x360.mp4",
  };
};


export default function AdminPage() {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [editingInstallation, setEditingInstallation] = useState<Installation | null>(null);
  const [deletingInstallation, setDeletingInstallation] = useState<Installation | null>(null);
  const [linkDialog, setLinkDialog] = useState({ isOpen: false, link: "" });
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    const savedInstallations = localStorage.getItem('installations');
    const loadedInstallations = savedInstallations ? JSON.parse(savedInstallations) : initialInstallations;
    
    const sampleReportKey = 'report_Maria Silva';
    if (!localStorage.getItem(sampleReportKey)) {
        localStorage.setItem(sampleReportKey, JSON.stringify(createSampleReport()));
    }

    const updatedInstallations = loadedInstallations.map((inst: Installation) => {
        const report = localStorage.getItem(`report_${inst.clientName}`);
        return { ...inst, reportSubmitted: !!report };
    });
    setInstallations(updatedInstallations);

  }, []);

  const saveInstallations = (newInstallations: Installation[]) => {
    setInstallations(newInstallations);
    localStorage.setItem('installations', JSON.stringify(newInstallations));
  };


  const form = useForm<Installation>({
    resolver: zodResolver(installationSchema),
    defaultValues: {
      clientName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      utilityCompany: "",
      installationType: "residencial",
      status: "Pendente",
      events: [],
    },
  });
  
  const editForm = useForm<Installation>({
    resolver: zodResolver(installationSchema),
  });

  function handleCreate(values: Installation) {
    const newInstallation = { ...values, id: Date.now(), reportSubmitted: false, events: [] };
    saveInstallations([...installations, newInstallation]);
    toast({ title: "Instalação Cadastrada!", description: `Cliente ${values.clientName} adicionado.` });
    form.reset();
    setCreateDialogOpen(false);
  }
  
  function handleUpdate(values: Installation) {
    const updatedInstallations = installations.map(inst => inst.id === values.id ? values : inst)
    saveInstallations(updatedInstallations);
    toast({ title: "Instalação Atualizada!", description: `Os dados de ${values.clientName} foram salvos.` });
    setEditingInstallation(null);
  }
  
  function handleDelete() {
    if (!deletingInstallation) return;
    const updatedInstallations = installations.filter(inst => inst.id !== deletingInstallation.id)
    saveInstallations(updatedInstallations);
    localStorage.removeItem(`report_${deletingInstallation.clientName}`);
    toast({ title: "Instalação Excluída!", variant: "destructive", description: `O registro de ${deletingInstallation.clientName} foi removido.` });
    setDeletingInstallation(null);
  }

  function openEditDialog(installation: Installation) {
    setEditingInstallation(installation);
    editForm.reset(installation);
  }

  function generateLink(clientName: string) {
    const link = `${window.location.origin}/?client=${encodeURIComponent(clientName)}`;
    setLinkDialog({ isOpen: true, link });
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast({
      title: "Link copiado!",
    });
  }

  const getStatusProps = (status: Installation["status"]) => {
    switch (status) {
      case "Concluído":
        return { icon: <CheckCircle className="h-4 w-4" />, className: "bg-green-600 hover:bg-green-700" };
      case "Cancelado":
        return { icon: <XCircle className="h-4 w-4" />, className: "bg-red-600 hover:bg-red-700" };
       case "Em Andamento":
        return { icon: <Bolt className="h-4 w-4" />, className: "bg-yellow-500 hover:bg-yellow-600" };
      case "Agendado":
         return { icon: <Clock className="h-4 w-4" />, className: "bg-blue-500 hover:bg-blue-600" };
      case "Pendente":
      default:
        return { icon: <FileText className="h-4 w-4" />, className: "bg-gray-500 hover:bg-gray-600" };
    }
  };


  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-6 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <SunMedium className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold text-foreground">SolarView Pro - Admin</h1>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nova Instalação
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                 <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Cadastrar Nova Instalação
                    </DialogTitle>
                    <DialogDescription>
                      Insira os dados para criar um novo registro de instalação.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form id="create-form" onSubmit={form.handleSubmit(handleCreate)} className="space-y-4 py-4">
                        <FormField control={form.control} name="clientName" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Cliente</FormLabel>
                            <FormControl><Input placeholder="Ex: Condomínio Sol Nascente" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}/>
                        <FormField control={form.control} name="installationType" render={({ field }) => (
                          <FormItem className="space-y-2">
                              <FormLabel>Tipo de Instalação</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-x-4">
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl><RadioGroupItem value="residencial" /></FormControl>
                                    <FormLabel className="font-normal flex items-center gap-2"><Home size={16}/> Residencial</FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl><RadioGroupItem value="comercial" /></FormControl>
                                    <FormLabel className="font-normal flex items-center gap-2"><Building size={16}/> Comercial</FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                        )}/>
                         <FormField control={form.control} name="address" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Endereço</FormLabel>
                              <FormControl><Input placeholder="Rua, Número, Bairro" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}/>
                        <div className="grid grid-cols-2 gap-4">
                           <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>Cidade</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                           <FormField control={form.control} name="state" render={({ field }) => (<FormItem><FormLabel>Estado</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        </div>
                         <FormField control={form.control} name="zipCode" render={({ field }) => (
                            <FormItem>
                              <FormLabel>CEP</FormLabel>
                              <FormControl><Input placeholder="00000-000" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}/>
                         <FormField control={form.control} name="utilityCompany" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2"><Bolt size={16}/> Concessionária</FormLabel>
                            <FormControl><Input placeholder="Ex: CPFL, Enel" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}/>
                    </form>
                  </Form>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button type="submit" form="create-form">Salvar Instalação</Button>
                  </DialogFooter>
            </DialogContent>
          </Dialog>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center">
            <h2 className="text-2xl font-semibold tracking-tight">Gerenciador de Instalações</h2>
          </div>
         
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {installations.map((inst) => {
               const statusProps = getStatusProps(inst.status);
               return (
                <Card key={inst.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate pr-2">{inst.clientName}</span>
                       <Badge variant="default" className={statusProps.className}>
                          {statusProps.icon}
                          <span className="ml-1">{inst.status}</span>
                       </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 pt-1">
                      {inst.installationType === 'residencial' ? <Home size={14}/> : <Building size={14} />} 
                      {inst.city} / {inst.state}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-3">
                     <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                           <FileText size={14} /> Relatório do Instalador: 
                           {inst.reportSubmitted ? (
                                <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">Enviado</Badge>
                            ) : (
                                <Badge variant="secondary">Pendente</Badge>
                            )}
                        </div>
                     </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                           <Bolt size={14} /> Concessionária:
                           <span className="font-medium text-foreground">{inst.utilityCompany}</span>
                        </div>
                     </div>
                  </CardContent>
                  <CardFooter className="flex-col items-stretch gap-2">
                      <Link href={`/admin/installation/${inst.id}`} passHref>
                          <Button className="w-full">
                            <SlidersHorizontal className="mr-2 h-4 w-4" /> Gerenciar
                          </Button>
                      </Link>
                      <div className="grid grid-cols-3 gap-2">
                        <Button variant="secondary" onClick={() => generateLink(inst.clientName)}>
                            <LinkIcon />
                        </Button>
                         <Button variant="secondary" onClick={() => openEditDialog(inst)}>
                            <Edit />
                        </Button>
                         <Button variant="destructive" className="bg-destructive/20 text-destructive hover:bg-destructive/30" onClick={() => setDeletingInstallation(inst)}>
                            <Trash2 />
                        </Button>
                      </div>
                  </CardFooter>
                </Card>
               )
            })}
          </div>

        </main>
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={!!editingInstallation} onOpenChange={(open) => !open && setEditingInstallation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Instalação</DialogTitle>
            <DialogDescription>
              Atualize os dados da instalação para {editingInstallation?.clientName}.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form id="edit-form" onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4 py-4">
              <FormField control={editForm.control} name="clientName" render={({ field }) => (<FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={editForm.control} name="address" render={({ field }) => (<FormItem><FormLabel>Endereço</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <div className="grid grid-cols-2 gap-4">
                  <FormField control={editForm.control} name="city" render={({ field }) => (<FormItem><FormLabel>Cidade</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                  <FormField control={editForm.control} name="state" render={({ field }) => (<FormItem><FormLabel>Estado</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
              </div>
               <FormField control={editForm.control} name="status" render={({ field }) => (
                <FormItem>
                    <FormLabel>Status</FormLabel>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap gap-4 pt-2">
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Pendente" /></FormControl><FormLabel className="font-normal">Pendente</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Agendado" /></FormControl><FormLabel className="font-normal">Agendado</FormLabel></FormItem>
                         <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Em Andamento" /></FormControl><FormLabel className="font-normal">Em Andamento</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Concluído" /></FormControl><FormLabel className="font-normal">Concluído</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Cancelado" /></FormControl><FormLabel className="font-normal">Cancelado</FormLabel></FormItem>
                    </RadioGroup>
                    <FormMessage />
                </FormItem>
               )}/>

            </form>
          </Form>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit" form="edit-form">Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Alert */}
      <AlertDialog open={!!deletingInstallation} onOpenChange={(open) => !open && setDeletingInstallation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a instalação de <span className="font-bold">{deletingInstallation?.clientName}</span> e seu respectivo relatório.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Link Dialog */}
      <AlertDialog open={linkDialog.isOpen} onOpenChange={(open) => setLinkDialog(prev => ({...prev, isOpen: open}))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Link Gerado com Sucesso!</AlertDialogTitle>
            <AlertDialogDescription>
              Envie o link abaixo para o técnico responsável pela instalação.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center space-x-2 rounded-md border bg-muted p-2">
            <LinkIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <Input id="link" value={linkDialog.link} readOnly className="flex-1 bg-transparent ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 border-0" />
            <Button type="button" size="sm" className="px-3" onClick={() => copyToClipboard(linkDialog.link)}>
              <span className="sr-only">Copiar</span>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setLinkDialog({isOpen: false, link: ""})}>Fechar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
