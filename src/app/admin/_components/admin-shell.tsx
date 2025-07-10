
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  SunMedium,
  LayoutDashboard,
  List,
  Calendar,
  Search,
  Users,
  HardDrive,
  Settings,
  CircleHelp,
  LogOut,
  ListChecks,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { CreateInstallationDialog } from './create-installation-dialog';

const menuItems = [
  {
    label: 'Dashboards',
    items: [
      {
        href: '/admin/dashboard/installation',
        icon: LayoutDashboard,
        label: 'Status da Instalação',
      },
      {
        href: '/admin/dashboard/project',
        icon: ListChecks,
        label: 'Status do Projeto',
      },
      {
        href: '/admin/dashboard/homologation',
        icon: CheckCircle,
        label: 'Status da Homologação',
      },
      {
        href: '/admin/dashboard/report',
        icon: FileText,
        label: 'Status do Relatório',
      },
    ],
  },
  {
    label: 'Gestão',
    items: [
      {
        href: '/admin/installations',
        icon: List,
        label: 'Lista de Instalações',
      },
      { href: '/admin/clients', icon: Users, label: 'Clientes' },
      { href: '/admin/equipment', icon: HardDrive, label: 'Equipamentos' },
    ],
  },
  {
    label: 'Ferramentas',
    items: [
      { href: '/admin/calendar', icon: Calendar, label: 'Calendário' },
      {
        href: '/admin/equipment/search',
        icon: Search,
        label: 'Busca de Equipamento',
      },
    ],
  },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <SunMedium className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-foreground">
              SolarView Pro
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <Link href={item.href}>
                      <SidebarMenuButton
                        isActive={pathname.startsWith(item.href)}
                        tooltip={item.label}
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarGroup>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex flex-col gap-2 p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Ajuda">
                  <CircleHelp />
                  <span>Ajuda & Suporte</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Sair">
                  <LogOut />
                  <span>Sair</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <div className="flex items-center gap-3 p-2 border-t mt-2 pt-4">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="@admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-foreground">
                  Admin
                </span>
                <span className="text-xs text-muted-foreground">
                  admin@solarview.pro
                </span>
              </div>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/95 px-6 backdrop-blur-sm">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <CreateInstallationDialog />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
