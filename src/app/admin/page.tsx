
"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link as LinkIcon, User, SunMedium, Copy, Home, Building, Bolt, FileText, Trash2, Edit, MoreHorizontal, AlertTriangle, FileCheck2, Camera, Video, PlusCircle, CheckCircle, XCircle, Clock, Sparkles } from "lucide-react";

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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { generateFinalReport, type GenerateFinalReportInput } from "@/ai/flows/generate-report-flow";
import { Skeleton } from "@/components/ui/skeleton";

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
  status: z.enum(["Pendente", "Concluído", "Cancelado"]).default("Pendente"),
  reportSubmitted: z.boolean().default(false),
});

type Installation = z.infer<typeof installationSchema>;

const finalReportSchema = z.object({
    protocolNumber: z.string().min(1, "O número do protocolo é obrigatório."),
});

type FinalReportValues = z.infer<typeof finalReportSchema>;


const initialInstallations: Installation[] = [
    { id: 1, clientName: "Condomínio Sol Nascente", address: "Rua A, 123", city: "Campinas", state: "SP", zipCode: "13000-001", installationType: "comercial", utilityCompany: "CPFL", status: "Pendente", reportSubmitted: false },
    { id: 2, clientName: "Maria Silva", address: "Rua B, 456", city: "São Paulo", state: "SP", zipCode: "01000-002", installationType: "residencial", utilityCompany: "Enel", status: "Concluído", reportSubmitted: true },
    { id: 3, clientName: "Supermercado Economia", address: "Av. C, 789", city: "Valinhos", state: "SP", zipCode: "13270-003", installationType: "comercial", utilityCompany: "CPFL", status: "Cancelado", reportSubmitted: false },
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
          { dataUrl: "https://placehold.co/400x400.png", annotation: "Aterramento concluído" },
          { dataUrl: "https://placehold.co/400x400.png", annotation: "Etiqueta do inversor" },
      ],
      installationVideoDataUrl: "https://placehold.co/480x360.mp4", // Placeholder for video
  };
};


