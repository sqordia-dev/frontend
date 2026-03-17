import { useState } from 'react';
import { Sun, Moon, Globe, Calendar, Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';
import { apiClient } from '../../lib/api-client';

const T = {
  en: {
    appearance: 'Appearance',
    appearanceDesc: 'Choose how Sqordia looks to you',
    lightMode: 'Light',
    darkMode: 'Dark',
    language: 'Language',
    languageDesc: 'Select your preferred language',
    english: 'English',
    french: 'Francais',
    dateFormat: 'Date Format',
    dateFormatDesc: 'How dates are displayed throughout the app',
  },
  fr: {
    appearance: 'Apparence',
    appearanceDesc: "Choisissez l'apparence de Sqordia",
    lightMode: 'Clair',
    darkMode: 'Sombre',
    language: 'Langue',
    languageDesc: 'Selectionnez votre langue preferee',
    english: 'English',
    french: 'Francais',
    dateFormat: 'Format de date',
    dateFormatDesc: "Comment les dates sont affichees dans l'application",
  },
};

const DATE_FORMATS = [
  { id: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '17/03/2026' },
  { id: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '03/17/2026' },
  { id: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2026-03-17' },
];

interface OptionCardProps {
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
  desc?: string;
}

function OptionCard({ selected, onClick, icon, label, desc }: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-200',
        selected
          ? 'border-momentum-orange bg-momentum-orange/5 dark:bg-momentum-orange/10 shadow-sm'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm',
      )}
    >
      {icon && <div className={cn('flex-shrink-0', selected ? 'text-momentum-orange' : 'text-gray-400 dark:text-gray-500')}>{icon}</div>}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-semibold', selected ? 'text-momentum-orange' : 'text-gray-800 dark:text-gray-200')}>{label}</p>
        {desc && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>}
      </div>
      {selected && (
        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-momentum-orange flex items-center justify-center">
          <Check size={12} className="text-white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

interface SectionBlockProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  children: React.ReactNode;
}

export function SectionBlock({ icon, title, desc, children }: SectionBlockProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-momentum-orange/10 dark:bg-momentum-orange/15 flex items-center justify-center text-momentum-orange">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
        </div>
      </div>
      <div className="ml-12">{children}</div>
    </div>
  );
}

export default function PreferencesSection() {
  const { theme, toggleTheme, language, setLanguage } = useTheme();
  const t = T[language as keyof typeof T] ?? T.en;

  const [dateFormat, setDateFormat] = useState(() => localStorage.getItem('sqordia_dateFormat') || 'DD/MM/YYYY');

  const persistSetting = (key: string, value: string) => {
    localStorage.setItem(key, value);
    apiClient.post('/api/v1/settings', {
      Key: `User.${key}`,
      Value: value,
      Category: 'User',
      IsPublic: false,
      SettingType: 1,
      DataType: 1,
      Encrypt: false,
      IsCritical: false,
    }).catch(() => {});
  };

  return (
    <div className="space-y-8">
      {/* Appearance */}
      <SectionBlock icon={<Sun size={18} />} title={t.appearance} desc={t.appearanceDesc}>
        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <OptionCard
            selected={theme === 'light'}
            onClick={() => { if (theme !== 'light') toggleTheme(); }}
            icon={<Sun size={18} />}
            label={t.lightMode}
          />
          <OptionCard
            selected={theme === 'dark'}
            onClick={() => { if (theme !== 'dark') toggleTheme(); }}
            icon={<Moon size={18} />}
            label={t.darkMode}
          />
        </div>
      </SectionBlock>

      <hr className="border-gray-200 dark:border-gray-700/50" />

      {/* Language */}
      <SectionBlock icon={<Globe size={18} />} title={t.language} desc={t.languageDesc}>
        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <OptionCard
            selected={language === 'en'}
            onClick={() => setLanguage('en')}
            label={t.english}
            desc="EN"
          />
          <OptionCard
            selected={language === 'fr'}
            onClick={() => setLanguage('fr')}
            label={t.french}
            desc="FR"
          />
        </div>
      </SectionBlock>

      <hr className="border-gray-200 dark:border-gray-700/50" />

      {/* Date Format */}
      <SectionBlock icon={<Calendar size={18} />} title={t.dateFormat} desc={t.dateFormatDesc}>
        <div className="grid grid-cols-3 gap-3 max-w-lg">
          {DATE_FORMATS.map((f) => (
            <OptionCard
              key={f.id}
              selected={dateFormat === f.id}
              onClick={() => { setDateFormat(f.id); persistSetting('sqordia_dateFormat', f.id); }}
              label={f.label}
              desc={f.example}
            />
          ))}
        </div>
      </SectionBlock>
    </div>
  );
}
