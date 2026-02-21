import { useState, useEffect } from 'react';
import { cmsService } from '../../../lib/cms-service';
import { CmsVersion } from '../../../lib/cms-types';

interface CmsVersionHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  versionId: string;
}

export function CmsVersionHistorySidebar({
  isOpen,
  onClose,
  versionId: _versionId,
}: CmsVersionHistorySidebarProps) {
  const [versions, setVersions] = useState<CmsVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadVersions();
    }
  }, [isOpen]);

  const loadVersions = async () => {
    setIsLoading(true);
    try {
      const data = await cmsService.getVersions();
      setVersions(data);
    } catch (error) {
      console.error('Failed to load versions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 24) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-[#FF6B00]/10 text-[#FF6B00]';
      case 'Published':
        return 'bg-emerald-100 text-emerald-600';
      case 'Archived':
        return 'bg-slate-200 text-slate-500';
      default:
        return 'bg-slate-200 text-slate-500';
    }
  };

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'border-[#FF6B00] shadow-[0_0_0_4px_rgba(255,106,0,0.1)]';
      case 'Published':
        return 'border-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.1)]';
      case 'Archived':
        return 'border-slate-400';
      default:
        return 'border-slate-400';
    }
  };

  const getBorderColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'border-l-[#FF6B00]';
      case 'Published':
        return 'border-l-emerald-500';
      case 'Archived':
        return 'border-l-slate-300';
      default:
        return 'border-l-slate-300';
    }
  };

  if (!isOpen) return null;

  return (
    <aside className="fixed inset-y-0 right-0 w-[400px] border-l border-slate-200 bg-white flex flex-col shadow-2xl z-50">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-20">
        <div className="flex items-center space-x-2">
          <span className="material-symbols-outlined text-slate-500">history</span>
          <h2 className="text-lg font-semibold tracking-tight">Version History</h2>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={loadVersions}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
            title="Refresh"
          >
            <span className="material-symbols-outlined text-xl">refresh</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
            title="Close"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-6 relative custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Vertical Timeline Line */}
            <div className="absolute left-10 top-10 bottom-10 w-px bg-slate-200" />

            <div className="space-y-10 relative">
              {versions.map((version) => (
                <div key={version.id} className="relative pl-12">
                  {/* Timeline Node */}
                  <div
                    className={`absolute left-[-1.35rem] top-2 w-4 h-4 rounded-full border-2 bg-white z-10 ${getNodeColor(version.status)}`}
                  />

                  {/* Version Card */}
                  <div
                    className={`bg-white rounded-xl border-l-4 shadow-sm ring-1 ring-slate-200 p-4 transition-all hover:shadow-md ${getBorderColor(version.status)} ${
                      version.status === 'Archived' ? 'opacity-75 hover:opacity-100' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-bold">Version {version.versionNumber}</span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md tracking-wider ${getStatusColor(version.status)}`}
                          >
                            {version.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          {formatDate(version.createdAt)}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                        {version.createdByUserName?.split(' ').map(n => n[0]).join('') || 'U'}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-[13px] text-slate-400 mb-1">Editor</p>
                      <p className="text-sm font-medium">{version.createdByUserName || 'Unknown'}</p>
                    </div>

                    {version.notes && (
                      <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                        <p className="text-[11px] text-slate-400 uppercase font-bold tracking-widest mb-2">
                          Changelog
                        </p>
                        <p className="text-[13px] leading-relaxed italic">"{version.notes}"</p>
                      </div>
                    )}

                    {/* Actions */}
                    {version.status === 'Draft' && (
                      <div className="flex space-x-2">
                        <button className="flex-1 py-1.5 px-3 bg-[#FF6B00] text-white text-xs font-semibold rounded hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200">
                          Restore
                        </button>
                        <button className="flex-1 py-1.5 px-3 bg-white text-slate-700 border border-slate-200 text-xs font-semibold rounded hover:bg-slate-50 transition-colors">
                          Compare
                        </button>
                      </div>
                    )}

                    {version.status === 'Published' && (
                      <button className="w-full py-1.5 px-3 bg-emerald-500 text-white text-xs font-semibold rounded hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-200 flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm mr-1.5">visibility</span>
                        View Live
                      </button>
                    )}

                    {version.status === 'Archived' && (
                      <button className="w-full py-1.5 px-3 bg-white text-slate-700 border border-slate-200 text-xs font-semibold rounded hover:bg-slate-50 transition-colors">
                        Restore
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom Stats */}
      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium uppercase tracking-widest">
          <span>Total Versions: {versions.length}</span>
          <span>Storage: {(versions.length * 0.3).toFixed(1)}MB</span>
        </div>
      </div>
    </aside>
  );
}
