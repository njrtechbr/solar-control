
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, ArrowLeft, Building, Home, MapPin, Plus, Paperclip, AlertCircle, Wrench, Calendar, MessageSquare, Check, Sparkles, Copy, FileCheck2, Camera, Video, Bolt } from "lucide-react";

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
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { generateFinalReport, type GenerateFinalReportInput } from "@/ai/flows/generate-report-flow";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const eventSchema = z.object({
  type: z.string().min(1, "O tipo de evento é obrigatório."),
  description: z.string().min(1, "A descrição é obrigatória."),
  date: z.date({ required_error: "A data é obrigatória." }),
  attachments: z.any().optional(),
});

type EventValues = z.infer<typeof eventSchema>;

const finalReportSchema = z.object({
    protocolNumber: z.string().min(1, "O número do protocolo é obrigatório."),
});
type FinalReportValues = z.infer<typeof finalReportSchema>;

const EVENT_TYPES = [
  { value: "Agendamento", label: "Agendamento", icon: Calendar },
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

  const finalReportForm = useForm<FinalReportValues>({
    resolver: zodResolver(finalReportSchema),
  });

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

    const allInstallations: Installation[] = JSON.parse(localStorage.getItem('installations') || '[]');
    const updatedAllInstallations = allInstallations.map(inst =>
      inst.id === installation.id ? updatedInstallation : inst
    );
    localStorage.setItem('installations', JSON.stringify(updatedAllInstallations));
    setInstallation(updatedInstallation);

    toast({ title: "Evento Adicionado!", description: `Novo evento do tipo "${values.type}" foi registrado.` });
    eventForm.reset();
    setEventDialogOpen(false);
  };
  
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
            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Eventos</CardTitle>
                    <CardDescription>Acompanhe tudo que acontece nesta instalação.</CardDescription>
                </CardHeader>
                <CardContent>
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
                                              <CalendarComponent mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus />
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
                    <CardTitle>Relatório do Instalador</CardTitle>
                     <CardDescription>Dados e mídias da instalação.</CardDescription>
                </CardHeader>
                <CardContent>
                    {!installation.reportSubmitted ? (
                        <p className="text-sm text-muted-foreground">O relatório ainda não foi enviado pelo instalador.</p>
                    ) : (
                        <Tabs defaultValue="report">
                           <TabsContent value="report" className="mt-0">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="w-full"><FileCheck2 className="mr-2"/> Ver Relatório Completo</Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl">
                                        <DialogHeader>
                                            <DialogTitle>Relatório de Instalação - {installerReport?.clientName}</DialogTitle>
                                            <DialogDescription>Detalhes completos preenchidos pelo instalador.</DialogDescription>
                                        </DialogHeader>
                                        <ScrollArea className="max-h-[70vh] pr-6">
                                            {installerReport && (
                                                <div className="space-y-6 py-4 text-sm">
                                                    <div>
                                                        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Camera /> Documentação Fotográfica</h3>
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                            {installerReport.photo_uploads && installerReport.photo_uploads.map((photo: any, index: number) => (
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
                                                        {installerReport.installationVideoDataUrl ? (
                                                            <video src={installerReport.installationVideoDataUrl} controls className="w-full rounded-md" />
                                                        ) : (
                                                            <p>Nenhum vídeo enviado.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </DialogContent>
                                </Dialog>
                            </TabsContent>
                        </Tabs>
                    )}
                </CardContent>
                 <CardFooter className="flex flex-col items-stretch space-y-4">
                     <Separator />
                     <h3 className="font-semibold text-lg flex items-center gap-2 pt-2"><Sparkles className="text-primary"/>Gerador de Relatório Final</h3>
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
                </CardFooter>
            </Card>
        </div>
      </main>
    </div>
  );
}
