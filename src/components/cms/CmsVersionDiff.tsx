import { useState, useEffect } from 'react';
import { CmsVersion, CmsContentBlock } from '../../lib/cms-types';
import { cmsService } from '../../lib/cms-service';

interface CmsVersionDiffProps {
  isOpen: boolean;
  onClose: () => void;
  draftVersion: CmsVersion;
  publishedVersion?: CmsVersion;
}

interface DiffBlock {
  blockKey: string;
  sectionKey: string;
  draftContent: string;
  publishedContent: string;
  status: 'added' | 'removed' | 'modified' | 'unchanged';
}

export function CmsVersionDiff({
  isOpen,
  onClose,
  draftVersion,
  publishedVersion,
}: CmsVersionDiffProps) {
  const [_draftBlocks, setDraftBlocks] = useState<CmsContentBlock[]>([]);
  const [_publishedBlocks, setPublishedBlocks] = useState<CmsContentBlock[]>([]);
  const [diffBlocks, setDiffBlocks] = useState<DiffBlock[]>([]);
  const [activeSection, setActiveSection] = useState('hero');
  const [language, setLanguage] = useState<'en' | 'fr'>('en');

  useEffect(() => {
    if (isOpen) {
      loadVersionContents();
    }
  }, [isOpen, draftVersion, publishedVersion]);

  const loadVersionContents = async () => {
    try {
      const draft = await cmsService.getBlocks(draftVersion.id);
      setDraftBlocks(draft);

      if (publishedVersion) {
        const published = await cmsService.getBlocks(publishedVersion.id);
        setPublishedBlocks(published);
        calculateDiff(draft, published);
      }
    } catch (error) {
      console.error('Failed to load version contents:', error);
    }
  };

  const calculateDiff = (draft: CmsContentBlock[], published: CmsContentBlock[]) => {
    const diffs: DiffBlock[] = [];
    const publishedMap = new Map(published.map((b) => [b.blockKey, b]));
    const draftMap = new Map(draft.map((b) => [b.blockKey, b]));

    // Check draft blocks
    draft.forEach((draftBlock) => {
      const pubBlock = publishedMap.get(draftBlock.blockKey);
      if (!pubBlock) {
        diffs.push({
          blockKey: draftBlock.blockKey,
          sectionKey: draftBlock.sectionKey,
          draftContent: draftBlock.content,
          publishedContent: '',
          status: 'added',
        });
      } else if (draftBlock.content !== pubBlock.content) {
        diffs.push({
          blockKey: draftBlock.blockKey,
          sectionKey: draftBlock.sectionKey,
          draftContent: draftBlock.content,
          publishedContent: pubBlock.content,
          status: 'modified',
        });
      }
    });

    // Check for removed blocks
    published.forEach((pubBlock) => {
      if (!draftMap.has(pubBlock.blockKey)) {
        diffs.push({
          blockKey: pubBlock.blockKey,
          sectionKey: pubBlock.sectionKey,
          draftContent: '',
          publishedContent: pubBlock.content,
          status: 'removed',
        });
      }
    });

    setDiffBlocks(diffs);
  };

  const sections = ['hero', 'features', 'faq', 'pricing', 'questionnaire'];
  const modifiedCount = diffBlocks.filter((d) => d.status === 'modified').length;
  const addedCount = diffBlocks.filter((d) => d.status === 'added').length;
  const removedCount = diffBlocks.filter((d) => d.status === 'removed').length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-md transition-colors"
          >
            <span className="material-symbols-outlined text-gray-500">close</span>
          </button>
          <div>
            <h1 className="text-base font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[#FF6B00] text-xl">compare_arrows</span>
              Compare Versions
            </h1>
            <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">
              Business Plan Template Editor
            </p>
          </div>
        </div>

        {/* Language toggle */}
        <div className="flex items-center bg-white border border-gray-200 rounded-md px-1 py-1 shadow-sm mx-4">
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
              language === 'en' ? 'text-[#FF6B00] bg-orange-50' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            EN
          </button>
          <div className="w-px h-3 bg-gray-200 mx-1" />
          <button
            onClick={() => setLanguage('fr')}
            className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
              language === 'fr' ? 'text-[#FF6B00] bg-orange-50' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            FR
          </button>
        </div>

        {/* Summary */}
        <div className="hidden md:flex items-center bg-white border border-gray-200 rounded-md px-4 py-1.5 gap-5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Summary</span>
            <span className="text-sm font-semibold text-[#FF6B00]">
              {diffBlocks.length} changes
            </span>
          </div>
          <div className="h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />
              <span className="text-gray-500">{modifiedCount} modified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-gray-500">{addedCount} added</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-gray-500">{removedCount} removed</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="text-gray-600 px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-100 transition-all border border-gray-200"
          >
            Discard
          </button>
          <button className="bg-[#FF6B00] text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-orange-600 transition-all shadow-sm">
            Publish v{draftVersion.versionNumber} Draft
          </button>
        </div>
      </header>

      {/* Section Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Jump To</span>
          <nav className="flex items-center gap-5 text-sm font-medium">
            {sections.map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`transition-colors capitalize ${
                  activeSection === section
                    ? 'text-[#FF6B00] border-b-2 border-[#FF6B00] pb-2.5 -mb-[11px]'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {section}
              </button>
            ))}
          </nav>
        </div>

        {/* Version selectors */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-50 border border-[#FF6B00]/20 rounded px-2.5 py-1 min-w-[140px]">
            <div className="flex flex-col">
              <span className="text-[9px] text-[#FF6B00] font-bold uppercase tracking-tight">
                Comparing
              </span>
              <span className="text-sm font-mono font-bold text-gray-900">
                v{draftVersion.versionNumber} Draft
              </span>
            </div>
            <span className="material-symbols-outlined text-[#FF6B00] text-lg ml-auto">
              expand_more
            </span>
          </div>
          <button className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all">
            <span className="material-symbols-outlined text-xl">swap_horiz</span>
          </button>
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded px-2.5 py-1 min-w-[140px]">
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tight">Base</span>
              <span className="text-sm font-mono font-bold text-gray-600">
                v{publishedVersion?.versionNumber || 0} Published
              </span>
            </div>
            <span className="material-symbols-outlined text-gray-400 text-lg ml-auto">
              expand_more
            </span>
          </div>
        </div>
      </div>

      {/* Main Content - Split View */}
      <main className="flex-1 flex overflow-hidden">
        {/* Draft Side (Left) */}
        <section className="flex-1 overflow-y-auto custom-scrollbar border-r border-gray-200 bg-white">
          <div className="p-8 max-w-3xl ml-auto w-full">
            <div className="flex items-center justify-between mb-8 pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="bg-orange-50 text-[#FF6B00] text-[11px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Draft Version
                </span>
                <span className="text-gray-400 text-[11px] font-medium">- Current Work</span>
              </div>
              <span className="text-gray-400 text-xs italic">Edited 2h ago</span>
            </div>

            {/* Content blocks */}
            {diffBlocks
              .filter((d) => d.sectionKey.includes(activeSection))
              .map((diff) => (
                <div key={diff.blockKey} className="mb-12">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                      Section: {diff.blockKey.split('.').pop()?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                      {diff.blockKey}
                    </span>
                  </div>
                  <div
                    className={`p-6 rounded-lg border ${
                      diff.status === 'added'
                        ? 'border-green-200 bg-green-50/30'
                        : diff.status === 'modified'
                        ? 'border-[#FF6B00]/20 bg-orange-50/30'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    {diff.status === 'added' && (
                      <span className="inline-block mb-2 bg-[#FF6B00] text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                        NEW
                      </span>
                    )}
                    <p className="text-gray-900 leading-relaxed">
                      {diff.draftContent || (
                        <span className="text-gray-400 italic">No content</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* Published Side (Right) */}
        <section className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/50">
          <div className="p-8 max-w-3xl mr-auto w-full">
            <div className="flex items-center justify-between mb-8 pb-2 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="bg-gray-200 text-gray-600 text-[11px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Published
                </span>
                <span className="text-gray-400 text-[11px] font-medium">- Live Website</span>
              </div>
              <span className="text-gray-400 text-xs italic">
                Live since {publishedVersion?.publishedAt ? new Date(publishedVersion.publishedAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>

            {/* Content blocks */}
            {diffBlocks
              .filter((d) => d.sectionKey.includes(activeSection))
              .map((diff) => (
                <div key={diff.blockKey} className="mb-12">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                      Section: {diff.blockKey.split('.').pop()?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                      {diff.blockKey}
                    </span>
                  </div>
                  <div
                    className={`p-6 rounded-lg border ${
                      diff.status === 'removed'
                        ? 'border-red-200 bg-red-50/30'
                        : 'border-gray-200 bg-white opacity-75'
                    }`}
                  >
                    {diff.status === 'removed' && (
                      <span className="inline-block mb-2 bg-red-100 text-red-700 text-[9px] px-1.5 py-0.5 rounded font-bold">
                        REMOVED
                      </span>
                    )}
                    {diff.status === 'added' ? (
                      <div className="min-h-[60px] flex flex-col items-center justify-center text-gray-300">
                        <span className="material-symbols-outlined text-2xl mb-2">block</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Not in Published</span>
                      </div>
                    ) : (
                      <p className={`leading-relaxed ${diff.status === 'removed' ? 'text-red-600 line-through' : 'text-gray-500'}`}>
                        {diff.publishedContent || (
                          <span className="text-gray-300 italic">Not in Published</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-6 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-1.5">
            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 border-2 border-white">
              JD
            </div>
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-600 border-2 border-white">
              MK
            </div>
          </div>
          <span className="text-[11px] text-gray-500 font-medium">2 active reviewers</span>
        </div>
        <div className="flex items-center gap-6 text-[11px] font-medium text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-green-600">sync</span>
            <span>Scrolling Synced</span>
          </div>
          <div className="h-3 w-px bg-gray-200" />
          <button className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
            <span className="material-symbols-outlined text-base">settings</span>
            <span>Diff Settings</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-gray-900 transition-colors">
            <span className="material-symbols-outlined text-base">help_outline</span>
            <span>Help</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
