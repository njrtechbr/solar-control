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
  CardDescription,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  clientName: z.string().min(1, "O nome do cliente é obrigatório."),
  panelPower: z.coerce.number().positive().optional(),
  strings: z.array(
    z.object({
      voltage: z.coerce.number().optional(),
      plates: z.coerce.number().optional(),
    })
  ),
  phase1Neutro: z.coerce.number().optional(),
  phase2Neutro: z.coerce.number().optional(),
  phase3Neutro: z.coerce.number().optional(),
  phase1phase2: z.coerce.number().optional(),
  phase1phase3: z.coerce.number().optional(),
  phase2phase3: z.coerce.number().optional(),
  phaseTerra: z.coerce.number().optional(),
  neutroTerra: z.coerce.number().optional(),
  cableMeterToBreaker: z.string().optional(),
  cableBreakerToInverter: z.string().optional(),
  generalBreaker: z.string().optional(),
  inverterBreaker: z.string().optional(),
  dataloggerConnected: z.boolean().default(false),
  observations: z.string().optional(),
  photo_uploads: z.array(z.object({ file: z.any(), annotation: z.string().optional() })).optional(),
  installationVideo: z.any().optional(),
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

export default function InstallationLogPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      strings: Array(6).fill({ voltage: undefined, plates: undefined }),
      photo_uploads: Array(12).fill({ file: undefined, annotation: "" }),
      dataloggerConnected: false,
    },
  });

  function onSubmit(data: FormValues) {
    console.log(data);
    toast({
      title: "Registro Enviado",
      description: "As informações da instalação foram salvas com sucesso.",
    });
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
        <div className="flex items-center gap-2">
          <SunMedium className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-bold text-foreground">SolarView Pro</h1>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8 lg:p-10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-4xl space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><User /> Informações do Cliente</CardTitle>
                <CardDescription>Detalhes do cliente e da usina solar.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <FormField control={form.control} name="clientName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente - Nome do Grupo</FormLabel>
                      <FormControl><Input placeholder="Ex: Condomínio Sol Nascente" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="panelPower" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Potência do Painel (Wp)</FormLabel>
                      <FormControl><Input type="number" placeholder="Ex: 550" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Power /> Medições das Strings (VCC)</CardTitle>
                <CardDescription>Insira a tensão (V) e a quantidade de placas por string.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4 lg:grid-cols-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="space-y-4 rounded-lg border p-3">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Zap /> Medições Elétricas (CA)</CardTitle>
                <CardDescription>Valores de tensão medidos na instalação.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <FormField control={form.control} name="phase1Neutro" render={({ field }) => (<FormItem><FormLabel>Fase 1 x Neutro (V)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="phase2Neutro" render={({ field }) => (<FormItem><FormLabel>Fase 2 x Neutro (V)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="phase3Neutro" render={({ field }) => (<FormItem><FormLabel>Fase 3 x Neutro (V)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="phase1phase2" render={({ field }) => (<FormItem><FormLabel>Fase 1 x Fase 2 (V)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="phase1phase3" render={({ field }) => (<FormItem><FormLabel>Fase 1 x Fase 3 (V)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="phase2phase3" render={({ field }) => (<FormItem><FormLabel>Fase 2 x Fase 3 (V)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="phaseTerra" render={({ field }) => (<FormItem><FormLabel>Fase x Terra (V)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
                <FormField control={form.control} name="neutroTerra" render={({ field }) => (<FormItem><FormLabel>Neutro x Terra (V)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CircuitBoard /> Componentes e Cabeamento</CardTitle>
                <CardDescription>Especifique os cabos e disjuntores utilizados.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-8 md:grid-cols-2">
                <FormField control={form.control} name="cableMeterToBreaker" render={({ field }) => (<FormItem className="space-y-3"><FormLabel>Cabo Medidor x Disjuntor Geral</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap gap-4">{CABLE_SIZES.map(size => (<FormItem key={size} className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value={size} /></FormControl><FormLabel className="font-normal">{size}</FormLabel></FormItem>))}</RadioGroup></FormControl></FormItem>)} />
                <FormField control={form.control} name="cableBreakerToInverter" render={({ field }) => (<FormItem className="space-y-3"><FormLabel>Cabo Disjuntor Geral x Inversor</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap gap-4">{CABLE_SIZES.map(size => (<FormItem key={size} className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value={size} /></FormControl><FormLabel className="font-normal">{size}</FormLabel></FormItem>))}</RadioGroup></FormControl></FormItem>)} />
                <FormField control={form.control} name="generalBreaker" render={({ field }) => (<FormItem className="space-y-3"><FormLabel>Disjuntor Geral</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap gap-4">{DISJUNCTOR_RATINGS.map(rating => (<FormItem key={rating} className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value={rating} /></FormControl><FormLabel className="font-normal">{rating}</FormLabel></FormItem>))}</RadioGroup></FormControl></FormItem>)} />
                <FormField control={form.control} name="inverterBreaker" render={({ field }) => (<FormItem className="space-y-3"><FormLabel>Disjuntor Inversor</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap gap-4">{DISJUNCTOR_RATINGS.map(rating => (<FormItem key={rating} className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value={rating} /></FormControl><FormLabel className="font-normal">{rating}</FormLabel></FormItem>))}</RadioGroup></FormControl></FormItem>)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Camera /> Documentação Fotográfica</CardTitle>
                <CardDescription>Anexe as fotos da instalação e adicione anotações se necessário.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {PHOTO_UPLOADS.map((photo, index) => (
                  <div key={photo.id} className="space-y-2 rounded-lg border p-4">
                    <FormLabel className="flex items-center gap-2"><Camera size={16}/> {index+1}: {photo.label}</FormLabel>
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ClipboardCheck /> Verificação Final</CardTitle>
                <CardDescription>Confirmação de conectividade, observações finais e vídeo da instalação.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <FormField control={form.control} name="dataloggerConnected" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Conexão Datalogger</FormLabel>
                        <p className="text-sm text-muted-foreground">Confirma que o datalogger está conectado e funcional.</p>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )}
                />
                <Separator />
                <FormField control={form.control} name="observations" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-base"><FileText size={16}/> Observações</FormLabel>
                      <FormControl><Textarea placeholder="Insira quaisquer notas ou observações relevantes sobre a instalação..." className="min-h-[120px]" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator />
                <FormField control={form.control} name="installationVideo" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-base"><Video size={16}/> Vídeo da Instalação</FormLabel>
                       <p className="text-sm text-muted-foreground pb-2">Após finalizar, realize um vídeo mostrando toda a instalação concluída.</p>
                      <FormControl><Input type="file" accept="video/*" onChange={(e) => field.onChange(e.target.files)} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" size="lg">Registrar Instalação</Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
