import { Resend } from "resend";

// Resend es opcional: si no está configurado, las funciones de este archivo
// no hacen nada en vez de romper el webhook o los crons.
function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getNotifyEmails(): string[] {
  const raw = process.env.NOTIFY_EMAIL ?? "";
  return raw
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

export async function sendHotLeadAlert(params: {
  contactName: string | null;
  phone: string;
  reason: string;
}) {
  const to = getNotifyEmails();
  const resend = getResend();
  if (to.length === 0 || !resend) return;

  await resend.emails.send({
    from: "ZOKKIA CRM <onboarding@resend.dev>",
    to,
    subject: `🔥 Lead HOT: ${params.contactName ?? params.phone}`,
    html: `
      <p><strong>Contacto:</strong> ${params.contactName ?? "Sin nombre"} (${params.phone})</p>
      <p><strong>Motivo:</strong> ${params.reason}</p>
      <p>Revisá la conversación en el panel de administración.</p>
    `,
  });
}

export async function sendDailyDigest(params: {
  hot: Array<{ name: string | null; phone: string; reason: string }>;
  warm: Array<{ name: string | null; phone: string; reason: string }>;
  cold: Array<{ name: string | null; phone: string; reason: string }>;
}) {
  const to = getNotifyEmails();
  const resend = getResend();
  if (to.length === 0 || !resend) return;

  const renderGroup = (title: string, items: typeof params.hot) => {
    if (items.length === 0) return "";
    const rows = items
      .map((i) => `<li>${i.name ?? "Sin nombre"} (${i.phone}) — ${i.reason}</li>`)
      .join("");
    return `<h3>${title} (${items.length})</h3><ul>${rows}</ul>`;
  };

  await resend.emails.send({
    from: "ZOKKIA CRM <onboarding@resend.dev>",
    to,
    subject: `Resumen diario de leads — ${new Date().toLocaleDateString("es-AR")}`,
    html: `
      ${renderGroup("🔥 Hot", params.hot)}
      ${renderGroup("🟡 Warm", params.warm)}
      ${renderGroup("🔵 Cold", params.cold)}
      ${params.hot.length + params.warm.length + params.cold.length === 0 ? "<p>No hubo leads calificados hoy.</p>" : ""}
    `,
  });
}
