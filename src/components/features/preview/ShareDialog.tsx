import * as React from "react";
import {
  Link2,
  Mail,
  Copy,
  Check,
  Loader2,
  Globe,
  Lock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type ShareVisibility = "private" | "link" | "public";

interface ShareSettings {
  visibility: ShareVisibility;
  shareUrl?: string;
  allowComments?: boolean;
  allowDownload?: boolean;
  expiresAt?: Date;
}

interface ShareDialogProps {
  planTitle?: string;
  currentSettings?: ShareSettings;
  onShare: (settings: ShareSettings) => Promise<{ shareUrl: string }>;
  onCopyLink?: (url: string) => void;
  onSendEmail?: (email: string, message?: string) => Promise<void>;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  translations?: {
    title?: string;
    description?: string;
    visibility?: string;
    private?: string;
    privateDesc?: string;
    link?: string;
    linkDesc?: string;
    public?: string;
    publicDesc?: string;
    shareLink?: string;
    copyLink?: string;
    copied?: string;
    sendEmail?: string;
    emailPlaceholder?: string;
    send?: string;
    sending?: string;
    done?: string;
  };
}

export function ShareDialog({
  planTitle,
  currentSettings,
  onShare,
  onCopyLink,
  onSendEmail,
  trigger,
  open,
  onOpenChange,
  translations,
}: ShareDialogProps) {
  const [visibility, setVisibility] = React.useState<ShareVisibility>(
    currentSettings?.visibility || "private"
  );
  const [shareUrl, setShareUrl] = React.useState(currentSettings?.shareUrl || "");
  const [isCopied, setIsCopied] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [isSendingEmail, setIsSendingEmail] = React.useState(false);

  const handleVisibilityChange = async (newVisibility: ShareVisibility) => {
    setVisibility(newVisibility);

    if (newVisibility !== "private" && !shareUrl) {
      // Generate share link
      setIsGenerating(true);
      try {
        const result = await onShare({ visibility: newVisibility });
        setShareUrl(result.shareUrl);
      } catch (error) {
        console.error("Failed to generate share link:", error);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      onCopyLink?.(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const handleSendEmail = async () => {
    if (!email || !onSendEmail) return;

    setIsSendingEmail(true);
    try {
      await onSendEmail(email);
      setEmail("");
    } catch (error) {
      console.error("Failed to send email:", error);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const visibilityOptions = [
    {
      value: "private" as const,
      icon: <Lock className="h-4 w-4" />,
      label: translations?.private || "Private",
      description:
        translations?.privateDesc || "Only you can view this plan",
    },
    {
      value: "link" as const,
      icon: <Link2 className="h-4 w-4" />,
      label: translations?.link || "Anyone with link",
      description:
        translations?.linkDesc || "Anyone with the link can view",
    },
    {
      value: "public" as const,
      icon: <Globe className="h-4 w-4" />,
      label: translations?.public || "Public",
      description:
        translations?.publicDesc || "Visible to everyone",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{translations?.title || "Share Business Plan"}</DialogTitle>
          <DialogDescription>
            {planTitle
              ? `Share "${planTitle}" with others.`
              : translations?.description ||
                "Control who can view your business plan."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Visibility Settings */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              {translations?.visibility || "Who can access"}
            </Label>
            <RadioGroup
              value={visibility}
              onValueChange={(value) =>
                handleVisibilityChange(value as ShareVisibility)
              }
              className="gap-2"
            >
              {visibilityOptions.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={option.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    visibility === option.value && "border-primary bg-accent"
                  )}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <div className="text-muted-foreground">{option.icon}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Share Link (only shown when not private) */}
          {visibility !== "private" && (
            <>
              <Separator />

              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  {translations?.shareLink || "Share link"}
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    placeholder={isGenerating ? "Generating link..." : ""}
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    disabled={!shareUrl || isGenerating}
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {isCopied
                        ? translations?.copied || "Copied"
                        : translations?.copyLink || "Copy link"}
                    </span>
                  </Button>
                </div>
              </div>

              {/* Email Invite */}
              {onSendEmail && (
                <>
                  <Separator />

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      {translations?.sendEmail || "Send via email"}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={
                          translations?.emailPlaceholder ||
                          "colleague@example.com"
                        }
                      />
                      <Button
                        onClick={handleSendEmail}
                        disabled={!email || isSendingEmail}
                      >
                        {isSendingEmail ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {translations?.sending || "Sending..."}
                          </>
                        ) : (
                          <>
                            <Mail className="mr-2 h-4 w-4" />
                            {translations?.send || "Send"}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange?.(false)}>
            {translations?.done || "Done"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Simple share button with copy functionality
interface ShareButtonProps {
  shareUrl: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ShareButton({
  shareUrl,
  variant = "outline",
  size = "default",
  className,
}: ShareButtonProps) {
  const [isCopied, setIsCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={className}
    >
      {isCopied ? (
        <>
          <Check className="mr-2 h-4 w-4 text-green-600" />
          Copied!
        </>
      ) : (
        <>
          <Link2 className="mr-2 h-4 w-4" />
          Share
        </>
      )}
    </Button>
  );
}
