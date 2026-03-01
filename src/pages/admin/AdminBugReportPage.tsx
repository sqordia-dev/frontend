import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  const { language } = useTheme();
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
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {language === 'fr' ? 'Rapport de bug' : 'Bug Report'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {language === 'fr' ? 'Créer des issues GitHub pour le suivi' : 'Create GitHub issues for tracking'}
            </p>
          </div>
        </div>

        {/* Success Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center shadow-sm">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </motion.div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {language === 'fr' ? 'Issue créée!' : 'Issue Created!'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {language === 'fr'
                ? `L'issue #${success.issueNumber} a été créée dans le dépôt ${success.repository}.`
                : `Issue #${success.issueNumber} has been created in the ${success.repository} repository.`}
            </p>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6 text-left border border-gray-100 dark:border-gray-700/50">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gray-900 dark:bg-white">
                  <Github className="w-4 h-4 text-white dark:text-gray-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{success.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {language === 'fr' ? 'Créé le' : 'Created'} {new Date(success.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <a
                href={success.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                {language === 'fr' ? 'Voir sur GitHub' : 'View on GitHub'}
              </a>
              <button
                onClick={resetForm}
                className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                {language === 'fr' ? 'Autre rapport' : 'Report Another'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === 'fr' ? 'Rapport de bug' : 'Bug Report'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {language === 'fr'
              ? 'Signaler un problème ou demander une fonctionnalité'
              : 'Report an issue or request a feature'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === 'fr' ? 'Retour' : 'Back'}
        </button>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Top Row: Repository & Category */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Repository */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              {language === 'fr' ? 'Dépôt cible' : 'Target Repository'}
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
                    className={cn(
                      "p-4 rounded-xl border-2 text-left transition-all",
                      isSelected
                        ? 'border-momentum-orange bg-momentum-orange/5 dark:bg-momentum-orange/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                      isSelected
                        ? 'bg-momentum-orange/10 text-momentum-orange'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className={cn(
                      "font-semibold",
                      isSelected ? 'text-momentum-orange' : 'text-gray-900 dark:text-white'
                    )}>
                      {opt.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category & Severity */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-5 shadow-sm">
            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'fr' ? 'Catégorie' : 'Category'}
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
                        "inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                        isSelected
                          ? 'border-momentum-orange bg-momentum-orange/5 dark:bg-momentum-orange/10 text-momentum-orange'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      )}
                    >
                      <Icon className={cn("w-4 h-4", isSelected ? 'text-momentum-orange' : opt.color)} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'fr' ? 'Sévérité' : 'Severity'}
              </label>
              <div className="flex flex-wrap gap-2">
                {SEVERITY_OPTIONS.map(opt => {
                  const isSelected = severity === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSeverity(opt.value)}
                      className={cn(
                        "px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                        isSelected
                          ? opt.color + ' border-current'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      )}
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
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-5 shadow-sm">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              {language === 'fr' ? 'Titre' : 'Title'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={language === 'fr' ? 'Résumé bref du problème...' : 'Brief summary of the issue...'}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-momentum-orange/20 focus:border-momentum-orange transition-all outline-none"
            />
            <div className="flex justify-between mt-1.5">
              <p className="text-xs text-gray-400">
                {language === 'fr' ? 'Min 5 caractères' : 'Min 5 characters'}
              </p>
              <p className={cn("text-xs", title.length >= 5 ? 'text-emerald-500' : 'text-gray-400')}>
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
              placeholder={language === 'fr'
                ? 'Décrivez le problème en détail. Que s\'est-il passé? Que devrait-il se passer?'
                : 'Describe the issue in detail. What happened? What did you expect?'}
              className="rounded-xl overflow-hidden [&_.prose-editor]:min-h-[150px] [&_.prose-editor]:max-h-[300px] [&_.prose-editor]:overflow-y-auto border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-momentum-orange/20 focus-within:border-momentum-orange"
            />
            <div className="flex justify-between mt-1.5">
              <p className="text-xs text-gray-400">
                {language === 'fr' ? 'Min 20 caractères (texte brut)' : 'Min 20 characters (plain text)'}
              </p>
              <p className={cn("text-xs", getPlainTextLength(description) >= 20 ? 'text-emerald-500' : 'text-gray-400')}>
                {getPlainTextLength(description)}/10000
              </p>
            </div>
          </div>

          {/* Reproduction Steps (for Bug category) */}
          <AnimatePresence>
            {category === 'Bug' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {language === 'fr' ? 'Étapes pour reproduire' : 'Steps to Reproduce'}{' '}
                  <span className="text-gray-400 font-normal">
                    ({language === 'fr' ? 'optionnel' : 'optional'})
                  </span>
                </label>
                <RichTextEditor
                  content={reproductionSteps}
                  onChange={setReproductionSteps}
                  placeholder={language === 'fr'
                    ? '1. Aller à...  2. Cliquer sur...  3. Voir l\'erreur'
                    : '1. Go to...  2. Click on...  3. See error'}
                  className="rounded-xl overflow-hidden [&_.prose-editor]:min-h-[100px] [&_.prose-editor]:max-h-[200px] [&_.prose-editor]:overflow-y-auto border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-momentum-orange/20 focus-within:border-momentum-orange"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Screenshots */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Image className="w-4 h-4 text-gray-400" />
            <label className="text-sm font-semibold text-gray-900 dark:text-white">
              {language === 'fr' ? 'Captures d\'écran' : 'Screenshots'}{' '}
              <span className="text-gray-400 font-normal">
                ({language === 'fr' ? 'optionnel' : 'optional'})
              </span>
            </label>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              "relative border-2 border-dashed rounded-xl p-8 text-center transition-all",
              dragActive
                ? 'border-momentum-orange bg-momentum-orange/5 dark:bg-momentum-orange/10'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={e => handleFileSelect(e.target.files)}
              className="hidden"
            />

            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3",
              dragActive
                ? 'bg-momentum-orange/10 text-momentum-orange'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
            )}>
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'fr' ? 'Glissez-déposez des images ici, ou' : 'Drag and drop images here, or'}{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-momentum-orange hover:underline font-medium"
              >
                {language === 'fr' ? 'parcourir' : 'browse'}
              </button>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {language === 'fr' ? 'PNG, JPG, GIF jusqu\'à 10Mo' : 'PNG, JPG, GIF up to 10MB'}
            </p>
          </div>

          {/* Uploading */}
          <AnimatePresence>
            {uploading && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 mt-3 text-sm text-gray-500"
              >
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-momentum-orange border-t-transparent"></div>
                {language === 'fr' ? 'Téléversement...' : 'Uploading...'}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Screenshot previews */}
          <AnimatePresence>
            {screenshots.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-3 mt-4"
              >
                {screenshots.map((screenshot, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group"
                  >
                    <img
                      src={screenshot.preview}
                      alt={`Screenshot ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                    />
                    {screenshot.url ? (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <div
                        className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow-sm"
                        title={language === 'fr' ? 'Ne sera pas attaché' : "Won't be attached"}
                      >
                        <AlertCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeScreenshot(index)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-sm"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center text-gray-400 hover:border-momentum-orange hover:text-momentum-orange transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* System Info (Collapsible) */}
        {systemInfo && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => setShowSystemInfo(!showSystemInfo)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Monitor className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white block">
                    {language === 'fr' ? 'Informations système' : 'System Information'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {language === 'fr' ? 'Capturé automatiquement' : 'Auto-captured'}
                  </span>
                </div>
              </div>
              <ChevronDown className={cn(
                "w-5 h-5 text-gray-400 transition-transform duration-200",
                showSystemInfo && 'rotate-180'
              )} />
            </button>

            <AnimatePresence>
              {showSystemInfo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">
                        {language === 'fr' ? 'Navigateur' : 'Browser'}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{systemInfo.browser}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">
                        {language === 'fr' ? 'Système' : 'OS'}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{systemInfo.operatingSystem}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">
                        {language === 'fr' ? 'Écran' : 'Screen'}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{systemInfo.screenSize}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Page</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={systemInfo.currentPageUrl}>
                        {systemInfo.currentPageUrl.replace(/^https?:\/\/[^/]+/, '')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Submit */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
          <div className="text-sm text-gray-500">
            <AnimatePresence mode="wait">
              {!isFormValid ? (
                <motion.span
                  key="invalid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-amber-600 dark:text-amber-400"
                >
                  <AlertCircle className="w-4 h-4" />
                  {title.length < 5 && getPlainTextLength(description) < 20
                    ? (language === 'fr' ? 'Titre et description requis' : 'Title and description required')
                    : title.length < 5
                    ? (language === 'fr' ? 'Titre trop court (min 5 car.)' : 'Title too short (min 5 chars)')
                    : (language === 'fr' ? 'Description trop courte (min 20 car.)' : 'Description too short (min 20 chars)')}
                </motion.span>
              ) : (
                <motion.span
                  key="valid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400"
                >
                  <CheckCircle className="w-4 h-4" />
                  {language === 'fr' ? 'Prêt à soumettre' : 'Ready to submit'}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors border border-gray-200 dark:border-gray-700"
            >
              {language === 'fr' ? 'Annuler' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitting || !isFormValid}
              className={cn(
                "flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all",
                "bg-momentum-orange text-white shadow-sm",
                "hover:bg-momentum-orange/90 hover:shadow-md",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              )}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  {language === 'fr' ? 'Création...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {language === 'fr' ? 'Créer l\'issue' : 'Create Issue'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
