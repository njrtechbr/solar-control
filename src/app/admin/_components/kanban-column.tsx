
"use client";

import { useMemo } from 'react';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { Installation } from '../page';
import { KanbanCard } from './kanban-card';
import { KanbanColumnType } from './kanban-board';
import { ScrollArea } from '@/components/ui/scroll-area';

type KanbanColumnProps = {
  column: KanbanColumnType;
  installations: Installation[];
};

export function KanbanColumn({ column, installations }: KanbanColumnProps) {
  const installationsIds = useMemo(() => {
    return installations.map((inst) => inst.id!);
  }, [installations]);

  const { setNodeRef, transition, transform } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col h-full bg-muted rounded-lg"
    >
      <div className="p-2 rounded-t-lg sticky top-0 z-10 bg-muted/95 backdrop-blur-sm">
        <h3 className="font-semibold text-foreground">
          {column.title}
          <span className="ml-2 text-sm font-normal text-muted-foreground bg-background rounded-full px-2 py-0.5">
            {installations.length}
          </span>
        </h3>
      </div>
       <ScrollArea className="flex-grow">
        <div className="flex flex-col gap-4 p-2">
            <SortableContext items={installationsIds}>
            {installations.map((inst) => (
                <KanbanCard key={inst.id} installation={inst} />
            ))}
            </SortableContext>
        </div>
      </ScrollArea>
    </div>
  );
}
