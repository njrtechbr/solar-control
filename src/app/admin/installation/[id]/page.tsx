
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, isPast, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
    ArrowLeft, Building, Home, MapPin, Plus, Paperclip, AlertCircle, Wrench, Calendar as CalendarIcon, 
    MessageSquare, Check, Sparkles, Copy, FileCheck2, Video, Bolt, Clock, CheckCircle, XCircle, FileText, 
    Activity, FileJson, Files, Upload, Hourglass, Send, ThumbsUp, ThumbsDown, Archive, ArchiveRestore, 
    Link as LinkIcon, Printer, CircuitBoard, Trash2, Edit, Save 
} from "lucide-react";
import Link from "next/link";

import { 
    type Installation, InstallationStatus, ProjectStatus, HomologationStatus, 
    type Inverter, type Panel, inverterSchema, panelSchema, initialInverters, initialPanels
} from "@/app/admin/_lib/data";
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { generateFinalReport, type GenerateFinalReportInput } from "@/ai/flows/generate-report-flow";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";


const eventSchema = z.object({
  type: z.string().min(1, "O tipo de evento é obrigatório."),
  description: z.string().min(1, "A descrição é obrigatória."),
  date: z.date({ required_error: "A data é obrigatória." }),
  attachments: z.any().optional(),
});
type EventValues = z.infer<typeof eventSchema>;

const scheduleSchema = z.object({
    date: z.date({ required_error: "A data é obrigatória." }),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:mm).").optional(),
    notes: z.string().optional(),
});
type ScheduleValues = z.infer<typeof scheduleSchema>;

const documentSchema = z.object({
    files: z.any().refine(files => files?.length > 0, "Selecione pelo menos um arquivo."),
});
type DocumentValues = z.infer<typeof documentSchema>;


const EVENT_TYPES = [
  { value: "Agendamento", label: "Agendamento", icon: CalendarIcon },
  { value: "Problema", label: "Problema Encontrado", icon: AlertCircle },
  { value: "Nota", label: "Nota Interna", icon: MessageSquare },
  { value: "Vistoria", label: "Vistoria Técnica", icon: Wrench },
  { value: "Conclusão", label: "Etapa Concluída", icon: Check },
  { value: "Protocolo", label: "Protocolo", icon: FileText },
  { value: "Projeto", label: "Projeto", icon: FileCheck2 },
  { value: "Homologação", label: "Homologação", icon: CheckCircle },
];

