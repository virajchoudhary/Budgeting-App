
"use client";

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings } from '@/contexts/settings-context';
import type { Currency, Theme } from '@/types';
import { supportedCurrencies } from '@/types';
import { ScrollFadeIn } from '@/components/shared/scroll-fade-in';
import { useTheme } from '@/contexts/theme-provider'; // Import useTheme
import { Moon, Sun, Laptop } from 'lucide-react'; // Icons for theme toggle
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const { currency, setCurrency } = useSettings();
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Manage your application preferences."
      />
      <ScrollFadeIn>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
            <CardDescription>Adjust your preferences for Kamski.</CardDescription> {/* Updated "Synapse Finance" to "Kamski" */}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currency-select">Default Currency</Label>
              <Select
                value={currency}
                onValueChange={(value: Currency) => setCurrency(value)}
              >
                <SelectTrigger id="currency-select" className="w-full md:w-[280px]">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {supportedCurrencies.map(curr => (
                    <SelectItem key={curr.value} value={curr.value}>
                      {curr.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose the default currency for displaying monetary values across the application.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="flex space-x-2">
                <Button variant={theme === 'light' ? 'default' : 'outline'} size="sm" onClick={() => setTheme('light')}>
                  <Sun className="mr-2 h-4 w-4" /> Light
                </Button>
                <Button variant={theme === 'dark' ? 'default' : 'outline'} size="sm" onClick={() => setTheme('dark')}>
                  <Moon className="mr-2 h-4 w-4" /> Dark
                </Button>
                <Button variant={theme === 'system' ? 'default' : 'outline'} size="sm" onClick={() => setTheme('system')}>
                  <Laptop className="mr-2 h-4 w-4" /> System
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Select your preferred application theme.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Account Linking</Label>
              <p className="text-sm text-muted-foreground">
                Direct bank account linking is a planned feature and will be available in a future update.
              </p>
            </div>

            <div className="space-y-2">
              <Label>More Options</Label>
               <p className="text-sm text-muted-foreground">
                Additional settings and customization options are under development. Check back soon!
              </p>
            </div>
          </CardContent>
        </Card>
      </ScrollFadeIn>
    </div>
  );
}
