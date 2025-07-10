
"use client";

import { useState } from "react";
import { Inverter, Installation } from "../page";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Search, Home, Building, User, MapPin } from "lucide-react";

interface EquipmentSearchProps {
  installations: Installation[];
  onEquipmentTransfer: (
    sourceInstallationId: number,
    destInstallationId: number,
    inverter: Inverter
  ) => void;
}

interface SearchResult {
  inverter: Inverter;
  installation: Installation;
}

export function EquipmentSearch({
  installations,
  onEquipmentTransfer,
}: EquipmentSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isTransferDialogOpen, setTransferDialogOpen] = useState(false);
  const [destinationInstallationId, setDestinationInstallationId] = useState<number | null>(null);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
        toast({ title: "Campo de busca vazio", description: "Por favor, insira um número de série.", variant: "destructive" });
        return;
    }
    setIsSearching(true);
    setSearchResult(null);

    setTimeout(() => {
        let found = false;
        for (const installation of installations) {
            if (installation.inverters) {
                const foundInverter = installation.inverters.find(
                    (inv) => inv.serialNumber?.toLowerCase() === searchQuery.toLowerCase()
                );

                if (foundInverter) {
                    setSearchResult({ inverter: foundInverter, installation });
                    found = true;
                    break;
                }
            }
        }

        if (!found) {
             toast({ title: "Não encontrado", description: "Nenhum inversor encontrado com este número de série." });
        }
        setIsSearching(false);
    }, 500);
  };
  
  const handleTransfer = () => {
    if (!destinationInstallationId || !searchResult) {
        toast({ title: "Erro na Transferência", description: "Selecione uma instalação de destino.", variant: "destructive"});
        return;
    }

    onEquipmentTransfer(
        searchResult.installation.id!,
        destinationInstallationId,
        searchResult.inverter
    );
    
    setTransferDialogOpen(false);
    setSearchResult(null);
    setSearchQuery("");
  }

  const destinationOptions = installations.filter(inst => inst.id !== searchResult?.installation.id);

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Buscar Inversor por Número de Série</CardTitle>
          <CardDescription>
            Localize rapidamente um inversor para ver detalhes ou transferí-lo para outra instalação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder="Digite o número de série..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              <Search className="mr-2 h-4 w-4" /> {isSearching ? "Buscando..." : "Buscar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {searchResult && (
        <Card className="mt-6 animate-in fade-in-50">
          <CardHeader>
            <CardTitle>Resultado da Busca</CardTitle>
            <CardDescription>
              Inversor encontrado na instalação abaixo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
                <h4 className="font-semibold text-lg">Inversor</h4>
                <p><strong>Marca:</strong> {searchResult.inverter.brand}</p>
                <p><strong>Modelo:</strong> {searchResult.inverter.model}</p>
                <p><strong>Nº de Série:</strong> <span className="font-mono bg-muted px-2 py-1 rounded">{searchResult.inverter.serialNumber}</span></p>
            </div>
            <div className="border-t pt-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                    {searchResult.installation.installationType === 'residencial' ? <Home size={20}/> : <Building size={20}/>}
                    Instalação Atual
                </h4>
                <div className="flex items-center gap-2 mt-2"><User size={16} className="text-muted-foreground"/> {searchResult.installation.clientName}</div>
                <div className="flex items-center gap-2 mt-1"><MapPin size={16} className="text-muted-foreground"/> {searchResult.installation.address}, {searchResult.installation.city} - {searchResult.installation.state}</div>
            </div>
          </CardContent>
          <CardFooter>
            <Dialog open={isTransferDialogOpen} onOpenChange={setTransferDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <ArrowRight className="mr-2 h-4 w-4"/> Transferir Equipamento
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Transferir Inversor</DialogTitle>
                        <DialogDescription>
                            Selecione a instalação de destino para o inversor <strong>{searchResult.inverter.brand} {searchResult.inverter.model}</strong> (S/N: {searchResult.inverter.serialNumber}).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <Label htmlFor="destination">Transferir para:</Label>
                        <Select onValueChange={(value) => setDestinationInstallationId(Number(value))}>
                            <SelectTrigger id="destination">
                                <SelectValue placeholder="Selecione um cliente/instalação..." />
                            </SelectTrigger>
                            <SelectContent>
                                {destinationOptions.map(inst => (
                                    <SelectItem key={inst.id} value={String(inst.id!)}>
                                        {inst.clientName} ({inst.city})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                        <Button onClick={handleTransfer}>Confirmar Transferência</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
