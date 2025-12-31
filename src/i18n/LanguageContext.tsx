import React, { useState, useEffect, ReactNode } from "react";
import { translations, Language } from "./translations";
import { LanguageContext, LanguageContextType } from "./language-core";

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("palticket-language");
    if (saved === "en" || saved === "ar") {
      return saved;
    }
    // Check browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith("ar")) {
      return "ar";
    }
    return "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("palticket-language", lang);
  };

  useEffect(() => {
    // Update document direction and lang
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
    
    // Update meta theme-color based on theme
    const themeColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--background")
      .trim();
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", `hsl(${themeColor})`);
    }
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
    dir: language === "ar" ? "rtl" : "ltr",
    isRTL: language === "ar",
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}