import React from 'react';
import { Telescope } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="mb-4 text-[#263247]">
      {icon ?? <Telescope className="w-12 h-12" />}
    </div>
    <h3 className="text-base font-semibold text-[#E8EDF5] mb-2">{title}</h3>
    <p className="text-sm text-[#94A3B8] max-w-sm mb-6 leading-relaxed">{description}</p>
    {action && (
      <Button variant="secondary" size="sm" onClick={action.onClick}>
        {action.label}
      </Button>
    )}
  </div>
);
