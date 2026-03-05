import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, Sparkles, Eye, Search, Mail, Copy,
  MoreHorizontal, Power, Clock, Tag, RefreshCw, FileText,
  Globe, Code, Send, Shield, Bell, CreditCard, Settings, Megaphone,
  BookOpen, Package,
} from 'lucide-react';
import { emailTemplateService, EmailTemplateDto, CreateEmailTemplateRequest, UpdateEmailTemplateRequest } from '../../lib/email-template-service';
import { STARTER_TEMPLATES } from '../../lib/email-starter-templates';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { SqordiaLoader } from '../../components/ui/SqordiaLoader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '../../components/ui/dialog';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from '../../components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from '../../components/ui/dropdown-menu';
import {
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
} from '../../components/ui/tooltip';

const CATEGORIES = ['all', 'auth', 'notification', 'marketing', 'billing', 'system'] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_CONFIG: Record<string, { icon: typeof Mail; color: string; bg: string; label: string }> = {
  auth:         { icon: Shield,     color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-500/10',    label: 'Auth' },
  notification: { icon: Bell,       color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-500/10',   label: 'Notification' },
  marketing:    { icon: Megaphone,  color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10',  label: 'Marketing' },
  billing:      { icon: CreditCard, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', label: 'Billing' },
  system:       { icon: Settings,   color: 'text-gray-600 dark:text-gray-400',    bg: 'bg-gray-500/10',    label: 'System' },
};

function getCategoryConfig(category: string) {
  return CATEGORY_CONFIG[category] || CATEGORY_CONFIG.system;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function AdminEmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editTemplate, setEditTemplate] = useState<EmailTemplateDto | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLang, setPreviewLang] = useState<'en' | 'fr'>('en');
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplateDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EmailTemplateDto | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [creatingSeed, setCreatingSeed] = useState(false);
  const [seedProgress, setSeedProgress] = useState(0);

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await emailTemplateService.getAll();
      setTemplates(data);
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  const filtered = useMemo(() => templates.filter(t => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch = !searchTerm ||
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subjectEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subjectFr.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }), [templates, selectedCategory, searchTerm]);

  const stats = useMemo(() => {
    const total = templates.length;
    const active = templates.filter(t => t.isActive).length;
    const byCategory = Object.fromEntries(
      CATEGORIES.filter(c => c !== 'all').map(c => [c, templates.filter(t => t.category === c).length])
    );
    return { total, active, inactive: total - active, byCategory };
  }, [templates]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await emailTemplateService.delete(deleteTarget.id);
      setTemplates(prev => prev.filter(t => t.id !== deleteTarget.id));
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleToggleActive = async (template: EmailTemplateDto) => {
    setTogglingId(template.id);
    try {
      await emailTemplateService.update(template.id, {
        subjectFr: template.subjectFr,
        subjectEn: template.subjectEn,
        bodyFr: template.bodyFr,
        bodyEn: template.bodyEn,
        isActive: !template.isActive,
      });
      setTemplates(prev => prev.map(t => t.id === template.id ? { ...t, isActive: !t.isActive } : t));
    } catch (err) {
      console.error('Toggle failed:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const handlePreview = async (template: EmailTemplateDto, lang: 'en' | 'fr' = 'en') => {
    try {
      setPreviewTemplate(template);
      setPreviewLang(lang);
      const html = await emailTemplateService.preview(template.id, lang);
      setPreviewHtml(html);
    } catch (err) {
      console.error('Preview failed:', err);
    }
  };

  const handleSave = async (data: CreateEmailTemplateRequest | UpdateEmailTemplateRequest) => {
    setSaving(true);
    try {
      if (editTemplate) {
        await emailTemplateService.update(editTemplate.id, data as UpdateEmailTemplateRequest);
      } else {
        await emailTemplateService.create(data as CreateEmailTemplateRequest);
      }
      setEditTemplate(null);
      setShowCreateDialog(false);
      await loadTemplates();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async (purpose: string, variables: string) => {
    setSaving(true);
    try {
      await emailTemplateService.generate({
        templateName: purpose.replace(/\s+/g, '_').toLowerCase(),
        purpose,
        variables: variables.split(',').map(v => v.trim()).filter(Boolean),
      });
      setShowGenerateDialog(false);
      await loadTemplates();
    } catch (err) {
      console.error('Generate failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateStarterPack = async () => {
    setCreatingSeed(true);
    setSeedProgress(0);
    try {
      const existingNames = new Set(templates.map(t => t.name));
      const toCreate = STARTER_TEMPLATES.filter(t => !existingNames.has(t.name));
      for (let i = 0; i < toCreate.length; i++) {
        await emailTemplateService.create(toCreate[i]);
        setSeedProgress(i + 1);
      }
      await loadTemplates();
    } catch (err) {
      console.error('Failed to create starter templates:', err);
    } finally {
      setCreatingSeed(false);
      setSeedProgress(0);
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-strategy-blue via-[#1e3358] to-[#0f1a2e] p-6 text-white shadow-xl"
        >
          {/* Background pattern */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="email-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#email-grid)" />
            </svg>
          </div>
          {/* Accent glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-momentum-orange/10 blur-3xl" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                <Mail className="h-5 w-5 text-momentum-orange" />
              </div>
              <div>
                <h1 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
                  Email Templates
                </h1>
                <p className="mt-0.5 flex items-center gap-2 text-sm text-white/60">
                  Manage bilingual email templates for your platform
                  <Link
                    to="/admin/email-templates/docs"
                    className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                  >
                    <BookOpen className="h-3 w-3" />
                    Docs
                  </Link>
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="brand-outline"
                size="sm"
                onClick={() => setShowGenerateDialog(true)}
                className="border-white/20 text-white hover:bg-white/10 hover:text-white"
              >
                <Sparkles className="h-4 w-4" />
                AI Generate
              </Button>
              <Button
                variant="brand"
                size="sm"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="h-4 w-4" />
                New Template
              </Button>
            </div>
          </div>

          {/* Stats row */}
          <div className="relative mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Total', value: stats.total, icon: FileText },
              { label: 'Active', value: stats.active, icon: Power },
              { label: 'Inactive', value: stats.inactive, icon: Clock },
              { label: 'Categories', value: Object.values(stats.byCategory).filter(v => v > 0).length, icon: Tag },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="flex items-center gap-3 rounded-xl bg-white/[0.06] px-4 py-3 backdrop-blur-sm"
              >
                <stat.icon className="h-4 w-4 text-white/40" />
                <div>
                  <p className="text-lg font-bold leading-none">{stat.value}</p>
                  <p className="mt-1 text-xs text-white/50">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(cat => {
              const isActive = selectedCategory === cat;
              const config = cat !== 'all' ? getCategoryConfig(cat) : null;
              const count = cat === 'all' ? templates.length : stats.byCategory[cat] || 0;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
                    isActive
                      ? 'bg-momentum-orange text-white shadow-sm shadow-momentum-orange/25'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                  )}
                >
                  {config && <config.icon className="h-3 w-3" />}
                  <span className="capitalize">{cat === 'all' ? 'All' : config?.label}</span>
                  <span className={cn(
                    'ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none',
                    isActive ? 'bg-white/20' : 'bg-background',
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Template list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <SqordiaLoader message="Loading templates..." size="md" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Mail className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="mt-4 font-heading text-lg font-semibold">No templates found</h3>
            <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your filters or search term.'
                : 'Get started with our ready-made starter pack, or create your own.'}
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <Button
                variant="gradient"
                size="default"
                className="mt-5"
                onClick={handleCreateStarterPack}
                disabled={creatingSeed}
              >
                {creatingSeed ? (
                  <><RefreshCw className="h-4 w-4 animate-spin" /> Creating {seedProgress}/{STARTER_TEMPLATES.length}...</>
                ) : (
                  <><Package className="h-4 w-4" /> Create Starter Pack ({STARTER_TEMPLATES.length} templates)</>
                )}
              </Button>
            )}
            <div className={cn('flex gap-2', !searchTerm && selectedCategory === 'all' ? 'mt-3' : 'mt-5')}>
              <Button variant="outline" size="sm" onClick={() => setShowGenerateDialog(true)}>
                <Sparkles className="h-4 w-4" />
                AI Generate
              </Button>
              <Button variant="brand" size="sm" onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4" />
                Create Template
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="grid gap-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((template, idx) => {
                const config = getCategoryConfig(template.category);
                const CatIcon = config.icon;
                return (
                  <motion.div
                    key={template.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.03 }}
                    className={cn(
                      'group relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-200',
                      'hover:border-border/80 hover:shadow-md',
                    )}
                  >
                    {/* Active indicator bar */}
                    <div className={cn(
                      'absolute left-0 top-0 h-full w-1 transition-colors',
                      template.isActive ? 'bg-emerald-500' : 'bg-muted-foreground/20',
                    )} />

                    <div className="flex items-center gap-4 p-4 pl-5">
                      {/* Category icon */}
                      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', config.bg)}>
                        <CatIcon className={cn('h-5 w-5', config.color)} />
                      </div>

                      {/* Template info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-semibold text-foreground">
                            {template.name}
                          </h3>
                          <Badge
                            variant="secondary"
                            className={cn('shrink-0 text-[10px]', config.bg, config.color)}
                          >
                            {config.label}
                          </Badge>
                          {template.isActive ? (
                            <Badge variant="success" className="shrink-0 text-[10px]">Active</Badge>
                          ) : (
                            <Badge variant="secondary" className="shrink-0 text-[10px] opacity-60">Inactive</Badge>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">
                          {template.subjectEn || 'No subject'}
                        </p>
                        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground/70">
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            EN / FR
                          </span>
                          <span className="flex items-center gap-1">
                            <Code className="h-3 w-3" />
                            v{template.version}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(template.lastModified || template.created)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 items-center gap-1.5">
                        {/* Active toggle */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Switch
                                checked={template.isActive}
                                disabled={togglingId === template.id}
                                onCheckedChange={() => handleToggleActive(template)}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>{template.isActive ? 'Deactivate' : 'Activate'}</TooltipContent>
                        </Tooltip>

                        {/* Preview */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handlePreview(template, 'en')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Preview</TooltipContent>
                        </Tooltip>

                        {/* Edit */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setEditTemplate(template)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>

                        {/* More menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handlePreview(template, 'en')}>
                              <Eye className="mr-2 h-4 w-4" /> Preview (EN)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePreview(template, 'fr')}>
                              <Globe className="mr-2 h-4 w-4" /> Preview (FR)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditTemplate(template)}>
                              <Edit2 className="mr-2 h-4 w-4" /> Edit Template
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              navigator.clipboard.writeText(template.id);
                            }}>
                              <Copy className="mr-2 h-4 w-4" /> Copy ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteTarget(template)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Results count */}
        {!loading && filtered.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs text-muted-foreground"
          >
            Showing {filtered.length} of {templates.length} template{templates.length !== 1 ? 's' : ''}
          </motion.p>
        )}

        {/* Create/Edit Dialog */}
        <TemplateEditDialog
          open={showCreateDialog || !!editTemplate}
          template={editTemplate}
          saving={saving}
          onSave={handleSave}
          onClose={() => { setEditTemplate(null); setShowCreateDialog(false); }}
        />

        {/* Generate Dialog */}
        <GenerateDialog
          open={showGenerateDialog}
          saving={saving}
          onGenerate={handleGenerate}
          onClose={() => setShowGenerateDialog(false)}
        />

        {/* Preview Dialog */}
        <PreviewDialog
          open={!!previewHtml}
          html={previewHtml}
          template={previewTemplate}
          language={previewLang}
          onLanguageChange={async (lang) => {
            if (previewTemplate) {
              setPreviewLang(lang);
              try {
                const html = await emailTemplateService.preview(previewTemplate.id, lang);
                setPreviewHtml(html);
              } catch (err) {
                console.error('Preview failed:', err);
              }
            }
          }}
          onClose={() => { setPreviewHtml(null); setPreviewTemplate(null); }}
        />

        {/* Delete confirmation */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete template?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete <span className="font-medium text-foreground">{deleteTarget?.name}</span>.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

/* ─── Template Create / Edit Dialog ───────────────────────────────────── */

function TemplateEditDialog({ open, template, saving, onSave, onClose }: {
  open: boolean;
  template: EmailTemplateDto | null;
  saving: boolean;
  onSave: (data: CreateEmailTemplateRequest | UpdateEmailTemplateRequest) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: '', category: 'notification',
    subjectFr: '', subjectEn: '', bodyFr: '', bodyEn: '', variablesJson: '[]',
  });

  useEffect(() => {
    if (open) {
      setForm({
        name: template?.name || '',
        category: template?.category || 'notification',
        subjectFr: template?.subjectFr || '',
        subjectEn: template?.subjectEn || '',
        bodyFr: template?.bodyFr || '',
        bodyEn: template?.bodyEn || '',
        variablesJson: template?.variablesJson || '[]',
      });
    }
  }, [open, template]);

  const isValid = template
    ? form.subjectEn.trim() && form.bodyEn.trim()
    : form.name.trim() && form.subjectEn.trim() && form.bodyEn.trim();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-momentum-orange/10">
              {template ? <Edit2 className="h-4 w-4 text-momentum-orange" /> : <Plus className="h-4 w-4 text-momentum-orange" />}
            </div>
            {template ? 'Edit Template' : 'New Template'}
          </DialogTitle>
          <DialogDescription>
            {template
              ? 'Update the template content in both languages.'
              : 'Create a new bilingual email template.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Name & Category (only for new) */}
          {!template && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Template Name</label>
                <Input
                  placeholder="e.g., welcome_email"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="flex h-11 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Bilingual content with tabs */}
          <Tabs defaultValue="en">
            <TabsList className="w-full">
              <TabsTrigger value="en" className="flex-1 gap-1.5">
                <span className="text-xs">🇬🇧</span> English
              </TabsTrigger>
              <TabsTrigger value="fr" className="flex-1 gap-1.5">
                <span className="text-xs">🇫🇷</span> French
              </TabsTrigger>
            </TabsList>

            <TabsContent value="en" className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input
                  placeholder="Email subject line..."
                  value={form.subjectEn}
                  onChange={e => setForm(f => ({ ...f, subjectEn: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Body</label>
                <Textarea
                  placeholder="HTML email body content..."
                  value={form.bodyEn}
                  onChange={e => setForm(f => ({ ...f, bodyEn: e.target.value }))}
                  rows={10}
                  className="font-mono text-xs"
                />
              </div>
            </TabsContent>

            <TabsContent value="fr" className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sujet</label>
                <Input
                  placeholder="Ligne de sujet..."
                  value={form.subjectFr}
                  onChange={e => setForm(f => ({ ...f, subjectFr: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Corps</label>
                <Textarea
                  placeholder="Contenu HTML du courriel..."
                  value={form.bodyFr}
                  onChange={e => setForm(f => ({ ...f, bodyFr: e.target.value }))}
                  rows={10}
                  className="font-mono text-xs"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Variables */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Code className="h-3.5 w-3.5 text-muted-foreground" />
              Template Variables (JSON)
            </label>
            <Input
              placeholder='["firstName", "lastName", "actionUrl"]'
              value={form.variablesJson}
              onChange={e => setForm(f => ({ ...f, variablesJson: e.target.value }))}
              className="font-mono text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              JSON array of variable names used in this template.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant="brand"
            onClick={() => onSave(form)}
            disabled={saving || !isValid}
          >
            {saving ? (
              <><RefreshCw className="h-4 w-4 animate-spin" /> Saving...</>
            ) : (
              <><Send className="h-4 w-4" /> {template ? 'Update' : 'Create'}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── AI Generate Dialog ──────────────────────────────────────────────── */

function GenerateDialog({ open, saving, onGenerate, onClose }: {
  open: boolean;
  saving: boolean;
  onGenerate: (purpose: string, variables: string) => void;
  onClose: () => void;
}) {
  const [purpose, setPurpose] = useState('');
  const [variables, setVariables] = useState('firstName, lastName, actionUrl');

  useEffect(() => {
    if (open) {
      setPurpose('');
      setVariables('firstName, lastName, actionUrl');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-momentum-orange/20 to-purple-500/20">
              <Sparkles className="h-4 w-4 text-momentum-orange" />
            </div>
            AI Generate Template
          </DialogTitle>
          <DialogDescription>
            Describe the email purpose and let AI craft a bilingual template for you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Purpose</label>
            <Textarea
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              rows={3}
              placeholder="e.g., Welcome email for new users after registration"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Variables</label>
            <Input
              value={variables}
              onChange={e => setVariables(e.target.value)}
              placeholder="firstName, lastName, actionUrl"
            />
            <p className="text-[11px] text-muted-foreground">
              Comma-separated variable names to include in the template.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant="gradient"
            onClick={() => onGenerate(purpose, variables)}
            disabled={saving || !purpose.trim()}
          >
            {saving ? (
              <><RefreshCw className="h-4 w-4 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Generate</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Preview Dialog ──────────────────────────────────────────────────── */

function PreviewDialog({ open, html, template, language, onLanguageChange, onClose }: {
  open: boolean;
  html: string | null;
  template: EmailTemplateDto | null;
  language: 'en' | 'fr';
  onLanguageChange: (lang: 'en' | 'fr') => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
              <Eye className="h-4 w-4 text-blue-500" />
            </div>
            Email Preview
            {template && (
              <Badge variant="secondary" className="ml-2 text-xs font-normal">
                {template.name}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Language toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={language === 'en' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onLanguageChange('en')}
            className="h-8"
          >
            <span className="mr-1 text-xs">🇬🇧</span> English
          </Button>
          <Button
            variant={language === 'fr' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onLanguageChange('fr')}
            className="h-8"
          >
            <span className="mr-1 text-xs">🇫🇷</span> French
          </Button>
        </div>

        {/* Subject line */}
        {template && (
          <div className="rounded-lg bg-muted/50 px-4 py-2.5">
            <p className="text-xs font-medium text-muted-foreground">Subject</p>
            <p className="mt-0.5 text-sm font-medium">
              {language === 'en' ? template.subjectEn : template.subjectFr}
            </p>
          </div>
        )}

        {/* HTML preview — rendered in iframe to isolate email styles from Tailwind */}
        <div className="max-h-[60vh] overflow-hidden rounded-xl border bg-white dark:bg-gray-50">
          {html ? (
            <iframe
              srcDoc={html}
              title="Email preview"
              className="h-[55vh] w-full border-0"
              sandbox="allow-same-origin"
            />
          ) : (
            <div className="flex items-center justify-center py-12">
              <SqordiaLoader message="Loading preview..." size="sm" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
