import type {Metadata} from 'next';
import './globals.css';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppShell } from '@/components/layout/app-shell';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Synapse Finance',
  description: 'Manage your finances with Synapse Finance',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SidebarProvider defaultOpen>
          <AppShell>
            {children}
          </AppShell>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
