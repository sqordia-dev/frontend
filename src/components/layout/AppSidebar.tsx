import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Plus,
  User,
  CreditCard,
  Shield,
  LogOut,
  Settings,
  Receipt,
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

export interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

export interface AppSidebarProps {
  navigation?: NavItem[];
  adminNavigation?: NavItem[];
  user?: {
    name?: string;
    email?: string;
    avatarUrl?: string;
    isAdmin?: boolean;
    persona?: string;
  };
  onLogout?: () => void;
  translations?: {
    mainMenu?: string;
    admin?: string;
    logout?: string;
  };
  brandName?: string;
  className?: string;
}

const defaultNavigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Create Plan", href: "/create-plan", icon: Plus },
  { name: "My Plans", href: "/plans", icon: FileText },
  { name: "Subscription", href: "/subscription", icon: CreditCard },
  { name: "Invoices", href: "/invoices", icon: Receipt },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
];

const defaultAdminNavigation: NavItem[] = [
  { name: "Admin Panel", href: "/admin", icon: Shield },
];

export function AppSidebar({
  navigation = defaultNavigation,
  adminNavigation = defaultAdminNavigation,
  user,
  onLogout,
  translations,
  brandName = "Sqordia",
  className,
}: AppSidebarProps) {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <Sidebar collapsible="icon" className={className}>
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Brain className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{brandName}</span>
                  {user?.persona && (
                    <span className="truncate text-xs text-muted-foreground">
                      {user.persona}
                    </span>
                  )}
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {translations?.mainMenu || "Main Menu"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.name}
                    >
                      <Link to={item.href}>
                        <Icon className="size-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.isAdmin && adminNavigation.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>
                {translations?.admin || "Administration"}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminNavigation.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={item.name}
                        >
                          <Link to={item.href}>
                            <Icon className="size-4" />
                            <span>{item.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          {user && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                size="lg"
                className="cursor-default hover:bg-transparent"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex items-center justify-center rounded-lg bg-muted font-medium text-muted-foreground",
                      isCollapsed ? "size-8 text-xs" : "size-10 text-sm"
                    )}
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name || "User"}
                        className="size-full rounded-lg object-cover"
                      />
                    ) : (
                      <span>
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user.name || "User"}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  )}
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {onLogout && (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={onLogout}
                tooltip={translations?.logout || "Logout"}
              >
                <LogOut className="size-4" />
                <span>{translations?.logout || "Logout"}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
