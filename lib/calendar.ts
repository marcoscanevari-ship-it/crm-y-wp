import { toZonedTime, fromZonedTime } from "date-fns-tz";

const ARGENTINA_TZ = "America/Argentina/Buenos_Aires";
const BUSINESS_HOUR_START = 9;
const BUSINESS_HOUR_END = 17;
const SLOT_MINUTES = 30;
const DAYS_AHEAD = 7;
const MAX_SLOTS = 5;

export interface AvailableSlot {
  start: Date;
  end: Date;
  label: string;
}

// Integración con Outlook 365 (Microsoft Graph) opcional: si no están configuradas
// las credenciales de la app de Azure AD, estas funciones devuelven null en vez de
// romper el webhook o el chat de prueba.
function getGraphConfig() {
  const tenantId = process.env.MS_TENANT_ID;
  const clientId = process.env.MS_CLIENT_ID;
  const clientSecret = process.env.MS_CLIENT_SECRET;
  const calendarUser = process.env.MS_CALENDAR_USER_EMAIL;
  if (!tenantId || !clientId || !clientSecret || !calendarUser) return null;
  return { tenantId, clientId, clientSecret, calendarUser };
}

async function getAccessToken(config: NonNullable<ReturnType<typeof getGraphConfig>>) {
  const res = await fetch(
    `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Error obteniendo token de Microsoft Graph: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

/**
 * Busca los próximos horarios libres en el calendario de Outlook 365 configurado,
 * dentro de la ventana de 9:00 a 17:00, de lunes a viernes (hora Argentina).
 * Devuelve null si la integración no está configurada.
 */
export async function getAvailableSlots(): Promise<AvailableSlot[] | null> {
  const config = getGraphConfig();
  if (!config) return null;

  const token = await getAccessToken(config);

  const now = new Date();
  const windowEnd = new Date(now.getTime() + DAYS_AHEAD * 24 * 60 * 60 * 1000);

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(config.calendarUser)}/calendarView` +
      `?startDateTime=${now.toISOString()}&endDateTime=${windowEnd.toISOString()}&$select=start,end&$top=100`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Prefer: `outlook.timezone="${ARGENTINA_TZ}"`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Error consultando el calendario de Outlook: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const busy: Array<{ start: Date; end: Date }> = (data.value ?? []).map((e: {
    start: { dateTime: string };
    end: { dateTime: string };
  }) => ({
    start: fromZonedTime(e.start.dateTime, ARGENTINA_TZ),
    end: fromZonedTime(e.end.dateTime, ARGENTINA_TZ),
  }));

  const slots: AvailableSlot[] = [];
  const cursor = new Date(now);

  for (let day = 0; day < DAYS_AHEAD && slots.length < MAX_SLOTS; day++) {
    const zonedDay = toZonedTime(new Date(cursor.getTime() + day * 24 * 60 * 60 * 1000), ARGENTINA_TZ);
    const weekday = zonedDay.getDay(); // 0 = domingo, 6 = sábado
    if (weekday === 0 || weekday === 6) continue;

    for (let hour = BUSINESS_HOUR_START; hour < BUSINESS_HOUR_END; hour += SLOT_MINUTES / 60) {
      if (slots.length >= MAX_SLOTS) break;

      const slotStartLocal = new Date(zonedDay);
      slotStartLocal.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);
      const slotStart = fromZonedTime(slotStartLocal, ARGENTINA_TZ);
      const slotEnd = new Date(slotStart.getTime() + SLOT_MINUTES * 60 * 1000);

      if (slotStart <= now) continue;

      const overlaps = busy.some((b) => slotStart < b.end && slotEnd > b.start);
      if (overlaps) continue;

      slots.push({
        start: slotStart,
        end: slotEnd,
        label: slotStart.toLocaleString("es-AR", {
          timeZone: ARGENTINA_TZ,
          weekday: "long",
          day: "2-digit",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }
  }

  return slots;
}

/**
 * Texto listo para inyectar en el system prompt con los próximos horarios libres,
 * o null si la integración no está configurada o no hay horarios disponibles.
 */
export async function getAvailabilityContext(): Promise<string | null> {
  try {
    const slots = await getAvailableSlots();
    if (!slots || slots.length === 0) return null;
    const list = slots.map((s) => `- ${s.label} hs (Argentina)`).join("\n");
    return `\n\n# DISPONIBILIDAD REAL DEL EQUIPO (usá estos horarios si el visitante quiere agendar una reunión, proponé 2 o 3 opciones concretas de esta lista, nunca inventes otros horarios)\n${list}`;
  } catch (err) {
    console.error("Error obteniendo disponibilidad de Outlook 365:", err);
    return null;
  }
}
