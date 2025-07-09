"use client";

import { useSearchParams } from "next/navigation";
import InstallationForm from "./_components/installation-form";
import { Suspense } from "react";

function InstallerPageContent() {
  const searchParams = useSearchParams();
  const clientName = searchParams.get('client') || '';

  if (!clientName) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Link Inválido</h1>
          <p className="text-muted-foreground">Este link de instalação não é válido. Fale com o administrador.</p>
        </div>
      </div>
    );
  }

  return <InstallationForm clientName={clientName} />;
}


export default function Home() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <InstallerPageContent />
    </Suspense>
  );
}
