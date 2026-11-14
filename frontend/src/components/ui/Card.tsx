import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  headerAction?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, title, className = '', headerAction }) => (
  <div className={`bg-[#151E30] border border-[#263247] rounded ${className}`}>
    {title && (
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#263247]">
        <h3 className="text-sm font-semibold text-[#E8EDF5]">{title}</h3>
        {headerAction}
      </div>
    )}
    <div className="p-4">{children}</div>
  </div>
);
