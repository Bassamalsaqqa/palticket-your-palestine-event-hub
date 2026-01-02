type LocalizedString = { en: string; ar: string };

export const getLocalizedText = (
  textObj: LocalizedString | undefined | null,
  language: "en" | "ar",
  placeholder: string = ""
): string => {
  if (!textObj) return placeholder;
  return textObj[language] || textObj[language === "en" ? "ar" : "en"] || placeholder;
};
