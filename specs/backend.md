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
- Generar Top 5
- Procesar respuestas
- Registrar analytics
- Registrar clicks llamadas

## Restaurantes
- Gestión perfil
- Dashboard estadísticas
- Stripe webhooks
- Suscripciones

---

# Sistema recomendación MVP

## Inputs
- Tipo comida
- Distancia
- Presupuesto
- Ambiente
- Horario

## Algoritmo inicial
Filtrado + scoring simple.

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