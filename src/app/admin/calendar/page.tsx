
"use client";

import { useState, useEffect } from 'react';
import { initialInstallations, type Installation } from '@/app/admin/_lib/data';
import { CalendarView } from '@/app/admin/_components/calendar-view';

export default function CalendarPage() {
    const [installations, setInstallations] = useState<Installation[]>([]);

    useEffect(() => {
        let savedInstallations = localStorage.getItem('installations');
        if (!savedInstallations || JSON.parse(savedInstallations).length === 0) {
            localStorage.setItem('installations', JSON.stringify(initialInstallations));
            savedInstallations = JSON.stringify(initialInstallations);
        }
        setInstallations(JSON.parse(savedInstallations));
    }, []);

    return <CalendarView installations={installations} />;
}
