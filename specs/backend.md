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
- Suscripciones mensuales
- Webhooks
- Cancelaciones
- Renovaciones

## Google Maps API (futuro)
- Geocoding
- Distancias