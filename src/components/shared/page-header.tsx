
import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-8"> {/* Increased bottom margin for more space */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"> {/* Increased gap */}
        <div>
          <h1 className="text-3xl font-headline font-semibold tracking-tight">{title}</h1> {/* Slightly larger title */}
          {description && <p className="text-muted-foreground mt-1 text-base">{description}</p>} {/* Slightly larger desc, more margin */}
        </div>
        {actions && <div className="flex gap-3">{actions}</div>} {/* Increased gap for actions */}
      </div>
    </div>
  );
}
