
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Building, Home, MapPin, Plus, Paperclip, AlertCircle, Wrench, Calendar as CalendarIcon, MessageSquare, Check, Sparkles, Copy, FileCheck2, Camera, Video, Bolt, Clock, CheckCircle, XCircle, FileText, Activity, FileJson } from "lucide-react";

import { type Installation } from "@/app/admin/page";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { generateFinalReport, type GenerateFinalReportInput } from "@/ai/flows/generate-report-flow";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";


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

const finalReportSchema = z.object({
    protocolNumber: z.string().min(1, "O número do protocolo é obrigatório."),
});
type FinalReportValues = z.infer<typeof finalReportSchema>;

const EVENT_TYPES = [
  { value: "Agendamento", label: "Agendamento", icon: CalendarIcon },
  { value: "Problema", label: "Problema Encontrado", icon: AlertCircle },
  { value: "Nota", label: "Nota Interna", icon: MessageSquare },
  { value: "Vistoria", label: "Vistoria Técnica", icon: Wrench },
  { value: "Conclusão", label: "Etapa Concluída", icon: Check },
];

export default function InstallationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [installation, setInstallation] = useState<Installation | null>(null);
  const [isEventDialogOpen, setEventDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [installerReport, setInstallerReport] = useState<any | null>(null);
  const [generatedFinalReport, setGeneratedFinalReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (id) {
      const allInstallations: Installation[] = JSON.parse(localStorage.getItem('installations') || '[]');
      const currentInstallation = allInstallations.find(inst => inst.id === Number(id));
      setInstallation(currentInstallation || null);

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
        date: installation?.scheduledDate ? new Date(installation.scheduledDate) : undefined,
        time: installation?.scheduledDate ? format(new Date(installation.scheduledDate), 'HH:mm') : "",
        notes: "",
    }
  });
  
  useEffect(() => {
    if (installation?.scheduledDate) {
        scheduleForm.reset({
            date: new Date(installation.scheduledDate),
            time: format(new Date(installation.scheduledDate), 'HH:mm'),
            notes: ""
        });
    }
  }, [installation, scheduleForm]);

  const finalReportForm = useForm<FinalReportValues>({
    resolver: zodResolver(finalReportSchema),
  });

  function updateInstallation(updatedInstallation: Installation) {
      const allInstallations: Installation[] = JSON.parse(localStorage.getItem('installations') || '[]');
      const updatedAllInstallations = allInstallations.map(inst =>
        inst.id === updatedInstallation.id ? updatedInstallation : inst
      );
      localStorage.setItem('installations', JSON.stringify(updatedAllInstallations));
      setInstallation(updatedInstallation);
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
      events: [...(installation.events || []), newEvent],
    };
    
    updateInstallation(updatedInstallation);

    toast({ title: "Evento Adicionado!", description: `Novo evento do tipo "${values.type}" foi registrado.` });
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
      events: [...(installation.events || []), newEvent],
    };

    updateInstallation(updatedInstallation);
    toast({ title: "Instalação Agendada!", description: `Agendado para ${formattedDate}`});
    setScheduleDialogOpen(false);
  }
  
  async function handleGenerateFinalReport(values: FinalReportValues) {
    if (!installerReport) return;
    
    setIsGenerating(true);
    setGeneratedFinalReport(null);
    try {
        const input: GenerateFinalReportInput = {
            installerReport: JSON.stringify(installerReport),
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

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: message });
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
  const getStatusProps = (status: Installation["status"]) => {
    switch (status) {
      case "Concluído":
        return { icon: <CheckCircle className="h-4 w-4" />, className: "bg-green-600 hover:bg-green-700", label: "Concluído" };
      case "Cancelado":
        return { icon: <XCircle className="h-4 w-4" />, className: "bg-red-600 hover:bg-red-700", label: "Cancelado" };
       case "Em Andamento":
        return { icon: <Bolt className="h-4 w-4" />, className: "bg-yellow-500 hover:bg-yellow-600", label: "Em Andamento" };
      case "Agendado":
         return { icon: <Clock className="h-4 w-4" />, className: "bg-blue-500 hover:bg-blue-600", label: "Agendado" };
      case "Pendente":
      default:
        return { icon: <FileText className="h-4 w-4" />, className: "bg-gray-500 hover:bg-gray-600", label: "Pendente" };
    }
  };
  const statusProps = getStatusProps(installation.status);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
       <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Voltar</span>
        </Button>
        <div className="flex-1">
          <h1 className="font-semibold text-lg md:text-xl truncate">{installation.clientName}</h1>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        <div className="md:col-span-2 lg:col-span-3 space-y-6">
             <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview"><Activity className="mr-2 h-4 w-4"/>Visão Geral</TabsTrigger>
                    <TabsTrigger value="report"><FileJson className="mr-2 h-4 w-4"/>Relatório do Instalador</TabsTrigger>
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
                               {[...(installation.events || [])].reverse().map(event => {
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
                                        <Plus className="mr-2 h-4 w-4" /> Adicionar Evento
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
                             <Form {...finalReportForm}>
                                <form onSubmit={finalReportForm.handleSubmit(handleGenerateFinalReport)} className="space-y-4">
                                    <FormField control={finalReportForm.control} name="protocolNumber" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Número de Protocolo</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Insira o número do protocolo" {...field} disabled={!installation.reportSubmitted}/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}/>
                                    <Button type="submit" disabled={isGenerating || !installation.reportSubmitted} className="w-full">
                                        {isGenerating ? "Gerando..." : "Gerar Relatório com IA"}
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
                                    <ScrollArea className="h-48">
                                       <p className="p-4 border rounded-md bg-muted/50 whitespace-pre-wrap">{generatedFinalReport}</p>
                                    </ScrollArea>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="report">
                     <Card className="mt-6">
                        <CardHeader>
                           <CardTitle>Relatório do Instalador</CardTitle>
                           <CardDescription>Dados e mídias da instalação enviados pelo técnico.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           {!installation.reportSubmitted || !installerReport ? (
                             <div className="text-center text-muted-foreground py-8">
                                <FileCheck2 className="mx-auto h-12 w-12" />
                                <p className="mt-4">O relatório ainda não foi enviado pelo instalador.</p>
                             </div>
                           ) : (
                             <Tabs defaultValue="media" className="w-full">
                               <TabsList className="grid w-full grid-cols-2">
                                 <TabsTrigger value="media">Mídias</TabsTrigger>
                                 <TabsTrigger value="data">Dados do Formulário</TabsTrigger>
                               </TabsList>
                               <TabsContent value="media">
                                   <ScrollArea className="h-[60vh] pr-2">
                                       <div className="space-y-6 py-4 text-sm">
                                           <div>
                                               <h3 className="font-semibold text-base mb-3 flex items-center gap-2"><Camera /> Fotos</h3>
                                               <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                                   {installerReport.photo_uploads && installerReport.photo_uploads.filter((p: any) => p.dataUrl).map((photo: any, index: number) => (
                                                       <div key={index} className="space-y-1 group">
                                                           <a href={photo.dataUrl} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-md">
                                                               <img src={photo.dataUrl} alt={photo.annotation || `Foto ${index + 1}`} className="object-cover aspect-square transition-transform duration-300 group-hover:scale-105" />
                                                           </a>
                                                           <p className="text-xs text-muted-foreground truncate">{photo.annotation || `Foto ${index + 1}`}</p>
                                                       </div>
                                                   ))}
                                               </div>
                                           </div>
                                           <Separator/>
                                           <div>
                                               <h3 className="font-semibold text-base mb-3 flex items-center gap-2"><Video /> Vídeo</h3>
                                               {installerReport.installationVideoDataUrl ? (
                                                   <video src={installerReport.installationVideoDataUrl} controls className="w-full rounded-md" />
                                               ) : (
                                                   <p className="text-muted-foreground text-center">Nenhum vídeo enviado.</p>
                                               )}
                                           </div>
                                       </div>
                                   </ScrollArea>
                               </TabsContent>
                               <TabsContent value="data">
                                   <ScrollArea className="h-[60vh] pr-2">
                                       <div className="space-y-4 py-4 text-sm">
                                           {Object.entries(installerReport).map(([key, value]) => {
                                               if (key === 'photo_uploads' || key === 'installationVideoDataUrl' || key === 'installationVideo') return null;
                                               if (typeof value === 'object' && value !== null) {
                                                   if (Array.isArray(value)) { // Handle strings array
                                                       return (
                                                           <div key={key}>
                                                               <h4 className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                                                               <div className="grid grid-cols-2 gap-2 mt-1">
                                                               {value.map((item, index) => (
                                                                 item.voltage || item.plates ? (
                                                                   <div key={index} className="p-2 border rounded-md bg-muted/50">
                                                                       <p><b>String {index + 1}:</b></p>
                                                                       <p>Tensão: {item.voltage || 'N/A'} V</p>
                                                                       <p>Placas: {item.plates || 'N/A'}</p>
                                                                   </div>
                                                                 ) : null
                                                               ))}
                                                               </div>
                                                           </div>
                                                       )
                                                   }
                                                   return null; // Don't render other objects for now
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
                               </TabsContent>
                             </Tabs>
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
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Status da Instalação</CardTitle>
                </CardHeader>
                <CardContent>
                     <Badge variant="default" className={cn("text-base", statusProps.className)}>
                        {statusProps.icon}
                        <span className="ml-2">{statusProps.label}</span>
                     </Badge>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Agendamento</CardTitle>
                </CardHeader>
                <CardContent>
                    {installation.scheduledDate ? (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-primary" />
                                <span className="font-semibold">{format(new Date(installation.scheduledDate), "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR })}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">O status da instalação foi atualizado para "Agendado".</p>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Nenhuma data agendada.</p>
                    )}
                </CardContent>
                <CardFooter>
                    <Dialog open={isScheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
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
                                                <Input type="time" {...field} />
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
        </div>
      </main>
    </div>
  );
}

    