import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  headerAction?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, title, className = '', headerAction }) => (
  <div className={`bg-[#111117] border border-[#262635] rounded ${className}`}>
    {title && (
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#262635]">
        <h3 className="text-sm font-semibold text-[#F3EFE8]">{title}</h3>
        {headerAction}
      </div>
    )}
    <div className="p-4">{children}</div>
  </div>
);
