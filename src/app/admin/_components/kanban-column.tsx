
"use client";

import { useMemo } from 'react';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { Installation } from '../page';
import { KanbanCard } from './kanban-card';
import { KanbanColumnType } from './kanban-board';

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
      className="flex flex-col"
    >
      <div className="bg-muted p-2 rounded-t-lg mb-2 sticky top-0 z-10">
        <h3 className="font-semibold text-foreground">
          {column.title}
          <span className="ml-2 text-sm font-normal text-muted-foreground bg-background rounded-full px-2 py-0.5">
            {installations.length}
          </span>
        </h3>
      </div>
      <div className="flex flex-grow flex-col gap-4 p-1 overflow-y-auto">
        <SortableContext items={installationsIds}>
          {installations.map((inst) => (
            <KanbanCard key={inst.id} installation={inst} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
