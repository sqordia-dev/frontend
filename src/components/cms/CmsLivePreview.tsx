import { Monitor, Tablet, Smartphone, Eye, Star, CheckCircle, ArrowRight, Quote, HelpCircle, ChevronDown } from 'lucide-react';
import { CmsContentBlock } from '../../lib/cms-types';
import { cn } from '@/lib/utils';

type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

interface CmsLivePreviewProps {
  device: PreviewDevice;
  onDeviceChange: (device: PreviewDevice) => void;
  blocks: CmsContentBlock[];
  editedContent: Record<string, string>;
  sectionKey: string;
  isDraft?: boolean;
}

// Modern device dimensions (iPhone 15 Pro, iPad Pro 11")
const deviceConfig = {
  desktop: { width: 1440, height: 900, scale: 0.28 },
  tablet: { width: 820, height: 1180, scale: 0.35 },
  mobile: { width: 393, height: 852, scale: 0.45 },
};

export function CmsLivePreview({
  device,
  onDeviceChange,
  blocks,
  editedContent,
  sectionKey,
  isDraft = true,
}: CmsLivePreviewProps) {
  const config = deviceConfig[device];

  // Get content value with edited fallback
  const getContent = (blockKey: string): string => {
    let block = blocks.find(b => b.blockKey === blockKey);
    if (!block) {
      block = blocks.find(b => b.blockKey.endsWith(blockKey) || b.blockKey.endsWith(`.${blockKey}`));
    }
    if (block) {
      return editedContent[block.id] ?? block.content;
    }
    return '';
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Section Renderers
  // ─────────────────────────────────────────────────────────────────────────────

  const renderHeroPreview = () => (
    <div className="relative z-10 px-6 py-12 text-center bg-gradient-to-b from-slate-50 to-white">
      <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-orange-50 text-[#FF6B00] text-[9px] font-bold uppercase tracking-wider mb-6 border border-orange-100">
        {getContent('landing.hero.badge_trusted') || 'AI-Powered Planning'}
      </div>
      <h1 className="text-2xl font-extrabold text-slate-900 leading-tight mb-3 px-2">
        {getContent('landing.hero.headline_line1') || 'Transform Your Ideas Into'}
        <span className="block text-[#FF6B00]">
          {getContent('landing.hero.headline_highlight') || 'Professional Business Plans'}
        </span>
      </h1>
      <p className="text-slate-500 text-[11px] leading-relaxed mb-6 px-4">
        {(getContent('landing.hero.subheadline') || 'Create bank-ready business plans in under 60 minutes with AI-powered guidance.').slice(0, 120)}
      </p>
      <div className="flex flex-col sm:flex-row gap-2 justify-center mb-8">
        <button className="bg-[#FF6B00] text-white px-6 py-2.5 rounded-lg font-bold text-[11px] shadow-lg shadow-orange-200 inline-flex items-center justify-center gap-1.5">
          {getContent('landing.hero.cta_primary') || 'Start Free Trial'}
          <ArrowRight size={12} />
        </button>
        <button className="bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-lg font-semibold text-[11px]">
          {getContent('landing.hero.cta_secondary') || 'View Examples'}
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 text-[9px] text-slate-400">
        <span className="flex items-center gap-1">
          <CheckCircle size={10} className="text-green-500" />
          {getContent('landing.hero.trust_nocard') || 'No credit card required'}
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle size={10} className="text-green-500" />
          {getContent('landing.hero.trust_trial') || '14-day free trial'}
        </span>
      </div>
    </div>
  );

  const renderFeaturesPreview = () => (
    <div className="px-4 py-8 bg-slate-50">
      <div className="text-center mb-6">
        <span className="text-[9px] font-bold uppercase tracking-wider text-[#FF6B00] mb-2 block">
          {getContent('landing.features.badge') || 'How It Works'}
        </span>
        <h2 className="text-lg font-bold text-slate-900 mb-1">
          {getContent('landing.features.title') || 'Three Simple Steps'}
        </h2>
        <p className="text-[10px] text-slate-500">
          {(getContent('landing.features.subtitle') || 'Transform your business idea into a professional plan').slice(0, 60)}...
        </p>
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((step) => (
          <div key={step} className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[#FF6B00] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                {step}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-[11px] mb-0.5">
                  {getContent(`landing.features.step${step}.title`) || `Step ${step}`}
                </h3>
                <p className="text-[9px] text-slate-500 line-clamp-2">
                  {getContent(`landing.features.step${step}.description`) || 'Feature description here...'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderValuePropsPreview = () => (
    <div className="px-4 py-8 bg-white">
      <div className="text-center mb-6">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
          {getContent('landing.valueProps.badge') || 'Why Sqordia'}
        </span>
        <h2 className="text-lg font-bold text-slate-900">
          {getContent('landing.valueProps.title') || 'Everything You Need'}
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B00] to-orange-600 flex items-center justify-center mb-2">
              <CheckCircle size={14} className="text-white" />
            </div>
            <h3 className="font-bold text-slate-900 text-[10px] mb-1">
              {getContent(`landing.valueProps.${i}.title`) || `Value ${i}`}
            </h3>
            <p className="text-[8px] text-slate-500 line-clamp-2">
              {getContent(`landing.valueProps.${i}.description`) || 'Description...'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStatsPreview = () => (
    <div className="px-4 py-6 bg-slate-50">
      <p className="text-center text-[9px] text-slate-400 mb-4">
        {getContent('landing.stats.heading') || 'Trusted by entrepreneurs worldwide'}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {['plans', 'funding', 'countries', 'rating'].map((stat) => (
          <div key={stat} className="text-center">
            <div className="text-base font-bold text-slate-900">
              {getContent(`landing.stats.${stat}.value`) || '0'}
            </div>
            <div className="text-[7px] text-slate-400 uppercase">
              {getContent(`landing.stats.${stat}.label`) || stat}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFaqPreview = () => (
    <div className="px-4 py-8 bg-slate-50">
      <div className="text-center mb-6">
        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 mb-2 block">
          {getContent('landing.faq.badge') || 'FAQ'}
        </span>
        <h2 className="text-lg font-bold text-slate-900">
          {getContent('landing.faq.title') || 'Frequently Asked'}{' '}
          <span className="text-[#FF6B00]">{getContent('landing.faq.title_highlight') || 'Questions'}</span>
        </h2>
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg p-3 border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle size={12} className="text-slate-400" />
                <span className="text-[10px] font-semibold text-slate-900">Question {i}</span>
              </div>
              <ChevronDown size={12} className="text-slate-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTestimonialsPreview = () => (
    <div className="px-4 py-8 bg-white">
      <div className="text-center mb-6">
        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 mb-2 block">
          {getContent('landing.testimonials.badge') || 'Success Stories'}
        </span>
        <h2 className="text-lg font-bold text-slate-900">
          {getContent('landing.testimonials.title') || 'Real Results'}
        </h2>
      </div>
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div className="flex items-center gap-1 mb-2">
              <Quote size={12} className="text-[#FF6B00]" />
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={10} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-[9px] text-slate-600 italic mb-2 line-clamp-2">
              "This is an amazing testimonial quote..."
            </p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-300" />
              <div>
                <div className="text-[9px] font-semibold text-slate-900">Name</div>
                <div className="text-[8px] text-slate-400">Role, Company</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFinalCtaPreview = () => (
    <div className="px-4 py-10 bg-gradient-to-br from-[#FF6B00] to-orange-600 text-center">
      <div className="inline-block px-3 py-1 bg-white/10 text-white rounded-full text-[9px] font-medium mb-4 border border-white/20">
        {getContent('landing.finalCta.badge') || 'Start Free Today'}
      </div>
      <h2 className="text-xl font-bold text-white mb-2">
        {getContent('landing.finalCta.headline') || 'Ready to Build Your Plan?'}
      </h2>
      <p className="text-[10px] text-white/80 mb-4">
        {(getContent('landing.finalCta.subheadline') || 'Join thousands of entrepreneurs').slice(0, 60)}...
      </p>
      <button className="bg-white text-[#FF6B00] px-6 py-2.5 rounded-lg font-bold text-[11px] shadow-lg inline-flex items-center gap-1.5">
        {getContent('landing.finalCta.cta') || 'Get Started Free'}
        <ArrowRight size={12} />
      </button>
    </div>
  );

  const renderDefaultPreview = () => (
    <div className="p-8 text-center bg-slate-50 min-h-[200px] flex flex-col items-center justify-center">
      <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Eye size={24} className="text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-900 mb-1">Preview</p>
      <p className="text-xs text-slate-400">
        Section: {sectionKey.split('.').pop()}
      </p>
    </div>
  );

  const renderPreview = () => {
    const section = sectionKey.toLowerCase();
    if (section.includes('hero')) return renderHeroPreview();
    if (section.includes('features')) return renderFeaturesPreview();
    if (section.includes('valueprops')) return renderValuePropsPreview();
    if (section.includes('stats')) return renderStatsPreview();
    if (section.includes('faq')) return renderFaqPreview();
    if (section.includes('testimonials')) return renderTestimonialsPreview();
    if (section.includes('finalcta') || section.includes('cta')) return renderFinalCtaPreview();
    return renderDefaultPreview();
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Device Frame Renderers
  // ─────────────────────────────────────────────────────────────────────────────

  const renderMobileFrame = () => (
    <div className="relative">
      {/* iPhone 15 Pro Frame */}
      <div className="relative bg-[#1a1a1a] rounded-[3rem] p-[3px] shadow-2xl shadow-black/30">
        {/* Titanium edge effect */}
        <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-[#3a3a3a] via-[#1a1a1a] to-[#2a2a2a]" />

        {/* Inner bezel */}
        <div className="relative bg-black rounded-[2.8rem] p-[10px]">
          {/* Screen */}
          <div
            className="relative bg-white rounded-[2.2rem] overflow-hidden"
            style={{
              width: config.width * config.scale,
              height: config.height * config.scale,
            }}
          >
            {/* Dynamic Island */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
              <div className="w-[90px] h-[28px] bg-black rounded-full flex items-center justify-center gap-2">
                <div className="w-[10px] h-[10px] rounded-full bg-[#1a1a1a] ring-1 ring-[#2a2a2a]" />
              </div>
            </div>

            {/* Status bar */}
            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/5 to-transparent z-10 flex items-end justify-between px-6 pb-1">
              <span className="text-[10px] font-semibold text-slate-900">9:41</span>
              <div className="flex items-center gap-1">
                <div className="flex gap-[2px]">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={cn("w-[3px] rounded-sm", i <= 3 ? "bg-slate-900" : "bg-slate-300")} style={{height: 4 + i * 2}} />
                  ))}
                </div>
                <div className="text-[9px] text-slate-900 ml-1">5G</div>
                <div className="w-6 h-3 rounded-sm bg-slate-900 relative ml-1">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[2px] w-[2px] h-[4px] bg-slate-900 rounded-r-sm" />
                </div>
              </div>
            </div>

            {/* Scaled content */}
            <div
              className="origin-top-left overflow-y-auto overflow-x-hidden pt-12"
              style={{
                width: config.width,
                height: config.height,
                transform: `scale(${config.scale})`,
              }}
            >
              {renderPreview()}
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[120px] h-[4px] bg-black/80 rounded-full" />
          </div>
        </div>

        {/* Side buttons */}
        <div className="absolute left-[-2px] top-[100px] w-[3px] h-[30px] bg-[#2a2a2a] rounded-l-sm" />
        <div className="absolute left-[-2px] top-[150px] w-[3px] h-[55px] bg-[#2a2a2a] rounded-l-sm" />
        <div className="absolute left-[-2px] top-[215px] w-[3px] h-[55px] bg-[#2a2a2a] rounded-l-sm" />
        <div className="absolute right-[-2px] top-[140px] w-[3px] h-[80px] bg-[#2a2a2a] rounded-r-sm" />
      </div>
    </div>
  );

  const renderTabletFrame = () => (
    <div className="relative">
      {/* iPad Pro 11" Frame */}
      <div className="relative bg-[#e4e4e4] rounded-[2rem] p-[2px] shadow-2xl shadow-black/20">
        {/* Aluminum edge */}
        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#f0f0f0] via-[#d0d0d0] to-[#e0e0e0]" />

        {/* Inner bezel */}
        <div className="relative bg-black rounded-[1.9rem] p-[8px]">
          {/* Screen */}
          <div
            className="relative bg-white rounded-[1.2rem] overflow-hidden"
            style={{
              width: config.width * config.scale,
              height: config.height * config.scale,
            }}
          >
            {/* Front camera */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[6px] h-[6px] bg-[#1a1a1a] rounded-full z-20 ring-1 ring-[#2a2a2a]" />

            {/* Status bar */}
            <div className="absolute top-0 left-0 right-0 h-6 bg-white z-10 flex items-center justify-between px-4">
              <span className="text-[10px] font-semibold text-slate-900">9:41</span>
              <div className="flex items-center gap-2">
                <div className="text-[9px] text-slate-900">Wi-Fi</div>
                <div className="w-5 h-2.5 rounded-sm bg-slate-900 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[2px] w-[2px] h-[4px] bg-slate-900 rounded-r-sm" />
                </div>
              </div>
            </div>

            {/* Scaled content */}
            <div
              className="origin-top-left overflow-y-auto overflow-x-hidden pt-6"
              style={{
                width: config.width,
                height: config.height,
                transform: `scale(${config.scale})`,
              }}
            >
              {renderPreview()}
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[100px] h-[4px] bg-black/60 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderDesktopFrame = () => (
    <div className="relative">
      {/* MacBook-style frame */}
      <div className="relative">
        {/* Screen bezel */}
        <div className="bg-[#1a1a1a] rounded-t-xl p-[6px] pb-0">
          {/* Camera notch */}
          <div className="absolute top-[3px] left-1/2 -translate-x-1/2 w-[6px] h-[6px] bg-[#2a2a2a] rounded-full ring-1 ring-[#3a3a3a]" />

          {/* Screen */}
          <div
            className="bg-white rounded-t-lg overflow-hidden"
            style={{
              width: config.width * config.scale,
              height: config.height * config.scale,
            }}
          >
            {/* Browser chrome */}
            <div className="h-8 bg-gradient-to-b from-slate-100 to-slate-50 border-b border-slate-200 flex items-center px-3 gap-3 shrink-0">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-inner" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e] shadow-inner" />
                <div className="w-3 h-3 rounded-full bg-[#28c840] shadow-inner" />
              </div>
              <div className="flex-1 max-w-md mx-auto">
                <div className="bg-white h-5 rounded-md border border-slate-200 text-[9px] text-slate-400 flex items-center justify-center px-3 shadow-inner">
                  <span className="text-slate-300 mr-1">🔒</span>
                  sqordia.app
                </div>
              </div>
              <div className="w-16" />
            </div>

            {/* Scaled content */}
            <div
              className="origin-top-left overflow-y-auto overflow-x-hidden"
              style={{
                width: config.width,
                height: config.height - 32,
                transform: `scale(${config.scale})`,
              }}
            >
              {renderPreview()}
            </div>
          </div>
        </div>

        {/* Bottom chin / hinge */}
        <div className="h-4 bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] rounded-b-sm" />

        {/* Base */}
        <div className="relative">
          <div className="h-3 bg-gradient-to-b from-[#c0c0c0] to-[#a0a0a0] rounded-b-lg mx-[-4px]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-[#888] rounded-b-sm" />
        </div>
      </div>
    </div>
  );

  return (
    <aside className="flex w-full h-full border-l border-border/50 bg-muted/30 flex-col">
      {/* Header */}
      <div className="h-14 border-b border-border/50 flex items-center justify-between px-6 bg-card">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Eye size={14} />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Live Preview
            </span>
          </div>
          {isDraft && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded-md">
              Draft
            </span>
          )}
        </div>

        {/* Device toggle */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
          {[
            { key: 'desktop', icon: Monitor, label: 'Desktop' },
            { key: 'tablet', icon: Tablet, label: 'iPad Pro' },
            { key: 'mobile', icon: Smartphone, label: 'iPhone 15' },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => onDeviceChange(key as PreviewDevice)}
              className={cn(
                'p-2 rounded-md transition-all duration-200',
                device === key
                  ? 'bg-card shadow-sm text-momentum-orange'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title={`${label} preview`}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 p-8 overflow-auto flex items-start justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="relative">
          {device === 'mobile' && renderMobileFrame()}
          {device === 'tablet' && renderTabletFrame()}
          {device === 'desktop' && renderDesktopFrame()}

          {/* Device label */}
          <div className="text-center mt-6">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              {device === 'mobile' && 'iPhone 15 Pro'}
              {device === 'tablet' && 'iPad Pro 11"'}
              {device === 'desktop' && 'MacBook Pro'}
              <span className="text-muted-foreground/50 ml-2">
                {config.width} × {config.height}
              </span>
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
