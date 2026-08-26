export const ALLOWED_EMAIL_DOMAINS = ["zokkia.com"];

// Emails con rol admin por defecto la primera vez que se les crea el perfil.
// El resto de los emails @zokkia.com arrancan como "operador".
export const ADMIN_EMAILS = ["mcanevari@zokkia.com", "jmgil@zokkia.com", "agil@zokkia.com"];

export function isEmailAllowed(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1];
  if (!domain) return false;
  return ALLOWED_EMAIL_DOMAINS.includes(domain);
}