export default function AdminPage() {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [editingInstallation, setEditingInstallation] = useState<Installation | null>(null);
  const [deletingInstallation, setDeletingInstallation] = useState<Installation | null>(null);
  const [viewingReport, setViewingReport] = useState<any | null>(null);
  const [linkDialog, setLinkDialog] = useState({ isOpen: false, link: "" });
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [generatedFinalReport, setGeneratedFinalReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);


  useEffect(() => {
    // Load installations from localStorage on mount
    const savedInstallations = localStorage.getItem('installations');
    const loadedInstallations = savedInstallations ? JSON.parse(savedInstallations) : initialInstallations;
    
    // Check for a sample report for "Maria Silva" and create if it doesn't exist
    const sampleReportKey = 'report_Maria Silva';
    if (!localStorage.getItem(sampleReportKey)) {
        localStorage.setItem(sampleReportKey, JSON.stringify(createSampleReport()));
    }

    // Check for submitted reports
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
    },
  });
  
  const editForm = useForm<Installation>({
    resolver: zodResolver(installationSchema),
  });

  const finalReportForm = useForm<FinalReportValues>({
    resolver: zodResolver(finalReportSchema),
  });

  async function handleGenerateFinalReport(values: FinalReportValues) {
    if (!viewingReport) return;
    
    setIsGenerating(true);
    setGeneratedFinalReport(null);
    try {
        const input: GenerateFinalReportInput = {
            installerReport: JSON.stringify(viewingReport),
            protocolNumber: values.protocolNumber,
        };
        const result = await generateFinalReport(input);
        setGeneratedFinalReport(result.finalReport);

    } catch(error) {
        console.error("Error generating final report:", error);
        toast({
            title: "Erro ao Gerar Relatório",
            description: "Não foi possível gerar o relatório final. Tente novamente.",
            variant: "destructive"
        })
    } finally {
        setIsGenerating(false);
    }
  }

  function handleCreate(values: Installation) {
    const newInstallation = { ...values, id: Date.now(), reportSubmitted: false };
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
    // Also remove the report from localStorage if it exists
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

  function copyToClipboard(text: string, message: string) {
    navigator.clipboard.writeText(text);
    toast({
      title: message,
    });
  }

  function openReportDialog(clientName: string) {
    const reportData = localStorage.getItem(`report_${clientName}`);
    if (reportData) {
        setViewingReport(JSON.parse(reportData));
        setGeneratedFinalReport(null); // Reset previous generation
        finalReportForm.reset();
    } else {
        toast({
            title: "Relatório não encontrado",
            description: "O instalador ainda não enviou o relatório para este cliente.",
            variant: "destructive"
        })
    }
  }

  const getStatusProps = (status: Installation["status"]) => {
    switch (status) {
      case "Concluído":
        return { variant: "default", icon: <CheckCircle className="h-4 w-4" />, className: "bg-green-600 hover:bg-green-700" };
      case "Cancelado":
        return { variant: "destructive", icon: <XCircle className="h-4 w-4" />, className: "" };
      case "Pendente":
      default:
        return { variant: "secondary", icon: <Clock className="h-4 w-4" />, className: "" };
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
                      Insira os dados para criar um novo registro de instalação. O link para o instalador será gerado em seguida.
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
                       <Badge variant={statusProps.variant} className={statusProps.className}>
                          {statusProps.icon}
                          <span>{inst.status}</span>
                       </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 pt-1">
                      {inst.installationType === 'residencial' ? <Home size={14}/> : <Building size={14} />} 
                      {inst.city} / {inst.state}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-3">
                     <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                           <FileText size={14} /> Relatório do Instalador: 
                           {inst.reportSubmitted ? (
                                <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">Enviado</Badge>
                            ) : (
                                <Badge variant="secondary">Pendente</Badge>
                            )}
                        </div>
                     </div>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                           <Bolt size={14} /> Concessionária:
                           <span className="font-medium text-foreground">{inst.utilityCompany}</span>
                        </div>
                     </div>
                  </CardContent>
                  <CardFooter className="flex-col items-stretch gap-2">
                      {inst.reportSubmitted ? (
                        <Button className="w-full" onClick={() => openReportDialog(inst.clientName)}>
                          <FileCheck2 className="mr-2 h-4 w-4" /> Ver Relatório Completo
                        </Button>
                      ) : (
                        <Button className="w-full" variant="outline" disabled>
                          <FileCheck2 className="mr-2 h-4 w-4" /> Aguardando Relatório
                        </Button>
                      )}
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
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4 pt-2">
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Pendente" /></FormControl><FormLabel className="font-normal">Pendente</FormLabel></FormItem>
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
            <Button type="button" size="sm" className="px-3" onClick={() => copyToClipboard(linkDialog.link, "Link copiado!")}>
              <span className="sr-only">Copiar</span>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setLinkDialog({isOpen: false, link: ""})}>Fechar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       {/* View Report Dialog */}
        <Dialog open={!!viewingReport} onOpenChange={(open) => !open && setViewingReport(null)}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Relatório de Instalação - {viewingReport?.clientName}</DialogTitle>
                    <DialogDescription>Detalhes completos preenchidos pelo instalador.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] pr-6">
                {viewingReport && (
                    <div className="space-y-6 py-4 text-sm">
                        
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Informações Gerais</h3>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                <p><strong>Cliente:</strong> {viewingReport.clientName}</p>
                                <p><strong>Potência do Painel:</strong> {viewingReport.panelPower || 'N/A'} Wp</p>
                            </div>
                        </div>
                        <Separator />

                        <div>
                            <h3 className="font-semibold text-lg mb-2">Medições das Strings (VCC)</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {viewingReport.strings && viewingReport.strings.map((s: any, i: number) => (
                                    (s.voltage || s.plates) && (
                                    <div key={i} className="p-2 border rounded-md bg-muted/50">
                                        <p className="font-medium">String {i+1}</p> 
                                        <p>Tensão: {s.voltage || 'N/A'} V</p>
                                        <p>Placas: {s.plates || 'N/A'}</p>
                                    </div>
                                    )
                                ))}
                            </div>
                        </div>
                         <Separator />

                        <div>
                            <h3 className="font-semibold text-lg mb-2">Medições Elétricas (CA)</h3>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                                <p><strong>F1 x N:</strong> {viewingReport.phase1Neutro || 'N/A'} V</p>
                                <p><strong>F2 x N:</strong> {viewingReport.phase2Neutro || 'N/A'} V</p>
                                <p><strong>F3 x N:</strong> {viewingReport.phase3Neutro || 'N/A'} V</p>
                                <p><strong>F1 x F2:</strong> {viewingReport.phase1phase2 || 'N/A'} V</p>
                                <p><strong>F1 x F3:</strong> {viewingReport.phase1phase3 || 'N/A'} V</p>
                                <p><strong>F2 x F3:</strong> {viewingReport.phase2phase3 || 'N/A'} V</p>
                                <p><strong>Fase x Terra:</strong> {viewingReport.phaseTerra || 'N/A'} V</p>
                                <p><strong>Neutro x Terra:</strong> {viewingReport.neutroTerra || 'N/A'} V</p>
                            </div>
                        </div>
                         <Separator />
                        
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Componentes e Cabeamento</h3>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                                <p><strong>Cabo Medidor x Disjuntor:</strong> {viewingReport.cableMeterToBreaker || 'N/A'}</p>
                                <p><strong>Cabo Disjuntor x Inversor:</strong> {viewingReport.cableBreakerToInverter || 'N/A'}</p>
                                <p><strong>Disjuntor Geral:</strong> {viewingReport.generalBreaker || 'N/A'}</p>
                                <p><strong>Disjuntor Inversor:</strong> {viewingReport.inverterBreaker || 'N/A'}</p>
                            </div>
                        </div>
                        <Separator />
                        
                         <div>
                            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Camera /> Documentação Fotográfica</h3>
                             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {viewingReport.photo_uploads && viewingReport.photo_uploads.map((photo: any, index: number) => (
                                    photo.dataUrl && (
                                        <div key={index} className="space-y-1">
                                            <a href={photo.dataUrl} target="_blank" rel="noopener noreferrer">
                                                <img src={photo.dataUrl} alt={photo.annotation || `Foto ${index + 1}`} className="rounded-md object-cover aspect-square hover:opacity-80 transition-opacity" />
                                            </a>
                                            <p className="text-xs text-muted-foreground truncate">{photo.annotation || `Foto ${index + 1}`}</p>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                        <Separator />

                        <div>
                            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Video /> Vídeo da Instalação</h3>
                            {viewingReport.installationVideoDataUrl ? (
                                <video src={viewingReport.installationVideoDataUrl} controls className="w-full rounded-md" />
                            ) : (
                                <p>Nenhum vídeo enviado.</p>
                            )}
                        </div>
                        <Separator />

                        <div>
                            <h3 className="font-semibold text-lg mb-2">Verificação Final</h3>
                            <p><strong>Datalogger Online:</strong> {viewingReport.dataloggerConnected ? 'Sim' : 'Não'}</p>
                            {viewingReport.observations && (
                                <>
                                    <p className="font-medium mt-2">Observações:</p>
                                    <p className="p-2 border rounded-md bg-muted/50 whitespace-pre-wrap">{viewingReport.observations}</p>
                                </>
                            )}
                        </div>

                         <Separator />
                        <div className="space-y-4 pt-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2"><Sparkles className="text-primary"/>Gerador de Relatório Final</h3>
                            <Form {...finalReportForm}>
                                <form onSubmit={finalReportForm.handleSubmit(handleGenerateFinalReport)} className="space-y-4">
                                    <FormField control={finalReportForm.control} name="protocolNumber" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Número de Protocolo</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Insira o número do protocolo" {...field}/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}/>
                                    <Button type="submit" disabled={isGenerating}>
                                        {isGenerating ? "Gerando..." : "Gerar Relatório Final com IA"}
                                    </Button>
                                </form>
                            </Form>
                            {isGenerating && (
                                <div className="space-y-2 pt-4">
                                    <Skeleton className="h-4 w-1/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            )}
                            {generatedFinalReport && (
                                <div className="space-y-2 pt-4">
                                    <div className="flex justify-between items-center">
                                       <h4 className="font-semibold">Relatório Final Gerado</h4>
                                       <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedFinalReport, "Relatório copiado!")}>
                                            <Copy className="mr-2 h-4 w-4"/>
                                            Copiar
                                       </Button>
                                    </div>
                                    <p className="p-4 border rounded-md bg-muted/50 whitespace-pre-wrap">{generatedFinalReport}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                </ScrollArea>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Fechar</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
}

    