import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
}) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <AlertTriangle className="w-10 h-10 text-red-400 mb-4" />
    <h3 className="text-sm font-semibold text-[#F3EFE8] mb-2">{title}</h3>
    <p className="text-sm text-[#9E9AA7] max-w-sm mb-4 leading-relaxed">{message}</p>
    {onRetry && (
      <Button variant="ghost" size="sm" onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
);
