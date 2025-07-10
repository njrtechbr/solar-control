import { HardDrive } from 'lucide-react';

export default function EquipmentPage() {
  return (
     <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
        <HardDrive className="mx-auto h-16 w-16 mb-4" />
        <h3 className="mt-4 text-2xl font-semibold">Gestão de Equipamentos</h3>
        <p className="mt-2 max-w-md">
            Esta área está em desenvolvimento. Em breve, você poderá gerenciar o inventário e o ciclo de vida de todos os seus equipamentos, como inversores e painéis.
        </p>
    </div>
  );
}
