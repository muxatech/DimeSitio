# Tech Stack

## Objetivo técnico

Construir una aplicación:
- rápida
- mobile first
- fácilmente escalable
- simple de mantener
- optimizada para desarrollo ágil

---

# Frontend

## Framework
Next.js

Razones:
- SSR
- routing integrado
- buen SEO
- excelente DX
- ecosistema enorme
- integración sencilla con Supabase

---

## Lenguaje
TypeScript

Uso obligatorio.

---

## UI

### TailwindCSS
Para estilos rápidos y mantenibles.

### shadcn/ui
Componentes reutilizables y accesibles.

### Framer Motion
Animaciones suaves para:
- comparador Tinder
- transiciones
- microinteracciones

---

# Backend

## Plataforma
Supabase

Uso:
- PostgreSQL
- Auth
- Storage
- Edge Functions
- Realtime

---

## API
Supabase Edge Functions

Responsabilidades:
- lógica de recomendación
- Stripe webhooks
- analytics
- scoring

---

# Base de datos

PostgreSQL vía Supabase.

---

# Auth

## Restaurantes
Supabase Auth:
- email/password
- magic link futuro

## Usuarios finales
Sin autenticación.

---

# Pagos

Stripe:
- `standard` 29€/mes suscripción, `founder_39` 39€ y `founder_69` 69€ pago único hasta 2026-12-31 (paymentLinks, `founder_rank` si <100)
- billing portal
- webhooks (`checkout.session.completed` con `metadata.plan` `founder_39|founder_69|standard`)

---

# Hosting

## Frontend
Netlify

## Backend
Supabase Cloud

---

# Estado global frontend

Zustand

Razones:
- simple
- ligero
- ideal para flujos rápidos

---

# Formularios

React Hook Form + Zod

---

# Fetching

TanStack Query

Uso:
- caché
- invalidaciones
- sincronización server state

---

# Mapas (futuro)

Google Maps API o Mapbox.

---

# Analytics

Inicialmente:
- eventos propios en DB

Futuro:
- PostHog
- Plausible

---

# Testing

## Unit
Vitest

## E2E
Playwright

---

# Calidad código

- ESLint
- Prettier
- Husky
- lint-staged

---

# Email

## Proveedor
Resend.

Tipos:
- Auth: Supabase SMTP con Resend (registro, invitación, reset password)
- Transaccionales: Edge Function `send-email` vía Resend API (bienvenida, primera llamada, recibos)

## Plantillas
HTML con CSS inline siguiendo la identidad visual (stone palette, botones redondeados, responsive).
Archivos en `supabase/templates/`.

## Seguimiento
Tabla `email_logs` en DB para tracking de envíos.

---

# Gestión entorno

Variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY (+ `STRIPE_SECRET_KEY_TEST` si `STRIPE_FOUNDER_MODE=test`)
- STRIPE_WEBHOOK_SECRET (+ `STRIPE_WEBHOOK_SECRET_TEST`)
- STRIPE_PRICE_ID (`standard` 29€/mes) + `STRIPE_PRICE_FOUNDER_SETUP` (39€) + `STRIPE_PRICE_FOUNDER_69_SETUP` (69€) y `_TEST` variantes
- PUBLIC_SITE_URL
- **RESEND_API_KEY**
- **RESEND_FROM** (opcional)

Nunca hardcodear secretos.