import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Sparkles, Eye, Search, Loader2 } from 'lucide-react';
import { emailTemplateService, EmailTemplateDto, CreateEmailTemplateRequest, UpdateEmailTemplateRequest } from '../../lib/email-template-service';

const CATEGORIES = ['all', 'auth', 'notification', 'marketing', 'billing', 'system'];

export default function AdminEmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editTemplate, setEditTemplate] = useState<EmailTemplateDto | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  const filtered = templates.filter(t => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch = !searchTerm || t.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    try {
      await emailTemplateService.delete(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handlePreview = async (template: EmailTemplateDto) => {
    try {
      const html = await emailTemplateService.preview(template.id, 'en');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email Templates</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGenerateDialog(true)}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            <Sparkles className="h-4 w-4" />
            AI Generate
          </button>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Template
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="flex gap-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                selectedCategory === cat
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Template list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center text-gray-500 dark:border-gray-600 dark:text-gray-400">
          No templates found. Create one or use AI generation.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Category</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Subject (EN)</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500 dark:text-gray-400">Version</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.map(template => (
                <tr key={template.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{template.name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize dark:bg-gray-700">
                      {template.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300 truncate max-w-[200px]">{template.subjectEn}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block h-2 w-2 rounded-full ${template.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">v{template.version}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handlePreview(template)} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700" title="Preview">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => setEditTemplate(template)} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700" title="Edit">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(template.id)} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      {(showCreateDialog || editTemplate) && (
        <TemplateEditDialog
          template={editTemplate}
          saving={saving}
          onSave={handleSave}
          onClose={() => { setEditTemplate(null); setShowCreateDialog(false); }}
        />
      )}

      {/* Generate Dialog */}
      {showGenerateDialog && (
        <GenerateDialog saving={saving} onGenerate={handleGenerate} onClose={() => setShowGenerateDialog(false)} />
      )}

      {/* Preview Dialog */}
      {previewHtml && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setPreviewHtml(null)}>
          <div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Email Preview</h3>
              <button onClick={() => setPreviewHtml(null)} className="text-gray-400 hover:text-gray-600">
                <Plus className="h-5 w-5 rotate-45" />
              </button>
            </div>
            <div className="border rounded-lg p-4" dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </div>
      )}
    </div>
  );
}

function TemplateEditDialog({ template, saving, onSave, onClose }: {
  template: EmailTemplateDto | null;
  saving: boolean;
  onSave: (data: CreateEmailTemplateRequest | UpdateEmailTemplateRequest) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: template?.name || '',
    category: template?.category || 'notification',
    subjectFr: template?.subjectFr || '',
    subjectEn: template?.subjectEn || '',
    bodyFr: template?.bodyFr || '',
    bodyEn: template?.bodyEn || '',
    variablesJson: template?.variablesJson || '[]',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-2xl overflow-auto rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{template ? 'Edit Template' : 'New Template'}</h3>
        <div className="space-y-4">
          {!template && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                  {CATEGORIES.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject (FR)</label>
              <input value={form.subjectFr} onChange={e => setForm(f => ({ ...f, subjectFr: e.target.value }))} className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject (EN)</label>
              <input value={form.subjectEn} onChange={e => setForm(f => ({ ...f, subjectEn: e.target.value }))} className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Body (EN)</label>
            <textarea value={form.bodyEn} onChange={e => setForm(f => ({ ...f, bodyEn: e.target.value }))} rows={6} className="w-full rounded-lg border px-3 py-2 text-sm font-mono dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Body (FR)</label>
            <textarea value={form.bodyFr} onChange={e => setForm(f => ({ ...f, bodyFr: e.target.value }))} rows={6} className="w-full rounded-lg border px-3 py-2 text-sm font-mono dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Cancel</button>
            <button onClick={() => onSave(form)} disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GenerateDialog({ saving, onGenerate, onClose }: {
  saving: boolean;
  onGenerate: (purpose: string, variables: string) => void;
  onClose: () => void;
}) {
  const [purpose, setPurpose] = useState('');
  const [variables, setVariables] = useState('firstName, lastName, actionUrl');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Generate Template
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purpose</label>
            <textarea value={purpose} onChange={e => setPurpose(e.target.value)} rows={3} placeholder="e.g., Welcome email for new users after registration" className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Variables (comma-separated)</label>
            <input value={variables} onChange={e => setVariables(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Cancel</button>
            <button onClick={() => onGenerate(purpose, variables)} disabled={saving || !purpose.trim()} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50">
              {saving ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
