
"use client";

import { useState, useEffect } from "react";
import { initialClients, type Client } from "@/app/admin/_lib/data";
import { ClientManagement } from "@/app/admin/_components/client-management";
import { toast } from "@/hooks/use-toast";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const savedClientsRaw = localStorage.getItem('clients');
    let savedClients: Client[] = [];
    
    if (savedClientsRaw) {
      try {
        savedClients = JSON.parse(savedClientsRaw);
      } catch (e) {
        console.error("Failed to parse clients from localStorage", e);
        savedClients = [];
      }
    }

    if (savedClients.length === 0) {
        localStorage.setItem('clients', JSON.stringify(initialClients));
        savedClients = initialClients;
    }
    setClients(savedClients);
  }, []);

  const saveClients = (updatedClients: Client[]) => {
    setClients(updatedClients);
    localStorage.setItem('clients', JSON.stringify(updatedClients));
  };

  const handleSaveClient = (clientData: Client) => {
    let updatedClients = [...clients];
    if (clientData.id) {
      // Editing existing client
      const index = updatedClients.findIndex(c => c.id === clientData.id);
      if (index > -1) {
        updatedClients[index] = clientData;
        toast({ title: "Cliente Atualizado!", description: `Os dados de ${clientData.name} foram salvos.` });
      }
    } else {
      // Adding new client
      const nextId = clients.length > 0 ? Math.max(...clients.map(c => c.id!)) + 1 : 1;
      const newClient = { ...clientData, id: nextId };
      updatedClients.push(newClient);
      toast({ title: "Cliente Cadastrado!", description: `${newClient.name} foi adicionado com sucesso.` });
    }
    saveClients(updatedClients);
  };
  
  const handleDeleteClient = (clientId: number) => {
    // Note: In a real app, you'd check for associated installations before deleting.
    const updatedClients = clients.filter(c => c.id !== clientId);
    saveClients(updatedClients);
    toast({ title: "Cliente Removido!", variant: "destructive" });
  };


  return <ClientManagement 
            clients={clients} 
            onSave={handleSaveClient} 
            onDelete={handleDeleteClient}
         />;
}
