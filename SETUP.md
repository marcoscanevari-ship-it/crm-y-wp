# ZOKKIA CRM — Puesta en marcha

CRM de WhatsApp con agente IA (Zokky), calificación automática de leads y follow-up automático.
Stack: Next.js 16 (App Router) + Supabase + WhatsApp Business API (Meta) + OpenRouter (DeepSeek) + Resend + Vercel.
(Microsoft Graph / Outlook 365 es opcional, para que Zokky proponga horarios — ver sección 5.)

## 0. Requisitos locales

- Node.js 20+ y npm
- `npm install` para instalar dependencias (si hay conflictos de peer dependencies, probá `npm install --legacy-peer-deps`)
- Este proyecto se generó sin correr `npm install` ni `npm run build` (no había Node disponible en el entorno de generación) — hacelo vos como primer paso antes de tocar nada más.

## 1. Meta Developers — WhatsApp Business API

1. https://developers.facebook.com → **Mis apps** → **Crear app** → tipo **Business**.
2. En el dashboard de la app → **Agregar producto** → **WhatsApp** → Configurar.
3. **WhatsApp → Configuración de la API**: agregá/usá un número, copiá el **Phone Number ID** → `WHATSAPP_PHONE_NUMBER_ID`.
4. Access token:
   - Pruebas: token temporal (24h) desde la misma pantalla.
   - Producción: **business.facebook.com → Configuración del negocio → Usuarios del sistema** → crear usuario admin → asignar la app → generar token con permisos `whatsapp_business_messaging` y `whatsapp_business_management` (no expira) → `WHATSAPP_ACCESS_TOKEN`.
5. **Webhook** (después de deployar en Vercel):
   - URL: `https://tu-app.vercel.app/api/webhook`
   - Verify token: cualquier string secreto → `WHATSAPP_VERIFY_TOKEN`
   - Suscribirse a: `messages`, `message_deliveries`, `message_reads`.
6. Pasar la app a modo **Activo** y solicitar el permiso `whatsapp_business_messaging` para producción. En modo desarrollo solo responden los números agregados como testers.

## 2. Supabase

1. https://supabase.com → nuevo proyecto.
2. Guardar **Project URL** (`SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`), **anon key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) y **service_role key** (`SUPABASE_SERVICE_ROLE_KEY`).
3. **SQL Editor** → correr el contenido completo de `supabase/schema.sql` (crea tablas, índices, RLS y el system prompt inicial de Zokky).
4. **Authentication → Providers**: habilitar **Email** (magic link).
5. **Authentication → URL Configuration**:
   - Site URL: `https://tu-app.vercel.app`
   - Redirect URLs: `https://tu-app.vercel.app/api/auth/callback`
6. El acceso al panel está restringido por dominio de email en `lib/auth.ts` (`ALLOWED_EMAIL_DOMAINS`). Por defecto: `zokkia.com`, `gmail.com`, `hotmail.com.ar`. Ajustalo ahí si hace falta.

   > Nota de seguridad: la restricción de dominio se aplica en la app (antes de enviar el magic link) y en el middleware. Supabase Auth en sí no restringe dominios, así que si necesitás una barrera a nivel de base de datos también, considerá un Auth Hook de Supabase (plan Team) o revisar los logs de auth periódicamente.

## 3. OpenRouter (DeepSeek)

1. https://openrouter.ai → crear cuenta.
2. **Keys** → crear API key → `OPENROUTER_API_KEY`.
3. El sistema usa `deepseek/deepseek-chat-v3-0324` (`lib/ai.ts`, `lib/qualify.ts`).

## 4. Resend (emails) — activo

`lib/email.ts` usa Resend para las alertas de leads hot y el digest diario. Si `RESEND_API_KEY` no está
cargada, las funciones no hacen nada (no rompen el webhook ni el cron `/api/cron/notify`), así que podés
deployar sin esto y activarlo después.

1. https://resend.com → crear cuenta, verificar tu dominio de envío (o usar el sandbox `onboarding@resend.dev` para pruebas).
2. **API Keys** → crear key → `RESEND_API_KEY`.
3. Definí `NOTIFY_EMAIL` con el/los emails que reciben alertas de leads hot y el digest diario (separados por coma).
4. Ajustá el remitente `from` en `lib/email.ts` una vez que tengas el dominio verificado en Resend.

