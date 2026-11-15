import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Plus, Download, Trash2, Calendar,
  ExternalLink, Sparkles, AlertCircle, FileText
} from 'lucide-react';
import { api, DiscoveryRecord } from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';

export const MyDiscoveries: React.FC = () => {
  const navigate = useNavigate();
  const [discoveries, setDiscoveries] = useState<DiscoveryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadDiscoveries = () => {
    setLoading(true);
    api.getDiscoveries()
      .then((data) => setDiscoveries(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDiscoveries();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this discovery entry?')) return;
    try {
      await api.deleteDiscovery(id);
      setDiscoveries((prev) => prev.filter((d) => d.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportReport = () => {
    if (discoveries.length === 0) return;
    let markdown = `# SPHEREx Citizen-Science Discovery Journal\n\n`;
    markdown += `Generated on: ${new Date().toISOString()}\n`;
    markdown += `Data Archive: NASA/IPAC IRSA (SPHEREx DR1)\n\n---\n\n`;

    discoveries.forEach((d, idx) => {
      markdown += `## ${idx + 1}. ${d.title}\n\n`;
      markdown += `- **Target Object:** ${d.object_name} (\`${d.object_id}\`)\n`;
      markdown += `- **Candidate Type:** ${d.candidate_type}\n`;
      markdown += `- **Confidence Level:** ${d.confidence}\n`;
      if (d.angular_displacement_arcsec) {
        markdown += `- **Angular Displacement:** ${d.angular_displacement_arcsec} arcseconds\n`;
      }
      markdown += `- **Observation Epochs:** ${d.observation_ids.join(', ')}\n`;
      markdown += `- **Recorded Date:** ${d.created_at}\n\n`;
      markdown += `### Scientific Analysis\n${d.analysis_summary}\n\n`;
      if (d.notes) {
        markdown += `### Observer Notes\n${d.notes}\n\n`;
      }
      markdown += `---\n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spherex-discoveries-report-${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-[#F4A272]" />
            <h1 className="text-2xl font-bold text-[#F3EFE8]">My Discoveries</h1>
          </div>
          <p className="text-sm text-[#9E9AA7]">
            Your personal astronomical observation journal and candidate catalog
          </p>
        </div>

        <div className="flex items-center gap-2">
          {discoveries.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleExportReport}
            >
              Export Report (.md)
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/discovery-lab')}
          >
            New Discovery Investigation
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-[#111117] border border-[#262635] rounded p-6 h-36 animate-pulse" />
          ))}
        </div>
      ) : discoveries.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-12 h-12" />}
          title="No discoveries logged yet"
          description="Investigate astronomical objects in the Discovery Lab, identify candidate moving or variable features, and save them here."
          action={{
            label: 'Launch Discovery Lab',
            onClick: () => navigate('/discovery-lab'),
          }}
        />
      ) : (
        <div className="space-y-4">
          {discoveries.map((disc) => (
            <div
              key={disc.id}
              className="bg-[#111117] border border-[#262635] rounded p-6 hover:border-[#3c3c4d] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-[#F3EFE8]">{disc.title}</h3>
                    <Badge variant={disc.candidate_type === 'moving_source' ? 'amber' : 'blue'}>
                      {disc.candidate_type.replace('_', ' ')}
                    </Badge>
                    <Badge variant="muted">Confidence: {disc.confidence}</Badge>
                  </div>
                  <div className="text-xs text-[#9E9AA7] flex items-center gap-2">
                    <span className="text-[#F4A272] font-medium">{disc.object_name}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3" />
                      {disc.created_at ? disc.created_at.slice(0, 10) : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/time-machine?object=${disc.object_id}`)}
                  >
                    View in Time Machine
                  </Button>
                  <button
                    onClick={() => handleDelete(disc.id)}
                    className="p-1.5 text-[#9E9AA7] hover:text-red-400 hover:bg-red-900/20 rounded transition-colors cursor-pointer"
                    title="Delete discovery"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {disc.notes && (
                <div className="bg-[#08080C] border border-[#262635] rounded p-3 text-xs text-[#F3EFE8] leading-relaxed mb-3">
                  <span className="font-semibold text-[#9E9AA7] block mb-1">Observer Notes:</span>
                  {disc.notes}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between text-[11px] text-[#9E9AA7] pt-2 border-t border-[#262635]">
                <div>
                  Observation Products: <span className="font-mono text-[#F4A272]">{disc.observation_ids.join(', ')}</span>
                </div>
                {disc.angular_displacement_arcsec && (
                  <div>
                    Displacement: <span className="font-mono text-[#F3B85B]">{disc.angular_displacement_arcsec}"</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
