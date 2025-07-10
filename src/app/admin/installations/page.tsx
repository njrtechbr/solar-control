
"use client";

import { useState, useEffect, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  type Installation,
  initialInstallations,
  createSampleReport,
} from '@/app/admin/_lib/data';
import { InstallationTable, getColumns } from "@/app/admin/_components/installation-table";
import { toast } from "@/hooks/use-toast";


export default function InstallationListPage() {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [filters, setFilters] = useState<{ [key: string]: string }>({});

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
      description: `O cliente ${installation.clientName} foi ${isArchiving ? 'arquivado' : 'restaurado'}.`
    });
  };

  const tableColumns = useMemo(() => getColumns(handleArchiveToggle), []);

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, global: value }));
  };

  const handleFilterChange = (key: keyof Installation, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters({});

  const filteredInstallations = useMemo(() => {
    let filtered = [...installations];
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
