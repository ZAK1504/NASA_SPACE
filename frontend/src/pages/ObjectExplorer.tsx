import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { ObjectCard }   from '../components/astronomy/ObjectCard';
import { EmptyState }   from '../components/ui/EmptyState';
import { FEATURED_OBJECTS, OBJECT_TYPE_FILTERS } from '../constants/objects';

export const ObjectExplorer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [typeFilter, setTypeFilter] = useState('All');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return FEATURED_OBJECTS.filter((obj) => {
      const matchQ =
        !q ||
        obj.name.toLowerCase().includes(q) ||
        obj.type.toLowerCase().includes(q) ||
        obj.tags.some((t) => t.toLowerCase().includes(q));
      const matchT = typeFilter === 'All' || obj.type === typeFilter;
      return matchQ && matchT;
    });
  }, [query, typeFilter]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F3EFE8] mb-2">Object Explorer</h1>
        <p className="text-sm text-[#9E9AA7]">
          Search and explore astronomical objects with SPHEREx observations
        </p>
      </div>

      {/* Search + type filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9AA7]" />
          <input
            type="text"
            placeholder="Search by name, type, or tag…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#111117] border border-[#262635] rounded pl-9 pr-3 py-2 text-sm text-[#F3EFE8] placeholder:text-[#9E9AA7] focus:outline-none focus:border-[#F4A272] transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {OBJECT_TYPE_FILTERS.map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                typeFilter === type
                  ? 'bg-[#F4A272]/10 text-[#F4A272] border-[#F4A272]/30'
                  : 'bg-transparent text-[#9E9AA7] border-[#262635] hover:text-[#F3EFE8] hover:border-[#3c3c4d]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-[#9E9AA7] mb-4">
        {filtered.length} object{filtered.length !== 1 ? 's' : ''} found
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No objects found"
          description={`No objects match "${query}". Try a different search term or clear the filters.`}
          action={{ label: 'Clear filters', onClick: () => { setQuery(''); setTypeFilter('All'); } }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((obj) => <ObjectCard key={obj.id} object={obj} />)}
        </div>
      )}
    </div>
  );
};
