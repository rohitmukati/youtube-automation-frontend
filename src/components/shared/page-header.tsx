import * as React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-foreground text-2xl leading-tight font-medium tracking-tight sm:text-[28px]">
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground mt-1.5 max-w-2xl text-sm sm:text-[15px]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="grid grid-cols-1 gap-2 min-[480px]:flex min-[480px]:flex-wrap min-[480px]:items-center">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
