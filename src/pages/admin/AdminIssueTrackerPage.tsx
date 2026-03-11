import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gitHubIssueService } from '../../lib/github-issue-service';
import {
  CreateGitHubIssueRequest,
  GitHubIssueResponse,
  GitHubIssueListItem,
  GitHubIssueListResponse,
  GitHubIssueDetailResponse,
  GitHubIssueStats,
  SystemInfo,
  IssueSeverity,
  IssueCategory,
  TargetRepository,
  IssueState,
  ListIssuesParams,
} from '../../lib/github-issue-types';
import { RichTextEditor } from '../../components/editor/RichTextEditor';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';
import {
  Bug,
  Send,
  X,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Monitor,
  Lightbulb,
  Sparkles,
  FileText,
  Zap,
  Upload,
  Laptop,
  Server,
  ChevronDown,
  Github,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Circle,
  CheckCircle2,
  MessageSquare,
  Clock,
  ArrowUpRight,
  ChevronRight,
  Image,
  Eye,
  Code,
  Pencil,
  Save,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Constants
// ─────────────────────────────────────────────────────────────────────────────

interface UploadedScreenshot {
  file: File;
  url: string;
  preview: string;
}

const SEVERITY_OPTIONS = [
  { value: 'Low' as IssueSeverity, label: 'Low', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { value: 'Medium' as IssueSeverity, label: 'Medium', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'High' as IssueSeverity, label: 'High', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'Critical' as IssueSeverity, label: 'Critical', color: 'bg-red-50 text-red-700 border-red-200' },
];

const CATEGORY_OPTIONS = [
  { value: 'Bug' as IssueCategory, label: 'Bug', icon: Bug, color: 'text-red-500' },
  { value: 'Feature' as IssueCategory, label: 'Feature', icon: Lightbulb, color: 'text-amber-500' },
  { value: 'Enhancement' as IssueCategory, label: 'Enhancement', icon: Sparkles, color: 'text-purple-500' },
  { value: 'Documentation' as IssueCategory, label: 'Docs', icon: FileText, color: 'text-blue-500' },
  { value: 'Performance' as IssueCategory, label: 'Performance', icon: Zap, color: 'text-green-500' },
];

const REPOSITORY_OPTIONS = [
  { value: 'frontend' as TargetRepository, label: 'Frontend', icon: Laptop, desc: 'UI, components, pages' },
  { value: 'backend' as TargetRepository, label: 'Backend', icon: Server, desc: 'API, database, services' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper Components
// ─────────────────────────────────────────────────────────────────────────────

function StatusDot({ state }: { state: string }) {
  const isOpen = state === 'open';
  return (
    <span className={cn(
      "flex h-2.5 w-2.5 rounded-full",
      isOpen ? "bg-emerald-500" : "bg-gray-400"
    )} />
  );
}

function PriorityBadge({ priority }: { priority?: string }) {
  if (!priority) return null;

  const colors: Record<string, string> = {
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };

  return (
    <span className={cn(
      "px-2 py-0.5 text-xs font-medium rounded-full capitalize",
      colors[priority.toLowerCase()] || colors.low
    )}>
      {priority}
    </span>
  );
}

function RepoBadge({ repo }: { repo: string }) {
  const isFrontend = repo === 'frontend';
  return (
    <span className={cn(
      "px-2 py-0.5 text-xs font-medium rounded",
      isFrontend
        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
        : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
    )}>
      {isFrontend ? 'FE' : 'BE'}
    </span>
  );
}

function TimeAgo({ date }: { date: string }) {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  let text = '';
  if (diffMins < 60) text = `${diffMins}m ago`;
  else if (diffHours < 24) text = `${diffHours}h ago`;
  else if (diffDays < 7) text = `${diffDays}d ago`;
  else text = then.toLocaleDateString();

  return <span className="text-xs text-gray-400">{text}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Issue Row Component
// ─────────────────────────────────────────────────────────────────────────────

function IssueRow({ issue, onClick }: { issue: GitHubIssueListItem; onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left border-b border-gray-100 dark:border-gray-800 last:border-b-0"
    >
      <StatusDot state={issue.state} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-gray-400">#{issue.issueNumber}</span>
          <span className="font-medium text-gray-900 dark:text-white truncate">
            {issue.title}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <TimeAgo date={issue.createdAt} />
          {issue.commentsCount > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {issue.commentsCount}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <PriorityBadge priority={issue.priority} />
        <RepoBadge repo={issue.repository} />
      </div>

      <ChevronRight className="w-4 h-4 text-gray-400" />
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GitHub Markdown Preview Component
// ─────────────────────────────────────────────────────────────────────────────

function GitHubPreview({
  title,
  description,
  category,
  severity,
  repository,
  reproductionSteps,
  screenshots,
  systemInfo,
}: {
  title: string;
  description: string;
  category: IssueCategory;
  severity: IssueSeverity;
  repository: TargetRepository;
  reproductionSteps: string;
  screenshots: UploadedScreenshot[];
  systemInfo: SystemInfo | null;
}) {
  // Strip HTML for preview
  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').trim();
  const descriptionText = stripHtml(description);
  const stepsText = stripHtml(reproductionSteps);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800">
      {/* Preview Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <Eye className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Live Preview
        </span>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* GitHub Issue Header Style */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {title || 'Issue title...'}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              "px-2 py-1 text-xs font-medium rounded-full",
              category === 'Bug' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
            )}>
              {category.toLowerCase()}
            </span>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
              priority: {severity.toLowerCase()}
            </span>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
              from: admin-panel
            </span>
          </div>
        </div>

        {/* Markdown Preview */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Description</h3>
          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {descriptionText || 'Describe the issue...'}
          </p>

          {stepsText && (
            <>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-4">
                Steps to Reproduce
              </h3>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{stepsText}</p>
            </>
          )}

          {systemInfo && (
            <>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-4">
                Environment
              </h3>
              <table className="text-sm">
                <tbody>
                  <tr>
                    <td className="pr-4 py-1 text-gray-500">Browser</td>
                    <td className="py-1 text-gray-900 dark:text-white">{systemInfo.browser}</td>
                  </tr>
                  <tr>
                    <td className="pr-4 py-1 text-gray-500">OS</td>
                    <td className="py-1 text-gray-900 dark:text-white">{systemInfo.operatingSystem}</td>
                  </tr>
                  <tr>
                    <td className="pr-4 py-1 text-gray-500">Screen</td>
                    <td className="py-1 text-gray-900 dark:text-white">{systemInfo.screenSize}</td>
                  </tr>
                </tbody>
              </table>
            </>
          )}

          {screenshots.length > 0 && (
            <>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-4">
                Screenshots
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {screenshots.map((s, i) => (
                  <img
                    key={i}
                    src={s.preview}
                    alt={`Screenshot ${i + 1}`}
                    className="w-24 h-24 object-cover rounded border border-gray-200 dark:border-gray-700"
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Repository indicator */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Github className="w-4 h-4" />
          <span>Will be created in:</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            sqordia/{repository}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Create Issue Slide-Over Component
// ─────────────────────────────────────────────────────────────────────────────

function CreateIssueSlideOver({
  isOpen,
  onClose,
  onSuccess,
  language,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (issue: GitHubIssueResponse) => void;
  language: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<IssueSeverity>('Medium');
  const [category, setCategory] = useState<IssueCategory>('Bug');
  const [repository, setRepository] = useState<TargetRepository>('frontend');
  const [reproductionSteps, setReproductionSteps] = useState('');
  const [screenshots, setScreenshots] = useState<UploadedScreenshot[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSystemInfo(gitHubIssueService.getSystemInfo());
    }
  }, [isOpen]);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);

    try {
      const newScreenshots: UploadedScreenshot[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 10 * 1024 * 1024) continue;

        const preview = URL.createObjectURL(file);
        let url = '';
        try {
          url = await gitHubIssueService.uploadScreenshot(file);
        } catch (err) {
          console.warn('Screenshot upload failed');
        }
        newScreenshots.push({ file, url, preview });
      }
      setScreenshots(prev => [...prev, ...newScreenshots]);
    } catch (err: any) {
      setError(err.message || 'Failed to process screenshot');
    } finally {
      setUploading(false);
    }
  }, []);

  const removeScreenshot = useCallback((index: number) => {
    setScreenshots(prev => {
      const newScreenshots = [...prev];
      URL.revokeObjectURL(newScreenshots[index].preview);
      newScreenshots.splice(index, 1);
      return newScreenshots;
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Convert HTML from RichTextEditor to plain text for GitHub
      const plainDescription = htmlToPlainText(description);
      const plainReproductionSteps = reproductionSteps ? htmlToPlainText(reproductionSteps) : undefined;

      const request: CreateGitHubIssueRequest = {
        title,
        description: plainDescription,
        severity,
        category,
        repository,
        reproductionSteps: plainReproductionSteps,
        browser: systemInfo?.browser,
        operatingSystem: systemInfo?.operatingSystem,
        screenSize: systemInfo?.screenSize,
        currentPageUrl: systemInfo?.currentPageUrl,
        screenshotUrls: screenshots.map(s => s.url).filter(Boolean),
      };

      const response = await gitHubIssueService.createIssue(request);
      onSuccess(response);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to create issue');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSeverity('Medium');
    setCategory('Bug');
    setRepository('frontend');
    setReproductionSteps('');
    screenshots.forEach(s => URL.revokeObjectURL(s.preview));
    setScreenshots([]);
    setError(null);
  };

  // Convert HTML to plain text for submission
  const htmlToPlainText = (html: string): string => {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<li>/gi, '• ')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const getPlainTextLength = (html: string) => htmlToPlainText(html).length;
  const isFormValid = title.length >= 5 && getPlainTextLength(description) >= 20;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Slide-over panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full max-w-5xl bg-white dark:bg-gray-900 shadow-2xl z-50 flex"
          >
            {/* Form Side */}
            <div className="w-1/2 flex flex-col border-r border-gray-200 dark:border-gray-800">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {language === 'fr' ? 'Nouvelle Issue' : 'New Issue'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {language === 'fr' ? 'Créer un rapport de bug ou une demande' : 'Create a bug report or request'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {/* Repository & Category Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Repository
                    </label>
                    <div className="flex gap-2">
                      {REPOSITORY_OPTIONS.map(opt => {
                        const Icon = opt.icon;
                        const isSelected = repository === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setRepository(opt.value)}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                              isSelected
                                ? "border-momentum-orange bg-momentum-orange/5 text-momentum-orange"
                                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                            )}
                          >
                            <Icon className="w-4 h-4" />
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Severity
                    </label>
                    <div className="flex gap-1">
                      {SEVERITY_OPTIONS.map(opt => {
                        const isSelected = severity === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setSeverity(opt.value)}
                            className={cn(
                              "flex-1 px-2 py-2 rounded-lg border text-xs font-medium transition-all",
                              isSelected ? opt.color + ' border-current' : "border-gray-200 dark:border-gray-700 text-gray-500"
                            )}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_OPTIONS.map(opt => {
                      const Icon = opt.icon;
                      const isSelected = category === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setCategory(opt.value)}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all",
                            isSelected
                              ? "border-momentum-orange bg-momentum-orange/5 text-momentum-orange"
                              : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"
                          )}
                        >
                          <Icon className={cn("w-3.5 h-3.5", isSelected ? "text-momentum-orange" : opt.color)} />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Brief summary of the issue..."
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-momentum-orange/20 focus:border-momentum-orange transition-all outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <RichTextEditor
                    content={description}
                    onChange={setDescription}
                    placeholder="Describe the issue in detail..."
                    className="rounded-lg overflow-hidden [&_.prose-editor]:min-h-[120px] [&_.prose-editor]:max-h-[200px] [&_.prose-editor]:overflow-y-auto border-gray-200 dark:border-gray-700"
                  />
                </div>

                {/* Steps (for bugs) */}
                {category === 'Bug' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Steps to Reproduce
                    </label>
                    <RichTextEditor
                      content={reproductionSteps}
                      onChange={setReproductionSteps}
                      placeholder="1. Go to...  2. Click on...  3. See error"
                      className="rounded-lg overflow-hidden [&_.prose-editor]:min-h-[80px] [&_.prose-editor]:max-h-[150px] [&_.prose-editor]:overflow-y-auto border-gray-200 dark:border-gray-700"
                    />
                  </div>
                )}

                {/* Screenshots */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Screenshots
                  </label>
                  <div
                    onDrop={e => { e.preventDefault(); setDragActive(false); handleFileSelect(e.dataTransfer.files); }}
                    onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer",
                      dragActive ? "border-momentum-orange bg-momentum-orange/5" : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    )}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={e => handleFileSelect(e.target.files)}
                      className="hidden"
                    />
                    <Upload className={cn("w-6 h-6 mx-auto mb-2", dragActive ? "text-momentum-orange" : "text-gray-400")} />
                    <p className="text-xs text-gray-500">Drop images or click to browse</p>
                  </div>

                  {screenshots.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {screenshots.map((s, i) => (
                        <div key={i} className="relative group">
                          <img src={s.preview} alt="" className="w-16 h-16 object-cover rounded border" />
                          <button
                            type="button"
                            onClick={() => removeScreenshot(i)}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <div className="text-sm text-gray-500">
                  {isFormValid ? (
                    <span className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle className="w-4 h-4" /> Ready
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-600">
                      <AlertCircle className="w-4 h-4" /> Fill required fields
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !isFormValid}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-momentum-orange text-white rounded-lg hover:bg-momentum-orange/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Create Issue
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Side */}
            <div className="w-1/2">
              <GitHubPreview
                title={title}
                description={description}
                category={category}
                severity={severity}
                repository={repository}
                reproductionSteps={reproductionSteps}
                screenshots={screenshots}
                systemInfo={systemInfo}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Issue Detail Slide-Over Component
// ─────────────────────────────────────────────────────────────────────────────

function IssueDetailSlideOver({
  isOpen,
  onClose,
  issue,
  loading,
  language,
  onStatusChange,
  onArchive,
}: {
  isOpen: boolean;
  onClose: () => void;
  issue: GitHubIssueDetailResponse | null;
  loading: boolean;
  language: string;
  onStatusChange: (updatedIssue: GitHubIssueDetailResponse) => void;
  onArchive: (repository: string, issueNumber: number) => void;
}) {
  const [updating, setUpdating] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [archiving, setArchiving] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editPriority, setEditPriority] = useState<string>('');
  const [editCategory, setEditCategory] = useState<string>('');

  const isOpen_ = issue?.state === 'open';

  // Reset edit state when issue changes or panel closes
  useEffect(() => {
    if (issue) {
      setEditTitle(issue.title);
      setEditBody(issue.body);
      // Extract priority and category from labels
      const priorityLabel = issue.labels.find(l =>
        ['low', 'medium', 'high', 'critical'].includes(l.name.toLowerCase())
      );
      const categoryLabel = issue.labels.find(l =>
        ['bug', 'feature', 'enhancement', 'documentation', 'performance'].includes(l.name.toLowerCase())
      );
      setEditPriority(priorityLabel?.name || '');
      setEditCategory(categoryLabel?.name || '');
    }
    setIsEditMode(false);
    setShowArchiveConfirm(false);
  }, [issue, isOpen]);

  const handleToggleState = async () => {
    if (!issue) return;
    setUpdating(true);
    try {
      const newState = isOpen_ ? 'closed' : 'open';
      const updatedIssue = await gitHubIssueService.updateIssueState(issue.repository, issue.issueNumber, newState);
      onStatusChange(updatedIssue);
    } catch (err) {
      console.error('Failed to update issue state:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!issue) return;
    setUpdating(true);
    try {
      const updates: {
        title?: string;
        body?: string;
        priority?: string;
        category?: string;
      } = {};

      if (editTitle !== issue.title) {
        updates.title = editTitle;
      }
      if (editBody !== issue.body) {
        updates.body = editBody;
      }
      if (editPriority) {
        updates.priority = editPriority.toLowerCase();
      }
      if (editCategory) {
        updates.category = editCategory.toLowerCase();
      }

      const updatedIssue = await gitHubIssueService.updateIssue(
        issue.repository,
        issue.issueNumber,
        updates
      );
      onStatusChange(updatedIssue);
      setIsEditMode(false);
    } catch (err) {
      console.error('Failed to update issue:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleArchive = async () => {
    if (!issue) return;
    setArchiving(true);
    try {
      await gitHubIssueService.archiveIssue(issue.repository, issue.issueNumber);
      onArchive(issue.repository, issue.issueNumber);
      setShowArchiveConfirm(false);
      onClose();
    } catch (err) {
      console.error('Failed to archive issue:', err);
    } finally {
      setArchiving(false);
    }
  };

  // Strip HTML tags from content
  const stripHtml = (html: string): string => {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  // Parse markdown-style body into sections
  const parseBody = (body: string) => {
    const sections: { title: string; content: string }[] = [];
    const lines = body.split('\n');
    let currentSection = { title: '', content: '' };

    lines.forEach(line => {
      if (line.startsWith('## ')) {
        if (currentSection.title || currentSection.content) {
          sections.push({ ...currentSection });
        }
        currentSection = { title: line.replace('## ', ''), content: '' };
      } else {
        currentSection.content += line + '\n';
      }
    });

    if (currentSection.title || currentSection.content) {
      sections.push(currentSection);
    }

    return sections;
  };

  // Parse markdown table to object
  const parseEnvironmentTable = (content: string): Record<string, string> => {
    const env: Record<string, string> = {};
    const lines = content.split('\n').filter(l => l.includes('|') && !l.includes('---'));
    lines.slice(1).forEach(line => {
      const parts = line.split('|').map(p => p.trim()).filter(Boolean);
      if (parts.length === 2) {
        env[parts[0]] = parts[1];
      }
    });
    return env;
  };

  const bodySections = issue ? parseBody(issue.body) : [];
  const envSection = bodySections.find(s => s.title === 'Environment');
  const environment = envSection ? parseEnvironmentTable(envSection.content) : {};

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Slide-over panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
          >
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-momentum-orange animate-spin" />
              </div>
            ) : issue ? (
              <>
                {/* Header */}
                <div className="flex items-start justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                        isOpen_
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      )}>
                        {isOpen_ ? <Circle className="w-3 h-3 fill-current" /> : <CheckCircle2 className="w-3 h-3" />}
                        {isOpen_ ? 'Open' : 'Closed'}
                      </span>
                      <span className="text-xs font-mono text-gray-400">#{issue.issueNumber}</span>
                      <RepoBadge repo={issue.repository} />
                      {isEditMode && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded">
                          {language === 'fr' ? 'Mode édition' : 'Edit Mode'}
                        </span>
                      )}
                    </div>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full text-xl font-semibold text-gray-900 dark:text-white leading-tight bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-momentum-orange/50"
                        placeholder={language === 'fr' ? 'Titre de l\'issue' : 'Issue title'}
                      />
                    ) : (
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white leading-tight">
                        {issue.title}
                      </h2>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                      {issue.author && (
                        <span className="flex items-center gap-1.5">
                          <img
                            src={issue.author.avatarUrl}
                            alt={issue.author.login}
                            className="w-5 h-5 rounded-full"
                          />
                          {issue.author.login}
                        </span>
                      )}
                      <span>opened <TimeAgo date={issue.createdAt} /></span>
                      {issue.commentsCount > 0 && (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {issue.commentsCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Labels / Edit Fields */}
                {isEditMode ? (
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Priority */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">
                          {language === 'fr' ? 'Priorité' : 'Priority'}
                        </label>
                        <select
                          value={editPriority}
                          onChange={(e) => setEditPriority(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-momentum-orange/50"
                        >
                          <option value="">{language === 'fr' ? 'Sélectionner...' : 'Select...'}</option>
                          {SEVERITY_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      {/* Category */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">
                          {language === 'fr' ? 'Catégorie' : 'Category'}
                        </label>
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-momentum-orange/50"
                        >
                          <option value="">{language === 'fr' ? 'Sélectionner...' : 'Select...'}</option>
                          {CATEGORY_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ) : issue.labels.length > 0 && (
                  <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                    <div className="flex flex-wrap gap-2">
                      {issue.labels.map((label, idx) => {
                        // Calculate if color is light (needs dark text)
                        const hex = label.color.replace('#', '');
                        const r = parseInt(hex.substr(0, 2), 16);
                        const g = parseInt(hex.substr(2, 2), 16);
                        const b = parseInt(hex.substr(4, 2), 16);
                        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                        const isLightColor = luminance > 0.6;

                        return (
                          <span
                            key={idx}
                            className="px-2.5 py-1 text-xs font-semibold rounded-full"
                            style={{
                              backgroundColor: `#${label.color}`,
                              color: isLightColor ? '#1f2937' : '#ffffff',
                              border: `1px solid ${isLightColor ? '#d1d5db' : `#${label.color}`}`
                            }}
                          >
                            {label.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="px-6 py-5 space-y-6">
                    {isEditMode ? (
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          {language === 'fr' ? 'Contenu (Markdown)' : 'Content (Markdown)'}
                        </label>
                        <textarea
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          rows={18}
                          className="w-full px-4 py-3 text-sm font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-momentum-orange/50 resize-y leading-relaxed"
                          placeholder={language === 'fr' ? 'Contenu de l\'issue en Markdown...' : 'Issue content in Markdown...'}
                        />
                        <p className="mt-1.5 text-xs text-gray-400">
                          {language === 'fr'
                            ? 'Utilisez la syntaxe Markdown. Les en-t\u00eates ## cr\u00e9ent des sections.'
                            : 'Use Markdown syntax. ## headers create sections.'}
                        </p>
                      </div>
                    ) : bodySections.map((section, idx) => (
                      <div key={idx}>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          {section.title === 'Description' && <FileText className="w-4 h-4 text-blue-500" />}
                          {section.title === 'Steps to Reproduce' && <Bug className="w-4 h-4 text-red-500" />}
                          {section.title === 'Environment' && <Monitor className="w-4 h-4 text-purple-500" />}
                          {section.title === 'Screenshots' && <Image className="w-4 h-4 text-green-500" />}
                          {section.title === 'Reporter' && <MessageSquare className="w-4 h-4 text-amber-500" />}
                          {section.title}
                        </h3>

                        {section.title === 'Environment' ? (
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-3">
                              {Object.entries(environment).map(([key, value]) => (
                                <div key={key}>
                                  <dt className="text-xs text-gray-500 mb-0.5">{key}</dt>
                                  <dd className="text-sm text-gray-900 dark:text-white font-medium truncate">
                                    {value}
                                  </dd>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : section.title === 'Screenshots' ? (
                          <div className="flex flex-wrap gap-3">
                            {section.content.match(/!\[.*?\]\((.*?)\)/g)?.map((match, i) => {
                              const url = match.match(/\((.*?)\)/)?.[1];
                              return url ? (
                                <a
                                  key={i}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block group"
                                >
                                  <img
                                    src={url}
                                    alt={`Screenshot ${i + 1}`}
                                    className="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700 group-hover:border-momentum-orange transition-colors"
                                  />
                                </a>
                              ) : null;
                            })}
                          </div>
                        ) : (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                              {stripHtml(section.content.trim().replace(/^\*.*\*$/m, '').trim())}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Timestamps */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Created</span>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {new Date(issue.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {issue.updatedAt && (
                          <div>
                            <span className="text-gray-500">Updated</span>
                            <p className="text-gray-900 dark:text-white font-medium">
                              {new Date(issue.updatedAt).toLocaleString()}
                            </p>
                          </div>
                        )}
                        {issue.closedAt && (
                          <div>
                            <span className="text-gray-500">Closed</span>
                            <p className="text-gray-900 dark:text-white font-medium">
                              {new Date(issue.closedAt).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Archive Confirmation Dialog */}
                <AnimatePresence>
                  {showArchiveConfirm && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center z-10"
                    >
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 m-4 max-w-md shadow-xl"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {language === 'fr' ? 'Archiver l\'issue?' : 'Archive Issue?'}
                            </h3>
                            <p className="text-sm text-gray-500">
                              #{issue.issueNumber} - {issue.title.slice(0, 40)}...
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                          {language === 'fr'
                            ? 'Cette action fermera l\'issue et ajoutera un label "archived". L\'issue restera visible sur GitHub mais ne peut pas être supprimée.'
                            : 'This will close the issue and add an "archived" label. The issue will remain visible on GitHub but cannot be deleted.'}
                        </p>
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => setShowArchiveConfirm(false)}
                            disabled={archiving}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            {language === 'fr' ? 'Annuler' : 'Cancel'}
                          </button>
                          <button
                            onClick={handleArchive}
                            disabled={archiving}
                            className={cn(
                              "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors",
                              archiving && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            {archiving ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                            {language === 'fr' ? 'Archiver' : 'Archive'}
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Footer with actions */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Github className="w-4 h-4" />
                    <span>sqordia/{issue.repository}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditMode ? (
                      <>
                        {/* Cancel Edit */}
                        <button
                          onClick={() => {
                            setIsEditMode(false);
                            setEditTitle(issue.title);
                            setEditBody(issue.body);
                          }}
                          disabled={updating}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          {language === 'fr' ? 'Annuler' : 'Cancel'}
                        </button>
                        {/* Save */}
                        <button
                          onClick={handleSaveEdit}
                          disabled={updating}
                          className={cn(
                            "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-momentum-orange text-white rounded-lg hover:bg-momentum-orange/90 transition-colors",
                            updating && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {updating ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          {language === 'fr' ? 'Enregistrer' : 'Save'}
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Archive */}
                        <button
                          onClick={() => setShowArchiveConfirm(true)}
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title={language === 'fr' ? 'Archiver' : 'Archive'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() => setIsEditMode(true)}
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title={language === 'fr' ? 'Modifier' : 'Edit'}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {/* Toggle State */}
                        <button
                          onClick={handleToggleState}
                          disabled={updating}
                          className={cn(
                            "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                            isOpen_
                              ? "bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50"
                              : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50",
                            updating && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {updating ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : isOpen_ ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                          {isOpen_
                            ? (language === 'fr' ? 'Fermer l\'issue' : 'Close Issue')
                            : (language === 'fr' ? 'Rouvrir l\'issue' : 'Reopen Issue')}
                        </button>
                        {/* GitHub Link */}
                        <a
                          href={issue.htmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {language === 'fr' ? 'GitHub' : 'GitHub'}
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <AlertCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500">{language === 'fr' ? 'Issue non trouvée' : 'Issue not found'}</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminIssueTrackerPage() {
  const { language } = useTheme();

  // Issues state
  const [issues, setIssues] = useState<GitHubIssueListItem[]>([]);
  const [stats, setStats] = useState<GitHubIssueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<IssueState>('open');
  const [repoFilter, setRepoFilter] = useState<'all' | 'frontend' | 'backend'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // UI state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Issue detail state
  const [selectedIssue, setSelectedIssue] = useState<GitHubIssueDetailResponse | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch issues
  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: ListIssuesParams = {
        state: statusFilter,
        repository: repoFilter,
        search: searchQuery || undefined,
        label: priorityFilter !== 'all' ? `priority: ${priorityFilter}` : undefined,
        pageSize: 50,
      };
      const response = await gitHubIssueService.listIssues(params);
      setIssues(response.issues);
    } catch (err: any) {
      setError(err.message || 'Failed to load issues');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, repoFilter, searchQuery, priorityFilter]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await gitHubIssueService.getStats();
      setStats(response);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
    fetchStats();
  }, [fetchIssues, fetchStats]);

  const handleIssueCreated = (issue: GitHubIssueResponse) => {
    setIsCreateOpen(false);
    setSuccessMessage(`Issue #${issue.issueNumber} created successfully!`);
    setTimeout(() => setSuccessMessage(null), 5000);
    fetchIssues();
    fetchStats();
  };

  // Open issue detail in-app
  const openIssueDetail = async (issue: GitHubIssueListItem) => {
    setIsDetailOpen(true);
    setDetailLoading(true);
    setSelectedIssue(null);

    try {
      const detail = await gitHubIssueService.getIssue(issue.repository, issue.issueNumber);
      setSelectedIssue(detail);
    } catch (err) {
      console.error('Failed to fetch issue details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailPanel = () => {
    setIsDetailOpen(false);
    setSelectedIssue(null);
  };

  const handleStatusChange = (updatedIssue: GitHubIssueDetailResponse) => {
    setSelectedIssue(updatedIssue);
    // Refresh the issue list and stats
    fetchIssues();
    fetchStats();
  };

  const handleArchive = (_repository: string, _issueNumber: number) => {
    // Close the detail panel
    closeDetailPanel();
    // Refresh the issue list and stats
    fetchIssues();
    fetchStats();
  };

  const filteredIssues = useMemo(() => {
    return issues;
  }, [issues]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === 'fr' ? 'Gestion des Issues' : 'Issue Tracker'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {language === 'fr'
              ? 'Gérer les rapports de bugs et demandes de fonctionnalités'
              : 'Manage bug reports and feature requests'}
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-momentum-orange text-white rounded-xl hover:bg-momentum-orange/90 transition-colors font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {language === 'fr' ? 'Nouvelle Issue' : 'New Issue'}
        </button>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
          >
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <span className="text-sm text-emerald-700 dark:text-emerald-300">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Circle className="w-5 h-5 text-emerald-600 fill-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOpen}</p>
                <p className="text-xs text-gray-500">{language === 'fr' ? 'Ouvertes' : 'Open'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalClosed}</p>
                <p className="text-xs text-gray-500">{language === 'fr' ? 'Fermées' : 'Closed'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.criticalCount}</p>
                <p className="text-xs text-gray-500">Critical</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.highCount}</p>
                <p className="text-xs text-gray-500">High Priority</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Status Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['open', 'closed', 'all'] as IssueState[]).map(state => (
              <button
                key={state}
                onClick={() => setStatusFilter(state)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-all capitalize",
                  statusFilter === state
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                )}
              >
                {state === 'all' ? (language === 'fr' ? 'Toutes' : 'All') : state}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={language === 'fr' ? 'Rechercher...' : 'Search issues...'}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-momentum-orange/20 focus:border-momentum-orange transition-all outline-none"
            />
          </div>

          {/* Repository Filter */}
          <select
            value={repoFilter}
            onChange={e => setRepoFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-momentum-orange/20 focus:border-momentum-orange outline-none"
          >
            <option value="all">{language === 'fr' ? 'Tous les repos' : 'All Repos'}</option>
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-momentum-orange/20 focus:border-momentum-orange outline-none"
          >
            <option value="all">{language === 'fr' ? 'Toutes priorités' : 'All Priorities'}</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Refresh */}
          <button
            onClick={() => { fetchIssues(); fetchStats(); }}
            disabled={loading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <RefreshCw className={cn("w-5 h-5 text-gray-500", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Issues List */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 text-momentum-orange animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <button
              onClick={fetchIssues}
              className="mt-4 text-momentum-orange hover:underline text-sm font-medium"
            >
              Try again
            </button>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Github className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {language === 'fr' ? 'Aucune issue trouvée' : 'No issues found'}
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-4 text-momentum-orange hover:underline text-sm font-medium"
            >
              {language === 'fr' ? 'Créer la première' : 'Create the first one'}
            </button>
          </div>
        ) : (
          <div>
            {filteredIssues.map(issue => (
              <IssueRow
                key={`${issue.repository}-${issue.issueNumber}`}
                issue={issue}
                onClick={() => openIssueDetail(issue)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Issue count */}
      {!loading && !error && filteredIssues.length > 0 && (
        <p className="text-sm text-gray-500 text-center">
          {language === 'fr'
            ? `${filteredIssues.length} issue(s) affichée(s)`
            : `Showing ${filteredIssues.length} issue(s)`}
        </p>
      )}

      {/* Create Issue Slide-Over */}
      <CreateIssueSlideOver
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleIssueCreated}
        language={language}
      />

      {/* Issue Detail Slide-Over */}
      <IssueDetailSlideOver
        isOpen={isDetailOpen}
        onClose={closeDetailPanel}
        issue={selectedIssue}
        loading={detailLoading}
        language={language}
        onStatusChange={handleStatusChange}
        onArchive={handleArchive}
      />
    </div>
  );
}
