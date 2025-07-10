
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import {
  type Installation,
  initialInstallations,
  createSampleReport,
  type Client,
  initialClients,
  type StatusConfig,
  defaultStatusConfig
} from '@/app/admin/_lib/data';

import { KanbanBoard, type KanbanColumnType } from '@/app/admin/_components/kanban-board';
import { toast } from '@/hooks/use-toast';


type DashboardType = 'installation' | 'project' | 'homologation' | 'report';

export default function DashboardPage() {
  const params = useParams();
  const slug = (params.slug?.[0] || 'installation') as DashboardType;
  
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [statusConfig, setStatusConfig] = useState<StatusConfig>(defaultStatusConfig);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Load clients and installations from localStorage, or initialize with sample data
    const savedClientsRaw = localStorage.getItem('clients');
    if (!savedClientsRaw || savedClientsRaw === '[]') {
      localStorage.setItem('clients', JSON.stringify(initialClients));
    }

    const savedInstallationsRaw = localStorage.getItem('installations');
    let loadedInstallations: Installation[] = [];
    if (savedInstallationsRaw) {
        try {
            loadedInstallations = JSON.parse(savedInstallationsRaw);
        } catch(e) {
            console.error("Failed to parse installations from localStorage", e);
            loadedInstallations = [];
        }
    }
    
    if (loadedInstallations.length === 0) {
      localStorage.setItem('installations', JSON.stringify(initialInstallations));
      loadedInstallations = initialInstallations;
    }
    
    const sampleReportKey = 'report_Maria Silva';
    if (!localStorage.getItem(sampleReportKey)) {
        localStorage.setItem(sampleReportKey, JSON.stringify(createSampleReport()));
    }
    
    const updatedInstallations = loadedInstallations.map((inst: Installation) => {
        const report = localStorage.getItem(`report_${inst.clientName}`);
        return { ...inst, reportSubmitted: !!report };
    });
    setInstallations(updatedInstallations);

    // Load status config
    const savedStatusConfigRaw = localStorage.getItem('statusConfig');
    if (savedStatusConfigRaw) {
      try {
        const savedConfig = JSON.parse(savedStatusConfigRaw);
        setStatusConfig(savedConfig);
      } catch (e) {
        console.error("Failed to parse status config", e);
        localStorage.setItem('statusConfig', JSON.stringify(defaultStatusConfig));
        setStatusConfig(defaultStatusConfig);
      }
    } else {
        localStorage.setItem('statusConfig', JSON.stringify(defaultStatusConfig));
        setStatusConfig(defaultStatusConfig);
    }
    
    setIsMounted(true);

  }, []);

  const kanbanConfig = useMemo(() => {
    return {
      installation: {
        columns: statusConfig.installation.map(s => ({ id: s, title: s })),
        statusType: 'status' as keyof Installation,
      },
      project: {
        columns: statusConfig.project.map(s => ({ id: s, title: s })),
        statusType: 'projectStatus' as keyof Installation,
      },
      homologation: {
        columns: statusConfig.homologation.map(s => ({ id: s, title: s })),
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
  }, [statusConfig]);
  
  const config = kanbanConfig[slug] || kanbanConfig.installation;

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
    
    if (String(installation[statusType]) === newStatus) return;


    const valueToSet: string | boolean = statusType === 'reportSubmitted' ? (newStatus === 'Enviado') : newStatus;
    (installation as any)[statusType] = valueToSet;
    
    const statusLabels = {
        status: "Status da Instalação",
        projectStatus: "Status do Projeto",
        homologationStatus: "Status da Homologação",
        reportSubmitted: "Relatório Técnico"
    };

    const statusLabel = statusLabels[statusType as keyof typeof statusLabels] || `Status de '${statusType}'`;
    eventDescription = `${statusLabel} alterado de "${oldStatus}" para "${newStatus}".`;


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
      return <div className="p-6">Carregando...</div>
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <KanbanBoard 
        installations={activeInstallations} 
        columns={config.columns as KanbanColumnType[]}
        onItemMove={handleItemMove} 
        statusType={config.statusType}
      />
    </div>
  );
}
