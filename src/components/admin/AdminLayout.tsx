import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  ShoppingCart,
  QrCode,
  Users,
  Shield,
  DoorOpen,
  UserCog,
  Download,
  FileText,
  Menu,
  ChevronLeft,
  LogOut,
  Home,
} from "lucide-react";
import { useState } from "react";

export function AdminLayout() {
  const { language, t, isRTL } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // For demo purposes, allow access without real auth
  // In production, you'd check for admin role
  // if (!isAuthenticated) {
  //   return <Navigate to={`/${language}/login`} replace />;
  // }

  const navItems = [
    { id: "dashboard", label: t.admin.dashboard, icon: LayoutDashboard, href: `/${language}/admin` },
    { id: "events", label: t.admin.events, icon: Calendar, href: `/${language}/admin/events` },
    { id: "ticket-types", label: t.admin.ticketTypes, icon: Ticket, href: `/${language}/admin/ticket-types` },
    { id: "orders", label: t.admin.orders, icon: ShoppingCart, href: `/${language}/admin/orders` },
    { id: "tickets", label: t.admin.tickets, icon: QrCode, href: `/${language}/admin/tickets` },
    { id: "users", label: t.admin.users, icon: Users, href: `/${language}/admin/users` },
    { id: "roles", label: t.admin.roles, icon: Shield, href: `/${language}/admin/roles` },
    { id: "gates", label: t.admin.gates, icon: DoorOpen, href: `/${language}/admin/gates` },
    { id: "staff", label: t.admin.staff, icon: UserCog, href: `/${language}/admin/staff` },
    { id: "exports", label: t.admin.exports, icon: Download, href: `/${language}/admin/exports` },
    { id: "audit-logs", label: t.admin.auditLogs, icon: FileText, href: `/${language}/admin/audit-logs` },
  ];

  const isActive = (href: string) => {
    if (href === `/${language}/admin`) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Link to={`/${language}/admin`} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && <span className="font-bold">{t.admin.title}</span>}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180", isRTL && "rotate-180")} />
        </Button>
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </ScrollArea>

      <Separator />

      {/* Footer */}
      <div className="p-4 space-y-2">
        <Link
          to={`/${language}`}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Home className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{t.nav.home}</span>}
        </Link>
        {isAuthenticated && (
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{t.nav.logout}</span>}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex w-full bg-muted/30">
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            "hidden lg:flex flex-col border-r bg-card transition-all duration-300",
            collapsed ? "w-16" : "w-64"
          )}
        >
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side={isRTL ? "right" : "left"} className="w-64 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <header className="sticky top-0 z-40 h-14 border-b bg-card flex items-center justify-between px-4 gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="font-semibold truncate">{t.admin.title}</h1>
            </div>

            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              {user && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
