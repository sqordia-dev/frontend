import * as React from "react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Plus,
  User,
  CreditCard,
  Shield,
  LogOut,
  Settings,
  Receipt,
  Sun,
  Moon,
  ChevronDown,
  Check,
  PanelLeftClose,
  PanelLeft,
  Rocket,
  Briefcase,
  Heart,
  Brain,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import CA from "country-flag-icons/react/3x2/CA";

// ── Flag components ─────────────────────────────────────────────────────────
const QuebecFlag = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <img
    src="/quebec-flag.svg"
    alt="Quebec Flag"
    width={size}
    height={size * 0.67}
    className={className}
    style={{ objectFit: "contain", display: "block" }}
  />
);

const FlagIcon = ({
  FlagComponent,
  size = 20,
}: {
  FlagComponent: React.ComponentType<React.SVGProps<SVGSVGElement>> | typeof QuebecFlag;
  size?: number;
}) => (
  <div className="inline-block leading-[0]" style={{ width: size, height: size * 0.67 }}>
    <FlagComponent className="block w-full h-full" />
  </div>
);

// ── Persona configuration ───────────────────────────────────────────────────
const PERSONA_CONFIG: Record<
  string,
  { icon: React.ElementType; colorCls: string; bgCls: string; label: string; labelFr: string }
> = {
  Entrepreneur: {
    icon: Rocket,
    colorCls: "text-momentum-orange",
    bgCls: "bg-momentum-orange/10",
    label: "Entrepreneur",
    labelFr: "Entrepreneur",
  },
  Consultant: {
    icon: Briefcase,
    colorCls: "text-strategy-blue",
    bgCls: "bg-strategy-blue/10",
    label: "Consultant",
    labelFr: "Consultant",
  },
  OBNL: {
    icon: Heart,
    colorCls: "text-emerald-600 dark:text-emerald-400",
    bgCls: "bg-emerald-500/10",
    label: "NPO",
    labelFr: "OBNL",
  },
};

// ── Persona badge ───────────────────────────────────────────────────────────
const PersonaBadge = ({
  persona,
  compact,
  language = "en",
}: {
  persona?: string | null;
  compact?: boolean;
  language?: string;
}) => {
  if (!persona) return null;
  const cfg = PERSONA_CONFIG[persona];
  if (!cfg) return null;
  const Icon = cfg.icon;
  const label = language === "fr" ? cfg.labelFr : cfg.label;

  if (compact) {
    return (
      <div
        className={cn("flex items-center justify-center w-6 h-6 rounded-md", cfg.bgCls, cfg.colorCls)}
        title={label}
      >
        <Icon size={12} />
      </div>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium",
        cfg.bgCls,
        cfg.colorCls
      )}
    >
      <Icon size={10} />
      {label}
    </span>
  );
};

// ── Language options ───────────────────────────────────────────────────────
const LANGUAGES = [
  { code: "en" as const, label: "English", displayCode: "EN", FlagComponent: CA },
  { code: "fr" as const, label: "Français", displayCode: "FR", FlagComponent: QuebecFlag },
];

// ── Types ───────────────────────────────────────────────────────────────────
export interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  accent?: boolean;
}

export interface AppSidebarUser {
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePictureUrl?: string | null;
  persona?: string | null;
  roles?: string[];
}

export interface AppSidebarProps {
  /** Navigation items for main menu */
  navigation?: NavItem[];
  /** Navigation items for admin section (shown only for admins) */
  adminNavigation?: NavItem[];
  /** Current user data */
  user?: AppSidebarUser | null;
  /** Callback when profile image fails to load */
  onProfileImageError?: () => void;
  /** Whether profile image has errored */
  profileImageError?: boolean;
  /** Callback when user logs out */
  onLogout?: () => void;
  /** Translation function for labels */
  t?: (key: string) => string;
  /** Current language code */
  language?: "en" | "fr";
  /** Callback to change language */
  onLanguageChange?: (lang: "en" | "fr") => void;
  /** Current theme */
  theme?: "light" | "dark";
  /** Callback to toggle theme */
  onThemeToggle?: () => void;
  /** Brand name displayed in header */
  brandName?: string;
  /** Additional CSS classes */
  className?: string;
}

