// Lightweight deterministic hash for mock usage.
// Collisions are possible but acceptable for demo data.
export const generateUserId = (email: string) => {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  // Use unsigned 32-bit int and base 36 for shorter string
  return `user-${(hash >>> 0).toString(36)}`;
};
