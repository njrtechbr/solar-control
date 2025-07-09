
"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { User, SunMedium, Home, Building, Bolt, PlusCircle, LayoutDashboard, ListChecks } from "lucide-react";

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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


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
  // New fields for utility company process
  protocolNumber: z.string().optional(),
  protocolDate: z.string().optional(),
  projectStatus: z.enum(["Não Enviado", "Enviado para Análise", "Aprovado", "Reprovado"]).default("Não Enviado"),
  homologationStatus: z.enum(["Pendente", "Aprovado", "Reprovado"]).default("Pendente"),

  status: z.enum(["Pendente", "Agendado", "Em Andamento", "Concluído", "Cancelado"]).default("Pendente"),
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
});

export type Installation = z.infer<typeof installationSchema>;

export type InstallationStatus = Installation['status'];
export type ProjectStatus = Installation['projectStatus'];

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


const initialInstallations: Installation[] = [
    { 
      id: 1, 
      clientName: "Condomínio Sol Nascente", 
      address: "Rua A, 123", 
      city: "Campinas", 
      state: "SP", 
      zipCode: "13000-001", 
      installationType: "comercial", 
      utilityCompany: "CPFL",
      protocolNumber: "987654321",
      protocolDate: new Date(Date.now() - 86400000 * 10).toISOString(),
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
      ] 
    },
    { 
      id: 2, 
      clientName: "Maria Silva", 
      address: "Rua B, 456", 
      city: "São Paulo", 
      state: "SP", 
      zipCode: "01000-002", 
      installationType: "residencial", 
      utilityCompany: "Enel",
      protocolNumber: "123456789",
      protocolDate: new Date(Date.now() - 86400000 * 15).toISOString(),
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
      ]
    },
    { 
      id: 3, 
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
      documents: [] 
    },
    { 
      id: 4, 
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
      documents: [] 
    },
    { 
      id: 5, 
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
      documents: [] 
    },
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

  useEffect(() => {
    const savedInstallations = localStorage.getItem('installations');
    if (!savedInstallations) {
        localStorage.setItem('installations', JSON.stringify(initialInstallations));
    }
    
    const loadedInstallations = JSON.parse(localStorage.getItem('installations') || '[]') as Installation[];

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
      installationType: "residencial",
      status: "Pendente",
      projectStatus: "Não Enviado",
      homologationStatus: "Pendente",
      events: [],
      documents: [],
    },
  });
  
  function handleCreate(values: Installation) {
    const newInstallation = { ...values, id: Date.now(), reportSubmitted: false, events: [], documents: [], scheduledDate: undefined };
    
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
  
  const handleItemMove = (installationId: number, newStatus: string, oldStatus: string) => {
    const allInstallations = [...installations];
    const installationIndex = allInstallations.findIndex(inst => inst.id === installationId);
    if (installationIndex === -1) return;

    const installation = allInstallations[installationIndex];
    
    // Determine which status to update based on the columns
    const isProjectStatusBoard = PROCESS_STATUS_COLUMNS.some(c => c.id === newStatus || c.id === oldStatus);
    
    let eventDescription = '';
    
    if (isProjectStatusBoard) {
        if (installation.projectStatus === newStatus) return;
        installation.projectStatus = newStatus as ProjectStatus;
        eventDescription = `Status do projeto alterado de "${oldStatus}" para "${newStatus}".`;
    } else {
        if (installation.status === newStatus) return;
        installation.status = newStatus as InstallationStatus;
        eventDescription = `Status da instalação alterado de "${oldStatus}" para "${newStatus}".`;

        if (newStatus === "Agendado" && !installation.scheduledDate) {
            const scheduledDate = new Date(Date.now() + 86400000 * 7); // Schedule for 7 days from now as a default
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
    }

    // Add event
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
                        <FormField control={form.control} name="protocolNumber" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nº do Protocolo (Opcional)</FormLabel>
                              <FormControl><Input placeholder="Protocolo da Cia. de Energia" {...field} /></FormControl>
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

        <main className="flex-1 overflow-hidden p-4 md:p-6">
            <Tabs defaultValue="installation-status">
                <TabsList className="mb-4">
                    <TabsTrigger value="installation-status"><LayoutDashboard className="mr-2" />Status da Instalação</TabsTrigger>
                    <TabsTrigger value="process-status"><ListChecks className="mr-2" />Status do Processo</TabsTrigger>
                </TabsList>
                <TabsContent value="installation-status" className="h-full overflow-x-auto">
                     <div className="min-w-[1200px] h-full">
                        <KanbanBoard 
                            installations={installations} 
                            columns={INSTALLATION_STATUS_COLUMNS}
                            onItemMove={handleItemMove} 
                        />
                    </div>
                </TabsContent>
                <TabsContent value="process-status" className="h-full overflow-x-auto">
                    <div className="min-w-[900px] h-full">
                        <KanbanBoard 
                            installations={installations} 
                            columns={PROCESS_STATUS_COLUMNS}
                            onItemMove={handleItemMove} 
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </main>
      </div>
    </>
  );
}
