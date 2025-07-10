
"use client";

import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import {
  type Installation,
  initialInstallations,
  type Inverter
} from '@/app/admin/_lib/data';
import { EquipmentSearch } from '@/app/admin/_components/equipment-search';

export default function EquipmentSearchPage() {
  const [installations, setInstallations] = useState<Installation[]>([]);

  useEffect(() => {
    const savedInstallationsRaw = localStorage.getItem('installations');
    let savedInstallations = savedInstallationsRaw ? JSON.parse(savedInstallationsRaw) : [];

    if (savedInstallations.length === 0) {
      localStorage.setItem('installations', JSON.stringify(initialInstallations));
      savedInstallations = initialInstallations;
    }
    setInstallations(savedInstallations);
  }, []);

  const saveInstallations = (newInstallations: Installation[]) => {
    setInstallations(newInstallations);
    localStorage.setItem('installations', JSON.stringify(newInstallations));
  };
  
  const handleEquipmentTransfer = (sourceInstallationId: number, destInstallationId: number, inverter: Inverter) => {
    let allInstallations = [...installations];
    
    const sourceIndex = allInstallations.findIndex(inst => inst.id === sourceInstallationId);
    const destIndex = allInstallations.findIndex(inst => inst.id === destInstallationId);

    if (sourceIndex === -1 || destIndex === -1) {
        toast({ title: "Erro na transferência", description: "Instalação de origem ou destino não encontrada.", variant: "destructive" });
        return;
    }

    const sourceInstallation = { ...allInstallations[sourceIndex] };
    const destInstallation = { ...allInstallations[destIndex] };
    
    // Remove from source
    sourceInstallation.inverters = (sourceInstallation.inverters || []).filter(inv => inv.id !== inverter.id);
    const sourceEvent = {
        id: new Date().toISOString() + "_transfer_out",
        date: new Date().toISOString(),
        type: 'Nota',
        description: `Inversor ${inverter.brand} ${inverter.model} (S/N: ${inverter.serialNumber}) transferido para a instalação de ${destInstallation.clientName}.`,
        attachments: [],
    };
    sourceInstallation.events = [...(sourceInstallation.events || []), sourceEvent].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    allInstallations[sourceIndex] = sourceInstallation;

    // Add to destination
    destInstallation.inverters = [...(destInstallation.inverters || []), inverter];
    const destEvent = {
        id: new Date().toISOString() + "_transfer_in",
        date: new Date().toISOString(),
        type: 'Nota',
        description: `Inversor ${inverter.brand} ${inverter.model} (S/N: ${inverter.serialNumber}) recebido da instalação de ${sourceInstallation.clientName}.`,
        attachments: [],
    };
    destInstallation.events = [...(destInstallation.events || []), destEvent].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    allInstallations[destIndex] = destInstallation;

    saveInstallations(allInstallations);
    toast({ title: "Transferência Concluída!", description: `Inversor movido para ${destInstallation.clientName}.` });
  };


  return (
    <EquipmentSearch 
        installations={installations} 
        onEquipmentTransfer={handleEquipmentTransfer}
    />
  );
}
