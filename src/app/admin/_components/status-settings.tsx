
"use client";

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Trash2, Edit, Save, X } from 'lucide-react';
import {
  type StatusConfig,
  type StatusCategory,
} from '@/app/admin/_lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface SortableItemProps {
  id: string;
  status: string;
  category: StatusCategory;
  onUpdate: (category: StatusCategory, oldStatus: string, newStatus: string) => void;
  onDelete: (category: StatusCategory, status: string) => void;
}

function SortableItem({ id, status, category, onUpdate, onDelete }: SortableItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [newStatus, setNewStatus] = useState(status);
    
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleSave = () => {
        if (newStatus && newStatus !== status) {
            onUpdate(category, status, newStatus);
        }
        setIsEditing(false);
    }
    
    const handleCancel = () => {
        setNewStatus(status);
        setIsEditing(false);
    }

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-2 bg-background p-2 rounded-md border">
            <button {...attributes} {...listeners} className="cursor-grab p-1">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
            </button>
            {isEditing ? (
                 <Input 
                    value={newStatus} 
                    onChange={(e) => setNewStatus(e.target.value)} 
                    className="h-8"
                />
            ) : (
                <span className="flex-1 text-sm">{status}</span>
            )}
            
            <div className="flex items-center gap-1">
                {isEditing ? (
                    <>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSave}><Save className="h-4 w-4 text-primary"/></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancel}><X className="h-4 w-4"/></Button>
                    </>
                ) : (
                    <>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsEditing(true)}><Edit className="h-4 w-4"/></Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. Isso excluirá permanentemente o status "{status}". Instalações com este status não serão afetadas, mas você precisará atribuir um novo status a elas.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(category, status)}>Confirmar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </>
                )}
            </div>
        </div>
    );
}


interface StatusColumnProps {
  category: StatusCategory;
  title: string;
  statuses: string[];
  config: StatusConfig;
  setConfig: React.Dispatch<React.SetStateAction<StatusConfig>>;
}

function StatusColumn({ category, title, statuses, config, setConfig }: StatusColumnProps) {
  const [newStatus, setNewStatus] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = statuses.indexOf(active.id as string);
      const newIndex = statuses.indexOf(over.id as string);
      const newOrder = arrayMove(statuses, oldIndex, newIndex);
      setConfig(prev => ({...prev, [category]: newOrder }));
    }
  };
  
  const handleAddStatus = () => {
    if(newStatus && !statuses.includes(newStatus)) {
        setConfig(prev => ({...prev, [category]: [...statuses, newStatus]}));
        setNewStatus('');
    }
  }

  const handleUpdateStatus = (oldStatus: string, updatedStatus: string) => {
      const updatedStatuses = statuses.map(s => s === oldStatus ? updatedStatus : s);
      setConfig(prev => ({...prev, [category]: updatedStatuses}));
  }

  const handleDeleteStatus = (category: StatusCategory, statusToDelete: string) => {
      const updatedStatuses = config[category].filter(s => s !== statusToDelete);
      setConfig(prev => ({...prev, [category]: updatedStatuses}));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={statuses} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {statuses.map(status => (
                <SortableItem 
                    key={status} 
                    id={status} 
                    status={status}
                    category={category}
                    onUpdate={handleUpdateStatus}
                    onDelete={handleDeleteStatus}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <div className="flex gap-2 pt-4 border-t">
          <Input 
            placeholder="Novo status..." 
            value={newStatus} 
            onChange={(e) => setNewStatus(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddStatus()}
          />
          <Button onClick={handleAddStatus}><Plus className="h-4 w-4 mr-2"/>Adicionar</Button>
        </div>
      </CardContent>
    </Card>
  );
}


interface StatusSettingsProps {
  initialConfig: StatusConfig;
  onSave: (newConfig: StatusConfig) => void;
}

export function StatusSettings({ initialConfig, onSave }: StatusSettingsProps) {
  const [config, setConfig] = useState(initialConfig);

  const categoryTitles: Record<StatusCategory, string> = {
    installation: 'Status da Instalação',
    project: 'Status do Projeto',
    homologation: 'Status da Homologação',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.keys(categoryTitles) as StatusCategory[]).map(category => (
          <StatusColumn
            key={category}
            category={category}
            title={categoryTitles[category]}
            statuses={config[category]}
            config={config}
            setConfig={setConfig}
          />
        ))}
      </div>
      <div className="flex justify-end pt-4">
        <Button size="lg" onClick={() => onSave(config)}>Salvar Todas as Alterações</Button>
      </div>
    </div>
  );
}
