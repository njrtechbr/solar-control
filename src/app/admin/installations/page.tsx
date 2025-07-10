
"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from 'next/navigation';
import type { ColumnDef } from "@tanstack/react-table";
import {
  type Installation,
  initialInstallations,
  createSampleReport,
  type Client,
  initialClients
} from '@/app/admin/_lib/data';
import { InstallationTable, getColumns } from "@/app/admin/_components/installation-table";
import { toast } from "@/hooks/use-toast";


export default function InstallationListPage() {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    // Load installations
    const savedInstallationsRaw = localStorage.getItem('installations');
    let loadedInstallations: Installation[] = [];
    if (savedInstallationsRaw) {
        try {
            loadedInstallations = JSON.parse(savedInstallationsRaw);
        } catch (e) {
            console.error("Failed to parse installations from localStorage", e);
            loadedInstallations = [];
        }
    }
    if (loadedInstallations.length === 0) {
        localStorage.setItem('installations', JSON.stringify(initialInstallations));
        loadedInstallations = initialInstallations;
    }
    
    // Load clients
    const savedClientsRaw = localStorage.getItem('clients');
    let loadedClients: Client[] = [];
    if (savedClientsRaw) {
        try {
            loadedClients = JSON.parse(savedClientsRaw);
        } catch (e) {
            console.error("Failed to parse clients from localStorage", e);
            loadedClients = [];
        }
    }
    if (loadedClients.length === 0) {
        localStorage.setItem('clients', JSON.stringify(initialClients));
        loadedClients = initialClients;
    }
    setClients(loadedClients);

    // Handle sample report
    const sampleReportKey = 'report_Maria Silva';
    if (!localStorage.getItem(sampleReportKey)) {
        localStorage.setItem(sampleReportKey, JSON.stringify(createSampleReport()));
    }

    // Update installations with report status
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
  
  const handleArchiveToggle = (id: number) => {
    const allInstallations = [...installations];
    const installationIndex = allInstallations.findIndex(inst => inst.id === id);
    if (installationIndex === -1) return;
    
    const installation = allInstallations[installationIndex];
    const isArchiving = !installation.archived;
    installation.archived = isArchiving;
    
    allInstallations[installationIndex] = installation;
    saveInstallations(allInstallations);
    toast({
      title: `Instalação ${isArchiving ? 'Arquivada' : 'Desarquivada'}!`,
      description: `A instalação de ${installation.clientName} foi ${isArchiving ? 'arquivada' : 'restaurada'}.`
    });
  };

  const tableColumns = useMemo(() => getColumns(handleArchiveToggle), [installations]);
  
  const searchParams = useSearchParams();
  const clientIdFilter = searchParams.get('clientId');

  const [filters, setFilters] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (clientIdFilter) {
      setFilters(prev => ({ ...prev, clientId: clientIdFilter }));
    }
  }, [clientIdFilter]);


  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, global: value }));
  };

  const handleFilterChange = (key: keyof Installation, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters({});

  const filteredInstallations = useMemo(() => {
    let filtered = [...installations];
    
    if (filters.clientId) {
      filtered = filtered.filter(inst => String(inst.clientId) === filters.clientId);
    }
    
    const globalFilter = filters['global']?.toLowerCase();
    if (globalFilter) {
      filtered = filtered.filter(inst => 
        inst.clientName.toLowerCase().includes(globalFilter) ||
        inst.city.toLowerCase().includes(globalFilter)
      );
    }
    
    return filtered;
  }, [installations, filters]);

  return (
    <InstallationTable 
        data={filteredInstallations} 
        columns={tableColumns} 
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
        filters={filters}
    />
  );
}
