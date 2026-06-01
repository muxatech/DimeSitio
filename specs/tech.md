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
- suscripciones recurrentes
- billing portal
- webhooks

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
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- **RESEND_API_KEY**
- **RESEND_FROM** (opcional)

Nunca hardcodear secretos.