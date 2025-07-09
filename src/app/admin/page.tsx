"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, User, SunMedium, Copy, Home, Building, Bolt, FileText } from "lucide-react";

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
  FormDescription,
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
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const formSchema = z.object({
  clientName: z.string().min(2, "O nome do cliente é obrigatório."),
  address: z.string().min(5, "O endereço é obrigatório."),
  city: z.string().min(2, "A cidade é obrigatória."),
  state: z.string().min(2, "O estado é obrigatório."),
  zipCode: z.string().min(8, "O CEP é obrigatório."),
  installationType: z.enum(["residencial", "comercial"], {
    required_error: "Selecione o tipo de instalação.",
  }),
  utilityCompany: z.string().min(2, "O nome da concessionária é obrigatório."),
});

const mockInstallations = [
    { id: 1, clientName: "Condomínio Sol Nascente", status: "Pendente", link: "/?client=Condomínio%20Sol%20Nascente" },
    { id: 2, clientName: "Maria Silva", status: "Concluído", link: "/?client=Maria%20Silva" },
    { id: 3, clientName: "Supermercado Economia", status: "Pendente", link: "/?client=Supermercado%20Economia" },
];

export default function AdminPage() {
  const [generatedLink, setGeneratedLink] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      utilityCompany: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const baseUrl = window.location.origin;
    // O ideal é passar todos os dados via query params ou apenas um ID
    // mas por simplicidade, passaremos apenas o nome do cliente por enquanto.
    const link = `${baseUrl}/?client=${encodeURIComponent(values.clientName)}`;
    setGeneratedLink(link);
    setIsDialogOpen(true);
  }

  function copyLinkToClipboard() {
    navigator.clipboard.writeText(generatedLink);
    toast({
      title: "Link Copiado!",
      description: "O link foi copiado para a área de transferência.",
    });
  }

  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <SunMedium className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold text-foreground">SolarView Pro - Admin</h1>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-8 p-4 md:p-8">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Cadastrar Nova Instalação
              </CardTitle>
              <CardDescription>
                Insira os dados do cliente para gerar um link de questionário para o instalador.
              </CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField control={form.control} name="clientName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Cliente</FormLabel>
                        <FormControl><Input placeholder="Ex: Condomínio Sol Nascente" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name="installationType" render={({ field }) => (
                      <FormItem className="space-y-3">
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
                  </div>
                   <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl><Input placeholder="Rua, Número, Bairro" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                     <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                     <FormField control={form.control} name="state" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                     <FormField control={form.control} name="zipCode" render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl><Input placeholder="00000-000" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                  </div>
                   <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                     <FormField control={form.control} name="utilityCompany" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Bolt size={16}/> Concessionária</FormLabel>
                        <FormControl><Input placeholder="Ex: CPFL, Enel" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full md:w-auto">
                    <Link className="mr-2 h-4 w-4" />
                    Gerar Link para o Instalador
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
          
          <Card>
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
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockInstallations.map((inst) => (
                        <TableRow key={inst.id}>
                            <TableCell className="font-medium">{inst.clientName}</TableCell>
                            <TableCell>
                                <Badge variant={inst.status === 'Concluído' ? 'default' : 'secondary'}>{inst.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm" onClick={() => {
                                    setGeneratedLink(`${window.location.origin}${inst.link}`);
                                    setIsDialogOpen(true);
                                }}>
                                    <Link className="mr-2 h-3 w-3" />
                                    Ver Link
                                </Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>

        </main>
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Link Gerado com Sucesso!</AlertDialogTitle>
            <AlertDialogDescription>
              Envie o link abaixo para o técnico responsável pela instalação. Ele será direcionado para o formulário de preenchimento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center space-x-2 rounded-md border bg-muted p-2">
            <Link className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <Input
              id="link"
              value={generatedLink}
              readOnly
              className="flex-1 bg-transparent ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 border-0"
            />
            <Button type="button" size="sm" className="px-3" onClick={copyLinkToClipboard}>
              <span className="sr-only">Copiar</span>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsDialogOpen(false)}>Fechar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
