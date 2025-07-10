
"use client";

import { useState, useEffect } from 'react';
import { initialInstallations, type Installation } from '@/app/admin/_lib/data';
import { CalendarView } from '@/app/admin/_components/calendar-view';

export default function CalendarPage() {
    const [installations, setInstallations] = useState<Installation[]>([]);

    useEffect(() => {
        const savedInstallationsRaw = localStorage.getItem('installations');
        let savedInstallations: Installation[] = [];

        if (savedInstallationsRaw) {
            try {
                savedInstallations = JSON.parse(savedInstallationsRaw);
            } catch (e) {
                console.error("Failed to parse installations from localStorage", e);
                savedInstallations = [];
            }
        }

        if (savedInstallations.length === 0) {
            localStorage.setItem('installations', JSON.stringify(initialInstallations));
            savedInstallations = initialInstallations;
        }
        setInstallations(savedInstallations);
    }, []);

    return <CalendarView installations={installations} />;
}
