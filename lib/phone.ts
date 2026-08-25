// Mapeo simple de prefijos E.164 -> país. No pretende ser exhaustivo,
// cubre los mercados más comunes para una agencia hispanohablante.
const COUNTRY_PREFIXES: Array<[string, string]> = [
  ["54", "Argentina"],
  ["598", "Uruguay"],
  ["595", "Paraguay"],
  ["591", "Bolivia"],
  ["56", "Chile"],
  ["57", "Colombia"],
  ["51", "Perú"],
  ["593", "Ecuador"],
  ["58", "Venezuela"],
  ["52", "México"],
  ["34", "España"],
  ["1", "Estados Unidos / Canadá"],
  ["55", "Brasil"],
];

export function inferCountry(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // Ordenamos por longitud de prefijo descendente para matchear el más específico primero.
  const sorted = [...COUNTRY_PREFIXES].sort((a, b) => b[0].length - a[0].length);
  const match = sorted.find(([prefix]) => digits.startsWith(prefix));
  return match ? match[1] : "Otro";
}
