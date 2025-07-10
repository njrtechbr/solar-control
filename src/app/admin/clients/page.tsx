import { Users } from 'lucide-react';

export default function ClientsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
        <Users className="mx-auto h-16 w-16 mb-4" />
        <h3 className="mt-4 text-2xl font-semibold">Gestão de Clientes</h3>
        <p className="mt-2 max-w-md">
            Esta área está em desenvolvimento. Em breve, você poderá gerenciar todos os seus clientes, seus dados e instalações vinculadas de forma centralizada.
        </p>
    </div>
  );
}
