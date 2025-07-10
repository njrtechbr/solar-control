
"use client";

import { useState, useEffect, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { User, SunMedium, Home, Building, Bolt, PlusCircle, LayoutDashboard, ListChecks, FileText, CheckCircle, List, Calendar, CircuitBoard } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { KanbanBoard, KanbanColumnType } from "./_components/kanban-board";
import { InstallationTable, getColumns } from "./_components/installation-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarView } from "./_components/calendar-view";
import { Textarea } from "@/components/ui/textarea";


export const InstallationStatus = z.enum(["Pendente", "Agendado", "Em Andamento", "Concluído", "Cancelado"]);
export const ProjectStatus = z.enum(["Não Enviado", "Enviado para Análise", "Aprovado", "Reprovado"]);
export const HomologationStatus = z.enum(["Pendente", "Aprovado", "Reprovado"]);

const installationSchema = z.object({
  id: z.number().optional(),
  installationId: z.string().optional(),
  clientName: z.string().min(2, "O nome do cliente é obrigatório."),
  address: z.string().min(5, "O endereço é obrigatório."),
  city: z.string().min(2, "A cidade é obrigatória."),
  state: z.string().min(2, "O estado é obrigatório."),
  zipCode: z.string().min(8, "O CEP é obrigatório."),
  installationType: z.enum(["residencial", "comercial"], {
    required_error: "Selecione o tipo de instalação.",
  }),
  utilityCompany: z.string().min(2, "O nome da concessionária é obrigatório."),
  protocolNumber: z.string().optional(),
  protocolDate: z.string().optional(),
  
  // Equipment Details
  inverterBrand: z.string().optional(),
  inverterModel: z.string().optional(),
  inverterSerialNumber: z.string().optional(),
  inverterWarranty: z.string().optional(),
  dataloggerId: z.string().optional(),
  
  panelBrand: z.string().optional(),
  panelModel: z.string().optional(),
  panelPower: z.coerce.number().optional(),
  panelQuantity: z.coerce.number().optional(),
  
  projectStatus: ProjectStatus.default("Não Enviado"),
  homologationStatus: HomologationStatus.default("Pendente"),
  status: InstallationStatus.default("Pendente"),
  reportSubmitted: z.boolean().default(false),
  scheduledDate: z.string().optional(),
  events: z.array(z.object({
    id: z.string(),
    date: z.string(),
    type: z.string(),
    description: z.string(),
    attachments: z.array(z.object({ name: z.string(), dataUrl: z.string() })).optional(),
  })).default([]),
  documents: z.array(z.object({
    name: z.string(),
    dataUrl: z.string(),
    type: z.string(),
    date: z.string(),
  })).default([]),
  archived: z.boolean().default(false),
});

export type Installation = z.infer<typeof installationSchema>;

const INSTALLATION_STATUS_COLUMNS: KanbanColumnType[] = [
  { id: 'Pendente', title: 'Pendente' },
  { id: 'Agendado', title: 'Agendado' },
  { id: 'Em Andamento', title: 'Em Andamento' },
  { id: 'Concluído', title: 'Concluído' },
  { id: 'Cancelado', title: 'Cancelado' },
];

const PROCESS_STATUS_COLUMNS: KanbanColumnType[] = [
  { id: 'Não Enviado', title: 'Não Enviado' },
  { id: 'Enviado para Análise', title: 'Em Análise' },
  { id: 'Aprovado', title: 'Aprovado' },
  { id: 'Reprovado', title: 'Reprovado' },
];

const HOMOLOGATION_STATUS_COLUMNS: KanbanColumnType[] = [
  { id: 'Pendente', title: 'Pendente' },
  { id: 'Aprovado', title: 'Aprovado' },
  { id: 'Reprovado', title: 'Reprovado' },
];

const REPORT_STATUS_COLUMNS: KanbanColumnType[] = [
  { id: 'Enviado', title: 'Enviado' },
  { id: 'Pendente', title: 'Pendente' },
];


const initialInstallations: Installation[] = [
    { 
      id: 1, 
      installationId: "INST-001",
      clientName: "Condomínio Sol Nascente", 
      address: "Rua A, 123", 
      city: "Campinas", 
      state: "SP", 
      zipCode: "13000-001", 
      installationType: "comercial", 
      utilityCompany: "CPFL",
      protocolNumber: "987654321",
      protocolDate: new Date(Date.now() - 86400000 * 10).toISOString(),
      inverterBrand: "WEG",
      inverterModel: "SIW500H",
      inverterSerialNumber: "WEG123456",
      inverterWarranty: "5 anos",
      dataloggerId: "DTL9876",
      panelBrand: "Jinko Solar",
      panelModel: "Tiger Pro",
      panelPower: 550,
      panelQuantity: 40,
      projectStatus: "Aprovado",
      homologationStatus: "Pendente",
      status: "Agendado", 
      reportSubmitted: false, 
      scheduledDate: new Date(Date.now() + 86400000 * 3).toISOString(), 
      events: [
        { id: '1', date: new Date(Date.now() - 86400000 * 10).toISOString(), type: 'Protocolo', description: 'Protocolo 987654321 aberto na CPFL.', attachments: []},
        { id: '2', date: new Date(Date.now() - 86400000 * 9).toISOString(), type: 'Projeto', description: 'Projeto enviado para análise da concessionária.', attachments: []},
        { id: '3', date: new Date(Date.now() - 86400000 * 4).toISOString(), type: 'Projeto', description: 'Projeto aprovado pela concessionária.', attachments: []},
        { id: '4', date: new Date(Date.now() - 86400000 * 2).toISOString(), type: 'Agendamento', description: 'Visita técnica agendada com o síndico para a próxima semana.', attachments: []}
      ], 
      documents: [
        { name: 'projeto_preliminar.pdf', dataUrl: '#', type: 'application/pdf', date: new Date(Date.now() - 86400000 * 9).toISOString() }
      ],
      archived: false
    },
    { 
      id: 2, 
      installationId: "INST-002",
      clientName: "Maria Silva", 
      address: "Rua B, 456", 
      city: "São Paulo", 
      state: "SP", 
      zipCode: "01000-002", 
      installationType: "residencial", 
      utilityCompany: "Enel",
      protocolNumber: "123456789",
      protocolDate: new Date(Date.now() - 86400000 * 15).toISOString(),
      inverterBrand: "Hoymiles",
      inverterModel: "MI-1500",
      inverterSerialNumber: "HOY987654",
      inverterWarranty: "12 anos",
      dataloggerId: "DTU-W100",
      panelBrand: "Canadian Solar",
      panelModel: "HiKu6",
      panelPower: 545,
      panelQuantity: 12,
      projectStatus: "Aprovado",
      homologationStatus: "Aprovado",
      status: "Concluído", 
      reportSubmitted: true, 
      events: [
        { id: '1', date: new Date(Date.now() - 86400000 * 15).toISOString(), type: 'Protocolo', description: 'Protocolo 123456789 aberto na Enel.', attachments: []},
        { id: '2', date: new Date(Date.now() - 86400000 * 14).toISOString(), type: 'Projeto', description: 'Projeto enviado para análise.', attachments: []},
        { id: '3', date: new Date(Date.now() - 86400000 * 8).toISOString(), type: 'Projeto', description: 'Projeto Aprovado.', attachments: []},
        { id: '4', date: new Date(Date.now() - 86400000 * 5).toISOString(), type: 'Agendamento', description: 'Instalação agendada.', attachments: []},
        { id: '5', date: new Date(Date.now() - 86400000 * 3).toISOString(), type: 'Problema', description: 'Atraso na entrega do inversor. Resolvido com o fornecedor no mesmo dia.', attachments: [{ name: 'nota_fiscal_inversor.pdf', dataUrl: '#'}]},
        { id: '6', date: new Date(Date.now() - 86400000 * 1).toISOString(), type: 'Conclusão', description: 'Instalação finalizada e comissionada com sucesso.', attachments: []},
        { id: '7', date: new Date(Date.now() - 86400000 * 0).toISOString(), type: 'Homologação', description: 'Instalação homologada pela concessionária.', attachments: []}
      ], 
      documents: [
         { name: 'art_assinada.pdf', dataUrl: '#', type: 'application/pdf', date: new Date(Date.now() - 86400000 * 14).toISOString() },
         { name: 'contrato_servico.pdf', dataUrl: '#', type: 'application/pdf', date: new Date(Date.now() - 86400000 * 16).toISOString() }
      ],
      archived: false
    },
    { 
      id: 3, 
      installationId: "INST-003",
      clientName: "Supermercado Economia", 
      address: "Av. C, 789", 
      city: "Valinhos", 
      state: "SP", 
      zipCode: "13270-003", 
      installationType: "comercial", 
      utilityCompany: "CPFL",
      protocolNumber: "555555555",
      protocolDate: new Date(Date.now() - 86400000 * 12).toISOString(),
      projectStatus: "Reprovado",
      homologationStatus: "Pendente",
      status: "Cancelado", 
      reportSubmitted: false, 
      events: [
        { id: '1', date: new Date(Date.now() - 86400000 * 10).toISOString(), type: 'Nota', description: 'Cliente solicitou cancelamento por motivos financeiros. Arquivar.', attachments: []}
      ], 
      documents: [],
      archived: true,
    },
    { 
      id: 4, 
      installationId: "INST-004",
      clientName: "João Pereira", 
      address: "Rua D, 101", 
      city: "Jundiaí", 
      state: "SP", 
      zipCode: "13201-004", 
      installationType: "residencial", 
      utilityCompany: "CPFL",
      protocolNumber: "",
      protocolDate: "",
      projectStatus: "Não Enviado",
      homologationStatus: "Pendente",
      status: "Pendente", 
      reportSubmitted: false, 
      events: [], 
      documents: [],
      archived: false,
    },
    { 
      id: 5, 
      installationId: "INST-005",
      clientName: "Oficina Mecânica Veloz", 
      address: "Rua E, 202", 
      city: "Indaiatuba", 
      state: "SP", 
      zipCode: "13330-005", 
      installationType: "comercial", 
      utilityCompany: "CPFL",
      protocolNumber: "333222111",
      protocolDate: new Date(Date.now() - 86400000 * 5).toISOString(),
      projectStatus: "Enviado para Análise",
      homologationStatus: "Pendente",
      status: "Pendente", 
      reportSubmitted: false, 
      events: [], 
      documents: [],
      archived: false,
    },
];

const createSampleReport = () => {
  return {
      clientName: "Maria Silva",
      inverterBrand: "Hoymiles",
      inverterModel: "MI-1500",
      inverterSerialNumber: "HOY987654-UPDATED",
      inverterWarranty: "12 anos",
      dataloggerId: "DTU-W100-UPDATED",
      panelBrand: "Canadian Solar",
      panelModel: "HiKu6",
      panelPower: 545,
      panelQuantity: 12,
      strings: [
          { voltage: 450, plates: 6 },
          { voltage: 452, plates: 6 },
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
          { file: null, dataUrl: "https://placehold.co/600x400.png", annotation: "Visão geral dos painéis solares no telhado." },
          { file: null, dataUrl: "https://placehold.co/600x400.png", annotation: "Inversor instalado na parede da garagem." },
          { file: null, dataUrl: "https://placehold.co/600x400.png", annotation: "Teste de goteiras após a instalação." },
          { file: null, dataUrl: "https://placehold.co/600x400.png", annotation: "Fachada da residência." },
      ],
      installationVideo: null,
      installationVideoDataUrl: "",
  };
};


export default function AdminPage() {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    let savedInstallations = localStorage.getItem('installations');
    if (!savedInstallations || JSON.parse(savedInstallations).length === 0) {
        localStorage.setItem('installations', JSON.stringify(initialInstallations));
        savedInstallations = JSON.stringify(initialInstallations);
    }
    
    const loadedInstallations = JSON.parse(savedInstallations) as Installation[];

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
      protocolNumber: "",
      inverterBrand: "",
      inverterModel: "",
      inverterSerialNumber: "",
      inverterWarranty: "",
      dataloggerId: "",
      panelBrand: "",
      panelModel: "",
      panelPower: undefined,
      panelQuantity: undefined,
      installationType: "residencial",
      status: "Pendente",
      projectStatus: "Não Enviado",
      homologationStatus: "Pendente",
      reportSubmitted: false,
      events: [],
      documents: [],
      archived: false,
    },
  });
  
  function handleCreate(values: Installation) {
    const nextId = installations.length > 0 ? Math.max(...installations.map(i => i.id!)) + 1 : 1;
    const newInstallation: Installation = { 
        ...values, 
        id: nextId,
        installationId: `INST-${String(nextId).padStart(3, '0')}`,
        reportSubmitted: false, 
        events: [], 
        documents: [], 
        scheduledDate: undefined,
        status: "Pendente",
        projectStatus: "Não Enviado",
        homologationStatus: "Pendente",
        archived: false,
     };
    
    if (values.protocolNumber) {
        newInstallation.protocolDate = new Date().toISOString();
        newInstallation.events.push({
            id: new Date().toISOString(),
            date: new Date().toISOString(),
            type: "Protocolo",
            description: `Protocolo ${values.protocolNumber} aberto na ${values.utilityCompany}.`,
            attachments: [],
        });
    }

    saveInstallations([...installations, newInstallation]);
    toast({ title: "Instalação Cadastrada!", description: `Cliente ${values.clientName} adicionado.` });
    form.reset();
    setCreateDialogOpen(false);
  }
  
  const handleItemMove = (installationId: number, newStatus: string, oldStatus: string, statusType: keyof Installation) => {
    const allInstallations = [...installations];
    const installationIndex = allInstallations.findIndex(inst => inst.id === installationId);
    if (installationIndex === -1) return;

    const installation = allInstallations[installationIndex];
    
    let eventDescription = '';
    
    if (installation[statusType] === newStatus) return;

    const valueToSet: string | boolean = statusType === 'reportSubmitted' ? (newStatus === 'Enviado') : newStatus;
    (installation as any)[statusType] = valueToSet;
    eventDescription = `Status de '${statusType}' alterado de "${oldStatus}" para "${newStatus}".`;

    if (statusType === "status" && newStatus === "Agendado" && !installation.scheduledDate) {
        const scheduledDate = new Date(Date.now() + 86400000 * 7);
        installation.scheduledDate = scheduledDate.toISOString();
        const scheduleEvent = {
            id: new Date().toISOString() + "_schedule",
            date: new Date().toISOString(),
            type: 'Agendamento',
            description: `Instalação agendada para ${format(scheduledDate, "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR })}.`,
            attachments: [],
        };
        installation.events.push(scheduleEvent);
    }
    
    const newEvent = {
        id: new Date().toISOString(),
        date: new Date().toISOString(),
        type: 'Nota',
        description: eventDescription,
        attachments: [],
    };
    installation.events = [...(installation.events || []), newEvent].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    allInstallations[installationIndex] = installation;
    saveInstallations(allInstallations);
    toast({
        title: "Status Atualizado!",
        description: `${installation.clientName} movido para "${newStatus}".`
    });
  }

  const handleArchiveToggle = (id: number) => {
    const allInstallations = [...installations];
    const installationIndex = allInstallations.findIndex(inst => inst.id === id);
    if (installationIndex === -1) return;
    
    const installation = allInstallations[installationIndex];
    const isArchiving = !installation.archived;
    installation.archived = isArchiving;
    
    allInstallations[installationIndex] = installation;
    saveInstallations(allInstallations);
    toast({
      title: `Instalação ${isArchiving ? 'Arquivada' : 'Desarquivada'}!`,
      description: `O cliente ${installation.clientName} foi ${isArchiving ? 'arquivado' : 'restaurado'}.`
    });
  };

  const tableColumns = useMemo(() => getColumns(handleArchiveToggle), []);

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, global: value }));
  };

  const handleFilterChange = (key: keyof Installation, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters({});

  const filteredInstallations = useMemo(() => {
    let filtered = [...installations];
    const globalFilter = filters['global']?.toLowerCase();
    
    if (globalFilter) {
      filtered = filtered.filter(inst => 
        inst.clientName.toLowerCase().includes(globalFilter) ||
        inst.city.toLowerCase().includes(globalFilter)
      );
    }
    return filtered;
  }, [installations, filters]);

  const activeInstallations = installations.filter(inst => !inst.archived);

  return (
    <>
      <div className="flex h-screen w-full flex-col bg-muted/40">
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
            <DialogContent className="sm:max-w-lg">
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
                    <form id="create-form" onSubmit={form.handleSubmit(handleCreate)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
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
                        <FormField control={form.control} name="protocolNumber" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nº do Protocolo (Opcional)</FormLabel>
                              <FormControl><Input placeholder="Protocolo da Cia. de Energia" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}/>
                          
                        <div className="space-y-4 rounded-lg border p-4">
                          <h3 className="font-semibold flex items-center gap-2"><CircuitBoard size={16} className="text-primary"/> Detalhes do Equipamento</h3>
                          <div className="grid grid-cols-2 gap-4">
                             <FormField control={form.control} name="inverterBrand" render={({ field }) => (<FormItem><FormLabel>Marca do Inversor</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)}/>
                             <FormField control={form.control} name="inverterModel" render={({ field }) => (<FormItem><FormLabel>Modelo do Inversor</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)}/>
                             <FormField control={form.control} name="inverterSerialNumber" render={({ field }) => (<FormItem><FormLabel>Nº de Série</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)}/>
                             <FormField control={form.control} name="inverterWarranty" render={({ field }) => (<FormItem><FormLabel>Garantia</FormLabel><FormControl><Input placeholder="Ex: 5 anos" {...field} /></FormControl></FormItem>)}/>
                             <FormField control={form.control} name="dataloggerId" render={({ field }) => (<FormItem><FormLabel>ID Datalogger</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)}/>
                             <FormField control={form.control} name="panelBrand" render={({ field }) => (<FormItem><FormLabel>Marca do Painel</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)}/>
                             <FormField control={form.control} name="panelModel" render={({ field }) => (<FormItem><FormLabel>Modelo do Painel</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)}/>
                             <FormField control={form.control} name="panelPower" render={({ field }) => (<FormItem><FormLabel>Potência (Wp)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)}/>
                             <FormField control={form.control} name="panelQuantity" render={({ field }) => (<FormItem><FormLabel>Quantidade</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)}/>
                          </div>
                        </div>
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

        <main className="flex-1 overflow-hidden p-4 md:p-6">
            <Tabs defaultValue="installation-status" className="flex flex-col h-full">
                <TabsList className="mb-4 self-start flex-wrap h-auto justify-start">
                    <TabsTrigger value="installation-status"><LayoutDashboard className="mr-2 h-4 w-4" />Status da Instalação</TabsTrigger>
                    <TabsTrigger value="process-status"><ListChecks className="mr-2 h-4 w-4" />Status do Projeto</TabsTrigger>
                    <TabsTrigger value="homologation-status"><CheckCircle className="mr-2 h-4 w-4" />Status da Homologação</TabsTrigger>
                    <TabsTrigger value="report-status"><FileText className="mr-2 h-4 w-4" />Status do Relatório</TabsTrigger>
                    <TabsTrigger value="calendar-view"><Calendar className="mr-2 h-4 w-4" />Calendário</TabsTrigger>
                    <TabsTrigger value="list-view"><List className="mr-2 h-4 w-4" />Lista Completa</TabsTrigger>
                </TabsList>
                <div className="flex-grow overflow-auto">
                    <TabsContent value="installation-status" className="h-full">
                         <div className="min-w-[1200px] h-full">
                            <KanbanBoard 
                                installations={activeInstallations} 
                                columns={INSTALLATION_STATUS_COLUMNS}
                                onItemMove={handleItemMove} 
                                statusType="status"
                            />
                        </div>
                    </TabsContent>
                    <TabsContent value="process-status" className="h-full">
                        <div className="min-w-[900px] h-full">
                            <KanbanBoard 
                                installations={activeInstallations} 
                                columns={PROCESS_STATUS_COLUMNS}
                                onItemMove={handleItemMove} 
                                statusType="projectStatus"
                            />
                        </div>
                    </TabsContent>
                    <TabsContent value="homologation-status" className="h-full">
                        <div className="min-w-[700px] h-full">
                            <KanbanBoard 
                                installations={activeInstallations} 
                                columns={HOMOLOGATION_STATUS_COLUMNS}
                                onItemMove={handleItemMove} 
                                statusType="homologationStatus"
                            />
                        </div>
                    </TabsContent>
                     <TabsContent value="report-status" className="h-full">
                        <div className="min-w-[500px] h-full">
                            <KanbanBoard 
                                installations={activeInstallations} 
                                columns={REPORT_STATUS_COLUMNS}
                                onItemMove={handleItemMove} 
                                statusType="reportSubmitted"
                            />
                        </div>
                    </TabsContent>
                    <TabsContent value="calendar-view" className="h-full">
                        <CalendarView installations={installations} />
                    </TabsContent>
                    <TabsContent value="list-view" className="h-full">
                        <InstallationTable 
                            data={filteredInstallations} 
                            columns={tableColumns} 
                            onSearch={handleSearch}
                            onFilterChange={handleFilterChange}
                            onResetFilters={resetFilters}
                            filters={filters}
                        />
                    </TabsContent>
                </div>
            </Tabs>
        </main>
      </div>
    </>
  );
}
