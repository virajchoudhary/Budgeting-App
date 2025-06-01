
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
          key={pathname}
          className="p-6 sm:p-8 lg:p-10 animate-content-fade-in" /* Increased padding */
        >
         <div className="mx-auto max-w-screen-xl"> {/* Wider max-width */}
            {children}
          </div>
        </div>
      </SidebarInset>
    </div>
  );
}
