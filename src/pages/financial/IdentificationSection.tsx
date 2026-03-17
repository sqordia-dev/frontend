import { useState, useEffect, useRef, type DragEvent, type FC } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ImageIcon, Upload } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useOrganizationProfile } from '../../hooks/useOrganizationProfile';
import { useUpdatePlanSettings } from '../../hooks/usePrevisio';
import { coverPageService } from '../../lib/cover-page-service';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { SkeletonPage } from '../../components/ui/skeleton';
import type { FinancialPlanDto } from '../../types/financial-projections';

interface OutletContext {
  plan: FinancialPlanDto;
  businessPlanId: string;
}

const SALES_TAX_OPTIONS = [
  { value: 'none', labelKey: 'fin.ident.taxNone' },
  { value: 'monthly', labelKey: 'fin.ident.taxMonthly' },
  { value: 'quarterly', labelKey: 'fin.ident.taxQuarterly' },
  { value: 'annually', labelKey: 'fin.ident.taxAnnually' },
] as const;

const BUSINESS_STAGE_OPTIONS = [
  { value: 'ConceptIdea', labelKey: 'fin.ident.stageConceptIdea' },
  { value: 'WritingPlan', labelKey: 'fin.ident.stageWritingPlan' },
  { value: 'OperatingUnder2Years', labelKey: 'fin.ident.stageOperatingUnder2' },
  { value: 'OperatingOver2Years', labelKey: 'fin.ident.stageOperatingOver2' },
  { value: 'Acquisition', labelKey: 'fin.ident.stageAcquisition' },
] as const;

const INDUSTRY_OPTIONS = [
  'Agriculture, foresterie, pêche et chasse',
  'Extraction minière, exploitation en carrière',
  'Services publics',
  'Construction',
  'Fabrication',
  'Commerce de gros',
  'Commerce de détail',
  'Transport et entreposage',
  'Industrie de l\'information et industrie culturelle',
  'Finance et assurances',
  'Services immobiliers',
  'Services professionnels, scientifiques et techniques',
  'Gestion de sociétés et d\'entreprises',
  'Services administratifs et de soutien',
  'Services d\'enseignement',
  'Soins de santé et assistance sociale',
  'Arts, spectacles et loisirs',
  'Hébergement et services de restauration',
  'Autres services (sauf les administrations publiques)',
  'Administrations publiques',
] as const;

const LEGAL_FORM_OPTIONS = [
  { value: 'sole_proprietorship', labelKey: 'fin.ident.legalSole' },
  { value: 'corporation', labelKey: 'fin.ident.legalCorporation' },
  { value: 'general_partnership', labelKey: 'fin.ident.legalPartnership' },
  { value: 'limited_partnership', labelKey: 'fin.ident.legalLimitedPartnership' },
  { value: 'npo', labelKey: 'fin.ident.legalNPO' },
  { value: 'cooperative', labelKey: 'fin.ident.legalCooperative' },
] as const;

function formatMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

