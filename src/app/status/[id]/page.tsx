
"use client";

import { useState, useEffect } from "react";
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SunMedium, CheckCircle, Hourglass, Send, ThumbsUp, ThumbsDown, Calendar as CalendarIcon, Bolt, FileText, XCircle, MessageSquare } from "lucide-react";

import { type Installation } from "@/app/admin/page";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
  const commonClasses = "h-5 w-5";
  switch (status) {
    case "completed": return <CheckCircle className={cn(commonClasses, "text-primary")} />;
    case "in_progress": return <Send className={cn(commonClasses, "text-blue-500 animate-pulse")} />;
    case "error": return <XCircle className={cn(commonClasses, "text-destructive")} />;
    default: return <Hourglass className={cn(commonClasses, "text-muted-foreground")} />;
  }
};

export default function StatusPage() {
  const params = useParams();
  const { id } = params;
  const [installation, setInstallation] = useState<Installation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const allInstallations: Installation[] = JSON.parse(localStorage.getItem('installations') || '[]');
      const currentInstallation = allInstallations.find(inst => inst.id === Number(id));
      setInstallation(currentInstallation || null);
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-muted/40 p-4">
             <div className="w-full max-w-2xl space-y-6">
                <Skeleton className="h-10 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-1/2 mx-auto" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
  }

  if (!installation) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center p-4">
        <div className="flex items-center gap-3 mb-4">
            <SunMedium className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">SolarView Pro</h1>
        </div>
        <h2 className="text-xl font-bold text-destructive">Instalação Não Encontrada</h2>
        <p className="text-muted-foreground">O link de acompanhamento é inválido ou a instalação não foi encontrada.</p>
        <p className="text-sm text-muted-foreground mt-2">Por favor, verifique o link ou entre em contato com o administrador.</p>
      </div>
    );
  }
  
  const processSteps = [
    {
      name: "Protocolo Aberto",
      status: installation.protocolNumber ? "completed" : "pending",
      description: installation.protocolDate ? `Protocolo aberto em ${format(new Date(installation.protocolDate), "dd/MM/yyyy")}` : "Aguardando abertura do protocolo",
    },
    {
      name: "Análise do Projeto",
      status: installation.projectStatus === "Aprovado" ? "completed" : (installation.projectStatus === "Reprovado" ? "error" : (installation.projectStatus === "Não Enviado" ? "pending" : "in_progress")),
      description: `Status do projeto: ${installation.projectStatus}`,
    },
    {
      name: "Agendamento da Instalação",
      status: installation.scheduledDate ? "completed" : "pending",
      description: installation.scheduledDate ? `Agendado para ${format(new Date(installation.scheduledDate), "dd/MM/yyyy 'às' HH:mm")}` : "Aguardando aprovação do projeto",
    },
    {
      name: "Execução da Instalação",
      status: installation.status === "Concluído" ? "completed" : (installation.status === "Cancelado" ? "error" : (installation.status === "Em Andamento" ? "in_progress" : "pending")),
      description: `Status da instalação: ${installation.status}`,
    },
    {
      name: "Homologação",
      status: installation.homologationStatus === "Aprovado" ? "completed" : (installation.homologationStatus === "Reprovado" ? "error" : "pending"),
      description: `Status da homologação: ${installation.homologationStatus}`,
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-muted/40 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-3xl">
        <header className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
                <SunMedium className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">SolarView Pro</h1>
            </div>
            <p className="text-muted-foreground">Acompanhamento da sua instalação</p>
        </header>

        <main className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Olá, {installation.clientName}!</CardTitle>
              <CardDescription>
                Este é o status atualizado do seu projeto de energia solar.
                <br />
                Local: {installation.city} - {installation.state}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Linha do Tempo</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8 relative pl-6 before:absolute before:inset-y-0 before:w-px before:bg-border before:left-0 before:ml-3">
                    {processSteps.map((step, index) => (
                         <div key={index} className="relative flex items-start">
                            <div className="absolute -left-[1.6rem] top-0 h-6 w-6 bg-background flex items-center justify-center rounded-full border-2 p-1">
                                <StatusIcon status={step.status} />
                            </div>
                            <div className="pl-6">
                                <h4 className="font-semibold">{step.name}</h4>
                                <p className="text-sm text-muted-foreground">{step.description}</p>
                            </div>
                       </div>
                    ))}
                </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle>Últimas Atualizações</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="space-y-6 relative pl-6 before:absolute before:inset-y-0 before:w-px before:bg-border before:left-0 before:ml-3">
                    {installation.events && installation.events.filter(e => e.type !== 'Nota').length > 0 ? (
                        installation.events
                            .filter(event => event.type !== 'Nota') // Don't show internal notes
                            .slice(0, 5) // Show last 5 relevant events
                            .map(event => (
                            <div key={event.id} className="relative">
                                <div className="absolute -left-6 top-1.5 h-3 w-3 bg-muted rounded-full border-2 border-background" />
                                <div className="pl-6">
                                    <p className="text-xs text-muted-foreground">{format(new Date(event.date), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}</p>
                                    <p className="text-sm">{event.description}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground py-4">
                            <MessageSquare className="mx-auto h-8 w-8" />
                            <p className="mt-2">Nenhuma atualização registrada ainda.</p>
                        </div>
                    )}
                 </div>
            </CardContent>
          </Card>
        </main>
        
        <footer className="mt-8 text-center text-xs text-muted-foreground">
            <p>Em caso de dúvidas, entre em contato com nosso suporte.</p>
            <p>&copy; {new Date().getFullYear()} SolarView Pro. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
}
