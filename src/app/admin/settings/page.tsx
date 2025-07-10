
"use client";

import { useState, useEffect } from "react";
import { type StatusConfig, defaultStatusConfig } from "@/app/admin/_lib/data";
import { StatusSettings } from "@/app/admin/_components/status-settings";
import { toast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [statusConfig, setStatusConfig] = useState<StatusConfig | null>(null);

  useEffect(() => {
    const savedConfigRaw = localStorage.getItem('statusConfig');
    if (savedConfigRaw) {
      try {
        setStatusConfig(JSON.parse(savedConfigRaw));
      } catch (e) {
        console.error("Failed to parse status config", e);
        setStatusConfig(defaultStatusConfig);
      }
    } else {
      setStatusConfig(defaultStatusConfig);
    }
  }, []);

  const handleSave = (newConfig: StatusConfig) => {
    setStatusConfig(newConfig);
    localStorage.setItem('statusConfig', JSON.stringify(newConfig));
    toast({ title: "Configurações Salvas!", description: "Suas novas configurações de status foram salvas." });
  };

  if (!statusConfig) {
    return <div>Carregando configurações...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Personalize os estágios e status do seu fluxo de trabalho.
        </p>
      </div>
      <StatusSettings initialConfig={statusConfig} onSave={handleSave} />
    </div>
  );
}
