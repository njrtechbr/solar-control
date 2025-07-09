
"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import { differenceInDays, isPast } from 'date-fns';

import { Installation } from '../page';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link as LinkIcon, Edit, Trash2, Home, Building, FileCheck2, SlidersHorizontal, GripVertical, CheckCircle, Bolt, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type KanbanCardProps = {
  installation: Installation;
};

export function KanbanCard({ installation }: KanbanCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: installation.id!,
    data: {
      type: 'Installation',
      installation,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };
  
  const isOverdue = installation.status === "Agendado" && installation.scheduledDate && isPast(new Date(installation.scheduledDate));
  const overdueDays = installation.scheduledDate ? differenceInDays(new Date(), new Date(installation.scheduledDate)) : 0;

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "h-[196px] w-full rounded-lg border-2 bg-card opacity-50",
          isOverdue ? "border-destructive" : "border-primary"
        )}
      />
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} >
      <Card className={cn("w-full group", isOverdue && "border-destructive hover:border-destructive/80")}>
        <CardHeader className="p-4 relative">
          <button {...listeners} className="absolute top-3 right-2 p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing">
            <GripVertical size={18} />
          </button>
          <CardTitle className="text-base truncate pr-6">{installation.clientName}</CardTitle>
          <CardDescription className="flex items-center gap-1 text-xs pt-1">
            {installation.installationType === 'residencial' ? <Home size={14}/> : <Building size={14} />} 
            {installation.city} / {installation.state}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 text-xs text-muted-foreground space-y-2">
            {isOverdue && (
              <div className="flex items-center gap-2 text-destructive font-semibold">
                <AlertTriangle size={14} />
                Atrasado há {overdueDays} dia(s)
              </div>
            )}
            <div className="flex items-center gap-2">
                <FileCheck2 size={14} /> Projeto:
                <span className="font-medium text-foreground">{installation.projectStatus}</span>
            </div>
             <div className="flex items-center gap-2">
                <Bolt size={14} /> Instalação:
                <span className="font-medium text-foreground">{installation.status}</span>
            </div>
             <div className="flex items-center gap-2">
                <CheckCircle size={14} /> Homologação:
                <span className="font-medium text-foreground">{installation.homologationStatus}</span>
            </div>
            <div>
                Relatório Técnico: 
                {installation.reportSubmitted ? (
                    <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 ml-1">Enviado</Badge>
                ) : (
                    <Badge variant="secondary" className="ml-1">Pendente</Badge>
                )}
            </div>
        </CardContent>
        <CardFooter className="p-2 pt-0">
             <Link href={`/admin/installation/${installation.id}`} passHref className="w-full">
                <Button variant="ghost" className="w-full justify-start text-sm">
                    <SlidersHorizontal className="mr-2 h-4 w-4" /> Ver Detalhes
                </Button>
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
