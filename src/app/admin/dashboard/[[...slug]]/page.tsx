
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import {
  type Installation,
  InstallationStatus,
  ProjectStatus,
  HomologationStatus,
  initialInstallations,
  createSampleReport,
} from '@/app/admin/_lib/data';

import { KanbanBoard, type KanbanColumnType } from '@/app/admin/_components/kanban-board';
import { toast } from '@/hooks/use-toast';

const KANBAN_CONFIG = {
  installation: {
    columns: [
      { id: 'Pendente', title: 'Pendente' },
      { id: 'Agendado', title: 'Agendado' },
      { id: 'Em Andamento', title: 'Em Andamento' },
      { id: 'Concluído', title: 'Concluído' },
      { id: 'Cancelado', title: 'Cancelado' },
    ],
    statusType: 'status' as keyof Installation,
  },
  project: {
    columns: [
      { id: 'Não Enviado', title: 'Não Enviado' },
      { id: 'Enviado para Análise', title: 'Em Análise' },
      { id: 'Aprovado', title: 'Aprovado' },
      { id: 'Reprovado', title: 'Reprovado' },
    ],
    statusType: 'projectStatus' as keyof Installation,
  },
  homologation: {
    columns: [
      { id: 'Pendente', title: 'Pendente' },
      { id: 'Aprovado', title: 'Aprovado' },
      { id: 'Reprovado', title: 'Reprovado' },
    ],
    statusType: 'homologationStatus' as keyof Installation,
  },
  report: {
     columns: [
      { id: 'Enviado', title: 'Enviado' },
      { id: 'Pendente', title: 'Pendente' },
    ],
    statusType: 'reportSubmitted' as keyof Installation,
  }
};

type DashboardType = keyof typeof KANBAN_CONFIG;

export default function DashboardPage() {
  const params = useParams();
  const slug = (params.slug?.[0] || 'installation') as DashboardType;
  const config = KANBAN_CONFIG[slug] || KANBAN_CONFIG.installation;

  const [installations, setInstallations] = useState<Installation[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    let savedInstallations = localStorage.getItem('installations');
    if (!savedInstallations || JSON.parse(savedInstallations).length === 0) {
      localStorage.setItem('installations', JSON.stringify(initialInstallations));
      savedInstallations = JSON.stringify(initialInstallations);
    }
    
    const loadedInstallations = JSON.parse(savedInstallations) as Installation[];
    const sampleReportKey = 'report_Maria Silva';
    if (!localStorage.getItem(sampleReportKey)) {
        localStorage.setItem(sampleReportKey, JSON.stringify(createSampleReport()));
    }
    const updatedInstallations = loadedInstallations.map((inst: Installation) => {
        const report = localStorage.getItem(`report_${inst.clientName}`);
        return { ...inst, reportSubmitted: !!report };
    });
    setInstallations(updatedInstallations);
    setIsMounted(true);

  }, []);

  const saveInstallations = (newInstallations: Installation[]) => {
    setInstallations(newInstallations);
    localStorage.setItem('installations', JSON.stringify(newInstallations));
  };
  
  const handleItemMove = (installationId: number, newStatus: string, oldStatus: string, statusType: keyof Installation) => {
    const allInstallations = [...installations];
    const installationIndex = allInstallations.findIndex(inst => inst.id === installationId);
    if (installationIndex === -1) return;

    const installation = allInstallations[installationIndex];
    
    let eventDescription = '';
    
    if (installation[statusType] === newStatus) return;

    const valueToSet: string | boolean = statusType === 'reportSubmitted' ? (newStatus === 'Enviado') : newStatus;
    (installation as any)[statusType] = valueToSet;
    eventDescription = `Status de '${statusType}' alterado de "${oldStatus}" para "${newStatus}".`;

    if (statusType === "status" && newStatus === "Agendado" && !installation.scheduledDate) {
        const scheduledDate = new Date(Date.now() + 86400000 * 7);
        installation.scheduledDate = scheduledDate.toISOString();
        const scheduleEvent = {
            id: new Date().toISOString() + "_schedule",
            date: new Date().toISOString(),
            type: 'Agendamento',
            description: `Instalação agendada para ${format(scheduledDate, "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR })}.`,
            attachments: [],
        };
        installation.events.push(scheduleEvent);
    }
    
    const newEvent = {
        id: new Date().toISOString(),
        date: new Date().toISOString(),
        type: 'Nota',
        description: eventDescription,
        attachments: [],
    };
    installation.events = [...(installation.events || []), newEvent].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    allInstallations[installationIndex] = installation;
    saveInstallations(allInstallations);
    toast({
        title: "Status Atualizado!",
        description: `${installation.clientName} movido para "${newStatus}".`
    });
  }

  const activeInstallations = installations.filter(inst => !inst.archived);
  
  if (!isMounted) {
      return <div>Carregando...</div>
  }

  return (
    <div className="h-full w-full">
      <KanbanBoard 
        installations={activeInstallations} 
        columns={config.columns}
        onItemMove={handleItemMove} 
        statusType={config.statusType}
      />
    </div>
  );
}
