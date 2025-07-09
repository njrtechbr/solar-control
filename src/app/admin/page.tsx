"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, User, SunMedium, Copy } from "lucide-react";

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
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const formSchema = z.object({
  clientName: z.string().min(2, {
    message: "O nome do cliente deve ter pelo menos 2 caracteres.",
  }),
});

export default function AdminPage() {
  const [generatedLink, setGeneratedLink] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const baseUrl = window.location.origin;
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
        <main className="flex flex-1 items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Cadastrar Novo Cliente
              </CardTitle>
              <CardDescription>
                Insira o nome do cliente para gerar um link de questionário para o instalador.
              </CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent>
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
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">
                    <Link className="mr-2 h-4 w-4" />
                    Gerar Link para o Instalador
                  </Button>
                </CardFooter>
              </form>
            </Form>
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
