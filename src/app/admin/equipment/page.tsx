
"use client";

import { useState, useEffect } from "react";
import { type Inverter, type Panel, initialInstallations } from "@/app/admin/_lib/data";
import { EquipmentManagement } from "@/app/admin/_components/equipment-management";
import { toast } from "@/hooks/use-toast";

export default function EquipmentPage() {
  const [inverters, setInverters] = useState<Inverter[]>([]);
  const [panels, setPanels] = useState<Panel[]>([]);

  useEffect(() => {
    // This is a simplified way to get all unique equipment from all installations
    // In a real database, you'd have a separate table for equipment.
    const savedInstallationsRaw = localStorage.getItem('installations');
    let allInverters: Inverter[] = [];
    let allPanels: Panel[] = [];

    if (savedInstallationsRaw) {
        try {
            const installations = JSON.parse(savedInstallationsRaw);
            installations.forEach((inst: any) => {
                if (inst.inverters) allInverters.push(...inst.inverters);
                if (inst.panels) allPanels.push(...inst.panels);
            });
        } catch (e) {
            console.error("Failed to parse installations for equipment", e);
        }
    } else {
         localStorage.setItem('installations', JSON.stringify(initialInstallations));
         initialInstallations.forEach((inst: any) => {
            if (inst.inverters) allInverters.push(...inst.inverters);
            if (inst.panels) allPanels.push(...inst.panels);
        });
    }

    // Creating unique lists based on ID to simulate a central inventory
    const uniqueInverters = Array.from(new Map(allInverters.map(item => [item.id, item])).values());
    const uniquePanels = Array.from(new Map(allPanels.map(item => [item.id, item])).values());
    
    setInverters(uniqueInverters);
    setPanels(uniquePanels);

  }, []);

  // Note: Saving/Deleting equipment from this central page is complex
  // because the data is denormalized within installations. 
  // For this prototype, we will just display the data.
  // A full implementation would require updating the specific installation.

  return <EquipmentManagement inverters={inverters} panels={panels} />;
}
