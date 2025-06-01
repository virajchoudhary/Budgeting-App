
"use client";

import React from 'react';
import { Sidebar, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { usePathname } from 'next/navigation';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen">
      <Sidebar collapsible="icon" variant="sidebar" side="left">
        <AppSidebar />
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="flex-1 bg-transparent">
        <div 
          key={pathname} /* Key change triggers re-render and animation */
          className="p-4 sm:p-6 lg:p-8 animate-content-fade-in" /* Ensure this class is applied */
        >
         <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </div>
      </SidebarInset>
    </div>
  );
}
