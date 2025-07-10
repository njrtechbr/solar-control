
"use client";

import { useState, useEffect } from "react";
import { type Inverter, type Panel, initialInverters, initialPanels } from "@/app/admin/_lib/data";
import { EquipmentManagement } from "@/app/admin/_components/equipment-management";
import { toast } from "@/hooks/use-toast";

export default function EquipmentPage() {
  const [inverters, setInverters] = useState<Inverter[]>([]);
  const [panels, setPanels] = useState<Panel[]>([]);

  useEffect(() => {
    // Load inverters from central inventory
    const savedInvertersRaw = localStorage.getItem('inverters');
    let loadedInverters: Inverter[] = [];
    if (savedInvertersRaw) {
      try {
        loadedInverters = JSON.parse(savedInvertersRaw);
      } catch (e) {
        console.error("Failed to parse inverters", e);
      }
    }
    if (loadedInverters.length === 0) {
      localStorage.setItem('inverters', JSON.stringify(initialInverters));
      loadedInverters = initialInverters;
    }
    setInverters(loadedInverters);

    // Load panels from central inventory
    const savedPanelsRaw = localStorage.getItem('panels');
    let loadedPanels: Panel[] = [];
    if (savedPanelsRaw) {
      try {
        loadedPanels = JSON.parse(savedPanelsRaw);
      } catch (e) {
        console.error("Failed to parse panels", e);
      }
    }
    if (loadedPanels.length === 0) {
      localStorage.setItem('panels', JSON.stringify(initialPanels));
      loadedPanels = initialPanels;
    }
    setPanels(loadedPanels);

  }, []);
  
  const saveInverters = (updatedInverters: Inverter[]) => {
      setInverters(updatedInverters);
      localStorage.setItem('inverters', JSON.stringify(updatedInverters));
  };
  
  const savePanels = (updatedPanels: Panel[]) => {
      setPanels(updatedPanels);
      localStorage.setItem('panels', JSON.stringify(updatedPanels));
  };

  const handleSaveInverter = (data: Inverter) => {
    let updated = [...inverters];
    if (data.id) { // Editing
      const index = updated.findIndex(i => i.id === data.id);
      if (index > -1) {
        updated[index] = data;
        toast({ title: "Inversor Atualizado!" });
      }
    } else { // Adding
      const newInverter = { ...data, id: new Date().toISOString() };
      updated.push(newInverter);
      toast({ title: "Inversor Adicionado!" });
    }
    saveInverters(updated);
  };
  
  const handleSavePanel = (data: Panel) => {
    let updated = [...panels];
    if (data.id) { // Editing
      const index = updated.findIndex(p => p.id === data.id);
      if (index > -1) {
        updated[index] = data;
        toast({ title: "Painel Atualizado!" });
      }
    } else { // Adding
      const newPanel = { ...data, id: new Date().toISOString() };
      updated.push(newPanel);
      toast({ title: "Painel Adicionado!" });
    }
    savePanels(updated);
  };

  const handleDeleteInverter = (id: string) => {
      // In a real app, check if it's assigned to an installation first
      const updated = inverters.filter(i => i.id !== id);
      saveInverters(updated);
      toast({ title: "Inversor Removido!", variant: "destructive"});
  };
  
  const handleDeletePanel = (id: string) => {
      const updated = panels.filter(p => p.id !== id);
      savePanels(updated);
      toast({ title: "Painel Removido!", variant: "destructive"});
  };


  return <EquipmentManagement 
            inverters={inverters} 
            panels={panels} 
            onSaveInverter={handleSaveInverter}
            onSavePanel={handleSavePanel}
            onDeleteInverter={handleDeleteInverter}
            onDeletePanel={handleDeletePanel}
         />;
}

    