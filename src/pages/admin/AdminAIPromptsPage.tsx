import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../lib/admin-service';
import { 
  Brain, Plus, Edit, Trash, AlertCircle, X, ToggleLeft, ToggleRight, Search, 
  Save, TestTube, Filter, Download, Upload, FileText, Globe, Building2, 
  Sparkles, CheckCircle, Clock, BarChart3, Copy, RefreshCw, LayoutGrid, List, ArrowLeft
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import RichTextEditor from '../../components/RichTextEditor';

// Section definitions with categories
const SECTION_CATEGORIES = {
  'Introduction': ['ExecutiveSummary', 'ProblemStatement', 'Solution'],
  'Market': ['MarketAnalysis', 'CompetitiveAnalysis', 'SwotAnalysis'],
  'Strategy': ['BusinessModel', 'MarketingStrategy', 'BrandingStrategy'],
  'Operations': ['OperationsPlan', 'ManagementTeam'],
  'Financial': ['FinancialProjections', 'FundingRequirements', 'RiskAnalysis'],
  'BusinessPlan': ['ExitStrategy'],
  'StrategicPlan': ['MissionStatement', 'SocialImpact', 'BeneficiaryProfile', 'GrantStrategy', 'SustainabilityPlan']
};

const ALL_SECTIONS = [
  ...SECTION_CATEGORIES.Introduction,
  ...SECTION_CATEGORIES.Market,
  ...SECTION_CATEGORIES.Strategy,
  ...SECTION_CATEGORIES.Operations,
  ...SECTION_CATEGORIES.Financial,
  ...SECTION_CATEGORIES.BusinessPlan,
  ...SECTION_CATEGORIES.StrategicPlan
];

const SECTION_DISPLAY_NAMES: Record<string, string> = {
  'ExecutiveSummary': 'Executive Summary',
  'ProblemStatement': 'Problem Statement',
  'Solution': 'Solution',
  'MarketAnalysis': 'Market Analysis',
  'CompetitiveAnalysis': 'Competitive Analysis',
  'SwotAnalysis': 'SWOT Analysis',
  'BusinessModel': 'Business Model',
  'MarketingStrategy': 'Marketing Strategy',
  'BrandingStrategy': 'Branding Strategy',
  'OperationsPlan': 'Operations Plan',
  'ManagementTeam': 'Management Team',
  'FinancialProjections': 'Financial Projections',
  'FundingRequirements': 'Funding Requirements',
  'RiskAnalysis': 'Risk Analysis',
  'ExitStrategy': 'Exit Strategy',
  'MissionStatement': 'Mission Statement',
  'SocialImpact': 'Social Impact',
  'BeneficiaryProfile': 'Beneficiary Profile',
  'GrantStrategy': 'Grant Strategy',
  'SustainabilityPlan': 'Sustainability Plan'
};

export default function AdminAIPromptsPage() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlanType, setSelectedPlanType] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [migrating, setMigrating] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'ContentGeneration',
    planType: 'BusinessPlan',
    language: 'en',
    sectionName: '',
    systemPrompt: '',
    userPromptTemplate: '',
    variables: '{"questionnaireContext": "The questionnaire responses context"}',
    notes: '',
    isActive: true
  });
  const [saving, setSaving] = useState(false);
  const [testingPrompt, setTestingPrompt] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const { t } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getAIPrompts();
      setPrompts(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMigrateDefaults = async () => {
    if (!confirm(t('admin.promptsStudio.migrateConfirm'))) return;
    
    try {
      setMigrating(true);
      setError(null);
      const result = await adminService.migrateDefaultPrompts();
      alert(t('admin.promptsStudio.migrateSuccess').replace('{count}', result.migrated.toString()));
      await loadPrompts();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error occurred';
      console.error('Migration error:', err);
      setError(`${t('admin.promptsStudio.migrateFailed')} ${errorMessage}`);
      alert(`${t('admin.promptsStudio.migrateFailed')} ${errorMessage}`);
    } finally {
      setMigrating(false);
    }
  };

  const filterPrompts = () => {
    let filtered = [...prompts];

    if (searchQuery) {
      filtered = filtered.filter(prompt =>
        prompt.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.sectionName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedPlanType !== 'all') {
      filtered = filtered.filter(prompt => prompt.planType === selectedPlanType);
    }

    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(prompt => prompt.language === selectedLanguage);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(prompt => prompt.category === selectedCategory);
    }

    if (selectedSection !== 'all') {
      filtered = filtered.filter(prompt => prompt.sectionName === selectedSection);
    }

    // Filter by active tab (section category)
    if (activeTab !== 'all') {
      const sectionsInCategory = SECTION_CATEGORIES[activeTab as keyof typeof SECTION_CATEGORIES] || [];
      filtered = filtered.filter(prompt => 
        !prompt.sectionName || sectionsInCategory.includes(prompt.sectionName)
      );
    }

    return filtered;
  };

  const getPromptsBySection = () => {
    const filtered = filterPrompts();
    const grouped: Record<string, any[]> = {};

    filtered.forEach(prompt => {
      const section = prompt.sectionName || 'Other';
      if (!grouped[section]) {
        grouped[section] = [];
      }
      grouped[section].push(prompt);
    });

    return grouped;
  };

  const handleDelete = async (promptId: string) => {
    if (!confirm(t('admin.aiPrompts.confirmDelete'))) return;
    try {
      await adminService.deleteAIPrompt(promptId);
      await loadPrompts();
    } catch (err: any) {
      alert(`${t('admin.aiPrompts.failedToDelete')} ${err.message}`);
    }
  };

  const handleToggleStatus = async (promptId: string, currentStatus: boolean) => {
    try {
      await adminService.updateAIPromptStatus(promptId, !currentStatus);
      await loadPrompts();
    } catch (err: any) {
      alert(`${t('admin.aiPrompts.failedToUpdateStatus')} ${err.message}`);
    }
  };

  const handleDuplicate = (prompt: any) => {
    setEditingPrompt(null);
    setFormData({
      name: `${prompt.name} (Copy)`,
      description: prompt.description || '',
      category: prompt.category || 'ContentGeneration',
      planType: prompt.planType || 'BusinessPlan',
      language: prompt.language === 'en' ? 'fr' : 'en', // Switch language
      sectionName: prompt.sectionName || '',
      systemPrompt: prompt.systemPrompt || '',
      userPromptTemplate: prompt.userPromptTemplate || '',
      variables: prompt.variables || '{}',
      notes: prompt.notes || '',
      isActive: true
    });
    setShowCreateModal(true);
  };

  const handleSave = async () => {
    const extractText = (html: string): string => {
      if (!html) return '';
      const div = document.createElement('div');
      div.innerHTML = html;
      return div.textContent || div.innerText || '';
    };

    const systemPromptText = extractText(formData.systemPrompt);
    const userPromptText = extractText(formData.userPromptTemplate);

    if (!formData.name || !formData.description || !systemPromptText || !userPromptText) {
      alert(t('admin.aiPrompts.requiredFields'));
      return;
    }

    try {
      setSaving(true);
      const saveData = {
        ...formData,
        systemPrompt: systemPromptText,
        userPromptTemplate: userPromptText
      };

      if (editingPrompt) {
        await adminService.updateAIPrompt(editingPrompt.id, saveData);
      } else {
        await adminService.createAIPrompt(saveData);
      }
      setShowCreateModal(false);
      setEditingPrompt(null);
      resetForm();
      await loadPrompts();
    } catch (err: any) {
      alert(`${t('admin.aiPrompts.failedToSave')} ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTestPrompt = async () => {
    if (!editingPrompt) return;
    
    try {
      setTestingPrompt(true);
      setTestResult(null);
      const result = await adminService.testAIPrompt(editingPrompt.id, {
        sampleVariables: formData.variables || '{}',
        maxTokens: 1000,
        temperature: 0.7
      });
      setTestResult(JSON.stringify(result, null, 2));
    } catch (err: any) {
      setTestResult(`Error: ${err.message}`);
    } finally {
      setTestingPrompt(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'ContentGeneration',
      planType: 'BusinessPlan',
      language: 'en',
      sectionName: '',
      systemPrompt: '',
      userPromptTemplate: '',
      variables: '{"questionnaireContext": "The questionnaire responses context"}',
      notes: '',
      isActive: true
    });
  };

  const convertTextToHtml = (text: string): string => {
    if (!text) return '';
    if (text.includes('<') && text.includes('>')) {
      return text;
    }
    return text.split('\n').map(line => `<p>${line || '<br>'}</p>`).join('');
  };

  const openEditModal = (prompt: any) => {
    setEditingPrompt(prompt);
    setFormData({
      name: prompt.name || '',
      description: prompt.description || '',
      category: prompt.category || 'ContentGeneration',
      planType: prompt.planType || 'BusinessPlan',
      language: prompt.language || 'en',
      sectionName: prompt.sectionName || '',
      systemPrompt: convertTextToHtml(prompt.systemPrompt || ''),
      userPromptTemplate: convertTextToHtml(prompt.userPromptTemplate || ''),
      variables: prompt.variables || '{}',
      notes: prompt.notes || '',
      isActive: prompt.isActive !== undefined ? prompt.isActive : true
    });
    setTestResult(null);
    setShowCreateModal(true);
  };

  const openCreateModal = () => {
    setEditingPrompt(null);
    resetForm();
    setTestResult(null);
    setShowCreateModal(true);
  };

  const filteredPrompts = filterPrompts();
  const promptsBySection = getPromptsBySection();
  const sections = Object.keys(promptsBySection).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#FF6B00' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title={t('admin.promptsStudio.backToDashboard')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.promptsStudio.title')}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('admin.promptsStudio.subtitle')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleMigrateDefaults}
            disabled={migrating}
            className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            {migrating ? t('admin.promptsStudio.migrating') : t('admin.promptsStudio.importDefaults')}
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center px-4 py-2 text-white rounded-lg transition-colors shadow-sm hover:shadow-md"
            style={{ backgroundColor: '#FF6B00' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E55F00'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF6B00'}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('admin.aiPrompts.newPrompt')}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin.promptsStudio.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <select
            value={selectedPlanType}
            onChange={(e) => setSelectedPlanType(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">{t('admin.promptsStudio.allPlanTypes')}</option>
            <option value="BusinessPlan">{t('admin.promptsStudio.businessPlan')}</option>
            <option value="StrategicPlan">{t('admin.promptsStudio.strategicPlan')}</option>
            <option value="LeanCanvas">{t('admin.promptsStudio.leanCanvas')}</option>
          </select>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">{t('admin.promptsStudio.allLanguages')}</option>
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">{t('admin.promptsStudio.allCategories')}</option>
            <option value="ContentGeneration">{t('admin.promptsStudio.contentGeneration')}</option>
            <option value="SystemPrompt">{t('admin.promptsStudio.systemPrompt')}</option>
            <option value="SectionImprovement">{t('admin.promptsStudio.sectionImprovement')}</option>
            <option value="QuestionSuggestions">{t('admin.promptsStudio.questionSuggestions')}</option>
          </select>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">{t('admin.promptsStudio.allSections')}</option>
            {ALL_SECTIONS.map(section => (
              <option key={section} value={section}>
                {SECTION_DISPLAY_NAMES[section] || section}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Section Tabs and View Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 flex-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'all'
                ? 'text-white'
                : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600'
            }`}
            style={activeTab === 'all' ? { backgroundColor: '#FF6B00' } : {}}
          >
            {t('admin.promptsStudio.allSections')}
          </button>
          {Object.keys(SECTION_CATEGORIES).map(category => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === category
                  ? 'text-white'
                  : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600'
              }`}
              style={activeTab === category ? { backgroundColor: '#FF6B00' } : {}}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-white dark:bg-gray-800">
          <button
            onClick={() => setViewMode('card')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'card'
                ? 'text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            style={viewMode === 'card' ? { backgroundColor: '#FF6B00' } : {}}
            title={t('admin.promptsStudio.cardView')}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'list'
                ? 'text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            style={viewMode === 'list' ? { backgroundColor: '#FF6B00' } : {}}
            title={t('admin.promptsStudio.listView')}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Prompts by Section */}
      {sections.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {prompts.length === 0 
              ? t('admin.promptsStudio.noPromptsFound')
              : t('admin.promptsStudio.noPromptsMatch')}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map(section => {
            const sectionPrompts = promptsBySection[section];
            const displayName = SECTION_DISPLAY_NAMES[section] || section;
            
            return (
              <div key={section} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5" style={{ color: '#FF6B00' }} />
                    {displayName}
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      ({sectionPrompts.length} {sectionPrompts.length !== 1 ? t('admin.promptsStudio.prompts') : t('admin.promptsStudio.prompt')})
                    </span>
                  </h3>
                </div>
                {viewMode === 'card' ? (
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sectionPrompts.map((prompt) => (
                      <div
                        key={prompt.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {prompt.name || t('admin.promptsStudio.unnamedPrompt')}
                              </h4>
                              <button
                                onClick={() => handleToggleStatus(prompt.id, prompt.isActive)}
                                className="flex items-center"
                                title={prompt.isActive ? t('admin.aiPrompts.deactivate') : t('admin.aiPrompts.activate')}
                              >
                                {prompt.isActive ? (
                                  <ToggleRight className="w-5 h-5" style={{ color: '#FF6B00' }} />
                                ) : (
                                  <ToggleLeft className="w-5 h-5 text-gray-400" />
                                )}
                              </button>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                prompt.isActive 
                                  ? 'text-white' 
                                  : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700'
                              }`}
                              style={prompt.isActive ? { backgroundColor: '#FF6B00' } : {}}>
                                {prompt.isActive ? t('admin.aiPrompts.status.active') : t('admin.aiPrompts.status.inactive')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                              {prompt.description || t('admin.aiPrompts.noDescription')}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                {prompt.planType}
                              </span>
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded uppercase">
                                {prompt.language}
                              </span>
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                v{prompt.version || 1}
                              </span>
                              {prompt.usageCount > 0 && (
                                <span className="flex items-center gap-1">
                                  <BarChart3 className="w-3 h-3" />
                                  {prompt.usageCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(prompt)}
                            className="flex items-center px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            {t('admin.aiPrompts.edit')}
                          </button>
                          <button
                            onClick={() => handleDuplicate(prompt)}
                            className="flex items-center px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            {t('admin.promptsStudio.duplicate')}
                          </button>
                          <button
                            onClick={() => handleDelete(prompt.id)}
                            className="flex items-center px-3 py-1.5 text-sm border border-red-300 dark:border-red-600 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash className="w-4 h-4 mr-1" />
                            {t('admin.aiPrompts.delete')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {sectionPrompts.map((prompt) => (
                      <div
                        key={prompt.id}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {prompt.name || t('admin.promptsStudio.unnamedPrompt')}
                              </h4>
                              <button
                                onClick={() => handleToggleStatus(prompt.id, prompt.isActive)}
                                className="flex items-center flex-shrink-0"
                                title={prompt.isActive ? t('admin.aiPrompts.deactivate') : t('admin.aiPrompts.activate')}
                              >
                                {prompt.isActive ? (
                                  <ToggleRight className="w-5 h-5" style={{ color: '#FF6B00' }} />
                                ) : (
                                  <ToggleLeft className="w-5 h-5 text-gray-400" />
                                )}
                              </button>
                              <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                                prompt.isActive 
                                  ? 'text-white' 
                                  : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700'
                              }`}
                              style={prompt.isActive ? { backgroundColor: '#FF6B00' } : {}}>
                                {prompt.isActive ? t('admin.aiPrompts.status.active') : t('admin.aiPrompts.status.inactive')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {prompt.description || t('admin.aiPrompts.noDescription')}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                  {prompt.planType}
                                </span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded uppercase">
                                  {prompt.language}
                                </span>
                              </span>
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                v{prompt.version || 1}
                              </span>
                              {prompt.category && (
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                  {prompt.category}
                                </span>
                              )}
                              {prompt.usageCount > 0 && (
                                <span className="flex items-center gap-1">
                                  <BarChart3 className="w-3 h-3" />
                                  {prompt.usageCount} {t('admin.aiPrompts.uses')}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => openEditModal(prompt)}
                              className="p-2 rounded transition-colors"
                              style={{ color: '#FF6B00' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FF6B0015'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              title={t('admin.aiPrompts.edit')}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDuplicate(prompt)}
                              className="p-2 rounded transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                              title={t('admin.promptsStudio.duplicate')}
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(prompt.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title={t('admin.aiPrompts.delete')}
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FF6B00' }}>
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {editingPrompt ? t('admin.aiPrompts.editPrompt') : t('admin.aiPrompts.createPrompt')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {editingPrompt ? t('admin.promptsStudio.fineTune') : t('admin.promptsStudio.buildNew')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingPrompt(null);
                  resetForm();
                  setTestResult(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('admin.aiPrompts.name')} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder={t('admin.aiPrompts.name')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('admin.aiPrompts.category')} *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="ContentGeneration">{t('admin.promptsStudio.contentGeneration')}</option>
                    <option value="SystemPrompt">{t('admin.promptsStudio.systemPrompt')}</option>
                    <option value="SectionImprovement">{t('admin.promptsStudio.sectionImprovement')}</option>
                    <option value="QuestionSuggestions">{t('admin.promptsStudio.questionSuggestions')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('admin.aiPrompts.description')} *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder={t('admin.aiPrompts.description')}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('admin.aiPrompts.planType')} *
                  </label>
                  <select
                    value={formData.planType}
                    onChange={(e) => setFormData({ ...formData, planType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="BusinessPlan">{t('admin.promptsStudio.businessPlan')}</option>
                    <option value="StrategicPlan">{t('admin.promptsStudio.strategicPlan')}</option>
                    <option value="LeanCanvas">{t('admin.promptsStudio.leanCanvas')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('admin.aiPrompts.language')} *
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('admin.promptsStudio.sectionName')}
                  </label>
                  <select
                    value={formData.sectionName}
                    onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">{t('admin.promptsStudio.noneSystemPrompt')}</option>
                    {ALL_SECTIONS.map(section => (
                      <option key={section} value={section}>
                        {SECTION_DISPLAY_NAMES[section] || section}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* System Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('admin.aiPrompts.systemPrompt')} *
                </label>
                <RichTextEditor
                  value={formData.systemPrompt}
                  onChange={(value) => setFormData({ ...formData, systemPrompt: value })}
                  placeholder={t('admin.aiPrompts.systemPromptPlaceholder')}
                />
              </div>

              {/* User Prompt Template */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('admin.aiPrompts.userPromptTemplate')} *
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    {t('admin.promptsStudio.userPromptHint')}
                  </span>
                </label>
                <RichTextEditor
                  value={formData.userPromptTemplate}
                  onChange={(value) => setFormData({ ...formData, userPromptTemplate: value })}
                  placeholder={t('admin.aiPrompts.userPromptTemplatePlaceholder')}
                />
              </div>

              {/* Variables */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('admin.aiPrompts.variables')} ({t('admin.aiPrompts.variablesPlaceholder').split(':')[0]})
                </label>
                <textarea
                  value={formData.variables}
                  onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder={t('admin.aiPrompts.variablesPlaceholder')}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('admin.aiPrompts.notes')}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder={t('admin.aiPrompts.notes')}
                />
              </div>

              {/* Test Result */}
              {testResult && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <TestTube className="w-4 h-4" style={{ color: '#FF6B00' }} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.promptsStudio.testResult')}</span>
                  </div>
                  <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto whitespace-pre-wrap">
                    {testResult}
                  </pre>
                </div>
              )}

              {/* Active Toggle */}
              {editingPrompt && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 border-gray-300 rounded"
                    style={{ accentColor: '#FF6B00' }}
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    {t('admin.promptsStudio.activePrompt')}
                  </label>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {editingPrompt && (
                  <button
                    onClick={handleTestPrompt}
                    disabled={testingPrompt}
                    className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    {testingPrompt ? t('admin.promptsStudio.testing') : t('admin.promptsStudio.testPrompt')}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingPrompt(null);
                    resetForm();
                    setTestResult(null);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('admin.aiPrompts.cancel')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.name || !formData.description || !formData.systemPrompt || !formData.userPromptTemplate}
                  className="flex items-center px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
                  style={{ backgroundColor: '#FF6B00' }}
                  onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#E55F00')}
                  onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#FF6B00')}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? t('admin.aiPrompts.saving') : (editingPrompt ? t('admin.promptsStudio.updatePrompt') : t('admin.promptsStudio.createPrompt'))}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
