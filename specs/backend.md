# Backend Spec

## Stack

- Supabase
- Supabase Edge Functions
- PostgreSQL
- Stripe
- OpenCode/OpenSpec
- Ollama local model: qwen3.6

---

# Arquitectura

Frontend -> Edge Functions -> Database

El frontend nunca accede directamente a lógica sensible.

---

# Responsabilidades Edge Functions

## Usuario
- Registrar analytics (impresiones, selecciones, llamadas)
- **Nota**: El filtrado de restaurantes, generación del Top 5 y lógica de batalla se ejecutan **en cliente** (React + Zustand), no en Edge Functions.

## Restaurantes
- CRUD de establecimientos (crear, editar, eliminar, listar)
- Estadísticas por establecimiento
- Stripe webhooks (Fase 3)
- Suscripciones (Fase 3)

## Staff
- Tabla `staff_users` para autorizar usuarios
- Edge Function `POST /staff/create-for-client`: crea restaurante para cliente + genera Stripe Payment Link con metadata (`plan=founder_39|founder_69|standard`, `owner_email`, `source='staff'`) — el staff elige 39€ o 69€ en interstitial previo antes del formulario, el cliente solo ve una founder
- `getStripeKeys(plan)` mapea `founder_39→STRIPE_PRICE_FOUNDER_SETUP` (39€), `founder_69→STRIPE_PRICE_FOUNDER_69_SETUP` (69€), `standard→STRIPE_PRICE_ID`
- Webhook `checkout.session.completed`: lee `metadata.plan` (`founder_39|founder_69` pago único hasta 2026-12-31 + `founder_rank`, `standard` suscripción), invita al dueño, asigna owner, activa restaurante

---

# Sistema recomendación MVP

## Inputs (MVP actual)
- Tipo de comida (categorías)
- Presupuesto (1-3)
- Zona

## Inputs (deferidos — post-MVP)
- Ambiente
- Distancia
- Horario

## Algoritmo inicial
Filtrado por categorías + precio + zona, shuffle aleatorio, top 5.
Batalla 1v1 hasta que queda 1 ganador.

No usar IA compleja inicialmente.

---

# Seguridad

- RLS obligatorio
- Validación inputs
- Rate limiting
- Protección Stripe webhooks

---

# Auth

## Usuarios finales
Sin login.

## Restaurantes
Supabase Auth:
- Email/password
- Magic link opcional

---

# Analytics

Guardar:
- impresiones_top5
- ganador_final
- clicks_llamar
- búsquedas

---

# Integraciones externas

## Stripe
- `standard` 29€/mes suscripción, `founder_39` 39€ y `founder_69` 69€ pago único hasta 2026-12-31 (paymentLinks + `setup_future_usage`, `founder_rank` si <100)
- Webhooks: `checkout.session.completed`, `invoice.paid` (solo standard), `customer.subscription.deleted`
- Cancelaciones y renovaciones

## Google Maps API (futuro)
- Geocoding
- Distancias