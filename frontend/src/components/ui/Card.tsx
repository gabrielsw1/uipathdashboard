import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string | ReactNode;
  actions?: ReactNode;
  infoTooltip?: string;
}

export function Card({ children, className, title, actions, infoTooltip }: CardProps) {
  return (
    <div className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}>
      {(title || actions || infoTooltip) && (
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            {infoTooltip && (
              <div className="relative group">
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Informações"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <div className="absolute z-50 bottom-full left-0 mb-2 w-72 p-4 bg-slate-900 dark:bg-slate-800 border border-slate-700 dark:border-slate-600 rounded-lg shadow-2xl text-sm text-slate-100 dark:text-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <p className="whitespace-normal leading-relaxed">{infoTooltip}</p>
                  <div className="absolute top-full left-4 -mt-1">
                    <div className="w-2 h-2 bg-slate-900 dark:bg-slate-800 border-r border-b border-slate-700 dark:border-slate-600 transform rotate-45"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

