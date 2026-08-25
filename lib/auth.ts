export const ALLOWED_EMAIL_DOMAINS = ["zokkia.com", "gmail.com", "hotmail.com.ar"];

export function isEmailAllowed(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1];
  if (!domain) return false;
  return ALLOWED_EMAIL_DOMAINS.includes(domain);
}
