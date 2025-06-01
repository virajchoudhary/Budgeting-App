
import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6"> {/* Reduced margin bottom */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"> {/* Reduced gap */}
        <div>
          <h1 className="text-2xl font-headline font-semibold tracking-tight">{title}</h1> {/* Reduced size, changed weight */}
          {description && <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>} {/* Smaller text, less margin */}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </div>
  );
}
