
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Home, ListChecks, FileInput, PieChart, Target, Brain, Settings, LogOut, CreditCard } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Overview', icon: Home },
  { href: '/transactions', label: 'Transactions', icon: ListChecks },
  { href: '/import', label: 'Import', icon: FileInput },
  { href: '/budgets', label: 'Budgets', icon: PieChart },
  { href: '/savings', label: 'Savings', icon: Target },
  { href: '/insights', label: 'Insights', icon: Brain },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2.5">
          <CreditCard className="h-7 w-7 text-sidebar-primary" /> 
          <h1 className="text-lg font-semibold tracking-tight group-data-[collapsible=icon]:hidden">Synapse</h1>
        </Link>
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <Separator className="mx-2 my-0 bg-sidebar-border" /> 
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  asChild 
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, side: 'right', align: 'center' }}
                >
                  <a>
                    <item.icon />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <Separator className="mx-2 mt-auto mb-0 bg-sidebar-border" /> 
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
             <Link href="/settings" passHref legacyBehavior>
                <SidebarMenuButton 
                    asChild
                    isActive={pathname === "/settings"}
                    tooltip={{children: "Settings", side: "right", align: "center"}}
                >
                  <a>
                    <Settings />
                    <span>Settings</span>
                  </a>
                </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={{children: "Log Out", side: "right", align: "center"}}>
              <LogOut />
              <span>Log Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
