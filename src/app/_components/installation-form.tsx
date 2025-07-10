
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Camera,
  CircuitBoard,
  ClipboardCheck,
  FileText,
  Power,
  SunMedium,
  User,
  Video,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { inverterSchema, panelSchema } from "@/app/admin/_lib/data";


const formSchema = z.object({
  clientName: z.string().min(1, "O nome do cliente é obrigatório."),
  
  // Equipment
  inverters: z.array(inverterSchema).optional(),
  panels: z.array(panelSchema).optional(),

  // VCC
  strings: z.array(
    z.object({
      voltage: z.coerce.number().optional(),
      plates: z.coerce.number().optional(),
    })
  ),
  
  // CA
  phase1Neutro: z.coerce.number().optional(),
  phase2Neutro: z.coerce.number().optional(),
  phase3Neutro: z.coerce.number().optional(),
  phase1phase2: z.coerce.number().optional(),
  phase1phase3: z.coerce.number().optional(),
  phase2phase3: z.coerce.number().optional(),
  phaseTerra: z.coerce.number().optional(),
  neutroTerra: z.coerce.number().optional(),

  // Cabling
  cableMeterToBreaker: z.string().optional(),
  cableBreakerToInverter: z.string().optional(),
  generalBreaker: z.string().optional(),
  inverterBreaker: z.string().optional(),

  // Final Check
  dataloggerConnected: z.boolean().default(false),
  observations: z.string().optional(),
  photo_uploads: z.array(z.object({ 
    file: z.any(), 
    dataUrl: z.string().optional(),
    annotation: z.string().optional() 
  })).optional(),
  installationVideo: z.any().optional(),
  installationVideoDataUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CABLE_SIZES = ["4mm", "6mm", "10mm", "16mm", "25mm", "50mm", "75mm", "Outro"];
const DISJUNCTOR_RATINGS = ["25A", "32A", "40A", "50A", "63A", "Outro"];
const PHOTO_UPLOADS = [
  { id: "photo1", label: "Placas Solares" },
  { id: "photo2", label: "Inversor (Foto Ampla)" },
  { id: "photo3", label: "Teste de Goteiras" },
  { id: "photo4", label: "Fachada do Local" },
  { id: "photo5", label: "Aterramento" },
  { id: "photo6", label: "Tela do Inversor" },
  { id: "photo7", label: "Etiqueta do Inversor" },
  { id: "photo8", label: "Etiqueta do Painel" },
  { id: "photo9", label: "Placa de Geração" },
  { id: "photo10", label: "Cabos" },
  { id: "photo11", label: "Datalogger" },
  { id: "photo12", label: "Ponto de Conexão" },
];

// Helper to convert file to Base64
const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

export default function InstallationForm({ clientName }: { clientName: string }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: clientName || "",
      inverters: [],
      panels: [],
      strings: Array(6).fill({ voltage: undefined, plates: undefined }),
      photo_uploads: Array(12).fill({ file: undefined, dataUrl: "", annotation: "" }),
      dataloggerConnected: false,
    },
  });

  async function onSubmit(data: FormValues) {
    try {
        // Handle photo uploads
        if (data.photo_uploads) {
            for (let i = 0; i < data.photo_uploads.length; i++) {
                const photo = data.photo_uploads[i];
                if (photo.file && photo.file instanceof FileList && photo.file.length > 0) {
                    photo.dataUrl = await fileToDataUrl(photo.file[0]);
                }
                delete photo.file; // Don't store the File object
            }
        }

        // Handle video upload
        if (data.installationVideo && data.installationVideo instanceof FileList && data.installationVideo.length > 0) {
            data.installationVideoDataUrl = await fileToDataUrl(data.installationVideo[0]);
        }
        delete data.installationVideo; // Don't store the File object
      
        // Save the report to localStorage, keyed by the client's name
        localStorage.setItem(`report_${data.clientName}`, JSON.stringify(data));
        
        // Also update the main installations list to mark the report as submitted
        const installations = JSON.parse(localStorage.getItem('installations') || '[]');
        const updatedInstallations = installations.map((inst: any) => 
            inst.clientName === data.clientName ? { ...inst, reportSubmitted: true } : inst
        );
        localStorage.setItem('installations', JSON.stringify(updatedInstallations));

        toast({
          title: "Relatório Enviado com Sucesso!",
          description: "As informações da instalação foram salvas. Você pode fechar esta página.",
        });
        
        // Optionally, disable the form after submission
        form.reset({}, { keepValues: true });

    } catch (error) {
        console.error("Failed to save report to localStorage", error);
        toast({
            title: "Erro ao Salvar",
            description: "Não foi possível salvar o relatório. Verifique as permissões do navegador.",
            variant: "destructive"
        })
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4">
        <div className="flex items-center gap-2">
          <SunMedium className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-bold text-foreground">SolarView Pro</h1>
        </div>
      </header>
      <main className="flex-1 p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-2xl space-y-6">
            <Accordion type="multiple" defaultValue={['client-info']} className="w-full">
              <AccordionItem value="client-info">
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Informações do Cliente</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div className="space-y-4 rounded-lg border p-4">
                    <FormField control={form.control} name="clientName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cliente</FormLabel>
                          <FormControl><Input {...field} readOnly disabled /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="equipment-details">
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <CircuitBoard className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Detalhes dos Equipamentos</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                    <div className="rounded-lg border p-4 space-y-4">
                      <h4 className="font-medium">Inversor</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="inverters.0.brand" render={({ field }) => (<FormItem><FormLabel>Marca</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                        <FormField control={form.control} name="inverters.0.model" render={({ field }) => (<FormItem><FormLabel>Modelo</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                        <FormField control={form.control} name="inverters.0.serialNumber" render={({ field }) => (<FormItem><FormLabel>Nº de Série</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                        <FormField control={form.control} name="inverters.0.warranty" render={({ field }) => (<FormItem><FormLabel>Garantia</FormLabel><FormControl><Input placeholder="Ex: 5 anos" {...field} /></FormControl></FormItem>)} />
                        <FormField control={form.control} name="inverters.0.dataloggerId" render={({ field }) => (<FormItem><FormLabel>ID Datalogger</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                      </div>
                    </div>
                     <div className="rounded-lg border p-4 space-y-4">
                      <h4 className="font-medium">Painéis Solares</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="panels.0.brand" render={({ field }) => (<FormItem><FormLabel>Marca</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                        <FormField control={form.control} name="panels.0.model" render={({ field }) => (<FormItem><FormLabel>Modelo</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
                        <FormField control={form.control} name="panels.0.power" render={({ field }) => (<FormItem><FormLabel>Potência (Wp)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                        <FormField control={form.control} name="panels.0.quantity" render={({ field }) => (<FormItem><FormLabel>Quantidade</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                      </div>
                    </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="strings-measurements">
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <Power className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Medições das Strings (VCC)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="space-y-3 rounded-lg border p-3">
                        <p className="text-center font-semibold text-sm">String {index + 1}</p>
                        <FormField control={form.control} name={`strings.${index}.voltage`} render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tensão (V)</FormLabel>
                              <FormControl><Input type="number" placeholder="Tensão" {...field} /></FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField control={form.control} name={`strings.${index}.plates`} render={({ field }) => (
                            <FormItem>
                              <FormLabel>Qtd. Placas</FormLabel>
                              <FormControl><Input type="number" placeholder="Placas" {...field} /></FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="electrical-measurements">
                <AccordionTrigger>
                   <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Medições Elétricas (CA)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                   <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
                    <FormField control={form.control} name="phase1Neutro" render={({ field }) => (<FormItem><FormLabel>F1 x N (V)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="phase2Neutro" render={({ field }) => (<FormItem><FormLabel>F2 x N (V)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="phase3Neutro" render={({ field }) => (<FormItem><FormLabel>F3 x N (V)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="phase1phase2" render={({ field }) => (<FormItem><FormLabel>F1 x F2 (V)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="phase1phase3" render={({ field }) => (<FormItem><FormLabel>F1 x F3 (V)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="phase2phase3" render={({ field }) => (<FormItem><FormLabel>F2 x F3 (V)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="phaseTerra" render={({ field }) => (<FormItem><FormLabel>Fase x Terra (V)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                    <FormField control={form.control} name="neutroTerra" render={({ field }) => (<FormItem><FormLabel>Neutro x Terra (V)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="components-cabling">
                <AccordionTrigger>
                   <div className="flex items-center gap-3">
                    <CircuitBoard className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Componentes e Cabeamento</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                   <div className="space-y-4 rounded-lg border p-4">
                      <FormField control={form.control} name="cableMeterToBreaker" render={({ field }) => (<FormItem className="space-y-3"><FormLabel>Cabo Medidor x Disjuntor Geral</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap gap-x-4 gap-y-2">{CABLE_SIZES.map(size => (<FormItem key={size} className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value={size} /></FormControl><FormLabel className="font-normal">{size}</FormLabel></FormItem>))}</RadioGroup></FormControl></FormItem>)} />
                   </div>
                   <div className="space-y-4 rounded-lg border p-4">
                      <FormField control={form.control} name="cableBreakerToInverter" render={({ field }) => (<FormItem className="space-y-3"><FormLabel>Cabo Disjuntor Geral x Inversor</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap gap-x-4 gap-y-2">{CABLE_SIZES.map(size => (<FormItem key={size} className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value={size} /></FormControl><FormLabel className="font-normal">{size}</FormLabel></FormItem>))}</RadioGroup></FormControl></FormItem>)} />
                   </div>
                   <div className="space-y-4 rounded-lg border p-4">
                      <FormField control={form.control} name="generalBreaker" render={({ field }) => (<FormItem className="space-y-3"><FormLabel>Disjuntor Geral</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap gap-x-4 gap-y-2">{DISJUNCTOR_RATINGS.map(rating => (<FormItem key={rating} className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value={rating} /></FormControl><FormLabel className="font-normal">{rating}</FormLabel></FormItem>))}</RadioGroup></FormControl></FormItem>)} />
                   </div>
                   <div className="space-y-4 rounded-lg border p-4">
                      <FormField control={form.control} name="inverterBreaker" render={({ field }) => (<FormItem className="space-y-3"><FormLabel>Disjuntor Inversor</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap gap-x-4 gap-y-2">{DISJUNCTOR_RATINGS.map(rating => (<FormItem key={rating} className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value={rating} /></FormControl><FormLabel className="font-normal">{rating}</FormLabel></FormItem>))}</RadioGroup></FormControl></FormItem>)} />
                   </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="photo-docs">
                <AccordionTrigger>
                   <div className="flex items-center gap-3">
                    <Camera className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Documentação Fotográfica</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {PHOTO_UPLOADS.map((photo, index) => (
                      <div key={photo.id} className="space-y-2 rounded-lg border p-3">
                        <FormLabel className="text-sm font-medium">{index+1}: {photo.label}</FormLabel>
                        <FormField control={form.control} name={`photo_uploads.${index}.file`} render={({ field }) => (
                          <FormItem>
                            <FormControl><Input type="file" accept="image/*" className="text-sm" onChange={(e) => field.onChange(e.target.files)} /></FormControl>
                          </FormItem>
                        )}/>
                         <FormField control={form.control} name={`photo_uploads.${index}.annotation`} render={({ field }) => (
                          <FormItem>
                            <FormControl><Input type="text" placeholder="Anotação (opcional)" {...field} /></FormControl>
                          </FormItem>
                        )}/>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="final-check">
                 <AccordionTrigger>
                   <div className="flex items-center gap-3">
                    <ClipboardCheck className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Verificação Final</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                  <div className="rounded-lg border p-4">
                    <FormField control={form.control} name="dataloggerConnected" render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Conexão Datalogger</FormLabel>
                          <p className="text-sm text-muted-foreground">O datalogger está online?</p>
                        </div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    )}
                    />
                  </div>
                   <div className="space-y-2 rounded-lg border p-4">
                    <FormField control={form.control} name="observations" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><FileText size={16}/> Observações</FormLabel>
                          <FormControl><Textarea placeholder="Insira notas relevantes..." className="min-h-[100px]" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                   <div className="space-y-2 rounded-lg border p-4">
                    <FormField control={form.control} name="installationVideo" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><Video size={16}/> Vídeo da Instalação</FormLabel>
                           <p className="text-sm text-muted-foreground pb-2">Grave um vídeo da instalação concluída.</p>
                          <FormControl><Input type="file" accept="video/*" onChange={(e) => field.onChange(e.target.files)} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="pt-4">
              <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting || form.formState.isSubmitted}>
                {form.formState.isSubmitting ? "Enviando..." : "Enviar Relatório"}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
