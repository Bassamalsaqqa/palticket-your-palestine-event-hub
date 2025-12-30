import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      
      setScrollProgress(progress);
      setIsVisible(scrollTop > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Button
      variant="default"
      size="icon"
      className={cn(
        "fixed bottom-6 z-50 h-12 w-12 rounded-full shadow-lg transition-all duration-300",
        "ltr:right-6 rtl:left-6",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-16 opacity-0 pointer-events-none"
      )}
      onClick={scrollToTop}
      aria-label="Back to top"
    >
      <svg className="absolute inset-0 h-full w-full -rotate-90">
        <circle
          className="text-primary-foreground/20"
          strokeWidth="3"
          stroke="currentColor"
          fill="transparent"
          r="20"
          cx="24"
          cy="24"
        />
        <circle
          className="text-primary-foreground transition-all duration-200"
          strokeWidth="3"
          strokeDasharray={125.6}
          strokeDashoffset={125.6 - (scrollProgress / 100) * 125.6}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="20"
          cx="24"
          cy="24"
        />
      </svg>
      <ArrowUp className="h-5 w-5 relative z-10" />
    </Button>
  );
}