const AllocateEquipmentDialog: React.FC<{
  installation: Installation;
  onSave: (updatedInstallation: Installation) => void;
}> = ({ installation, onSave }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [availableInverters, setAvailableInverters] = useState<Inverter[]>([]);
    const [availablePanels, setAvailablePanels] = useState<Panel[]>([]);
    const [selectedInverters, setSelectedInverters] = useState<string[]>([]);
    const [selectedPanels, setSelectedPanels] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            // Load all installations to find out which equipment is already allocated
            const allInstallations: Installation[] = JSON.parse(localStorage.getItem('installations') || '[]');
            const allocatedInverterIds = new Set(allInstallations.flatMap(inst => inst.inverters?.map(inv => inv.id!)).filter(Boolean));
            const allocatedPanelIds = new Set(allInstallations.flatMap(inst => inst.panels?.map(p => p.id!)).filter(Boolean));

            // Load master equipment lists
            const allInverters: Inverter[] = JSON.parse(localStorage.getItem('inverters') || JSON.stringify(initialInverters));
            const allPanels: Panel[] = JSON.parse(localStorage.getItem('panels') || JSON.stringify(initialPanels));
            
            // Filter for available equipment
            setAvailableInverters(allInverters.filter(inv => !allocatedInverterIds.has(inv.id!)));
            setAvailablePanels(allPanels.filter(p => !allocatedPanelIds.has(p.id!)));

            // Set initial selections based on what's already in the installation
            setSelectedInverters(installation.inverters?.map(i => i.id!) || []);
            setSelectedPanels(installation.panels?.map(p => p.id!) || []);
        }
    }, [isOpen, installation]);
    
    const handleSave = () => {
        const allInverters: Inverter[] = JSON.parse(localStorage.getItem('inverters') || '[]');
        const allPanels: Panel[] = JSON.parse(localStorage.getItem('panels') || '[]');

        const updatedInstallation: Installation = {
            ...installation,
            inverters: allInverters.filter(inv => selectedInverters.includes(inv.id!)),
            panels: allPanels.filter(p => selectedPanels.includes(p.id!)),
        };
        onSave(updatedInstallation);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-2" /> Alocar</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Alocar Equipamentos</DialogTitle>
                    <DialogDescription>Selecione os equipamentos do seu inventário para alocar nesta instalação.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-6 max-h-[60vh] overflow-y-auto">
                    <div>
                        <h4 className="font-semibold mb-2">Inversores Disponíveis</h4>
                        <div className="space-y-2">
                           {availableInverters.map(inverter => (
                               <div key={inverter.id} className="flex items-center space-x-2">
                                   <Checkbox 
                                        id={`inv-${inverter.id}`} 
                                        checked={selectedInverters.includes(inverter.id!)}
                                        onCheckedChange={(checked) => {
                                            setSelectedInverters(prev => 
                                                checked ? [...prev, inverter.id!] : prev.filter(id => id !== inverter.id)
                                            );
                                        }}
                                   />
                                   <Label htmlFor={`inv-${inverter.id}`} className="font-normal text-sm">
                                      {inverter.brand} {inverter.model} (S/N: {inverter.serialNumber})
                                   </Label>
                               </div>
                           ))}
                           {availableInverters.length === 0 && <p className="text-sm text-muted-foreground">Nenhum inversor disponível no estoque.</p>}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2">Painéis Solares Disponíveis</h4>
                        <div className="space-y-2">
                           {availablePanels.map(panel => (
                               <div key={panel.id} className="flex items-center space-x-2">
                                   <Checkbox 
                                        id={`panel-${panel.id}`} 
                                        checked={selectedPanels.includes(panel.id!)}
                                        onCheckedChange={(checked) => {
                                            setSelectedPanels(prev => 
                                                checked ? [...prev, panel.id!] : prev.filter(id => id !== panel.id)
                                            );
                                        }}
                                   />
                                   <Label htmlFor={`panel-${panel.id}`} className="font-normal text-sm">
                                      {panel.quantity}x {panel.brand} {panel.model} ({panel.power}Wp)
                                   </Label>
                               </div>
                           ))}
                           {availablePanels.length === 0 && <p className="text-sm text-muted-foreground">Nenhum painel disponível no estoque.</p>}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                    <Button onClick={handleSave}>Salvar Alocação</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function InstallationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [installation, setInstallation] = useState<Installation | null>(null);
  const [isEventDialogOpen, setEventDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [isDocumentDialogOpen, setDocumentDialogOpen] = useState(false);
  
  const [protocolNumberInput, setProtocolNumberInput] = useState('');

  const [installerReport, setInstallerReport] = useState<any | null>(null);
  const [generatedFinalReport, setGeneratedFinalReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      const allInstallations: Installation[] = JSON.parse(localStorage.getItem('installations') || '[]');
      const currentInstallation = allInstallations.find(inst => inst.id === Number(id));
      setInstallation(currentInstallation || null);
      setProtocolNumberInput(currentInstallation?.protocolNumber || '');

      if (currentInstallation?.reportSubmitted) {
        const reportData = localStorage.getItem(`report_${currentInstallation.clientName}`);
        if(reportData) {
            setInstallerReport(JSON.parse(reportData));
        }
      }
    }
  }, [id]);

  const eventForm = useForm<EventValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      type: "Nota",
      description: "",
      date: new Date(),
    }
  });

  const scheduleForm = useForm<ScheduleValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
        date: undefined,
        time: "",
        notes: "",
    }
  });

  const documentForm = useForm<DocumentValues>({
    resolver: zodResolver(documentSchema),
  });
  
  useEffect(() => {
    if (installation) {
        scheduleForm.reset({
            date: installation.scheduledDate ? new Date(installation.scheduledDate) : undefined,
            time: installation.scheduledDate ? format(new Date(installation.scheduledDate), 'HH:mm') : "",
            notes: ""
        });
    }
  }, [installation, scheduleForm]);


  function updateInstallation(updatedInstallation: Installation, toastMessage?: {title: string, description: string}) {
      const allInstallations: Installation[] = JSON.parse(localStorage.getItem('installations') || '[]');
      const updatedAllInstallations = allInstallations.map(inst =>
        inst.id === updatedInstallation.id ? updatedInstallation : inst
      );
      localStorage.setItem('installations', JSON.stringify(updatedAllInstallations));
      setInstallation(updatedInstallation);
      if (toastMessage) {
        toast(toastMessage);
      }
  }

  const handleAddEvent = async (values: EventValues) => {
    if (!installation) return;

    let attachedFiles: { name: string, dataUrl: string }[] = [];
    if (values.attachments && values.attachments.length > 0) {
      for (const file of Array.from(values.attachments as FileList)) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });
        attachedFiles.push({ name: file.name, dataUrl });
      }
    }

    const newEvent = {
      id: new Date().toISOString(),
      date: values.date.toISOString(),
      type: values.type,
      description: values.description,
      attachments: attachedFiles,
    };

    const updatedInstallation = {
      ...installation,
      events: [...(installation.events || []), newEvent].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    };
    
    updateInstallation(updatedInstallation, { title: "Evento Adicionado!", description: `Novo evento do tipo "${values.type}" foi registrado.` });
    eventForm.reset();
    setEventDialogOpen(false);
  };

  const handleSchedule = (values: ScheduleValues) => {
    if (!installation) return;
    
    const [hours, minutes] = values.time?.split(':').map(Number) || [0,0];
    const scheduledDate = new Date(values.date);
    scheduledDate.setHours(hours, minutes);

    const formattedDate = format(scheduledDate, "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR });
    const description = `Instalação agendada para ${formattedDate}.${values.notes ? `\n\nObservações: ${values.notes}` : ''}`;
    
    const newEvent = {
        id: new Date().toISOString(),
        date: new Date().toISOString(),
        type: 'Agendamento',
        description: description,
        attachments: [],
    };
    
    const updatedInstallation = {
      ...installation,
      scheduledDate: scheduledDate.toISOString(),
      status: "Agendado" as Installation['status'],
      events: [...(installation.events || []), newEvent].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    };

    updateInstallation(updatedInstallation, { title: "Instalação Agendada!", description: `Agendado para ${formattedDate}`});
    setScheduleDialogOpen(false);
  }
  
  const handleStatusChange = (statusType: keyof Installation, newStatus: string) => {
    if (!installation || isSubmitting) return;

    setIsSubmitting(true);
    const oldStatus = installation[statusType];
    if (oldStatus === newStatus) {
        setIsSubmitting(false);
        return;
    }

    const updatedInstallation = { ...installation, [statusType]: newStatus as any };

    // Create a new event for the change
    const newEvent = {
      id: new Date().toISOString(),
      date: new Date().toISOString(),
      type: "Nota",
      description: `Status de '${statusType}' alterado de "${oldStatus}" para "${newStatus}".`,
      attachments: [],
    };
    
    updatedInstallation.events = [...(updatedInstallation.events || []), newEvent].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    updateInstallation(updatedInstallation, {
        title: "Status Atualizado!",
        description: `O ${statusType} foi atualizado para "${newStatus}".`
    });
    
    setTimeout(() => setIsSubmitting(false), 500); // Prevent rapid changes
  };

  async function handleGenerateFinalReport() {
    if (!installerReport || !installation) return;
    
    setIsGenerating(true);
    setGeneratedFinalReport(null);
    try {
        const fullReportData = {
            ...installerReport,
            protocolNumber: installation.protocolNumber, // Ensure protocol number is in the data
        };

        const input: GenerateFinalReportInput = {
            installerReport: JSON.stringify(fullReportData),
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

  async function handleAddDocument(values: DocumentValues) {
    if (!installation) return;
    let newDocuments: { name: string, dataUrl: string, type: string, date: string }[] = [];
    if (values.files && values.files.length > 0) {
        for (const file of Array.from(values.files as FileList)) {
            const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            });
            newDocuments.push({ name: file.name, dataUrl, type: file.type, date: new Date().toISOString() });
        }
    }
    const updatedInstallation = {
        ...installation,
        documents: [...(installation.documents || []), ...newDocuments],
    };
    updateInstallation(updatedInstallation, { title: "Documento(s) Adicionado(s)!", description: `${newDocuments.length} arquivo(s) foram anexados à instalação.` });
    documentForm.reset();
    setDocumentDialogOpen(false);
  }

  const handleArchiveToggle = () => {
    if (!installation) return;
    const isArchiving = !installation.archived;
    const updatedInstallation = {
        ...installation,
        archived: isArchiving
    };
    updateInstallation(updatedInstallation, {
        title: `Instalação ${isArchiving ? 'Arquivada' : 'Desarquivada'}!`,
        description: `O cliente ${installation.clientName} foi ${isArchiving ? 'arquivado' : 'restaurado'}.`
    });
  }
  
  const handleSaveProtocolNumber = () => {
    if (!installation || installation.protocolNumber === protocolNumberInput) return;

    const oldProtocol = installation.protocolNumber || 'N/A';
    const updatedInstallation: Installation = {
      ...installation,
      protocolNumber: protocolNumberInput,
    };
    
    const newEvent = {
        id: new Date().toISOString() + "_protocol",
        date: new Date().toISOString(),
        type: 'Protocolo',
        description: `Número do protocolo atualizado de "${oldProtocol}" para "${protocolNumberInput}".`,
        attachments: [],
    };
    updatedInstallation.events = [...(updatedInstallation.events || []), newEvent].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    updateInstallation(updatedInstallation, {
        title: "Protocolo Atualizado!",
        description: "O número do protocolo foi salvo com sucesso."
    });
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: message });
  }

  const handleCopyStatusLink = () => {
    if (!installation) return;
    const link = `${window.location.origin}/status/${installation.id}`;
    copyToClipboard(link, "Link de acompanhamento copiado!");
  }

  const handleCopyInstallerLink = () => {
    if (!installation) return;
    const link = `${window.location.origin}/?client=${encodeURIComponent(installation.clientName)}`;
    copyToClipboard(link, "Link do formulário do instalador copiado!");
  }
  
  const handleSaveAllocation = (updatedInstallation: Installation) => {
     updateInstallation(updatedInstallation, { title: "Equipamentos Alocados!", description: "Os equipamentos foram salvos nesta instalação." });
  }

  if (!installation) {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="space-y-4 w-full max-w-4xl p-4">
                <Skeleton className="h-12 w-1/2" />
                <Skeleton className="h-8 w-1/4" />
                <div className="grid md:grid-cols-3 gap-6 pt-4">
                    <Card><CardHeader><Skeleton className="h-6 w-24 mb-2"/><Skeleton className="h-4 w-full"/></CardHeader><CardContent><Skeleton className="h-4 w-3/4"/></CardContent></Card>
                    <Card><CardHeader><Skeleton className="h-6 w-24 mb-2"/><Skeleton className="h-4 w-full"/></CardHeader><CardContent><Skeleton className="h-4 w-3/4"/></CardContent></Card>
                    <Card><CardHeader><Skeleton className="h-6 w-24 mb-2"/><Skeleton className="h-4 w-full"/></CardHeader><CardContent><Skeleton className="h-4 w-3/4"/></CardContent></Card>
                </div>
                <Card className="mt-6"><CardHeader><Skeleton className="h-8 w-48"/></CardHeader><CardContent><Skeleton className="h-20 w-full"/></CardContent></Card>
            </div>
        </div>
    );
  }
  
  const Icon = installation.installationType === 'residencial' ? Home : Building;

  const allAttachments = [
    ...(installation.documents?.map(doc => ({
      id: `doc_${doc.name}_${doc.date}`,
      name: doc.name,
      dataUrl: doc.dataUrl,
      type: doc.dataUrl.startsWith('data:image') ? 'image' : (doc.dataUrl.startsWith('data:video') ? 'video' : 'file'),
      date: doc.date,
      source: 'Documento do Projeto',
    })) || []),
    ...(installerReport?.photo_uploads?.filter((p: any) => p.dataUrl).map((p: any, index: number) => ({
      id: `installer_photo_${index}`,
      name: p.annotation || `Foto do Instalador ${index + 1}`,
      dataUrl: p.dataUrl,
      type: 'image',
      date: (installation.events || []).find(e => e.type === 'Conclusão')?.date || new Date().toISOString(),
      source: 'Relatório do Instalador'
    })) || []),
    ...(installerReport?.installationVideoDataUrl ? [{
      id: 'installer_video',
      name: 'Vídeo da Instalação',
      dataUrl: installerReport.installationVideoDataUrl,
      type: 'video',
      date: (installation.events || []).find(e => e.type === 'Conclusão')?.date || new Date().toISOString(),
      source: 'Relatório do Instalador'
    }] : []),
    ...((installation.events || []).flatMap(event => 
      event.attachments?.map(att => ({
        id: `${event.id}_${att.name}`,
        name: att.name,
        dataUrl: att.dataUrl,
        type: att.dataUrl.startsWith('data:image') ? 'image' : 'file',
        date: event.date,
        source: `Evento: ${event.type}`
      })) || []
    ) || [])
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const processSteps = [
    {
      name: "Protocolo",
      status: installation.protocolNumber ? "completed" : "pending",
      Icon: FileText,
      description: installation.protocolNumber ? `Nº ${installation.protocolNumber}` : "Pendente",
    },
    {
      name: "Projeto",
      status: installation.projectStatus === "Aprovado" ? "completed" : (installation.projectStatus === "Reprovado" ? "error" : (installation.projectStatus === "Não Enviado" ? "pending" : "in_progress")),
      Icon: installation.projectStatus === "Aprovado" ? ThumbsUp : (installation.projectStatus === "Reprovado" ? ThumbsDown : (installation.projectStatus === "Não Enviado" ? Hourglass : Send)),
      description: installation.projectStatus,
    },
    {
      name: "Agendamento",
      status: installation.scheduledDate ? "completed" : "pending",
      Icon: CalendarIcon,
      description: installation.scheduledDate ? format(new Date(installation.scheduledDate), "dd/MM/yy 'às' HH:mm") : "Não agendado",
    },
    {
      name: "Instalação",
      status: installation.status === "Concluído" ? "completed" : (installation.status === "Cancelado" ? "error" : (installation.status === "Em Andamento" ? "in_progress" : "pending")),
      Icon: installation.status === "Concluído" ? CheckCircle : (installation.status === "Cancelado" ? XCircle : (installation.status === "Em Andamento" ? Bolt : Hourglass)),
      description: installation.status,
    },
    {
      name: "Homologação",
      status: installation.homologationStatus === "Aprovado" ? "completed" : (installation.homologationStatus === "Reprovado" ? "error" : "pending"),
      Icon: installation.homologationStatus === "Aprovado" ? ThumbsUp : (installation.homologationStatus === "Reprovado" ? ThumbsDown : Hourglass),
      description: installation.homologationStatus,
    },
  ];

  const statusItems = [
    { 
      label: "Status da Instalação", 
      value: installation.status, 
      options: InstallationStatus.options,
      key: "status" as keyof Installation,
      icon: Bolt 
    },
    { 
      label: "Status do Projeto", 
      value: installation.projectStatus, 
      options: ProjectStatus.options,
      key: "projectStatus" as keyof Installation,
      icon: FileCheck2 
    },
    { 
      label: "Status da Homologação", 
      value: installation.homologationStatus, 
      options: HomologationStatus.options,
      key: "homologationStatus" as keyof Installation,
      icon: CheckCircle 
    },
  ];

  const isOverdue = installation.status === "Agendado" && installation.scheduledDate && isPast(new Date(installation.scheduledDate));
  const overdueDays = installation.scheduledDate ? differenceInDays(new Date(), new Date(installation.scheduledDate)) : 0;
  const canBeArchived = !installation.archived && (installation.status === 'Concluído' || installation.status === 'Cancelado');
  const isArchivable = installation.archived || canBeArchived;

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
       <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Voltar</span>
        </Button>
        <div className="flex-1">
          <h1 className="font-semibold text-lg md:text-xl truncate flex items-center gap-2">
            {installation.clientName}
            <span className="font-normal text-muted-foreground text-base">({installation.installationId})</span>
            {installation.archived && <Badge variant="destructive">Arquivado</Badge>}
            </h1>
        </div>
        <div className="flex items-center gap-2">
             <Link href={`/admin/installation/${id}/print`} passHref>
                <Button variant="link" className="p-0 h-auto hidden sm:flex">
                    <Printer className="mr-2 h-4 w-4" /> Imprimir
                </Button>
            </Link>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" disabled={!isArchivable}>
                        {installation.archived ? <ArchiveRestore className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}
                        <span className="hidden sm:inline">{installation.archived ? "Desarquivar" : "Arquivar"}</span>
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        {installation.archived 
                            ? "Esta ação irá desarquivar a instalação, fazendo com que ela apareça novamente nos quadros Kanban."
                            : "Esta ação irá arquivar a instalação, removendo-a das visualizações principais do Kanban. Você ainda poderá acessá-la pela lista completa."
                        }
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleArchiveToggle}>
                        Confirmar
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Button variant="secondary" onClick={handleCopyInstallerLink}>
                <Wrench className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Link Instalador</span>
            </Button>
            <Button variant="secondary" onClick={handleCopyStatusLink}>
                <LinkIcon className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Link Cliente</span>
            </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        <div className="md:col-span-2 lg:col-span-3 space-y-6">

             <Card>
                <CardHeader>
                  <CardTitle>Linha do Tempo do Processo</CardTitle>
                  <CardDescription>Acompanhe o andamento da instalação em cada etapa principal.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 md:space-x-4 overflow-x-auto pb-4">
                    {processSteps.map((step, index) => (
                      <div key={step.name} className="flex items-center w-full">
                        <div className="flex flex-col items-center text-center">
                          <div className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full border-2",
                            step.status === "completed" && "bg-primary border-primary text-primary-foreground",
                            step.status === "in_progress" && "bg-blue-500 border-blue-500 text-white",
                            step.status === "error" && "bg-destructive border-destructive text-destructive-foreground",
                            step.status === "pending" && "bg-muted border-border text-muted-foreground",
                          )}>
                            <step.Icon className="h-5 w-5" />
                          </div>
                          <div className="mt-2 w-24">
                            <p className="font-semibold text-sm truncate">{step.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                          </div>
                        </div>
                        {index < processSteps.length - 1 && (
                          <div className={cn(
                            "flex-auto border-t-2 h-0 -mx-2",
                            step.status === "completed" ? "border-primary" : "border-border"
                          )} />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
             </Card>

             <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview"><Activity className="mr-2 h-4 w-4"/>Visão Geral</TabsTrigger>
                    <TabsTrigger value="attachments"><Files className="mr-2 h-4 w-4"/>Anexos</TabsTrigger>
                    <TabsTrigger value="data"><FileJson className="mr-2 h-4 w-4"/>Dados do Relatório</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                     <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Histórico de Eventos</CardTitle>
                            <CardDescription>Acompanhe tudo que acontece nesta instalação.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <ScrollArea className="h-[40vh]">
                           <div className="space-y-8 relative pl-6 before:absolute before:inset-y-0 before:w-px before:bg-border before:left-0 before:ml-3">
                               {(!installation.events || installation.events.length === 0) && (
                                 <div className="text-center text-muted-foreground py-8">
                                    <MessageSquare className="mx-auto h-12 w-12" />
                                    <p className="mt-4">Nenhum evento registrado ainda.</p>
                                    <p className="text-sm">Use o botão abaixo para adicionar o primeiro evento.</p>
                                 </div>
                               )}
                               {(installation.events || []).map(event => {
                                   const EventIcon = EVENT_TYPES.find(e => e.value === event.type)?.icon || MessageSquare;
                                   return (
                                       <div key={event.id} className="relative">
                                            <div className="absolute -left-6 top-0 h-6 w-6 bg-background flex items-center justify-center rounded-full border">
                                                <EventIcon className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="pl-6">
                                              <p className="text-sm text-muted-foreground">{format(new Date(event.date), "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR })}</p>
                                              <h4 className="font-semibold">{event.type}</h4>
                                              <p className="text-muted-foreground text-sm whitespace-pre-wrap">{event.description}</p>
                                              {event.attachments && event.attachments.length > 0 && (
                                                  <div className="mt-2 space-y-1">
                                                      {event.attachments.map((file, idx) => (
                                                          <a key={idx} href={file.dataUrl} download={file.name} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-2 max-w-xs truncate">
                                                              <Paperclip className="h-3 w-3 flex-shrink-0" /> <span className="truncate">{file.name}</span>
                                                          </a>
                                                      ))}
                                                  </div>
                                              )}
                                            </div>
                                       </div>
                                   )
                               })}
                           </div>
                           </ScrollArea>
                        </CardContent>
                         <CardFooter>
                            <Dialog open={isEventDialogOpen} onOpenChange={setEventDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" /> Adicionar Evento Manual
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Adicionar Novo Evento</DialogTitle>
                                        <DialogDescription>Registre uma nova ocorrência para esta instalação.</DialogDescription>
                                    </DialogHeader>
                                    <Form {...eventForm}>
                                        <form id="event-form" onSubmit={eventForm.handleSubmit(handleAddEvent)} className="space-y-4 py-4">
                                             <FormField control={eventForm.control} name="type" render={({ field }) => (
                                                <FormItem>
                                                  <FormLabel>Tipo de Evento</FormLabel>
                                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                      <SelectTrigger>
                                                        <SelectValue placeholder="Selecione um tipo..." />
                                                      </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                      {EVENT_TYPES.map(et => (
                                                        <SelectItem key={et.value} value={et.value}>{et.label}</SelectItem>
                                                      ))}
                                                    </SelectContent>
                                                  </Select>
                                                  <FormMessage />
                                                </FormItem>
                                              )}/>
                                            <FormField control={eventForm.control} name="date" render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                  <FormLabel>Data do Evento</FormLabel>
                                                  <Popover>
                                                    <PopoverTrigger asChild>
                                                      <FormControl>
                                                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                          {field.value ? format(field.value, 'PPP', { locale: ptBR }) : <span>Escolha uma data</span>}
                                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                      </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus />
                                                    </PopoverContent>
                                                  </Popover>
                                                  <FormMessage />
                                                </FormItem>
                                              )}/>
                                            <FormField control={eventForm.control} name="description" render={({ field }) => (
                                                <FormItem>
                                                  <FormLabel>Descrição</FormLabel>
                                                  <FormControl>
                                                    <Textarea placeholder="Descreva o que aconteceu..." {...field} />
                                                  </FormControl>
                                                  <FormMessage />
                                                </FormItem>
                                              )}/>
                                            <FormField control={eventForm.control} name="attachments" render={({ field: { onChange, ...field }}) => (
                                                <FormItem>
                                                    <FormLabel>Anexos</FormLabel>
                                                    <FormControl>
                                                        <Input type="file" multiple onChange={(e) => onChange(e.target.files)} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}/>
                                        </form>
                                    </Form>
                                    <DialogFooter>
                                        <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                                        <Button type="submit" form="event-form">Salvar Evento</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardFooter>
                    </Card>
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/>Gerador de Relatório Final</CardTitle>
                            <CardDescription>Use IA para consolidar o relatório do instalador em um documento final.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-4">
                                <Button onClick={handleGenerateFinalReport} disabled={isGenerating || !installation.reportSubmitted} className="w-full">
                                    {isGenerating ? "Gerando..." : "Gerar Relatório com IA"}
                                </Button>
                            </div>
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
                                    <ScrollArea className="h-48">
                                       <p className="p-4 border rounded-md bg-muted/50 whitespace-pre-wrap">{generatedFinalReport}</p>
                                    </ScrollArea>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="attachments">
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Anexos da Instalação</CardTitle>
                            <CardDescription>Todos os arquivos e mídias associados a esta instalação.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[60vh]">
                                {allAttachments.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-8">
                                        <FileCheck2 className="mx-auto h-12 w-12" />
                                        <p className="mt-4">Nenhum anexo encontrado.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {allAttachments.map(att => (
                                            <a key={att.id} href={att.dataUrl} download={att.name} target="_blank" rel="noopener noreferrer" className="group relative block border rounded-lg overflow-hidden">
                                                {att.type === 'image' ? (
                                                     <img src={att.dataUrl} alt={att.name} className="h-40 w-full object-cover transition-transform group-hover:scale-105" />
                                                ) : att.type === 'video' ? (
                                                    <div className="h-40 w-full bg-muted flex items-center justify-center">
                                                        <Video className="h-16 w-16 text-muted-foreground" />
                                                    </div>
                                                ) : (
                                                    <div className="h-40 w-full bg-muted flex items-center justify-center">
                                                        <Paperclip className="h-16 w-16 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white">
                                                    <p className="text-xs font-semibold truncate">{att.name}</p>
                                                     <p className="text-xs opacity-80 truncate">{att.source}</p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="data">
                     <Card className="mt-6">
                        <CardHeader>
                           <CardTitle>Dados do Formulário do Instalador</CardTitle>
                           <CardDescription>Dados brutos da instalação enviados pelo técnico.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           {!installation.reportSubmitted || !installerReport ? (
                             <div className="text-center text-muted-foreground py-8">
                                <FileCheck2 className="mx-auto h-12 w-12" />
                                <p className="mt-4">O relatório ainda não foi enviado pelo instalador.</p>
                             </div>
                           ) : (
                               <ScrollArea className="h-[60vh] pr-2">
                                   <div className="space-y-4 py-4 text-sm">
                                       {Object.entries(installerReport).map(([key, value]) => {
                                           if (['photo_uploads', 'installationVideoDataUrl', 'installationVideo', 'inverters', 'panels'].includes(key)) return null;
                                           if (typeof value === 'object' && value !== null) {
                                               if (Array.isArray(value)) { // Handle strings array
                                                   const filteredArray = value.filter(item => item.voltage || item.plates);
                                                   if (filteredArray.length === 0) return null;
                                                   return (
                                                       <div key={key}>
                                                           <h4 className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                                                           <div className="grid grid-cols-2 gap-2 mt-1">
                                                           {filteredArray.map((item, index) => (
                                                             <div key={index} className="p-2 border rounded-md bg-muted/50">
                                                                 <p><b>String {value.findIndex(originalItem => originalItem === item) + 1}:</b></p>
                                                                 <p>Tensão: {item.voltage || 'N/A'} V</p>
                                                                 <p>Placas: {item.plates || 'N/A'}</p>
                                                             </div>
                                                           ))}
                                                           </div>
                                                       </div>
                                                   )
                                               }
                                               return null;
                                           }
                                           return (
                                               <div key={key} className="flex justify-between border-b pb-1">
                                                   <span className="font-medium text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                                   <span className="text-right">{String(value) || 'N/A'}</span>
                                               </div>
                                           )
                                       })}
                                   </div>
                               </ScrollArea>
                           )}
                         </CardContent>
                    </Card>
                </TabsContent>
             </Tabs>
        </div>
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Icon className="h-8 w-8 text-muted-foreground" />
                    <div>
                        <CardTitle>{installation.clientName}</CardTitle>
                        <CardDescription>{installation.installationType === "residencial" ? "Residencial" : "Comercial"}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                    <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground"/>
                        <span>{installation.address}, {installation.city} - {installation.state}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <Bolt className="h-4 w-4 text-muted-foreground"/>
                        <span>{installation.utilityCompany}</span>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="protocol-number" className="flex items-center gap-2 text-muted-foreground">
                            <FileText className="h-4 w-4"/>
                            <span>Protocolo</span>
                        </Label>
                        <div className="flex items-center gap-2">
                             <Input 
                                id="protocol-number"
                                value={protocolNumberInput}
                                onChange={(e) => setProtocolNumberInput(e.target.value)}
                                placeholder="Insira o nº do protocolo"
                             />
                             <Button size="icon" className="h-10 w-10" onClick={handleSaveProtocolNumber} disabled={protocolNumberInput === installation.protocolNumber}>
                                <Save className="h-4 w-4" />
                                <span className="sr-only">Salvar Protocolo</span>
                             </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CircuitBoard className="h-5 w-5 text-primary" />
                    Equipamentos Alocados
                  </div>
                   <AllocateEquipmentDialog installation={installation} onSave={handleSaveAllocation} />
                </CardTitle>
                <CardDescription>Equipamentos do inventário alocados nesta instalação.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                    <div className="pr-4 space-y-4">
                        <h4 className="font-semibold text-sm">Inversores</h4>
                        {(installation.inverters || []).length > 0 ? (
                            (installation.inverters || []).map(inverter => (
                                <div key={inverter.id} className="text-xs p-2 border rounded-md relative group">
                                    <p className="font-bold">{inverter.brand} {inverter.model}</p>
                                    <p>S/N: {inverter.serialNumber || 'N/A'}</p>
                                </div>
                            ))
                        ) : (<p className="text-xs text-muted-foreground">Nenhum inversor alocado.</p>)}

                        <h4 className="font-semibold text-sm pt-2">Painéis Solares</h4>
                         {(installation.panels || []).length > 0 ? (
                            (installation.panels || []).map(panel => (
                                <div key={panel.id} className="text-xs p-2 border rounded-md relative group">
                                    <p className="font-bold">{panel.brand} {panel.model}</p>
                                    <p>Potência: {panel.power || 'N/A'} Wp | Qtd: {panel.quantity || 'N/A'}</p>
                                </div>
                            ))
                        ) : (<p className="text-xs text-muted-foreground">Nenhum painel alocado.</p>)}
                    </div>
                </ScrollArea>
              </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Status Gerais</CardTitle>
                    <CardDescription>Gerencie o andamento da instalação.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-4">
                    {statusItems.map((item) => (
                         <div key={item.key} className="space-y-1">
                            <Label className="flex items-center gap-2 text-muted-foreground">
                                <item.icon className="h-4 w-4"/>
                                <span>{item.label}</span>
                            </Label>
                            <Select 
                                value={item.value} 
                                onValueChange={(newStatus) => handleStatusChange(item.key, newStatus)}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger className="h-9">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    {item.options.map(option => (
                                        <SelectItem key={`${item.key}-${option}`} value={option}>{option}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ))}
                    <div className="space-y-1">
                        <Label className="flex items-center gap-2 text-muted-foreground">
                            <FileText className="h-4 w-4"/>
                            <span>Relatório Técnico</span>
                        </Label>
                        <div className="pt-1">
                          {installation.reportSubmitted ? (
                              <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">Enviado</Badge>
                          ) : (
                              <Badge variant="secondary">Pendente</Badge>
                          )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Agendamento</CardTitle>
                </CardHeader>
                <CardContent>
                    {isOverdue && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Agendamento Atrasado</AlertTitle>
                            <AlertDescription>
                                Este agendamento está atrasado há {overdueDays} dia(s).
                            </AlertDescription>
                        </Alert>
                    )}
                    {installation.scheduledDate ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-primary" />
                                <span className="font-semibold">{format(new Date(installation.scheduledDate), "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR })}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">O status da instalação foi atualizado para "Agendado".</p>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Aguardando aprovação do projeto para agendar.</p>
                    )}
                </CardContent>
                <CardFooter>
                    <Dialog open={isScheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full" disabled={installation.projectStatus !== 'Aprovado'}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {installation.scheduledDate ? "Reagendar" : "Agendar"}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Agendar Instalação</DialogTitle>
                                <DialogDescription>Selecione a data e hora para a visita técnica.</DialogDescription>
                            </DialogHeader>
                             <Form {...scheduleForm}>
                                <form id="schedule-form" onSubmit={scheduleForm.handleSubmit(handleSchedule)} className="space-y-4 py-4">
                                    <FormField control={scheduleForm.control} name="date" render={({ field }) => (
                                        <FormItem className="flex flex-col items-center">
                                            <FormLabel>Data</FormLabel>
                                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={scheduleForm.control} name="time" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Hora (HH:mm)</FormLabel>
                                            <FormControl>
                                                <Input type="time" {...field} value={field.value ?? ''}/>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                    <FormField control={scheduleForm.control} name="notes" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Observações (opcional)</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Alguma nota para a equipe?" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </form>
                            </Form>
                            <DialogFooter>
                                <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                                <Button type="submit" form="schedule-form">Salvar Agendamento</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Documentos do Projeto</CardTitle>
                    <CardDescription>Anexe arquivos importantes como PDFs, projetos, etc.</CardDescription>
                </CardHeader>
                <CardContent>
                    {installation.documents && installation.documents.length > 0 ? (
                        <ScrollArea className="h-24">
                            <div className="space-y-2 text-sm">
                                {installation.documents.map((doc, idx) => (
                                     <a key={idx} href={doc.dataUrl} download={doc.name} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-2 truncate">
                                        <Paperclip className="h-4 w-4 flex-shrink-0" /> <span className="truncate">{doc.name}</span>
                                    </a>
                                ))}
                            </div>
                        </ScrollArea>
                    ) : (
                        <p className="text-sm text-muted-foreground">Nenhum documento anexado.</p>
                    )}
                </CardContent>
                <CardFooter>
                     <Dialog open={isDocumentDialogOpen} onOpenChange={setDocumentDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                                <Upload className="mr-2 h-4 w-4" />
                                Adicionar Documento
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Anexar Documentos</DialogTitle>
                                <DialogDescription>Selecione os arquivos para anexar a esta instalação.</DialogDescription>
                            </DialogHeader>
                             <Form {...documentForm}>
                                <form id="document-form" onSubmit={documentForm.handleSubmit(handleAddDocument)} className="space-y-4 py-4">
                                     <FormField control={documentForm.control} name="files" render={({ field: { onChange, ...field }}) => (
                                        <FormItem>
                                            <FormLabel>Arquivos</FormLabel>
                                            <FormControl>
                                                <Input type="file" multiple onChange={(e) => onChange(e.target.files)} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </form>
                            </Form>
                            <DialogFooter>
                                <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                                <Button type="submit" form="document-form">Salvar Documentos</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardFooter>
            </Card>
        </div>
      </main>
    </div>
  );
}
