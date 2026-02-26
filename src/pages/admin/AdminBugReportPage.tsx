import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { gitHubIssueService } from '../../lib/github-issue-service';
import {
  CreateGitHubIssueRequest,
  GitHubIssueResponse,
  SystemInfo,
  IssueSeverity,
  IssueCategory,
  TargetRepository,
} from '../../lib/github-issue-types';
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
  ArrowLeft,
  Image,
} from 'lucide-react';

interface UploadedScreenshot {
  file: File;
  url: string;
  preview: string;
}

export default function AdminBugReportPage() {
  const navigate = useNavigate();
  const { t } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Translated options
  const SEVERITY_OPTIONS = [
    { value: 'Low' as IssueSeverity, label: t('admin.bugReport.severity.low'), description: 'Minor issue with easy workaround' },
    { value: 'Medium' as IssueSeverity, label: t('admin.bugReport.severity.medium'), description: 'Affects functionality but has workaround' },
    { value: 'High' as IssueSeverity, label: t('admin.bugReport.severity.high'), description: 'Significant impact on functionality' },
    { value: 'Critical' as IssueSeverity, label: t('admin.bugReport.severity.critical'), description: 'System is unusable or data loss' },
  ];

  const CATEGORY_OPTIONS = [
    { value: 'Bug' as IssueCategory, label: t('admin.bugReport.category.bug') },
    { value: 'Feature' as IssueCategory, label: t('admin.bugReport.category.feature') },
    { value: 'Enhancement' as IssueCategory, label: t('admin.bugReport.category.enhancement') },
    { value: 'Documentation' as IssueCategory, label: t('admin.bugReport.category.documentation') },
    { value: 'Performance' as IssueCategory, label: t('admin.bugReport.category.performance') },
  ];

  const REPOSITORY_OPTIONS = [
    { value: 'frontend' as TargetRepository, label: t('admin.bugReport.frontend'), description: t('admin.bugReport.frontendDesc') },
    { value: 'backend' as TargetRepository, label: t('admin.bugReport.backend'), description: t('admin.bugReport.backendDesc') },
  ];

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<IssueSeverity>('Medium');
  const [category, setCategory] = useState<IssueCategory>('Bug');
  const [repository, setRepository] = useState<TargetRepository>('frontend');
  const [reproductionSteps, setReproductionSteps] = useState('');
  const [screenshots, setScreenshots] = useState<UploadedScreenshot[]>([]);

  // System info (auto-captured)
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<GitHubIssueResponse | null>(null);

  // Capture system info on mount
  useEffect(() => {
    const info = gitHubIssueService.getSystemInfo();
    setSystemInfo(info);
  }, []);

  // Handle file upload
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const newScreenshots: UploadedScreenshot[] = [];

      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`File "${file.name}" is not an image`);
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File "${file.name}" exceeds 10MB limit`);
        }

        // Create preview
        const preview = URL.createObjectURL(file);

        // Try to upload to server, but don't block if it fails
        let url = '';
        try {
          url = await gitHubIssueService.uploadScreenshot(file);
        } catch (uploadErr: any) {
          // Upload failed - continue with local preview only
          console.warn('Screenshot upload failed, using local preview only:', uploadErr.message);
          // Use empty URL - screenshot won't be included in the issue but user can still see preview
        }

        newScreenshots.push({ file, url, preview });
      }

      setScreenshots(prev => [...prev, ...newScreenshots]);

      // Warn user if any uploads failed
      const failedUploads = newScreenshots.filter(s => !s.url);
      if (failedUploads.length > 0) {
        setError(`${failedUploads.length} screenshot(s) couldn't be uploaded to the server. They will be shown locally but won't be attached to the GitHub issue.`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process screenshot');
    } finally {
      setUploading(false);
    }
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Remove screenshot
  const removeScreenshot = useCallback((index: number) => {
    setScreenshots(prev => {
      const newScreenshots = [...prev];
      URL.revokeObjectURL(newScreenshots[index].preview);
      newScreenshots.splice(index, 1);
      return newScreenshots;
    });
  }, []);

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Only include screenshots that were successfully uploaded (have a URL)
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

  // Reset form
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

  // Get icon for category
  const getCategoryIcon = (cat: IssueCategory) => {
    switch (cat) {
      case 'Bug': return <Bug className="w-4 h-4" />;
      case 'Feature': return <Lightbulb className="w-4 h-4" />;
      case 'Enhancement': return <Sparkles className="w-4 h-4" />;
      case 'Documentation': return <FileText className="w-4 h-4" />;
      case 'Performance': return <Zap className="w-4 h-4" />;
    }
  };

  // Get severity color
  const getSeverityColor = (sev: IssueSeverity) => {
    switch (sev) {
      case 'Low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'High': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'Critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    }
  };

  // Success view
  if (success) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('admin.bugReport.title')}</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">{t('admin.bugReport.subtitle')}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('admin.bugReport.successTitle')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('admin.bugReport.successMessage').replace('{issueNumber}', String(success.issueNumber)).replace('{repository}', success.repository)}
            </p>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-start gap-3">
                <Bug className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{success.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('admin.bugReport.created')} {new Date(success.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <a
                href={success.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                {t('admin.bugReport.viewOnGitHub')}
              </a>
              <button
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {t('admin.bugReport.reportAnother')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin')}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('admin.bugReport.title')}</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">{t('admin.bugReport.subtitle')}</p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-red-800 dark:text-red-300">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Repository Selection */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('admin.bugReport.targetRepository')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REPOSITORY_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRepository(option.value)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  repository === option.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="font-semibold text-gray-900 dark:text-white">{option.label}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Issue Details */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('admin.bugReport.issueDetails')}</h2>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('admin.bugReport.titleLabel')} <span className="text-red-500">{t('admin.bugReport.required')}</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={t('admin.bugReport.titlePlaceholder')}
              required
              minLength={5}
              maxLength={256}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{title.length}/256 {t('admin.bugReport.titleCharacters')}</p>
          </div>

          {/* Category & Severity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('admin.bugReport.category')} <span className="text-red-500">{t('admin.bugReport.required')}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setCategory(option.value)}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                      category === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {getCategoryIcon(option.value)}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('admin.bugReport.severity')} <span className="text-red-500">{t('admin.bugReport.required')}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {SEVERITY_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSeverity(option.value)}
                    title={option.description}
                    className={`px-3 py-2 rounded-lg border transition-all ${
                      severity === option.value
                        ? `border-transparent ${getSeverityColor(option.value)}`
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('admin.bugReport.description')} <span className="text-red-500">{t('admin.bugReport.required')}</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t('admin.bugReport.descriptionPlaceholder')}
              required
              minLength={20}
              maxLength={10000}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description.length}/10000 {t('admin.bugReport.titleCharacters')}</p>
          </div>

          {/* Reproduction Steps (shown for Bug category) */}
          {category === 'Bug' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('admin.bugReport.stepsToReproduce')}
              </label>
              <textarea
                value={reproductionSteps}
                onChange={e => setReproductionSteps(e.target.value)}
                placeholder={t('admin.bugReport.stepsPlaceholder')}
                maxLength={5000}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              />
            </div>
          )}
        </div>

        {/* Screenshots */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('admin.bugReport.screenshots')}</h2>

          {/* Upload area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={e => handleFileSelect(e.target.files)}
              className="hidden"
            />
            <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {t('admin.bugReport.dragDropImages')}{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {t('admin.bugReport.browse')}
              </button>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {t('admin.bugReport.imageFormats')}
            </p>
          </div>

          {/* Uploading indicator */}
          {uploading && (
            <div className="flex items-center gap-3 mt-4 text-gray-600 dark:text-gray-400">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              {t('admin.bugReport.uploading')}
            </div>
          )}

          {/* Screenshot previews */}
          {screenshots.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {screenshots.map((screenshot, index) => (
                <div key={index} className="relative group">
                  <img
                    src={screenshot.preview}
                    alt={`Screenshot ${index + 1}`}
                    className={`w-full h-24 object-cover rounded-lg border ${
                      screenshot.url
                        ? 'border-gray-200 dark:border-gray-700'
                        : 'border-amber-400 dark:border-amber-500'
                    }`}
                  />
                  {/* Show warning icon for local-only screenshots */}
                  {!screenshot.url && (
                    <div className="absolute bottom-1 left-1 p-1 bg-amber-500 text-white rounded-full" title="Local only - won't be attached to issue">
                      <AlertCircle className="w-3 h-3" />
                    </div>
                  )}
                  {/* Show success icon for uploaded screenshots */}
                  {screenshot.url && (
                    <div className="absolute bottom-1 left-1 p-1 bg-green-500 text-white rounded-full" title="Uploaded successfully">
                      <CheckCircle className="w-3 h-3" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeScreenshot(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Information */}
        {systemInfo && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('admin.bugReport.systemInfo')}</h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('admin.bugReport.autoCaptured')}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.bugReport.browser')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{systemInfo.browser}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.bugReport.operatingSystem')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{systemInfo.operatingSystem}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.bugReport.screenSize')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{systemInfo.screenSize}</p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.bugReport.currentPage')}</p>
                <p className="font-medium text-gray-900 dark:text-white truncate" title={systemInfo.currentPageUrl}>
                  {systemInfo.currentPageUrl}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4">
          {/* Show validation hints when button would be disabled */}
          {(!title || title.length < 5 || !description || description.length < 20) && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {!title || title.length < 5 ? 'Title required (min 5 chars)' : ''}
              {(!title || title.length < 5) && (!description || description.length < 20) ? ' • ' : ''}
              {!description || description.length < 20 ? 'Description required (min 20 chars)' : ''}
            </p>
          )}
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {t('admin.bugReport.cancel')}
          </button>
          <button
            type="submit"
            disabled={submitting || !title || !description || title.length < 5 || description.length < 20}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {t('admin.bugReport.creatingIssue')}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {t('admin.bugReport.createIssue')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
