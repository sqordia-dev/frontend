import { useEffect, useState } from 'react';
import { templateService } from '../../lib/template-service';
import { Search, Plus, Edit, Trash2, Eye, Copy, Archive, CheckCircle, XCircle, Filter, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { getUserFriendlyError } from '../../utils/error-messages';
import { Button } from '../../components/ui/button';

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [industries, setIndustries] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
    category: 'BusinessPlan',
    type: 'Standard',
    industry: '',
    targetAudience: '',
    language: 'en',
    country: '',
    isPublic: false,
    tags: '',
    author: '',
    version: '1.0.0'
  });
  const [saving, setSaving] = useState(false);
  const { t } = useTheme();
  const toast = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await templateService.getTemplates();
      setTemplates(data);
      
      // Extract unique industries
      const uniqueIndustries = Array.from(new Set(data.map((t: any) => t.industry).filter(Boolean)));
      setIndustries(uniqueIndustries.sort()); // Sort alphabetically
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('admin.templates.confirmDelete'))) {
      return;
    }

    try {
      await templateService.deleteTemplate(id);
      await loadTemplates();
    } catch (err: any) {
      toast.error('Delete Error', getUserFriendlyError(err, 'delete'));
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await templateService.publishTemplate(id);
      await loadTemplates();
    } catch (err: any) {
      toast.error('Publish Error', getUserFriendlyError(err, 'save'));
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await templateService.archiveTemplate(id);
      await loadTemplates();
    } catch (err: any) {
      toast.error('Archive Error', getUserFriendlyError(err, 'save'));
    }
  };

  const handleClone = async (id: string) => {
    const newName = window.prompt(t('admin.templates.enterCloneName'));
    if (!newName) return;

    try {
      await templateService.cloneTemplate(id, newName);
      await loadTemplates();
    } catch (err: any) {
      toast.error('Clone Error', getUserFriendlyError(err, 'save'));
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.description || !formData.category || !formData.type || !formData.language) {
      toast.warning('Validation', t('admin.templates.requiredFields'));
      return;
    }

    try {
      setSaving(true);
      if (editingTemplate) {
        // For update, include the ID
        await templateService.updateTemplate(editingTemplate.id, {
          ...formData,
          id: editingTemplate.id
        });
      } else {
        // For create, backend uses camelCase JSON serialization
        await templateService.createTemplate({
          name: formData.name,
          description: formData.description,
          content: formData.content || '',
          category: formData.category, // Backend will parse enum from string
          type: formData.type, // Backend will parse enum from string
          industry: formData.industry,
          targetAudience: formData.targetAudience,
          language: formData.language,
          country: formData.country,
          isPublic: formData.isPublic,
          tags: formData.tags || '',
          previewImage: '',
          author: formData.author || 'Admin',
          authorEmail: '',
          version: formData.version || '1.0.0',
          changelog: ''
        });
      }
      setShowCreateModal(false);
      setEditingTemplate(null);
      setFormData({
        name: '',
        description: '',
        content: '',
        category: 'BusinessPlan',
        type: 'Standard',
        industry: '',
        targetAudience: '',
        language: 'en',
        country: '',
        isPublic: false,
        tags: '',
        author: '',
        version: '1.0.0'
      });
      await loadTemplates();
    } catch (err: any) {
      toast.error('Save Error', getUserFriendlyError(err, 'save'));
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (template: any) => {
    setEditingTemplate(template);
      setFormData({
        name: template.name || '',
        description: template.description || '',
        content: template.content || '',
        category: template.category || 'BusinessPlan',
        type: template.type || 'Standard',
      industry: template.industry || '',
      targetAudience: template.targetAudience || '',
      language: template.language || 'en',
      country: template.country || '',
      isPublic: template.isPublic || false,
      tags: template.tags || '',
      author: template.author || '',
      version: template.version || '1.0.0'
    });
    setShowCreateModal(true);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !searchTerm || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesIndustry = selectedIndustry === 'all' || template.industry === selectedIndustry;
    
    return matchesSearch && matchesIndustry;
  });

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {/* Button skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
        {/* Filters skeleton */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        </div>
        {/* Table skeleton */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700">
            <div className="flex gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-3 w-16 bg-gray-200 dark:bg-gray-600 rounded" />
              ))}
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-6">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-56 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-5 w-14 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="brand"
          onClick={() => {
            setEditingTemplate(null);
      setFormData({
        name: '',
        description: '',
        content: '',
        category: 'BusinessPlan',
        type: 'Standard',
              industry: '',
              targetAudience: '',
              language: 'en',
              country: '',
              isPublic: false,
              tags: '',
              author: '',
              version: '1.0.0'
            });
            setShowCreateModal(true);
          }}
        >
          <Plus size={18} />
          {t('admin.templates.create')}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('admin.templates.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500 dark:text-gray-400" />
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{t('admin.templates.allIndustries')}</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Templates Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('admin.templates.name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('admin.templates.industry')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('admin.templates.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('admin.templates.usage')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('admin.templates.rating')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('admin.templates.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {t('admin.templates.noTemplates')}
                  </td>
                </tr>
              ) : (
                filteredTemplates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{template.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{template.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                        {template.industry || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {template.isPublic ? (
                        <span className="flex items-center gap-1 text-[#FF6B00]">
                          <CheckCircle size={16} />
                          <span className="text-sm">{t('admin.templates.public')}</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <XCircle size={16} />
                          <span className="text-sm">{t('admin.templates.draft')}</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {template.usageCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {template.rating > 0 ? `${template.rating.toFixed(1)} ⭐` : t('admin.templates.noRatings')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`/template/${template.id}`, '_blank')}
                          title={t('admin.templates.preview')}
                        >
                          <Eye size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(template)}
                          title={t('admin.templates.edit')}
                        >
                          <Edit size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleClone(template.id)}
                          title={t('admin.templates.clone')}
                        >
                          <Copy size={18} />
                        </Button>
                        {!template.isPublic && (
                          <Button
                            variant="brand-ghost"
                            size="icon"
                            onClick={() => handlePublish(template.id)}
                            title={t('admin.templates.publish')}
                          >
                            <CheckCircle size={18} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleArchive(template.id)}
                          title={t('admin.templates.archive')}
                        >
                          <Archive size={18} />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 shadow-none"
                          onClick={() => handleDelete(template.id)}
                          title={t('admin.templates.delete')}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingTemplate) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingTemplate ? t('admin.templates.editTemplate') : t('admin.templates.createTemplate')}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTemplate(null);
                  }}
                >
                  <X size={24} />
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.templates.name')} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.templates.industry')}
                  </label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.templates.description')} *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.templates.content')}
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.templates.category')} *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="BusinessPlan">Business Plan</option>
                    <option value="FinancialProjection">Financial Projection</option>
                    <option value="MarketingPlan">Marketing Plan</option>
                    <option value="OperationsPlan">Operations Plan</option>
                    <option value="RiskAssessment">Risk Assessment</option>
                    <option value="ExecutiveSummary">Executive Summary</option>
                    <option value="CompanyProfile">Company Profile</option>
                    <option value="MarketAnalysis">Market Analysis</option>
                    <option value="CompetitiveAnalysis">Competitive Analysis</option>
                    <option value="SalesPlan">Sales Plan</option>
                    <option value="HRPlan">HR Plan</option>
                    <option value="TechnologyPlan">Technology Plan</option>
                    <option value="SustainabilityPlan">Sustainability Plan</option>
                    <option value="ExitStrategy">Exit Strategy</option>
                    <option value="LegalCompliance">Legal Compliance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.templates.type')} *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="Custom">Custom</option>
                    <option value="IndustrySpecific">Industry Specific</option>
                    <option value="Regional">Regional</option>
                    <option value="LanguageSpecific">Language Specific</option>
                    <option value="SizeSpecific">Size Specific</option>
                    <option value="SectorSpecific">Sector Specific</option>
                    <option value="ComplianceSpecific">Compliance Specific</option>
                    <option value="FundingSpecific">Funding Specific</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.templates.language')} *
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.templates.version')}
                  </label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.templates.targetAudience')}
                  </label>
                  <input
                    type="text"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={t('admin.templates.targetAudiencePlaceholder')}
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-0 focus:ring-orange-500 accent-[#FF6B00]"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  {t('admin.templates.makePublic')}
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTemplate(null);
                  }}
                >
                  {t('admin.templates.cancel')}
                </Button>
                <Button
                  variant="brand"
                  onClick={handleSave}
                  disabled={saving || !formData.name || !formData.description || !formData.category || !formData.type || !formData.language}
                >
                  {saving ? t('admin.templates.saving') : (editingTemplate ? t('admin.templates.update') : t('admin.templates.create'))}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

