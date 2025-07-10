
"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PlusCircle, User, Home, Building, Bolt, ChevronDown } from "lucide-react";
import { z } from "zod";

import {
  type Installation,
  installationSchema,
  type Client,
  initialClients,
} from '@/app/admin/_lib/data';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// We need a slightly different schema for the form, as we only need the clientId
const formSchema = installationSchema.omit({ 
    clientName: true,
    address: true,
    city: true,
    state: true,
    zipCode: true
});

export function CreateInstallationDialog() {
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const savedInstallationsRaw = localStorage.getItem('installations');
    if (savedInstallationsRaw) {
        setInstallations(JSON.parse(savedInstallationsRaw));
    }
    
    const savedClientsRaw = localStorage.getItem('clients');
    let savedClients = savedClientsRaw ? JSON.parse(savedClientsRaw) : [];
    if (savedClients.length === 0) {
        localStorage.setItem('clients', JSON.stringify(initialClients));
        savedClients = initialClients;
    }
    setClients(savedClients);

  }, []);

  const saveInstallations = (newInstallations: Installation[]) => {
    setInstallations(newInstallations);
    localStorage.setItem('installations', JSON.stringify(newInstallations));
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inverters: [],
      panels: [],
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

  function handleCreate(values: z.infer<typeof formSchema>) {
    const selectedClient = clients.find(c => c.id === values.clientId);
    if (!selectedClient) {
        toast({ title: "Erro", description: "Cliente selecionado não encontrado.", variant: "destructive" });
        return;
    }

    const nextId = installations.length > 0 ? Math.max(...installations.map(i => i.id!)) + 1 : 1;
    
    const newInstallation: Installation = {
      ...values,
      id: nextId,
      installationId: `INST-${String(nextId).padStart(3, '0')}`,
      clientName: selectedClient.name, // Denormalize name for easy access
      address: selectedClient.address,
      city: selectedClient.city,
      state: selectedClient.state,
      zipCode: selectedClient.zipCode,
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
    toast({
      title: "Instalação Cadastrada!",
      description: `Instalação para ${selectedClient.name} adicionada.`,
    });
    form.reset();
    setCreateDialogOpen(false);
  }

  return (
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
            <PlusCircle className="h-5 w-5" />
            Cadastrar Nova Instalação
          </DialogTitle>
          <DialogDescription>
            Selecione o cliente e insira os dados iniciais da instalação.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="create-form"
            onSubmit={form.handleSubmit(handleCreate)}
            className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4"
          >
             <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                   <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={String(client.id!)}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="installationType"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Tipo de Instalação no Local</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="residencial" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center gap-2">
                          <Home size={16} /> Residencial
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="comercial" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center gap-2">
                          <Building size={16} /> Comercial
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          
            <FormField
              control={form.control}
              name="utilityCompany"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Bolt size={16} /> Concessionária
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: CPFL, Enel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="protocolNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nº do Protocolo (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Protocolo da Cia. de Energia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" form="create-form">
            Salvar Instalação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