// ── Default navigation ───────────────────────────────────────────────────────
const defaultNavigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Create Plan", href: "/create-plan", icon: Plus, accent: true },
  { name: "Subscription", href: "/subscription", icon: CreditCard },
  { name: "Invoices", href: "/invoices", icon: Receipt },
  { name: "Settings", href: "/profile", icon: Settings },
];

const defaultAdminNavigation: NavItem[] = [
  { name: "Admin Panel", href: "/admin", icon: Shield },
];

// ── Default translation function ───────────────────────────────────────────
const defaultT = (key: string): string => {
  const translations: Record<string, string> = {
    "nav.mainMenu": "Main Menu",
    "nav.admin": "Administration",
    "nav.darkMode": "Dark Mode",
    "nav.lightMode": "Light Mode",
    "nav.logout": "Logout",
  };
  return translations[key] || key;
};

// ── Main component ─────────────────────────────────────────────────────────
export function AppSidebar({
  navigation = defaultNavigation,
  adminNavigation = defaultAdminNavigation,
  user,
  onProfileImageError,
  profileImageError = false,
  onLogout,
  t = defaultT,
  language = "en",
  onLanguageChange,
  theme = "light",
  onThemeToggle,
  brandName = "Sqordia",
  className,
}: AppSidebarProps) {
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isLangOpen, setIsLangOpen] = useState(false);

  // Close language dropdown when clicking outside
  useEffect(() => {
    if (!isLangOpen) return;
    const close = (e: MouseEvent) => {
      if (!(e.target as Element).closest(".lang-sel")) setIsLangOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [isLangOpen]);

  const currentLang = LANGUAGES.find((l) => l.code === language);
  const isAdmin = user?.roles?.includes("Admin");

  const isActive = (href: string, index: number, items: { href: string }[]) => {
    if (href === "/dashboard") return location.pathname === "/dashboard";
    if (!location.pathname.startsWith(href)) return false;
    return items.findIndex((n) => n.href === href) === index;
  };

  return (
    <Sidebar collapsible="icon" className={cn("border-r-0", className)}>
      {/* Header / Logo */}
      <SidebarHeader className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="hover:bg-transparent group"
              tooltip={brandName}
            >
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-strategy-blue text-white shadow-md transition-transform duration-200 group-hover:scale-105 shrink-0">
                  <Brain className="h-5 w-5" />
                </div>
                {!isCollapsed && (
                  <span className="text-base font-bold tracking-tight font-heading">
                    {brandName}
                  </span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Main navigation */}
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-3">
              {t("nav.mainMenu")}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navigation.map((item, idx) => {
                const Icon = item.icon;
                const active = isActive(item.href, idx, navigation);
                const isAccent = item.accent;
                return (
                  <SidebarMenuItem key={`${item.href}-${idx}`}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.name}
                      className={cn(
                        "h-10 rounded-lg font-medium transition-all duration-150",
                        active && "bg-primary/10 text-primary font-semibold",
                        !active && "hover:bg-muted/80",
                        isAccent && !active && "text-momentum-orange hover:bg-momentum-orange/10"
                      )}
                    >
                      <Link to={item.href} className="flex items-center gap-3">
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            active && "text-primary",
                            isAccent && !active && "text-momentum-orange"
                          )}
                        />
                        <span>{item.name}</span>
                        {active && (
                          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin navigation */}
        {isAdmin && adminNavigation.length > 0 && (
          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-3">
                {t("nav.admin")}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {adminNavigation.map((item, idx) => {
                  const Icon = item.icon;
                  const active = isActive(item.href, idx, adminNavigation);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.name}
                        className={cn(
                          "h-10 rounded-lg font-medium transition-all duration-150",
                          active && "bg-primary/10 text-primary font-semibold",
                          !active && "hover:bg-muted/80"
                        )}
                      >
                        <Link to={item.href} className="flex items-center gap-3">
                          <Icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
                          <span>{item.name}</span>
                          {active && (
                            <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer: User Profile, Language, Theme, Collapse, Logout */}
      <SidebarFooter className="p-2 border-t border-border/50">
        {/* User Profile Card */}
        {user && (
          <div className="mb-2">
            {!isCollapsed ? (
              <Link
                to="/profile"
                className={cn(
                  "block rounded-xl p-3 transition-colors",
                  "bg-muted/50 hover:bg-muted/70"
                )}
              >
                <div className="flex items-center gap-3">
                  {user.profilePictureUrl && !profileImageError ? (
                    <img
                      src={user.profilePictureUrl}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="h-10 w-10 rounded-lg object-cover ring-2 ring-background shrink-0"
                      onError={onProfileImageError}
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-strategy-blue/20 to-strategy-blue/5 text-strategy-blue shrink-0">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                {user.persona && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <PersonaBadge persona={user.persona} language={language} />
                  </div>
                )}
              </Link>
            ) : (
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={`${user.firstName} ${user.lastName}`}>
                    <Link to="/profile">
                      {user.profilePictureUrl && !profileImageError ? (
                        <img
                          src={user.profilePictureUrl}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="h-6 w-6 rounded-md object-cover"
                          onError={onProfileImageError}
                        />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            )}
          </div>
        )}

        <SidebarMenu className="gap-1">
          {/* Language selector */}
          {onLanguageChange && (
            <SidebarMenuItem>
              <div className="relative lang-sel">
                <SidebarMenuButton
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  tooltip={currentLang?.label || "Language"}
                  className="h-10 rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <div className="flex h-5 w-7 items-center justify-center rounded overflow-hidden border border-border/50 shrink-0">
                    {currentLang?.FlagComponent && (
                      <FlagIcon FlagComponent={currentLang.FlagComponent} size={28} />
                    )}
                  </div>
                  <span className="flex-1 text-left text-sm">{currentLang?.label}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform duration-200",
                      isLangOpen && "rotate-180"
                    )}
                  />
                </SidebarMenuButton>

                {isLangOpen && !isCollapsed && (
                  <div className="absolute bottom-full left-0 right-0 mb-1.5 bg-popover border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          onLanguageChange(lang.code);
                          setIsLangOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                          language === lang.code
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        <div className="flex h-4 w-6 items-center justify-center rounded-sm overflow-hidden border border-border/30 shrink-0">
                          <FlagIcon FlagComponent={lang.FlagComponent} size={24} />
                        </div>
                        <span className="flex-1 text-left">{lang.label}</span>
                        {language === lang.code && <Check className="h-4 w-4 text-primary" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </SidebarMenuItem>
          )}

          {/* Theme toggle */}
          {onThemeToggle && (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={onThemeToggle}
                tooltip={theme === "light" ? t("nav.darkMode") : t("nav.lightMode")}
                className="h-10 rounded-lg hover:bg-muted/80 transition-colors"
              >
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-md transition-colors",
                    theme === "light"
                      ? "bg-slate-900/10 text-slate-700"
                      : "bg-amber-500/10 text-amber-500"
                  )}
                >
                  {theme === "light" ? (
                    <Moon className="h-3.5 w-3.5" />
                  ) : (
                    <Sun className="h-3.5 w-3.5" />
                  )}
                </div>
                <span className="text-sm">
                  {theme === "light" ? t("nav.darkMode") : t("nav.lightMode")}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          <SidebarSeparator className="my-1" />

          {/* Collapse Toggle */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleSidebar}
              tooltip={isCollapsed ? "Expand" : "Collapse"}
              className="h-10 rounded-lg hover:bg-muted/80 transition-colors"
            >
              {isCollapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
              <span className="text-sm">{isCollapsed ? "Expand" : "Collapse"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Logout */}
          {onLogout && (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={onLogout}
                tooltip={t("nav.logout")}
                className="h-10 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">{t("nav.logout")}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export default AppSidebar;
