import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, Copy, Check, AlertTriangle, RefreshCw, QrCode, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../lib/auth-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '../../contexts/ToastContext';

type SetupStep = 'idle' | 'scanning' | 'verifying' | 'backup-codes' | 'done';

interface TwoFactorSettingsProps {
  language?: string;
}

export default function TwoFactorSettings({ language = 'fr' }: TwoFactorSettingsProps) {
  const toast = useToast();
  const [isEnabled, setIsEnabled] = useState(false);
  const [remainingBackupCodes, setRemainingBackupCodes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [setupStep, setSetupStep] = useState<SetupStep>('idle');

  // Setup state
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [manualEntryKey, setManualEntryKey] = useState('');
  const [showManualKey, setShowManualKey] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Backup codes state
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Disable state
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [disableError, setDisableError] = useState('');

  // Regenerate state
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const status = await authService.get2FAStatus();
      setIsEnabled(status.isEnabled);
      setRemainingBackupCodes(status.remainingBackupCodes ?? 0);
    } catch {
      // Silently handle - component shows disabled state
    } finally {
      setLoading(false);
    }
  };

  const handleStartSetup = async () => {
    try {
      const setup = await authService.setup2FA();
      setQrCodeUrl(setup.qrCodeUrl);
      setManualEntryKey(setup.manualEntryKey);
      setSetupStep('scanning');
    } catch (err: any) {
      toast.error(
        language === 'fr' ? 'Erreur' : 'Error',
        err.message || (language === 'fr' ? 'Impossible de configurer la 2FA' : 'Failed to setup 2FA')
      );
    }
  };

  const handleVerifyAndEnable = async () => {
    if (verificationCode.length !== 6) return;
    try {
      setVerifyLoading(true);
      setVerifyError('');
      const result = await authService.enable2FA(verificationCode);
      setBackupCodes(result.backupCodes);
      setSetupStep('backup-codes');
      toast.success(
        language === 'fr' ? '2FA activée' : '2FA Enabled',
        language === 'fr' ? 'L\'authentification à deux facteurs est maintenant active' : 'Two-factor authentication is now active'
      );
    } catch (err: any) {
      setVerifyError(
        err.message || (language === 'fr' ? 'Code invalide. Réessayez.' : 'Invalid code. Please try again.')
      );
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleBackupCodesDone = () => {
    setIsEnabled(true);
    setSetupStep('idle');
    setBackupCodes([]);
    setVerificationCode('');
    setQrCodeUrl('');
    setManualEntryKey('');
    loadStatus();
  };

  const handleDisable = async () => {
    if (disableCode.length < 6) return;
    try {
      setDisableLoading(true);
      setDisableError('');
      await authService.disable2FA(disableCode);
      setIsEnabled(false);
      setShowDisableConfirm(false);
      setDisableCode('');
      setRemainingBackupCodes(0);
      toast.success(
        language === 'fr' ? '2FA désactivée' : '2FA Disabled',
        language === 'fr' ? 'L\'authentification à deux facteurs a été désactivée' : 'Two-factor authentication has been disabled'
      );
    } catch (err: any) {
      setDisableError(
        err.message || (language === 'fr' ? 'Code invalide' : 'Invalid code')
      );
    } finally {
      setDisableLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    try {
      setRegenLoading(true);
      const result = await authService.regenerateBackupCodes();
      setBackupCodes(result.backupCodes);
      setShowRegenConfirm(false);
      setSetupStep('backup-codes');
      toast.success(
        language === 'fr' ? 'Codes régénérés' : 'Codes Regenerated',
        language === 'fr' ? 'Vos nouveaux codes de secours sont prêts' : 'Your new backup codes are ready'
      );
    } catch (err: any) {
      toast.error(language === 'fr' ? 'Erreur' : 'Error', err.message);
    } finally {
      setRegenLoading(false);
    }
  };

  const handleCopyBackupCodes = async () => {
    const text = backupCodes.join('\n');
    await navigator.clipboard.writeText(text);
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const t = {
    title: language === 'fr' ? 'Authentification à deux facteurs' : 'Two-Factor Authentication',
    description: language === 'fr'
      ? 'Ajoutez une couche de sécurité supplémentaire avec une application comme Google Authenticator ou Microsoft Authenticator'
      : 'Add an extra layer of security using an app like Google Authenticator or Microsoft Authenticator',
    enabled: language === 'fr' ? 'Activée' : 'Enabled',
    disabled: language === 'fr' ? 'Désactivée' : 'Disabled',
    enable: language === 'fr' ? 'Activer' : 'Enable',
    disable: language === 'fr' ? 'Désactiver' : 'Disable',
    backupCodesRemaining: language === 'fr' ? 'codes de secours restants' : 'backup codes remaining',
    regenerateCodes: language === 'fr' ? 'Régénérer les codes' : 'Regenerate codes',
    // Setup step: scanning
    scanTitle: language === 'fr' ? 'Scannez le code QR' : 'Scan QR Code',
    scanDesc: language === 'fr'
      ? 'Ouvrez votre application d\'authentification et scannez ce code QR'
      : 'Open your authenticator app and scan this QR code',
    cantScan: language === 'fr' ? 'Impossible de scanner ? Entrez la clé manuellement' : "Can't scan? Enter key manually",
    manualKey: language === 'fr' ? 'Clé manuelle' : 'Manual entry key',
    next: language === 'fr' ? 'Suivant' : 'Next',
    // Setup step: verifying
    verifyTitle: language === 'fr' ? 'Vérification' : 'Verify Setup',
    verifyDesc: language === 'fr'
      ? 'Entrez le code à 6 chiffres affiché dans votre application'
      : 'Enter the 6-digit code shown in your authenticator app',
    verifyPlaceholder: '000000',
    verifyButton: language === 'fr' ? 'Vérifier et activer' : 'Verify & Enable',
    // Backup codes
    backupTitle: language === 'fr' ? 'Codes de secours' : 'Backup Codes',
    backupDesc: language === 'fr'
      ? 'Sauvegardez ces codes dans un endroit sûr. Chaque code ne peut être utilisé qu\'une seule fois.'
      : 'Save these codes in a safe place. Each code can only be used once.',
    backupWarning: language === 'fr'
      ? 'Si vous perdez l\'accès à votre application d\'authentification, ces codes sont votre seul moyen de connexion.'
      : 'If you lose access to your authenticator app, these codes are your only way to log in.',
    copyAll: language === 'fr' ? 'Copier tout' : 'Copy all',
    copied: language === 'fr' ? 'Copié !' : 'Copied!',
    savedCodes: language === 'fr' ? 'J\'ai sauvegardé mes codes' : 'I\'ve saved my codes',
    // Disable confirm
    disableTitle: language === 'fr' ? 'Désactiver la 2FA ?' : 'Disable 2FA?',
    disableDesc: language === 'fr'
      ? 'Entrez un code de votre application d\'authentification pour confirmer.'
      : 'Enter a code from your authenticator app to confirm.',
    confirm: language === 'fr' ? 'Confirmer' : 'Confirm',
    cancel: language === 'fr' ? 'Annuler' : 'Cancel',
    // Regen confirm
    regenTitle: language === 'fr' ? 'Régénérer les codes ?' : 'Regenerate Codes?',
    regenDesc: language === 'fr'
      ? 'Vos anciens codes de secours seront invalidés et remplacés par de nouveaux.'
      : 'Your old backup codes will be invalidated and replaced with new ones.',
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  // ---- Backup codes display (shared between setup and regeneration) ----
  if (setupStep === 'backup-codes') {
    return (
      <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h4 className="text-heading-sm text-strategy-blue dark:text-white">{t.backupTitle}</h4>
            <p className="text-body-sm text-gray-500 dark:text-gray-400 mt-0.5">{t.backupDesc}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          {backupCodes.map((code, i) => (
            <div key={i} className="font-mono text-sm text-center py-1.5 px-2 bg-gray-50 dark:bg-gray-800 rounded">
              {code}
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-300">{t.backupWarning}</p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyBackupCodes}
            className="gap-1.5"
          >
            {copiedCodes ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedCodes ? t.copied : t.copyAll}
          </Button>
          <Button
            variant="brand"
            size="sm"
            onClick={handleBackupCodesDone}
          >
            {t.savedCodes}
          </Button>
        </div>
      </div>
    );
  }

  // ---- Setup step: QR code scanning ----
  if (setupStep === 'scanning') {
    return (
      <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-momentum-orange/10 flex items-center justify-center">
            <QrCode className="w-5 h-5 text-momentum-orange" />
          </div>
          <div>
            <h4 className="text-heading-sm text-strategy-blue dark:text-white">{t.scanTitle}</h4>
            <p className="text-body-sm text-gray-500 dark:text-gray-400 mt-0.5">{t.scanDesc}</p>
          </div>
        </div>

        {/* QR Code rendered client-side (secret never leaves the browser) */}
        <div className="flex justify-center p-4 bg-white rounded-lg">
          <QRCodeSVG
            value={qrCodeUrl}
            size={200}
            level="M"
          />
        </div>

        {/* Manual entry key */}
        <div>
          <button
            type="button"
            onClick={() => setShowManualKey(!showManualKey)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            {showManualKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {t.cantScan}
          </button>
          {showManualKey && (
            <div className="mt-2 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-muted-foreground mb-1">{t.manualKey}</p>
              <p className="font-mono text-sm select-all break-all">{manualEntryKey}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => setSetupStep('idle')}>
            {t.cancel}
          </Button>
          <Button variant="brand" size="sm" onClick={() => setSetupStep('verifying')}>
            {t.next}
          </Button>
        </div>
      </div>
    );
  }

  // ---- Setup step: verify code ----
  if (setupStep === 'verifying') {
    return (
      <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-momentum-orange/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-momentum-orange" />
          </div>
          <div>
            <h4 className="text-heading-sm text-strategy-blue dark:text-white">{t.verifyTitle}</h4>
            <p className="text-body-sm text-gray-500 dark:text-gray-400 mt-0.5">{t.verifyDesc}</p>
          </div>
        </div>

        {verifyError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/20">
            <p className="text-sm text-red-600 dark:text-red-400">{verifyError}</p>
          </div>
        )}

        <div>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder={t.verifyPlaceholder}
            className="h-14 text-center text-2xl font-mono tracking-[0.5em]"
            autoComplete="one-time-code"
            maxLength={6}
            autoFocus
            disabled={verifyLoading}
          />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => setSetupStep('scanning')}>
            {t.cancel}
          </Button>
          <Button
            variant="brand"
            size="sm"
            onClick={handleVerifyAndEnable}
            disabled={verifyLoading || verificationCode.length !== 6}
          >
            {verifyLoading ? '...' : t.verifyButton}
          </Button>
        </div>
      </div>
    );
  }

  // ---- Disable confirmation ----
  if (showDisableConfirm) {
    return (
      <div className="p-5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h4 className="text-heading-sm text-red-700 dark:text-red-300">{t.disableTitle}</h4>
            <p className="text-body-sm text-red-600/70 dark:text-red-400/70 mt-0.5">{t.disableDesc}</p>
          </div>
        </div>
        {disableError && (
          <div className="rounded-lg border border-red-200 bg-red-100 dark:bg-red-900/30 p-3">
            <p className="text-sm text-red-600 dark:text-red-400">{disableError}</p>
          </div>
        )}
        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={disableCode}
          onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          className="h-12 text-center text-xl font-mono tracking-[0.3em]"
          autoComplete="one-time-code"
          maxLength={6}
          autoFocus
          disabled={disableLoading}
        />
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => { setShowDisableConfirm(false); setDisableCode(''); setDisableError(''); }}>
            {t.cancel}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDisable}
            disabled={disableLoading || disableCode.length < 6}
          >
            {disableLoading ? '...' : t.confirm}
          </Button>
        </div>
      </div>
    );
  }

  // ---- Regenerate confirmation ----
  if (showRegenConfirm) {
    return (
      <div className="p-5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h4 className="text-heading-sm text-amber-700 dark:text-amber-300">{t.regenTitle}</h4>
            <p className="text-body-sm text-amber-600/70 dark:text-amber-400/70 mt-0.5">{t.regenDesc}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowRegenConfirm(false)}>
            {t.cancel}
          </Button>
          <Button
            variant="brand"
            size="sm"
            onClick={handleRegenerateBackupCodes}
            disabled={regenLoading}
          >
            {regenLoading ? '...' : t.confirm}
          </Button>
        </div>
      </div>
    );
  }

  // ---- Default: status view ----
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 sm:p-5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isEnabled ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-gray-200 dark:bg-gray-700'}`}>
          <Shield className={`w-5 h-5 ${isEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`} />
        </div>
        <div className="min-w-0">
          <h4 className="text-heading-sm text-strategy-blue dark:text-white">{t.title}</h4>
          <p className="text-body-sm text-gray-500 dark:text-gray-400 mt-1">{t.description}</p>
          <span className={`inline-flex items-center gap-1.5 mt-2 text-label-sm ${isEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-emerald-500' : 'bg-gray-400'}`} />
            {isEnabled ? t.enabled : t.disabled}
          </span>
          {isEnabled && remainingBackupCodes > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {remainingBackupCodes} {t.backupCodesRemaining}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        {isEnabled && (
          <button
            onClick={() => setShowRegenConfirm(true)}
            className="px-3 py-2 text-label-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {t.regenerateCodes}
          </button>
        )}
        <button
          onClick={isEnabled ? () => setShowDisableConfirm(true) : handleStartSetup}
          className={`w-full sm:w-auto px-4 py-2.5 text-label-md rounded-lg border min-h-[44px] transition-colors ${
            isEnabled
              ? 'border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20'
              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          {isEnabled ? t.disable : t.enable}
        </button>
      </div>
    </div>
  );
}
