-- Berta CRM — schema completo
-- Ejecutar en Supabase SQL Editor (proyecto nuevo)

create extension if not exists pgcrypto;

-- Contacts
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  name text,
  created_at timestamptz default now(),
  ad_source text,
  ctwa_clid text,
  blocked boolean default false,
  bot_enabled boolean default true
);

-- Messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now(),
  whatsapp_message_id text,
  status text check (status in ('sent', 'delivered', 'read', 'failed'))
);

create index if not exists idx_messages_contact on messages(contact_id, created_at);
create index if not exists idx_messages_wamid on messages(whatsapp_message_id)
  where whatsapp_message_id is not null;

-- Leads
-- Nota: se agrega la columna "topic" (no estaba en el schema original) para poder
-- alimentar el gráfico de "temas" del dashboard, generado por la IA al calificar.
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete cascade not null,
  score text not null check (score in ('hot', 'warm', 'cold')),
  reason text not null,
  topic text,
  qualified_at timestamptz default now(),
  notified boolean default false
);

create index if not exists idx_leads_score on leads(score, qualified_at);
create index if not exists idx_leads_contact on leads(contact_id);

-- Settings (prompt del sistema, configuración por contacto)
create table if not exists settings (
  key text primary key,
  value text not null
);

-- Seed: system prompt genérico de Berta (editable desde /settings)
insert into settings (key, value)
values (
  'system_prompt',
  E'Sos Berta, asistente virtual de la agencia. Reglas irrompibles:\n'
  '- Respondé SIEMPRE en español argentino (voseo), nunca en otro idioma.\n'
  '- En la primera respuesta genérica, preguntá qué quiere lograr la persona, no listes servicios.\n'
  '- Mensajes cortos (menos de 30 palabras), máximo 2 emojis, sin markdown, sin listas, texto corrido.\n'
  '- Nunca inventes precios de servicios de la agencia ni datos falsos.\n'
  '- Si el usuario expresa molestia, derivá a un humano.\n'
  '- Solo enviá el link de Calendly cuando haya interés REAL.\n'
  '- Nunca pidas el email.'
)
on conflict (key) do nothing;

insert into settings (key, value)
values ('calendly_link', 'https://calendly.com/tu-agencia/reunion')
on conflict (key) do nothing;

-- RLS: la anon key es pública (va en el bundle del cliente), así que hay que
-- restringir el acceso vía PostgREST a usuarios autenticados. El webhook y los
-- crons usan el service_role key, que bypassa RLS.
alter table contacts enable row level security;
alter table messages enable row level security;
alter table leads enable row level security;
alter table settings enable row level security;

create policy "authenticated_all_contacts" on contacts
  for all to authenticated using (true) with check (true);

create policy "authenticated_all_messages" on messages
  for all to authenticated using (true) with check (true);

create policy "authenticated_all_leads" on leads
  for all to authenticated using (true) with check (true);

create policy "authenticated_all_settings" on settings
  for all to authenticated using (true) with check (true);