## 5. Microsoft Graph (Outlook 365) — OPCIONAL, para que Zokky proponga horarios

Permite que Zokky consulte el calendario de Outlook 365 configurado y proponga horarios reales de reunión
(lunes a viernes, 9:00 a 17:00 hora Argentina) directamente en la conversación. Si las variables no están
cargadas, `lib/calendar.ts` no hace nada y Zokky sigue funcionando sin esta info.

1. https://portal.azure.com → **Azure Active Directory** → **Registros de aplicaciones** → **Nuevo registro**.
2. Copiá el **Id. de aplicación (cliente)** → `MS_CLIENT_ID` y el **Id. de directorio (inquilino)** → `MS_TENANT_ID`.
3. **Certificados y secretos** → **Nuevo secreto de cliente** → copiá el valor (una sola vez) → `MS_CLIENT_SECRET`.
4. **Permisos de API** → **Agregar un permiso** → **Microsoft Graph** → **Permisos de la aplicación** → agregar `Calendars.Read`.
5. **Conceder consentimiento de administrador** para ese permiso (requiere rol de administrador del tenant).
6. `MS_CALENDAR_USER_EMAIL` = el email de Outlook 365 cuyo calendario se va a consultar (por ejemplo, el tuyo).
7. La integración usa el flujo *client credentials* (sin login interactivo) — pensada para leer un único calendario de forma automática desde el backend.

## 6. Vercel — Deploy

1. Importar el repo en Vercel.
2. Variables de entorno (Project Settings → Environment Variables):

```
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_VERIFY_TOKEN=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENROUTER_API_KEY=
RESEND_API_KEY=
NOTIFY_EMAIL=
MS_TENANT_ID=
MS_CLIENT_ID=
MS_CLIENT_SECRET=
MS_CALENDAR_USER_EMAIL=
CRON_SECRET=
```

3. `vercel.json` ya define los 4 crons (`/api/cron/notify` 21:00 UTC, `/api/cron/followup` 13/17/21 UTC). Vercel los agrega automáticamente al deployar (requiere plan con Cron Jobs habilitado).
4. Deployar.

## 7. Conectar el webhook

Con la URL de Vercel ya deployada, volvé a Meta Developers → WhatsApp → Configuración → Webhook → completar URL + verify token → **Verificar y guardar** → suscribirse a `messages`, `message_deliveries`, `message_reads`.

## 8. Checklist final

- [ ] App creada en Meta Developers con producto WhatsApp
- [ ] Token permanente vía Usuario del Sistema en Business Manager
- [ ] Proyecto Supabase creado y `supabase/schema.sql` ejecutado completo (incluye columnas `email`/`company` de `contacts`)
- [ ] Auth por email (magic link) configurada, dominios permitidos revisados en `lib/auth.ts`
- [ ] Cuenta OpenRouter con API key
- [ ] Cuenta Resend con dominio verificado (o sandbox) y API key
- [ ] (Opcional) App de Azure AD registrada con permiso `Calendars.Read` para que Zokky proponga horarios
- [ ] Deploy en Vercel con todas las variables de entorno
- [ ] Webhook verificado en Meta Developers, suscripto a los 3 campos
- [ ] App de Meta en modo Activo con permiso `whatsapp_business_messaging`
- [ ] Mensaje de prueba enviado al número de WhatsApp → Zokky responde
- [ ] Login al panel probado con un email de dominio permitido
- [ ] System prompt revisado y ajustado en `/settings`

## Estructura del proyecto

```
app/
  login/                     login con magic link
  (app)/                     panel protegido (dashboard, conversations, settings, test-chat)
  api/webhook/                webhook de WhatsApp (GET verify, POST mensajes/status)
  api/cron/notify/             digest diario de leads
  api/cron/followup/           follow-up automático
  api/conversations/[id]/...   envío manual, toggle bot, bloquear
  api/test-chat/               prueba del agente sin WhatsApp real
lib/                          integraciones (Supabase, WhatsApp, IA, email, etc.)
supabase/schema.sql           schema completo a correr en Supabase
```
