
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from 'next/navigation';
import * as QRCode from "qrcode.react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SunMedium, Printer, ArrowLeft, Building, Home, MapPin, Bolt, FileText, Calendar, User, Info, CheckCircle, FileCheck, Power, Link as LinkIcon, CircuitBoard } from "lucide-react";

import { type Installation } from "@/app/admin/_lib/data";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function PrintInstallationPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [installation, setInstallation] = useState<Installation | null>(null);
    const [installerReport, setInstallerReport] = useState<any | null>(null);
    const [installerQrCodeValue, setInstallerQrCodeValue] = useState('');
    const [clientQrCodeValue, setClientQrCodeValue] = useState('');

    useEffect(() => {
        if (id) {
            const allInstallations: Installation[] = JSON.parse(localStorage.getItem('installations') || '[]');
            const currentInstallation = allInstallations.find(inst => inst.id === Number(id));
            if (currentInstallation) {
                setInstallation(currentInstallation);

                if (currentInstallation.reportSubmitted) {
                    const reportData = localStorage.getItem(`report_${currentInstallation.clientName}`);
                    if (reportData) {
                        setInstallerReport(JSON.parse(reportData));
                    }
                }

                if (typeof window !== 'undefined') {
                    const installerUrl = `${window.location.origin}/?client=${encodeURIComponent(currentInstallation.clientName)}`;
                    setInstallerQrCodeValue(installerUrl);
                    
                    const clientUrl = `${window.location.origin}/status/${currentInstallation.id}`;
                    setClientQrCodeValue(clientUrl);
                }
            }
        }
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (!installation) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <div className="w-full max-w-4xl space-y-4 p-4">
                    <Skeleton className="h-12 w-1/2" />
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        );
    }
    
    const Icon = installation.installationType === 'residencial' ? Home : Building;

    return (
        <div className="bg-gray-100 min-h-screen">
            <header className="bg-white shadow-sm p-4 flex items-center justify-between no-print sticky top-0 z-10">
                <div className="flex items-center gap-4">
                     <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Voltar</span>
                    </Button>
                    <h1 className="text-lg font-semibold">Impressão de Documentos</h1>
                </div>
                <Button onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir / Salvar PDF
                </Button>
            </header>

            <main className="p-4 md:p-8">
                {/* Documento do Instalador */}
                <div className="bg-white shadow-lg rounded-lg mx-auto max-w-4xl p-10 mb-8" style={{ width: '210mm', minHeight: '297mm', pageBreakAfter: 'always' }}>
                    <header className="flex justify-between items-center border-b pb-4 mb-6">
                        <div className="flex items-center gap-3">
                            <SunMedium className="h-10 w-10 text-primary" />
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">SolarView Pro</h1>
                                <p className="text-muted-foreground">Ordem de Serviço de Instalação</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold">Nº da Instalação:</p>
                            <p className="text-lg">{installation.installationId}</p>
                        </div>
                    </header>

                    <section className="mb-6">
                        <h2 className="text-xl font-semibold border-b pb-2 mb-4 flex items-center gap-2"><User className="h-5 w-5 text-primary"/>Informações do Cliente</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><strong className="block text-muted-foreground">Cliente:</strong> {installation.clientName}</div>
                            <div><strong className="block text-muted-foreground">Tipo de Instalação:</strong> <span className="capitalize">{installation.installationType}</span></div>
                            <div><strong className="block text-muted-foreground">Endereço:</strong> {installation.address}</div>
                            <div><strong className="block text-muted-foreground">Cidade/UF:</strong> {installation.city} / {installation.state}</div>
                            <div><strong className="block text-muted-foreground">CEP:</strong> {installation.zipCode}</div>
                        </div>
                    </section>
                    
                     <section className="mb-6">
                        <h2 className="text-xl font-semibold border-b pb-2 mb-4 flex items-center gap-2"><Info className="h-5 w-5 text-primary"/>Detalhes do Projeto</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><strong className="block text-muted-foreground">Concessionária:</strong> {installation.utilityCompany}</div>
                            <div><strong className="block text-muted-foreground">Nº Protocolo:</strong> {installation.protocolNumber || 'N/A'}</div>
                             {installation.scheduledDate && 
                                <div><strong className="block text-muted-foreground">Data Agendada:</strong> {format(new Date(installation.scheduledDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</div>
                             }
                        </div>
                    </section>
                    
                    <section className="mb-6">
                        <h2 className="text-xl font-semibold border-b pb-2 mb-4 flex items-center gap-2"><CircuitBoard className="h-5 w-5 text-primary"/>Equipamentos a Instalar</h2>
                         <div className="space-y-4 text-sm">
                            <h3 className="font-semibold">Inversores</h3>
                            {(installation.inverters || []).map((inverter, idx) => (
                                <div key={idx} className="pl-4 border-l-2 ml-2">
                                    <p><strong>{inverter.brand} {inverter.model}</strong></p>
                                    <p>Nº de Série: {inverter.serialNumber || 'A confirmar'} | Datalogger: {inverter.dataloggerId || 'A confirmar'}</p>
                                </div>
                            ))}
                            <h3 className="font-semibold mt-4">Painéis Solares</h3>
                            {(installation.panels || []).map((panel, idx) => (
                                <div key={idx} className="pl-4 border-l-2 ml-2">
                                    <p><strong>{panel.brand} {panel.model}</strong></p>
                                    <p>Potência: {panel.power} Wp | Quantidade: {panel.quantity}</p>
                                </div>
                            ))}
                         </div>
                    </section>

                    <section className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md flex items-center gap-6">
                         <div className="flex-shrink-0">
                             {installerQrCodeValue && <QRCode.default value={installerQrCodeValue} size={128} />}
                         </div>
                         <div>
                            <h3 className="text-lg font-semibold text-amber-800">Ação para o Instalador</h3>
                            <p className="text-amber-700">Após a conclusão da instalação, escaneie este QR Code com seu celular para abrir o formulário e preencher o relatório técnico obrigatório.</p>
                         </div>
                    </section>
                    
                    <footer className="mt-10 pt-4 border-t text-center absolute bottom-10 left-0 right-0">
                        <p className="text-sm">Assinatura do Instalador: _________________________________________</p>
                        <p className="text-xs text-muted-foreground mt-4">&copy; {new Date().getFullYear()} SolarView Pro. Documento gerado em {format(new Date(), "dd/MM/yyyy HH:mm")}.</p>
                    </footer>
                </div>

                {/* Documento do Cliente */}
                 <div className="bg-white shadow-lg rounded-lg mx-auto max-w-4xl p-10" style={{ width: '210mm', minHeight: '297mm' }}>
                    <header className="flex justify-between items-center border-b pb-4 mb-6">
                        <div className="flex items-center gap-3">
                            <SunMedium className="h-10 w-10 text-primary" />
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">SolarView Pro</h1>
                                <p className="text-muted-foreground">Comprovante de Instalação</p>
                            </div>
                        </div>
                         <div className="text-right">
                            <p className="font-semibold">Nº da Instalação:</p>
                            <p className="text-lg">{installation.installationId}</p>
                        </div>
                    </header>

                    <section className="mb-6">
                        <h2 className="text-xl font-semibold border-b pb-2 mb-4 flex items-center gap-2"><User className="h-5 w-5 text-primary"/>Dados do Cliente</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><strong className="block text-muted-foreground">Cliente:</strong> {installation.clientName}</div>
                            <div><strong className="block text-muted-foreground">Endereço:</strong> {installation.address}, {installation.city} - {installation.state}</div>
                        </div>
                    </section>

                     <section className="mb-6">
                        <h2 className="text-xl font-semibold border-b pb-2 mb-4 flex items-center gap-2"><FileCheck className="h-5 w-5 text-primary"/>Resumo do Processo</h2>
                        <div className="space-y-2 text-sm">
                            <p><strong>Status do Projeto:</strong> {installation.projectStatus}</p>
                            <p><strong>Status da Instalação:</strong> {installation.status}</p>
                            <p><strong>Status da Homologação:</strong> {installation.homologationStatus}</p>
                        </div>
                    </section>
                    
                    {installerReport || (installation.inverters && installation.inverters.length > 0) ? (
                        <section>
                            <h2 className="text-xl font-semibold border-b pb-2 mb-4 flex items-center gap-2"><Power className="h-5 w-5 text-primary"/>Detalhes Técnicos da Instalação</h2>
                            <div className="space-y-4 text-sm">
                                {installerReport ? (
                                    Object.entries(installerReport).map(([key, value]) => {
                                        if (['photo_uploads', 'installationVideoDataUrl', 'installationVideo', 'clientName', 'inverters', 'panels'].includes(key)) return null;
                                        if (typeof value === 'object' && value !== null) {
                                           if (Array.isArray(value)) {
                                                const filteredArray = value.filter(item => item.voltage || item.plates);
                                                if (filteredArray.length === 0) return null;
                                                return (
                                                    <div key={key}>
                                                        <h4 className="font-semibold capitalize text-base">{key.replace(/([A-Z])/g, ' $1')}</h4>
                                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-1 pl-4">
                                                        {filteredArray.map((item, index) => (
                                                          <div key={index} className="p-2 border rounded-md bg-gray-50">
                                                              <p><b>String {value.findIndex(originalItem => originalItem === item) + 1}:</b> {item.voltage || 'N/A'} V | {item.plates || 'N/A'} Placas</p>
                                                          </div>
                                                        ))}
                                                        </div>
                                                    </div>
                                                )
                                            }
                                            return null;
                                        }
                                        return (
                                            <div key={key} className="flex justify-between border-b py-1">
                                                <span className="font-medium text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                                <span className="text-right font-medium">{String(value) || 'N/A'}</span>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <>
                                        <h3 className="font-semibold">Inversores</h3>
                                        {(installation.inverters || []).map((inverter, idx) => (
                                            <div key={idx} className="pl-4 text-xs">
                                                <p><strong>{inverter.brand} {inverter.model}</strong> (S/N: {inverter.serialNumber || 'N/A'})</p>
                                            </div>
                                        ))}
                                        <h3 className="font-semibold mt-2">Painéis Solares</h3>
                                        {(installation.panels || []).map((panel, idx) => (
                                            <div key={idx} className="pl-4 text-xs">
                                                <p><strong>{panel.quantity}x {panel.brand} {panel.model}</strong> ({panel.power} Wp)</p>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        </section>
                    ) : (
                        <div className="text-center text-muted-foreground py-8 border rounded-lg bg-gray-50">
                            <p>O relatório técnico do instalador ainda não foi preenchido.</p>
                        </div>
                    )}
                    
                    <section className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md flex items-center gap-6 mt-8">
                         <div className="flex-shrink-0">
                             {clientQrCodeValue && <QRCode.default value={clientQrCodeValue} size={128} />}
                         </div>
                         <div>
                            <h3 className="text-lg font-semibold text-blue-800">Acompanhe sua Instalação</h3>
                            <p className="text-blue-700">Use a câmera do seu celular para escanear este QR Code e acompanhar em tempo real o andamento do seu projeto de energia solar.</p>
                         </div>
                    </section>


                    <footer className="mt-10 pt-4 border-t text-center absolute bottom-10 left-0 right-0">
                        <p className="text-sm">Assinatura do Cliente: _________________________________________</p>
                        <p className="text-xs text-muted-foreground mt-4">&copy; {new Date().getFullYear()} SolarView Pro. Documento gerado em {format(new Date(), "dd/MM/yyyy HH:mm")}.</p>
                    </footer>
                </div>
            </main>
        </div>
    );
}
