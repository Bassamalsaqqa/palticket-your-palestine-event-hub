export function getCurrencySymbol(code: string): string {
  const symbols: Record<string, string> = {
    ILS: '\u20AA',
    USD: '$',
    EUR: '\u20AC',
    GBP: '\u00A3',
  };

  return symbols[code.toUpperCase()] || code;
}
