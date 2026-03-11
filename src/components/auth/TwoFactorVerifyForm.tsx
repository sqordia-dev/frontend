import { useState, useRef, useEffect, FormEvent } from 'react';
import { Shield, ArrowLeft, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TwoFactorVerifyFormProps {
  onVerify: (code: string) => Promise<void>;
  onCancel: () => void;
  error?: string;
  loading?: boolean;
  language?: string;
}

export default function TwoFactorVerifyForm({
  onVerify,
  onCancel,
  error,
  loading = false,
  language = 'fr',
}: TwoFactorVerifyFormProps) {
  const [code, setCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [useBackupCode]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    await onVerify(code.trim());
  };

  const handleCodeChange = (value: string) => {
    if (useBackupCode) {
      setCode(value);
      return;
    }
    // Only allow digits for TOTP codes
    const digits = value.replace(/\D/g, '').slice(0, 6);
    setCode(digits);

    // Auto-submit when 6 digits entered
    if (digits.length === 6) {
      onVerify(digits);
    }
  };

  const t = {
    title: language === 'fr' ? 'Vérification en deux étapes' : 'Two-Step Verification',
    subtitle: language === 'fr'
      ? 'Entrez le code à 6 chiffres de votre application d\'authentification'
      : 'Enter the 6-digit code from your authenticator app',
    backupSubtitle: language === 'fr'
      ? 'Entrez un de vos codes de secours'
      : 'Enter one of your backup codes',
    codeLabel: language === 'fr' ? 'Code de vérification' : 'Verification code',
    backupLabel: language === 'fr' ? 'Code de secours' : 'Backup code',
    codePlaceholder: '000000',
    backupPlaceholder: language === 'fr' ? 'Entrez votre code de secours' : 'Enter your backup code',
    verify: language === 'fr' ? 'Vérifier' : 'Verify',
    verifying: language === 'fr' ? 'Vérification...' : 'Verifying...',
    useBackup: language === 'fr' ? 'Utiliser un code de secours' : 'Use a backup code',
    useApp: language === 'fr' ? 'Utiliser l\'application' : 'Use authenticator app',
    back: language === 'fr' ? 'Retour à la connexion' : 'Back to login',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-momentum-orange/10">
          <Shield className="h-7 w-7 text-momentum-orange" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">{t.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {useBackupCode ? t.backupSubtitle : t.subtitle}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="2fa-code" className="mb-2 block text-sm font-semibold">
            {useBackupCode ? t.backupLabel : t.codeLabel}
          </Label>
          {useBackupCode ? (
            <Input
              ref={inputRef}
              id="2fa-code"
              type="text"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder={t.backupPlaceholder}
              className="h-12"
              autoComplete="off"
              disabled={loading}
            />
          ) : (
            <Input
              ref={inputRef}
              id="2fa-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder={t.codePlaceholder}
              className="h-14 text-center text-2xl font-mono tracking-[0.5em]"
              autoComplete="one-time-code"
              maxLength={6}
              disabled={loading}
            />
          )}
        </div>

        <Button
          type="submit"
          variant="brand"
          size="lg"
          disabled={loading || !code.trim()}
          className="w-full min-h-[44px]"
        >
          {loading ? t.verifying : t.verify}
        </Button>
      </form>

      {/* Toggle backup code / app */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            setUseBackupCode(!useBackupCode);
            setCode('');
          }}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <KeyRound className="h-4 w-4" />
          {useBackupCode ? t.useApp : t.useBackup}
        </button>
      </div>

      {/* Back to login */}
      <div className="text-center">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </button>
      </div>
    </div>
  );
}
