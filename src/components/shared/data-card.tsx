
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DataCardProps {
  title: string;
  description?: string | React.ReactNode;
  content?: React.ReactNode;
  footer?: React.ReactNode;
  icon?: React.ElementType;
  className?: string;
  titleClassName?: string;
}

export function DataCard({ title, description, content, footer, icon: Icon, className, titleClassName }: DataCardProps) {
  return (
    <Card className={cn("transition-shadow duration-300", className)}> {/* Removed shadow-lg hover:shadow-xl, base shadow is on Card now */}
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={cn("text-xl font-semibold", titleClassName)}>
            {title}
          </CardTitle>
          {Icon && <Icon className="h-6 w-6 text-primary" />}
        </div>
        {description && <CardDescription className="mt-1">{description}</CardDescription>}
      </CardHeader>
      {content && <CardContent>{content}</CardContent>}
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
