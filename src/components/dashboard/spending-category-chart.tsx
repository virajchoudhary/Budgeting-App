
"use client";

import type { FC } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSettings } from '@/contexts/settings-context';

interface SpendingData {
  name: string; // Category name
  value: number; // Total spent
  fill: string; // Color for the pie slice
}

interface SpendingCategoryChartProps {
  data: SpendingData[];
}

const chartConfig = {
  amount: {
    label: "Amount",
  },
} as const;

// Helper to generate HSL chart colors from globals.css
const getChartColor = (index: number) => `hsl(var(--chart-${(index % 8) + 1}))`;


export const SpendingCategoryChart: FC<SpendingCategoryChartProps> = ({ data }) => {
  const { currency } = useSettings();

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Spending by Category</CardTitle>
          <CardDescription>No spending data available to display chart.</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-8">
          <PieChartIcon className="mx-auto h-12 w-12 text-primary" />
          <p>Once you have transactions, your spending categories will appear here.</p>
        </CardContent>
      </Card>
    );
  }
  
  const chartDataWithColors = data.map((item, index) => ({
    ...item,
    name: item.name,
    value: item.value,
    fill: getChartColor(index), 
  }));


  const dynamicChartConfig = chartDataWithColors.reduce((acc, item) => {
    acc[item.name] = { label: item.name, color: item.fill };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Spending by Category</CardTitle>
        <CardDescription>Distribution of your expenses across categories this month.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={dynamicChartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel 
                  formatter={(value, name) => (
                    <div className="flex flex-col">
                      <span className="font-medium">{name}</span>
                      <span>{Number(value).toLocaleString('en-US', { style: 'currency', currency: currency })}</span>
                    </div>
                  )}
                />} 
              />
              <Pie
                data={chartDataWithColors}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60} // Donut chart
                labelLine={false}
                // label={({ percent, name }) => `${name} (${(percent * 100).toFixed(0)}%)`} // Optional: labels on slices
              >
                {chartDataWithColors.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.fill} stroke={entry.fill} />
                ))}
              </Pie>
               <ChartLegend
                content={<ChartLegendContent nameKey="name" className="flex-wrap justify-center" />}
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: '20px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

// Placeholder icon, replace with actual Lucide icon if desired
function PieChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}
