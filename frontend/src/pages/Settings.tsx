import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

export const Settings: React.FC = () => (
  <div className="max-w-2xl mx-auto px-6 py-8">
    <div className="flex items-center gap-3 mb-8">
      <SettingsIcon className="w-5 h-5 text-[#6EA8FE]" />
      <h1 className="text-2xl font-bold text-[#E8EDF5]">Settings</h1>
    </div>
    <div className="bg-[#151E30] border border-[#263247] rounded p-6">
      <p className="text-sm text-[#94A3B8]">Settings panel coming in a future phase.</p>
    </div>
  </div>
);
