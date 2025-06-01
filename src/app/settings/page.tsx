
"use client";

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings } from '@/contexts/settings-context';
import type { Currency } from '@/types';
import { supportedCurrencies } from '@/types';
import { ScrollFadeIn } from '@/components/shared/scroll-fade-in'; // Import the animation wrapper

export default function SettingsPage() {
  const { currency, setCurrency } = useSettings();

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
            <CardDescription>Adjust your preferences for Synapse Finance.</CardDescription>
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
