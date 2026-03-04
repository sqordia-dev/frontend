import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Bug, Upload, FileText, Info, Loader2, Send, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { bugReportService } from '@/lib/bug-report-service';
import {
  BugReportSeverity,
  CreateBugReportRequest,
  PAGE_SECTION_OPTIONS,
  SEVERITY_OPTIONS,
} from '@/lib/bug-report-types';

export default function BugReportPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [pageSection, setPageSection] = useState('');
  const [severity, setSeverity] = useState<BugReportSeverity>('Low');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [ticketNumber, setTicketNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdBugReportId, setCreatedBugReportId] = useState<string | null>(null);

  // System info (auto-detected)
  const systemInfo = bugReportService.getSystemInfo();

  // Fetch next ticket number on mount
  useEffect(() => {
    const fetchTicketNumber = async () => {
      try {
        const ticket = await bugReportService.getNextTicketNumber();
        setTicketNumber(ticket);
      } catch {
        setTicketNumber('BUG-XXXX');
      }
    };
    fetchTicketNumber();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const isValidType = ['image/png', 'image/jpeg', 'video/mp4'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10 MB
      return isValidType && isValidSize;
    });
    setAttachments((prev) => [...prev, ...validFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const request: CreateBugReportRequest = {
        title,
        pageSection,
        severity,
        description,
        appVersion: systemInfo.appVersion,
        browser: systemInfo.browser,
        operatingSystem: systemInfo.operatingSystem,
      };

      const bugReport = await bugReportService.createBugReport(request);

      // Upload attachments
      for (const file of attachments) {
        await bugReportService.addAttachment(bugReport.id, file);
      }

      setCreatedBugReportId(bugReport.id);
      setSuccess(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit bug report';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportPdf = async () => {
    if (!createdBugReportId) return;
    try {
      await bugReportService.downloadPdf(createdBugReportId, ticketNumber);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download PDF';
      setError(errorMessage);
    }
  };

  const handleExportWord = async () => {
    if (!createdBugReportId) return;
    try {
      await bugReportService.downloadWord(createdBugReportId, ticketNumber);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download Word document';
      setError(errorMessage);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-900">
        <div className="max-w-4xl mx-auto py-12 px-6">
          <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <Bug className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Bug Report Submitted
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Your bug report has been submitted successfully.
            </p>
            <p className="text-lg font-semibold text-orange-600 dark:text-orange-400 mb-6">
              Ticket: {ticketNumber}
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <Button
                variant="outline"
                onClick={handleExportPdf}
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                Export as PDF
              </Button>
              <Button
                variant="outline"
                onClick={handleExportWord}
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                Export as Word
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-orange-600 hover:bg-orange-700 gap-2"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-900">
      {/* Header */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-orange-600 p-1.5 rounded-lg">
            <Bug className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            Sqordia <span className="text-orange-600">CMS</span>
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <X className="w-5 h-5" />
        </Button>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-12 px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Report a Bug</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Found an issue? Let us know so we can fix it.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-8 space-y-8">
              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Title & Section Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Issue Title
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Image not loading on landing page"
                    required
                    className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Page / Section
                  </Label>
                  <Select value={pageSection} onValueChange={setPageSection} required>
                    <SelectTrigger className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="Select a location..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SECTION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Severity Selector */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Severity Level
                </Label>
                <div className="flex flex-wrap gap-3">
                  {SEVERITY_OPTIONS.map((option) => (
                    <label key={option.value} className="flex-1 min-w-[100px] cursor-pointer group">
                      <input
                        type="radio"
                        name="severity"
                        value={option.value}
                        checked={severity === option.value}
                        onChange={() => setSeverity(option.value as BugReportSeverity)}
                        className="hidden peer"
                      />
                      <div
                        className={cn(
                          'px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-zinc-900 transition-all text-center',
                          severity === option.value && option.color === 'blue' && 'bg-blue-50 border-blue-500 dark:bg-blue-900/20 dark:border-blue-400',
                          severity === option.value && option.color === 'yellow' && 'bg-yellow-50 border-yellow-500 dark:bg-yellow-900/20 dark:border-yellow-400',
                          severity === option.value && option.color === 'orange' && 'bg-orange-50 border-orange-500 dark:bg-orange-900/20 dark:border-orange-400',
                          severity === option.value && option.color === 'red' && 'bg-red-50 border-red-500 dark:bg-red-900/20 dark:border-red-400'
                        )}
                      >
                        <div
                          className={cn(
                            'w-2 h-2 rounded-full mx-auto mb-1',
                            option.color === 'blue' && 'bg-blue-400',
                            option.color === 'yellow' && 'bg-yellow-400',
                            option.color === 'orange' && 'bg-orange-500',
                            option.color === 'red' && 'bg-red-500'
                          )}
                        />
                        <span
                          className={cn(
                            'text-sm font-medium',
                            option.color === 'red' && 'text-red-700 dark:text-red-400'
                          )}
                        >
                          {option.label}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rich Text Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Detailed Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={`Steps to reproduce:\n1. Navigate to...\n2. Click on...\n3. Observe that...`}
                  rows={6}
                  required
                  className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-700 resize-none"
                />
              </div>

              {/* File Attachment */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Attachments
                </Label>
                <div
                  className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:border-orange-500/50 transition-colors bg-slate-50 dark:bg-zinc-900/50 group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,video/mp4"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/10 text-orange-600 mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG or MP4 up to 10MB</p>
                </div>

                {/* Attachment List */}
                {attachments.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-100 dark:bg-zinc-800 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-500" />
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            {file.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            ({formatFileSize(file.size)})
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAttachment(index)}
                          className="h-8 w-8 text-slate-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Auto-captured Info */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="bg-slate-50 dark:bg-zinc-900/50 rounded-lg p-4 flex flex-wrap gap-8 items-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    System Information
                  </span>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <span>Version: <span className="font-semibold">{systemInfo.appVersion}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <span>Browser: <span className="font-semibold">{systemInfo.browser}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <span>OS: <span className="font-semibold">{systemInfo.operatingSystem}</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-8 py-5 bg-slate-50 dark:bg-zinc-900/80 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !title || !pageSection || !description}
                className="bg-orange-600 hover:bg-orange-700 gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Bug Report
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-8 flex items-center justify-between text-slate-500 dark:text-slate-400 px-2">
          <div className="flex items-center gap-2 text-sm">
            <Info className="w-4 h-4" />
            <span>
              Need immediate assistance?{' '}
              <a href="#" className="text-orange-600 hover:underline font-medium">
                Contact support
              </a>
            </span>
          </div>
          <div className="text-xs">
            Ticket #{ticketNumber} will be created
          </div>
        </div>
      </main>
    </div>
  );
}
