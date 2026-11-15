import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface InfoPanelProps {
  title?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
  title = 'What am I seeing?',
  children,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-[#262635] rounded overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#111827] hover:bg-[#111117] transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#F4A272] flex-shrink-0" />
          <span className="text-sm font-medium text-[#F3EFE8]">{title}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[#9E9AA7] transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-4 py-4 bg-[#0d1526] border-t border-[#262635] text-sm text-[#9E9AA7] space-y-2 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
};
