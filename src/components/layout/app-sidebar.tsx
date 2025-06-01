
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
  { href: '/import', label: 'Import', icon: FileInput }, // Shorter label
  { href: '/budgets', label: 'Budgets', icon: PieChart },
  { href: '/savings', label: 'Savings', icon: Target }, // Shorter label
  { href: '/insights', label: 'Insights', icon: Brain },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2.5">
          <CreditCard className="h-7 w-7 text-primary" /> {/* Slightly smaller icon */}
          <h1 className="text-lg font-semibold tracking-tight group-data-[collapsible=icon]:hidden">Synapse</h1> {/* Adjusted font size */}
        </Link>
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <Separator className="mx-2 my-0" /> {/* Less vertical margin */}
      <SidebarContent className="p-2"> {/* Reduced padding */}
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  asChild // Ensure the <a> tag gets the styles
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
      <Separator className="mx-2 mt-auto mb-0" /> {/* Push to bottom, less vertical margin */}
      <SidebarFooter className="p-2"> {/* Reduced padding */}
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
