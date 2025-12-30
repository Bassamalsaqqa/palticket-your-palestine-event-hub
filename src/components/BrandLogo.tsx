import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n";

export function BrandLogo({ className = "" }: { className?: string }) {
  const { language, t } = useLanguage();

  return (
    <Link
      to={`/${language}`}
      className={`flex items-center gap-2 transition-opacity hover:opacity-80 ${className}`}
    >
      {/* Logo placeholder - replace with actual logo */}
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xl">
        P
      </div>
      <span className="text-xl font-bold text-foreground">
        {t.appName}
      </span>
    </Link>
  );
}
