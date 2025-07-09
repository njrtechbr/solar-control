
"use client";

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Installation } from '../page';
import { Card } from '@/components/ui/card';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: ptBR }),
  getDay,
  locales,
});

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  resource: Installation;
}

interface CalendarViewProps {
  installations: Installation[];
}

const messages = {
  date: 'Data',
  time: 'Hora',
  event: 'Evento',
  allDay: 'Dia Inteiro',
  week: 'Semana',
  work_week: 'Semana de Trabalho',
  day: 'Dia',
  month: 'Mês',
  previous: 'Anterior',
  next: 'Próximo',
  yesterday: 'Ontem',
  tomorrow: 'Amanhã',
  today: 'Hoje',
  agenda: 'Agenda',
  noEventsInRange: 'Não há eventos neste período.',
  showMore: (total: number) => `+ Ver mais (${total})`,
};

export function CalendarView({ installations }: CalendarViewProps) {
  const router = useRouter();

  const events = useMemo(() => {
    return installations
      .filter(inst => inst.scheduledDate && inst.status === "Agendado")
      .map(inst => ({
        title: inst.clientName,
        start: new Date(inst.scheduledDate!),
        end: new Date(inst.scheduledDate!),
        resource: inst,
      }));
  }, [installations]);

  const handleSelectEvent = (event: CalendarEvent) => {
    router.push(`/admin/installation/${event.resource.id}`);
  };

  return (
    <Card className="h-[80vh] p-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={handleSelectEvent}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        messages={messages}
        culture="pt-BR"
        className="text-sm"
      />
    </Card>
  );
}
