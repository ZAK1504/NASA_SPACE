import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

export const Settings: React.FC = () => (
  <div className="max-w-2xl mx-auto px-6 py-8">
    <div className="flex items-center gap-3 mb-8">
      <SettingsIcon className="w-5 h-5 text-[#F4A272]" />
      <h1 className="text-2xl font-bold text-[#F3EFE8]">Settings</h1>
    </div>
    <div className="bg-[#111117] border border-[#262635] rounded p-6">
      <p className="text-sm text-[#9E9AA7]">Settings panel coming in a future phase.</p>
    </div>
  </div>
);
