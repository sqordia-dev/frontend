import { useState, useEffect } from 'react';
import { X, RefreshCw, History, Loader2, RotateCcw, Eye, Edit } from 'lucide-react';
import { questionnaireVersionService } from '../../../lib/questionnaire-version-service';
import type { QuestionnaireVersion } from '../../../types/questionnaire-version';
import { cn } from '@/lib/utils';

interface QuestionnaireVersionHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore: (versionId: string) => Promise<void>;
  currentVersionId?: string;
}

export function QuestionnaireVersionHistorySidebar({
  isOpen,
  onClose,
  onRestore,
  currentVersionId,
}: QuestionnaireVersionHistorySidebarProps) {
  const [versions, setVersions] = useState<QuestionnaireVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadVersions();
    }
  }, [isOpen]);

  const loadVersions = async () => {
    setIsLoading(true);
    try {
      const data = await questionnaireVersionService.getVersionHistory();
      setVersions(data);
    } catch (error) {
      console.error('Failed to load versions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (versionId: string) => {
    if (!confirm('Are you sure you want to restore this version? This will create a new draft based on this version.')) {
      return;
    }

    setRestoringId(versionId);
    try {
      await onRestore(versionId);
      onClose();
    } catch (error) {
      console.error('Failed to restore version:', error);
    } finally {
      setRestoringId(null);
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
    if (hours < 48) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
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
        return 'border-[#FF6B00] bg-[#FF6B00]/10';
      case 'Published':
        return 'border-emerald-500 bg-emerald-100';
      case 'Archived':
        return 'border-slate-400 bg-slate-100';
      default:
        return 'border-slate-400 bg-slate-100';
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
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className="fixed inset-y-0 right-0 w-[420px] border-l border-slate-200 bg-white flex flex-col shadow-2xl z-50">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <History size={20} className="text-slate-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Version History</h2>
              <p className="text-xs text-slate-500">{versions.length} versions</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={loadVersions}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-[#FF6B00]" />
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <History size={48} className="mx-auto mb-4 opacity-50" />
              <p>No version history available</p>
            </div>
          ) : (
            <>
              {/* Vertical Timeline Line */}
              <div className="absolute left-10 top-6 bottom-6 w-px bg-slate-200" />

              <div className="space-y-6 relative">
                {versions.map((version) => (
                  <div key={version.id} className="relative pl-12">
                    {/* Timeline Node */}
                    <div
                      className={cn(
                        'absolute left-[18px] top-3 w-4 h-4 rounded-full border-2 z-10',
                        getNodeColor(version.status),
                        currentVersionId === version.id && 'ring-4 ring-[#FF6B00]/20'
                      )}
                    />

                    {/* Version Card */}
                    <div
                      className={cn(
                        'bg-white rounded-xl border-l-4 shadow-sm ring-1 ring-slate-200 p-4 transition-all hover:shadow-md',
                        getBorderColor(version.status),
                        currentVersionId === version.id && 'ring-2 ring-[#FF6B00]/30',
                        version.status === 'Archived' && 'opacity-75 hover:opacity-100'
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-slate-900">
                              Version {version.versionNumber}
                            </span>
                            <span
                              className={cn(
                                'px-2 py-0.5 text-[10px] font-bold uppercase rounded-md tracking-wider',
                                getStatusColor(version.status)
                              )}
                            >
                              {version.status}
                            </span>
                            {currentVersionId === version.id && (
                              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md tracking-wider bg-[#FF6B00]/10 text-[#FF6B00]">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium">
                            {formatDate(version.createdAt)}
                          </p>
                        </div>
                        {version.createdByUserName && (
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                            {version.createdByUserName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                        <div>
                          <p className="text-[11px] text-slate-400 uppercase font-medium mb-0.5">Questions</p>
                          <p className="font-semibold text-slate-700">{version.questionCount}</p>
                        </div>
                        {version.publishedAt && (
                          <div>
                            <p className="text-[11px] text-slate-400 uppercase font-medium mb-0.5">Published</p>
                            <p className="font-medium text-slate-600 text-xs">{formatDate(version.publishedAt)}</p>
                          </div>
                        )}
                      </div>

                      {version.notes && (
                        <div className="mb-3 p-3 bg-slate-50 rounded-lg">
                          <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                            Notes
                          </p>
                          <p className="text-sm text-slate-600 italic">"{version.notes}"</p>
                        </div>
                      )}

                      {/* Actions */}
                      {version.status === 'Archived' && (
                        <button
                          onClick={() => handleRestore(version.id)}
                          disabled={restoringId === version.id}
                          className={cn(
                            'w-full py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5',
                            restoringId === version.id
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                          )}
                        >
                          {restoringId === version.id ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              Restoring...
                            </>
                          ) : (
                            <>
                              <RotateCcw size={14} />
                              Restore as Draft
                            </>
                          )}
                        </button>
                      )}

                      {version.status === 'Published' && currentVersionId !== version.id && (
                        <button
                          onClick={() => handleRestore(version.id)}
                          disabled={restoringId === version.id}
                          className={cn(
                            'w-full py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5',
                            restoringId === version.id
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
                          )}
                        >
                          {restoringId === version.id ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              Restoring...
                            </>
                          ) : (
                            <>
                              <RotateCcw size={14} />
                              Restore as Draft
                            </>
                          )}
                        </button>
                      )}

                      {version.status === 'Published' && currentVersionId === version.id && (
                        <div className="w-full py-2 px-3 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-lg text-center flex items-center justify-center gap-1.5">
                          <Eye size={14} />
                          Currently Active
                        </div>
                      )}

                      {version.status === 'Draft' && currentVersionId === version.id && (
                        <div className="w-full py-2 px-3 text-xs font-medium text-[#FF6B00] bg-[#FF6B00]/5 rounded-lg text-center flex items-center justify-center gap-1.5">
                          <Edit size={14} />
                          Currently Editing
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer Stats */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium uppercase tracking-wider">
            <span>
              {versions.filter(v => v.status === 'Published').length} Published
            </span>
            <span>
              {versions.filter(v => v.status === 'Archived').length} Archived
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
