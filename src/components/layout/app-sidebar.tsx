
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
import { Home, ListChecks, FileInput, PieChart, Target, Brain, Settings, LogOut, CreditCard, UserCircle, LogIn, UserCog } from 'lucide-react'; // Added UserCog for Profile
import { useAuth } from '@/contexts/auth-context';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { href: '/', label: 'Home', icon: Home, authRequired: false },
  { href: '/transactions', label: 'Transactions', icon: ListChecks, authRequired: false },
  { href: '/import', label: 'Import', icon: FileInput, authRequired: false },
  { href: '/budgets', label: 'Budgets', icon: PieChart, authRequired: false },
  { href: '/savings', label: 'Savings', icon: Target, authRequired: false },
  { href: '/insights', label: 'Insights', icon: Brain, authRequired: false },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/auth'); 
    } catch (error) {
      console.error("Logout error:", error);
      toast({ variant: "destructive", title: "Logout Failed", description: "Could not log out. Please try again." });
    }
  };

  const visibleNavItems = navItems.filter(item => !item.authRequired || (item.authRequired && user));

  return (
    <>
      <SidebarHeader className="flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2.5">
          <CreditCard className="h-7 w-7 text-sidebar-primary" />
          <h1 className="text-lg font-semibold tracking-tight text-sidebar-foreground group-data-[collapsible=icon]:hidden">Kamski</h1>
        </Link>
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <Separator className="mx-2 my-0 bg-sidebar-border" />
      <SidebarContent className="p-2">
        <SidebarMenu>
          {!loading && visibleNavItems.map((item) => (
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
          {!loading && (
            <>
               {user && (
                 <SidebarMenuItem>
                    <Link href="/profile" passHref legacyBehavior>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname === "/profile"}
                            tooltip={{children: "My Profile", side: "right", align: "center"}}
                        >
                        <a>
                            <UserCog />
                            <span>My Profile</span>
                        </a>
                        </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
               )}
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
              {user ? (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip={{children: user.email || "User Profile Info", side: "right", align: "center"}} className="cursor-default hover:bg-transparent">
                      <UserCircle />
                      <span>{user.email ? (user.email.length > 18 ? user.email.substring(0,15) + "..." : user.email) : "User"}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout} tooltip={{children: "Log Out", side: "right", align: "center"}}>
                      <LogOut />
                      <span>Log Out</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              ) : (
                <>
                  <SidebarMenuItem>
                    <Link href="/auth" passHref legacyBehavior>
                      <SidebarMenuButton asChild isActive={pathname === "/auth"} tooltip={{children: "Login / Sign Up", side: "right", align: "center"}}>
                        <a><LogIn /><span>Login / Sign Up</span></a>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                </>
              )}
            </>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
