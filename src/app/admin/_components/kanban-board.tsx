
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

import { Installation, InstallationStatus, ProjectStatus } from '../page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import { Badge } from '@/components/ui/badge';
import { FileCheck2, Home, Building } from 'lucide-react';

export type KanbanColumnType = {
  id: string;
  title: string;
};

type KanbanBoardProps = {
  installations: Installation[];
  columns: KanbanColumnType[];
  onItemMove: (installationId: number, newStatus: string, oldStatus: string) => void;
};


export function KanbanBoard({ installations, columns, onItemMove }: KanbanBoardProps) {
  const [activeInstallation, setActiveInstallation] = useState<Installation | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);


  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  function getStatusForInstallation(inst: Installation): string {
    // This is a bit of a hack, but we need to determine which board we are on.
    // The columns prop tells us.
    const isProjectStatusBoard = columns.some(c => c.id === "Não Enviado");
    return isProjectStatusBoard ? inst.projectStatus : inst.status;
  }

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
    const installation = active.data.current?.installation as Installation;
    const oldStatus = getStatusForInstallation(installation);
    
    // If over.data.current is a card, we infer the column from it.
    let newStatus: string;
    if (over.data.current?.type === 'Installation') {
      const overInstallation = over.data.current.installation as Installation;
      newStatus = getStatusForInstallation(overInstallation);
    } else {
      // It's a column
      newStatus = over.id as string;
    }
    
    if (newStatus !== oldStatus) {
      onItemMove(installationId, newStatus, oldStatus);
    }
  }

   function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    const isActiveAnInstallation = active.data.current?.type === 'Installation';
    const isOverAColumn = over.data.current?.type === 'Column';

    // Dropping an Installation over a column
    if (isActiveAnInstallation && isOverAColumn) {
        const installation = active.data.current?.installation as Installation;
        const oldStatus = getStatusForInstallation(installation);
        const newStatus = over.id as string;
        
        if (newStatus !== oldStatus) {
           onItemMove(installation.id!, newStatus, oldStatus);
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
          {columns.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              installations={installations.filter((inst) => getStatusForInstallation(inst) === col.id)}
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
