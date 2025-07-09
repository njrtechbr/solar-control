
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import Link from 'next/link';

import { Installation, InstallationStatus } from '../page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import { Badge } from '@/components/ui/badge';
import { FileCheck2, Home, Building } from 'lucide-react';

type KanbanBoardProps = {
  installations: Installation[];
  onStatusChange: (installationId: number, newStatus: InstallationStatus) => void;
};

const KANBAN_COLUMNS: { id: InstallationStatus; title: string }[] = [
  { id: 'Pendente', title: 'Pendente' },
  { id: 'Agendado', title: 'Agendado' },
  { id: 'Em Andamento', title: 'Em Andamento' },
  { id: 'Concluído', title: 'Concluído' },
  { id: 'Cancelado', title: 'Cancelado' },
];

export function KanbanBoard({ installations, onStatusChange }: KanbanBoardProps) {
  const [activeInstallation, setActiveInstallation] = useState<Installation | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);


  const columnsId = useMemo(() => KANBAN_COLUMNS.map((col) => col.id), []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === 'Installation') {
      setActiveInstallation(event.active.data.current.installation);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveInstallation(null);
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    const isActiveAnInstallation = active.data.current?.type === 'Installation';
    if (!isActiveAnInstallation) return;

    const installationId = active.id as number;
    const newStatus = over.id as InstallationStatus;
    
    // This is a simplified check. In a real scenario, you'd check if over.id is a column.
    // If over.data.current is a card, we infer the column from it.
    const finalStatus = over.data.current?.type === 'Installation' 
        ? over.data.current.installation.status 
        : newStatus;

    onStatusChange(installationId, finalStatus);
  }

   function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    const isActiveAnInstallation = active.data.current?.type === 'Installation';
    const isOverAnInstallation = over.data.current?.type === 'Installation';

    if (!isActiveAnInstallation) return;

    // Dropping an Installation over another Installation
    if (isActiveAnInstallation && isOverAnInstallation) {
      // Logic to reorder items within the same column can go here if needed.
      // For now, we only care about changing status (column).
    }

    const isOverAColumn = over.data.current?.type === 'Column';

    // Dropping an Installation over a column
    if (isActiveAnInstallation && isOverAColumn) {
        const installation = active.data.current?.installation as Installation;
        const columnId = over.id as InstallationStatus;
        if (installation.status !== columnId) {
            onStatusChange(installation.id!, columnId);
        }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      collisionDetection={closestCorners}
    >
      <div className="grid grid-cols-5 gap-4">
        <SortableContext items={columnsId}>
          {KANBAN_COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              installations={installations.filter((inst) => inst.status === col.id)}
            />
          ))}
        </SortableContext>
      </div>

      {isMounted && createPortal(
        <DragOverlay>
          {activeInstallation && (
             <Card className="w-full opacity-75">
                <CardHeader className="p-4">
                    <CardTitle className="text-base truncate">{activeInstallation.clientName}</CardTitle>
                    <CardDescription className="flex items-center gap-1 text-xs">
                        {activeInstallation.installationType === 'residencial' ? <Home size={14}/> : <Building size={14} />} 
                        {activeInstallation.city} / {activeInstallation.state}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-xs text-muted-foreground space-y-2">
                     <div className="flex items-center gap-2">
                        <FileCheck2 size={14} /> Projeto:
                        <span className="font-medium text-foreground">{activeInstallation.projectStatus}</span>
                    </div>
                     <div>
                        Relatório Técnico: 
                        {activeInstallation.reportSubmitted ? (
                            <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 ml-1">Enviado</Badge>
                        ) : (
                            <Badge variant="secondary" className="ml-1">Pendente</Badge>
                        )}
                    </div>
                </CardContent>
             </Card>
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}
