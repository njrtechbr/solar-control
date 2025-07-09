"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, User, SunMedium, Copy, Home, Building, Bolt, FileText, Trash2, Edit, MoreHorizontal, AlertTriangle, FileCheck2 } from "lucide-react";

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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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

const initialInstallations: Installation[] = [
    { id: 1, clientName: "Condomínio Sol Nascente", address: "Rua A, 123", city: "Campinas", state: "SP", zipCode: "13000-001", installationType: "comercial", utilityCompany: "CPFL", status: "Pendente", reportSubmitted: false },
    { id: 2, clientName: "Maria Silva", address: "Rua B, 456", city: "São Paulo", state: "SP", zipCode: "01000-002", installationType: "residencial", utilityCompany: "Enel", status: "Concluído", reportSubmitted: true },
    { id: 3, clientName: "Supermercado Economia", address: "Av. C, 789", city: "Valinhos", state: "SP", zipCode: "13270-003", installationType: "comercial", utilityCompany: "CPFL", status: "Cancelado", reportSubmitted: false },
];


export default function AdminPage() {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [editingInstallation, setEditingInstallation] = useState<Installation | null>(null);
  const [deletingInstallation, setDeletingInstallation] = useState<Installation | null>(null);
  const [viewingReport, setViewingReport] = useState<any | null>(null);
  const [linkDialog, setLinkDialog] = useState({ isOpen: false, link: "" });

  useEffect(() => {
    // Load installations from localStorage on mount
    const savedInstallations = localStorage.getItem('installations');
    const loadedInstallations = savedInstallations ? JSON.parse(savedInstallations) : initialInstallations;
    
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

  function handleCreate(values: Installation) {
    const newInstallation = { ...values, id: Date.now(), reportSubmitted: false };
    saveInstallations([...installations, newInstallation]);
    toast({ title: "Instalação Cadastrada!", description: `Cliente ${values.clientName} adicionado.` });
    form.reset();
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

  function copyLinkToClipboard() {
    navigator.clipboard.writeText(linkDialog.link);
    toast({
      title: "Link Copiado!",
      description: "O link foi copiado para a área de transferência.",
    });
  }

  function openReportDialog(clientName: string) {
    const reportData = localStorage.getItem(`report_${clientName}`);
    if (reportData) {
        setViewingReport(JSON.parse(reportData));
    } else {
        toast({
            title: "Relatório não encontrado",
            description: "O instalador ainda não enviou o relatório para este cliente.",
            variant: "destructive"
        })
    }
  }

  const getBadgeVariant = (status: Installation["status"]) => {
    switch(status) {
        case "Concluído": return "default";
        case "Cancelado": return "destructive";
        case "Pendente":
        default: return "secondary";
    }
  }


  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <SunMedium className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold text-foreground">SolarView Pro - Admin</h1>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-8 p-4 md:grid md:grid-cols-3 md:gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3 md:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5"/> Instalações Cadastradas</CardTitle>
                <CardDescription>Visualize e gerencie as instalações pendentes e concluídas.</CardDescription>
              </CardHeader>
              <CardContent>
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Cliente</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Relatório</TableHead>
                              <TableHead>Cidade/UF</TableHead>
                              <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {installations.map((inst) => (
                          <TableRow key={inst.id}>
                              <TableCell className="font-medium">{inst.clientName}</TableCell>
                              <TableCell>
                                <Badge variant={getBadgeVariant(inst.status)}>{inst.status}</Badge>
                              </TableCell>
                               <TableCell>
                                {inst.reportSubmitted ? (
                                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">Enviado</Badge>
                                ) : (
                                    <Badge variant="secondary">Pendente</Badge>
                                )}
                              </TableCell>
                              <TableCell>{inst.city}/{inst.state}</TableCell>
                              <TableCell className="text-right">
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Abrir menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                         {inst.reportSubmitted && (
                                            <DropdownMenuItem onClick={() => openReportDialog(inst.clientName)}>
                                                <FileCheck2 className="mr-2 h-4 w-4" />
                                                <span>Ver Relatório</span>
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem onClick={() => generateLink(inst.clientName)}>
                                            <Link className="mr-2 h-4 w-4" />
                                            <span>Ver Link</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => openEditDialog(inst)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            <span>Editar</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => setDeletingInstallation(inst)}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Excluir</span>
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                  </DropdownMenu>
                              </TableCell>
                          </TableRow>
                          ))}
                      </TableBody>
                  </Table>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1 md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Cadastrar Nova Instalação
                </CardTitle>
                <CardDescription>
                  Insira os dados para criar um novo registro de instalação.
                </CardDescription>
              </CardHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreate)}>
                  <CardContent className="space-y-4">
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
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full">
                      Salvar Instalação
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
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
              {/* Add other fields as needed */}
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
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a instalação de <span className="font-bold">{deletingInstallation?.clientName}</span>.
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
            <Link className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <Input id="link" value={linkDialog.link} readOnly className="flex-1 bg-transparent ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 border-0" />
            <Button type="button" size="sm" className="px-3" onClick={copyLinkToClipboard}>
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
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Relatório de Instalação - {viewingReport?.clientName}</DialogTitle>
                    <DialogDescription>Detalhes preenchidos pelo instalador.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] pr-6">
                {viewingReport && (
                    <div className="space-y-4 py-4">
                        <h3 className="font-semibold text-lg">Informações Gerais</h3>
                        <p><strong>Potência do Painel:</strong> {viewingReport.panelPower || 'N/A'} Wp</p>
                        <Separator />

                        <h3 className="font-semibold text-lg mt-4">Medições das Strings (VCC)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {viewingReport.strings.map((s: any, i: number) => (
                                (s.voltage || s.plates) && <div key={i}><p className="font-medium">String {i+1}:</p> Tensão: {s.voltage || 'N/A'}V, Placas: {s.plates || 'N/A'}</div>
                            ))}
                        </div>
                         <Separator />

                        <h3 className="font-semibold text-lg mt-4">Medições Elétricas (CA)</h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                            <p><strong>F1 x N:</strong> {viewingReport.phase1Neutro || 'N/A'} V</p>
                            <p><strong>F2 x N:</strong> {viewingReport.phase2Neutro || 'N/A'} V</p>
                            <p><strong>F3 x N:</strong> {viewingReport.phase3Neutro || 'N/A'} V</p>
                            <p><strong>F1 x F2:</strong> {viewingReport.phase1phase2 || 'N/A'} V</p>
                            <p><strong>F1 x F3:</strong> {viewingReport.phase1phase3 || 'N/A'} V</p>
                            <p><strong>F2 x F3:</strong> {viewingReport.phase2phase3 || 'N/A'} V</p>
                            <p><strong>Fase x Terra:</strong> {viewingReport.phaseTerra || 'N/A'} V</p>
                            <p><strong>Neutro x Terra:</strong> {viewingReport.neutroTerra || 'N/A'} V</p>
                        </div>
                         <Separator />

                        <h3 className="font-semibold text-lg mt-4">Componentes e Cabeamento</h3>
                        <p><strong>Cabo Medidor x Disjuntor:</strong> {viewingReport.cableMeterToBreaker || 'N/A'}</p>
                        <p><strong>Cabo Disjuntor x Inversor:</strong> {viewingReport.cableBreakerToInverter || 'N/A'}</p>
                        <p><strong>Disjuntor Geral:</strong> {viewingReport.generalBreaker || 'N/A'}</p>
                        <p><strong>Disjuntor Inversor:</strong> {viewingReport.inverterBreaker || 'N/A'}</p>
                        <Separator />
                        
                        <h3 className="font-semibold text-lg mt-4">Verificação Final</h3>
                         <p><strong>Datalogger Online:</strong> {viewingReport.dataloggerConnected ? 'Sim' : 'Não'}</p>
                        {viewingReport.observations && <p><strong>Observações:</strong> {viewingReport.observations}</p>}

                    </div>
                )}
                </ScrollArea>
                <DialogFooter>
                    <Button onClick={() => setViewingReport(null)}>Fechar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
}