const IdentificationSection: FC = () => {
  const { t } = useTheme();
  const { plan, businessPlanId } = useOutletContext<OutletContext>();
  const { profile, isLoading: profileLoading, updateProfile } = useOrganizationProfile();
  const updateSettings = useUpdatePlanSettings(businessPlanId);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [salesTaxOption, setSalesTaxOption] = useState('none');
  const [startMonth, setStartMonth] = useState('');
  const [businessStage, setBusinessStage] = useState('');
  const [industry, setIndustry] = useState('');
  const [legalForm, setLegalForm] = useState('');
  const [saving, setSaving] = useState(false);

  // Initialize form from profile + plan data
  useEffect(() => {
    if (profile) {
      setCompanyName(profile.name || '');
      setLogoUrl(profile.logoUrl || null);
      setBusinessStage(profile.businessStage || '');
      setIndustry(profile.industry || '');
      setLegalForm(profile.legalForm || '');
    }
  }, [profile]);

  useEffect(() => {
    if (plan) {
      setSalesTaxOption(plan.salesTaxFrequency || 'none');
      const year = plan.startYear || new Date().getFullYear();
      const month = plan.startMonth || 1;
      setStartMonth(formatMonth(year, month));
    }
  }, [plan]);

  const handleLogoUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setLogoUploading(true);
    try {
      const url = await coverPageService.uploadLogo(businessPlanId, file);
      setLogoUrl(url);
    } catch {
      // silently fail — user can retry
    } finally {
      setLogoUploading(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleLogoUpload(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (profile) {
        await updateProfile({
          name: companyName,
          industry,
          legalForm,
          businessStage,
        });
      }

      // Parse year + month from the month input (YYYY-MM)
      const [yearStr, monthStr] = startMonth.split('-');
      const taxRate = salesTaxOption === 'none' ? 0 : plan.defaultSalesTaxRate || 14.975;

      await updateSettings.mutateAsync({
        projectionYears: plan.projectionYears,
        defaultVolumeGrowthRate: plan.defaultVolumeGrowthRate,
        defaultPriceIndexationRate: plan.defaultPriceIndexationRate,
        defaultExpenseIndexationRate: plan.defaultExpenseIndexationRate,
        defaultSocialChargeRate: plan.defaultSocialChargeRate,
        defaultSalesTaxRate: taxRate,
        startMonth: parseInt(monthStr, 10) || 1,
        salesTaxFrequency: salesTaxOption,
      });
    } catch {
      // error handled by hooks
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setCompanyName(profile.name || '');
      setLogoUrl(profile.logoUrl || null);
      setBusinessStage(profile.businessStage || '');
      setIndustry(profile.industry || '');
      setLegalForm(profile.legalForm || '');
    }
    if (plan) {
      setSalesTaxOption(plan.salesTaxFrequency || 'none');
      const year = plan.startYear || new Date().getFullYear();
      const month = plan.startMonth || 1;
      setStartMonth(formatMonth(year, month));
    }
  };

  if (profileLoading) {
    return <SkeletonPage />;
  }

  return (
    <div className="max-w-lg">
      {/* Title */}
      <h2 className="text-xl font-heading font-semibold text-strategy-blue mb-6">
        {t('fin.identification.title')}
      </h2>

      <div className="space-y-5">
        {/* Company Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            <span className="text-red-500 mr-0.5">*</span>
            {t('fin.ident.companyName')}
          </label>
          <Input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="bg-card"
          />
        </div>

        {/* Company Logo */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            {t('fin.ident.companyLogo')}
          </label>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center min-h-[120px] bg-card hover:border-strategy-blue/40 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {logoUrl ? (
              <img src={logoUrl} alt="Company logo" className="max-h-20 object-contain" />
            ) : (
              <ImageIcon className="w-12 h-12 text-muted-foreground/40" />
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleLogoUpload(file);
            }}
          />
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={logoUploading}
          >
            <Upload className="w-3.5 h-3.5" />
            {logoUploading ? t('fin.ident.uploading') : t('fin.ident.uploadImage')}
          </Button>
        </div>

        {/* Sales Tax */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            <span className="text-red-500 mr-0.5">*</span>
            {t('fin.ident.salesTaxSubject')}
          </label>
          <Select value={salesTaxOption} onValueChange={setSalesTaxOption}>
            <SelectTrigger className="bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SALES_TAX_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* First Month */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            <span className="text-red-500 mr-0.5">*</span>
            {t('fin.ident.firstMonth')}
          </label>
          <Input
            type="month"
            value={startMonth}
            onChange={(e) => setStartMonth(e.target.value)}
            className="bg-card"
          />
        </div>

        {/* Business Stage */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            <span className="text-red-500 mr-0.5">*</span>
            {t('fin.ident.businessStage')}
          </label>
          <Select value={businessStage} onValueChange={setBusinessStage}>
            <SelectTrigger className="bg-card">
              <SelectValue placeholder={t('fin.ident.selectPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {BUSINESS_STAGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Industry Sector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            <span className="text-red-500 mr-0.5">*</span>
            {t('fin.ident.industrySector')}
          </label>
          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger className="bg-card">
              <SelectValue placeholder={t('fin.ident.selectPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRY_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Legal Form */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            <span className="text-red-500 mr-0.5">*</span>
            {t('fin.ident.legalForm')}
          </label>
          <Select value={legalForm} onValueChange={setLegalForm}>
            <SelectTrigger className="bg-card">
              <SelectValue placeholder={t('fin.ident.selectPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {LEGAL_FORM_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-8 pt-6 border-t border-border">
        <Button onClick={handleSave} disabled={saving || !companyName.trim()}>
          {saving ? t('fin.ident.saving') : t('fin.ident.save')}
        </Button>
        <Button variant="outline" onClick={handleCancel} disabled={saving}>
          {t('fin.common.cancel')}
        </Button>
      </div>
    </div>
  );
};

export default IdentificationSection;
