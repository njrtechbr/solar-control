
"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PlusCircle, User, Home, Building, Bolt } from "lucide-react";

import {
  type Installation,
  installationSchema
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
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function CreateInstallationDialog() {
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [installations, setInstallations] = useState<Installation[]>([]);

  useEffect(() => {
    const savedInstallations = localStorage.getItem('installations');
    if (savedInstallations) {
      setInstallations(JSON.parse(savedInstallations));
    }
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
    toast({
      title: "Instalação Cadastrada!",
      description: `Cliente ${values.clientName} adicionado.`,
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
            <User className="h-5 w-5" />
            Cadastrar Nova Instalação
          </DialogTitle>
          <DialogDescription>
            Insira os dados para criar um novo registro de instalação. Equipamentos são adicionados depois.
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
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cliente</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Condomínio Sol Nascente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="installationType"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Tipo de Instalação</FormLabel>
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
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua, Número, Bairro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP</FormLabel>
                  <FormControl>
                    <Input placeholder="00000-000" {...field} />
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
