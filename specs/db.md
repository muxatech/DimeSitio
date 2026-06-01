# Database Spec

## Base de datos

PostgreSQL via Supabase.

---

# Tablas principales

## restaurants

Información principal restaurante.

Campos:
- id (uuid, pk)
- owner_id (uuid, ref auth.users, nullable — se migrará a restaurant_admins como fuente de verdad)
- name (text, not null)
- description (text)
- phone (text)
- address (text)
- city (text, not null, default 'Valencia')
- lat (numeric)
- lng (numeric)
- price_level (int, 1-3)
- image_url (text)
- menu_url (text)
- zone (text)
- active (boolean, default false — se activa vía suscripción Stripe)
- created_at (timestamptz)

Indices: active, city, owner_id, zone, price_level

---

## restaurant_admins

Relación N:M entre usuarios auth y restaurantes. Permite que un usuario gestione múltiples establecimientos y que cada establecimiento funcione de forma autónoma.

Campos:
- id (uuid, pk)
- restaurant_id (uuid, ref restaurants, not null)
- user_id (uuid, ref auth.users, not null)
- role (text: 'owner' | 'manager', default 'owner')
- created_at (timestamptz)
- unique(restaurant_id, user_id)

Roles:
- **owner**: control total (editar, eliminar, gestionar suscripción, ver stats)
- **manager**: solo editar perfil y ver stats (no eliminar, no gestionar suscripción)
  - **Nota MVP**: El rol `manager` existe en backend pero **no se expone en frontend**. El panel solo gestiona `owner`. Manager es dead code para MVP, listo para cuando se necesiten roles delegados.

Cada restaurante es autónomo:
- Perfil propio (nombre, descripción, fotos, categorías, etc.)
- Estadísticas propias (impresiones, selecciones, llamadas)
- Suscripción propia (Fase 3 — Stripe, cada restaurante paga 29€/mes)

---

## categories

Catálogo de tipos de cocina.

Campos:
- id (uuid, pk)
- name (text, unique)
- icon (text)
- created_at (timestamptz)

---

## restaurant_categories

Relación M:N restaurants ↔ categories.

Campos:
- restaurant_id (uuid, ref restaurants)
- category_id (uuid, ref categories)
- PK: (restaurant_id, category_id)

---

## subscriptions

Datos Stripe. Una suscripción por restaurante (cada restaurante es autónomo).

Campos:
- id (uuid, pk)
- restaurant_id (uuid, unique, ref restaurants)
- stripe_customer_id (text)
- stripe_subscription_id (text)
- status (text: 'active' | 'inactive' | 'past_due' | 'canceled', default 'inactive')
- current_period_end (timestamptz)
- created_at (timestamptz)

---

## staff_users

Usuarios autorizados a crear restaurantes para clientes (onboarding presencial).

Campos:
- user_id (uuid, pk, ref auth.users, on delete cascade)
- created_at (timestamptz, default now())

Se inserta manualmente. Solo usuarios en esta tabla ven el botón "Crear para un cliente".

---

## flow_starts

Inicios de flujo de usuario (tracking).

Campos:
- id (uuid, pk)
- session_id (text)
- created_at (timestamptz)

---

## impressions

Restaurante aparece en Top 5 de un usuario.

Campos:
- id (uuid, pk)
- restaurant_id (uuid, ref restaurants)
- session_id (text)
- created_at (timestamptz)

---

## selections

Restaurante seleccionado en batalla 1v1.

Campos:
- id (uuid, pk)
- restaurant_id (uuid, ref restaurants)
- session_id (text)
- round (int)
- created_at (timestamptz)

---

## calls

Click en botón llamar de un restaurante ganador.

Campos:
- id (uuid, pk)
- restaurant_id (uuid, ref restaurants)
- session_id (text)
- created_at (timestamptz)

---

## email_logs

Seguimiento de emails transaccionales enviados.

Campos:
- id (uuid, pk)
- to_email (text, not null)
- type (text, not null) — 'welcome' | 'invite' | 'first_call' | 'payment_receipt' | 'invoice'
- restaurant_id (uuid, nullable, ref restaurants, on delete set null)
- status (text, not null) — 'sent' | 'failed'
- error (text, nullable)
- created_at (timestamptz, default now())

Nota: Los emails de Auth (confirmación registro, reset password) los envía Supabase internamente vía SMTP y no se registran en esta tabla. Solo se loguean los que pasan por la Edge Function `send-email`.

---

# Relaciones clave

```
auth.users ──< restaurant_admins >── restaurants
auth.users ──< staff_users          │
                                    │
                              restaurant_categories >── categories
                                    │
                              subscriptions (1:1)
                                    │
                              impressions
                              selections
                              calls
                              flow_starts
```

- Un auth.user puede ser owner/manager de N restaurantes vía restaurant_admins
- Cada restaurante tiene 0 o 1 suscripción (Stripe)
- Cada restaurante tiene sus propias estadísticas (impressions, selections, calls)
- Los usuarios anónimos generan eventos (flow_starts, impressions, selections, calls) sin estar autenticados

---

# RLS

## Restaurantes (público)
- SELECT: cualquiera puede leer restaurantes con `active = true`

## Panel restaurante (autenticado vía restaurant_admins)
- SELECT sobre restaurants: solo si el usuario está en restaurant_admins para ese restaurante
- INSERT: solo si el usuario crea (se añade automáticamente como owner)
- UPDATE: cualquier admin en `restaurant_admins` (frontend solo owner en MVP)
- DELETE: solo owner

## Estadísticas (autenticado)
- SELECT sobre impressions/selections/calls: solo restaurantes donde el usuario está en restaurant_admins

## Usuarios finales (no autenticados)
- INSERT sobre flow_starts/impressions/selections/calls: permitido (tracking anónimo)

---

# Índices importantes

- restaurants: active, city, zone, price_level, owner_id
- restaurant_admins: user_id, restaurant_id
- subscriptions: restaurant_id, status
- impressions: restaurant_id, session_id, created_at
- selections: restaurant_id, session_id
- calls: restaurant_id, session_id
- flow_starts: session_id