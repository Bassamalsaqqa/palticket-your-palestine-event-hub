import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/i18n";
import { useAuth } from "@/contexts";
import { BrandLogo } from "./BrandLogo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, User, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const { language, t, isRTL } = useLanguage();
  const { isAdmin, isStaff } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: t.nav.home, href: `/${language}` },
    { label: t.nav.discover, href: `/${language}/discover` },
    { label: t.nav.about, href: `/${language}/about` },
    { label: t.nav.contact, href: `/${language}/contact` },
  ];

  if (isAdmin) {
    navLinks.push({ label: t.nav.admin, href: `/${language}/admin` });
  }

  if (isStaff) {
    navLinks.push({ label: t.nav.scanner, href: `/${language}/scan` });
  }

  const isActive = (href: string) => {
    if (href === `/${language}`) {
      return location.pathname === href || location.pathname === `/${language}/`;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <BrandLogo />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive(link.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label={t.common.search}>
            <Search className="h-5 w-5" />
          </Button>
          <LanguageSwitcher />
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/${language}/login`}>
              {t.nav.login}
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to={`/${language}/signup`}>
              {t.nav.signup}
            </Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t.common.menu}>
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? "left" : "right"} className="w-80">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <BrandLogo />
                </div>

                <nav className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "px-4 py-3 rounded-lg text-base font-medium transition-colors",
                        isActive(link.href)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <div className="mt-auto pt-8 flex flex-col gap-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={`/${language}/login`} onClick={() => setIsOpen(false)}>
                      <User className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                      {t.nav.login}
                    </Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link to={`/${language}/signup`} onClick={() => setIsOpen(false)}>
                      {t.nav.signup}
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
