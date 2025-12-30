import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n";
import { Facebook, Instagram, Twitter, Youtube, Linkedin } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// TODO: Replace these placeholder URLs with actual social media links
const socialLinks = [
  { icon: Facebook, href: "https://facebook.com/palticket", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com/palticket", label: "Instagram" },
  { icon: Twitter, href: "https://x.com/palticket", label: "X (Twitter)" },
  { icon: Youtube, href: "https://youtube.com/palticket", label: "YouTube" },
  { icon: Linkedin, href: "https://linkedin.com/company/palticket", label: "LinkedIn" },
];

// TikTok icon as component since lucide doesn't have it
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
  );
}

export function Footer() {
  const { language, t } = useLanguage();

  const footerLinks = {
    company: [
      { label: t.footer.about, href: `/${language}/about` },
      { label: t.footer.contact, href: `/${language}/contact` },
      { label: t.footer.becomePartner, href: `/${language}/partner` },
    ],
    support: [
      { label: t.footer.faq, href: `/${language}/faq` },
      { label: t.footer.privacy, href: `/${language}/privacy` },
      { label: t.footer.terms, href: `/${language}/terms` },
    ],
    explore: [
      { label: t.nav.discover, href: `/${language}/discover` },
      { label: t.footer.pastEvents, href: `/${language}/past-events` },
      { label: t.footer.designGuidelines, href: `/${language}/design-guidelines` },
    ],
  };

  return (
    <footer className="border-t bg-card">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2">
            <BrandLogo className="mb-4" />
            <p className="text-muted-foreground mb-6 max-w-sm">
              {t.tagline}
            </p>
            
            {/* Newsletter */}
            <div className="space-y-2">
              <h4 className="font-semibold">{t.footer.newsletter}</h4>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder={t.footer.newsletterPlaceholder}
                  className="max-w-xs"
                />
                <Button variant="default">{t.footer.subscribe}</Button>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4">{t.footer.about}</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold mb-4">{t.footer.faq}</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Explore Links */}
          <div>
            <h4 className="font-semibold mb-4">{t.nav.discover}</h4>
            <ul className="space-y-2">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links & Copyright */}
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-2">
              {t.footer.followUs}:
            </span>
            <div className="flex gap-1">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
              {/* TikTok */}
              <a
                href="https://tiktok.com/@palticket"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {t.appName}. {t.footer.allRightsReserved}
          </p>
        </div>
      </div>
    </footer>
  );
}
