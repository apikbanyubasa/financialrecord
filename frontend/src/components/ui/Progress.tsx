'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  indicatorColor?: string;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, indicatorColor, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div
        ref={ref}
        className={cn('relative h-2.5 w-full overflow-hidden rounded-full bg-secondary', className)}
        {...props}
      >
        <div
          className={cn(
            'h-full w-full flex-1 transition-all duration-500 ease-in-out rounded-full',
            !indicatorColor && 'bg-primary'
          )}
          style={{
            transform: `translateX(-${100 - percentage}%)`,
            backgroundColor: indicatorColor,
          }}
        />
      </div>
    );
  }
);
Progress.displayName = 'Progress';
