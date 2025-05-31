"use client";

import React from 'react';
import { Sidebar, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import { AppSidebar } from './app-sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar collapsible="icon" variant="sidebar" side="left">
        <AppSidebar />
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="flex-1">
        <div className="p-4 sm:p-6 lg:p-8">
         {children}
        </div>
      </SidebarInset>
    </div>
  );
}
