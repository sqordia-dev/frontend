import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { gitHubIssueService } from '../../lib/github-issue-service';
import {
  CreateGitHubIssueRequest,
  GitHubIssueResponse,
  SystemInfo,
  IssueSeverity,
  IssueCategory,
  TargetRepository,
} from '../../lib/github-issue-types';
import { RichTextEditor } from '../../components/editor/RichTextEditor';
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
} from 'lucide-react';

interface UploadedScreenshot {
  file: File;
  url: string;
  preview: string;
}

export default function AdminBugReportPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Options
  const SEVERITY_OPTIONS = [
    { value: 'Low' as IssueSeverity, label: 'Low', color: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200' },
    { value: 'Medium' as IssueSeverity, label: 'Medium', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
    { value: 'High' as IssueSeverity, label: 'High', color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' },
    { value: 'Critical' as IssueSeverity, label: 'Critical', color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' },
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

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<IssueSeverity>('Medium');
  const [category, setCategory] = useState<IssueCategory>('Bug');
  const [repository, setRepository] = useState<TargetRepository>('frontend');
  const [reproductionSteps, setReproductionSteps] = useState('');
  const [screenshots, setScreenshots] = useState<UploadedScreenshot[]>([]);
  const [showSystemInfo, setShowSystemInfo] = useState(false);

  // System info
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<GitHubIssueResponse | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const info = gitHubIssueService.getSystemInfo();
    setSystemInfo(info);
  }, []);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const newScreenshots: UploadedScreenshot[] = [];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          throw new Error(`File "${file.name}" is not an image`);
        }
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File "${file.name}" exceeds 10MB limit`);
        }

        const preview = URL.createObjectURL(file);
        let url = '';
        try {
          url = await gitHubIssueService.uploadScreenshot(file);
        } catch (uploadErr: any) {
          console.warn('Screenshot upload failed:', uploadErr.message);
        }

        newScreenshots.push({ file, url, preview });
      }

      setScreenshots(prev => [...prev, ...newScreenshots]);

      const failedUploads = newScreenshots.filter(s => !s.url);
      if (failedUploads.length > 0) {
        setError(`${failedUploads.length} screenshot(s) won't be attached to the GitHub issue.`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process screenshot');
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
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
      const uploadedScreenshotUrls = screenshots.map(s => s.url).filter(url => url);

      const request: CreateGitHubIssueRequest = {
        title,
        description,
        severity,
        category,
        repository,
        reproductionSteps: reproductionSteps || undefined,
        browser: systemInfo?.browser,
        operatingSystem: systemInfo?.operatingSystem,
        screenSize: systemInfo?.screenSize,
        currentPageUrl: systemInfo?.currentPageUrl,
        screenshotUrls: uploadedScreenshotUrls.length > 0 ? uploadedScreenshotUrls : undefined,
      };

      const response = await gitHubIssueService.createIssue(request);
      setSuccess(response);
    } catch (err: any) {
      setError(err.message || 'Failed to create GitHub issue');
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
    setSuccess(null);
    setError(null);
  };

  // Strip HTML tags for character count validation
  const getPlainTextLength = (html: string) => html.replace(/<[^>]*>/g, '').length;
  const isFormValid = title.length >= 5 && getPlainTextLength(description) >= 20;

  // Success view
  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Issue Created!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Issue #{success.issueNumber} has been created in the {success.repository} repository.
          </p>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-start gap-3">
              <Github className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">{success.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Created {new Date(success.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <a
              href={success.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d4a6f] transition-colors font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              View on GitHub
            </a>
            <button
              onClick={resetForm}
              className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
            >
              Report Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Error Banner */}
      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300 flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Row: Repository & Category */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Repository */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Target Repository
            </label>
            <div className="grid grid-cols-2 gap-3">
              {REPOSITORY_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const isSelected = repository === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRepository(opt.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-[#FF6B00] bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-[#FF6B00]' : 'text-gray-400'}`} />
                    <div className={`font-semibold ${isSelected ? 'text-[#FF6B00]' : 'text-gray-900 dark:text-white'}`}>
                      {opt.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category & Severity */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
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
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                        isSelected
                          ? 'border-[#FF6B00] bg-orange-50 dark:bg-orange-900/20 text-[#FF6B00]'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-[#FF6B00]' : opt.color}`} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Severity
              </label>
              <div className="flex flex-wrap gap-2">
                {SEVERITY_OPTIONS.map(opt => {
                  const isSelected = severity === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSeverity(opt.value)}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                        isSelected
                          ? opt.color + ' border-current'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Brief summary of the issue..."
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all outline-none"
            />
            <div className="flex justify-between mt-1.5">
              <p className="text-xs text-gray-400">Min 5 characters</p>
              <p className={`text-xs ${title.length >= 5 ? 'text-green-500' : 'text-gray-400'}`}>
                {title.length}/256
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              content={description}
              onChange={setDescription}
              placeholder="Describe the issue in detail. What happened? What did you expect?"
              className="rounded-xl overflow-hidden [&_.prose-editor]:min-h-[150px] [&_.prose-editor]:max-h-[300px] [&_.prose-editor]:overflow-y-auto border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-[#FF6B00]/20 focus-within:border-[#FF6B00]"
            />
            <div className="flex justify-between mt-1.5">
              <p className="text-xs text-gray-400">Min 20 characters (plain text)</p>
              <p className={`text-xs ${getPlainTextLength(description) >= 20 ? 'text-green-500' : 'text-gray-400'}`}>
                {getPlainTextLength(description)}/10000
              </p>
            </div>
          </div>

          {/* Reproduction Steps (for Bug category) */}
          {category === 'Bug' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Steps to Reproduce <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <RichTextEditor
                content={reproductionSteps}
                onChange={setReproductionSteps}
                placeholder="1. Go to...  2. Click on...  3. See error"
                className="rounded-xl overflow-hidden [&_.prose-editor]:min-h-[100px] [&_.prose-editor]:max-h-[200px] [&_.prose-editor]:overflow-y-auto border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-[#FF6B00]/20 focus-within:border-[#FF6B00]"
              />
            </div>
          )}
        </div>

        {/* Screenshots */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Screenshots <span className="text-gray-400 font-normal">(optional)</span>
          </label>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
              dragActive
                ? 'border-[#FF6B00] bg-orange-50 dark:bg-orange-900/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={e => handleFileSelect(e.target.files)}
              className="hidden"
            />

            <Upload className={`w-8 h-8 mx-auto mb-3 ${dragActive ? 'text-[#FF6B00]' : 'text-gray-400'}`} />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Drag and drop images here, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[#FF6B00] hover:underline font-medium"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
          </div>

          {/* Uploading */}
          {uploading && (
            <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#FF6B00] border-t-transparent"></div>
              Uploading...
            </div>
          )}

          {/* Screenshot previews */}
          {screenshots.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {screenshots.map((screenshot, index) => (
                <div key={index} className="relative group">
                  <img
                    src={screenshot.preview}
                    alt={`Screenshot ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                  {screenshot.url ? (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center" title="Won't be attached">
                      <AlertCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeScreenshot(index)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* System Info (Collapsible) */}
        {systemInfo && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSystemInfo(!showSystemInfo)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">System Information</span>
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">Auto-captured</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showSystemInfo ? 'rotate-180' : ''}`} />
            </button>

            {showSystemInfo && (
              <div className="px-5 pb-5 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Browser</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{systemInfo.browser}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">OS</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{systemInfo.operatingSystem}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Screen</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{systemInfo.screenSize}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Page</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={systemInfo.currentPageUrl}>
                    {systemInfo.currentPageUrl.replace(/^https?:\/\/[^/]+/, '')}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="text-sm text-gray-500">
            {!isFormValid && (
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {title.length < 5 && getPlainTextLength(description) < 20
                  ? 'Title and description required'
                  : title.length < 5
                  ? 'Title too short (min 5 chars)'
                  : 'Description too short (min 20 chars)'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !isFormValid}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FF6B00] text-white rounded-lg hover:bg-[#e55f00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
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
      </form>
    </div>
  );
}
