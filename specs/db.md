# Database Spec

## Base de datos

PostgreSQL via Supabase.

---

# Tablas principales

## restaurants

Información principal restaurante.

Campos:
- id
- owner_id
- name
- description
- phone
- address
- city
- lat
- lng
- price_level
- active
- subscription_status
- created_at

---

## restaurant_tags

Tipos de comida y atributos.

Ejemplos:
- sushi
- italiano
- romántico
- barato
- terraza

---

## searches

Búsquedas realizadas usuarios.

Campos:
- id
- session_id
- answers_json
- location
- created_at

---

## top5_results

Restaurantes mostrados.

Campos:
- id
- search_id
- restaurant_id
- score
- shown_position

---

## battles

Comparaciones tipo Tinder.

Campos:
- id
- search_id
- restaurant_a
- restaurant_b
- winner_restaurant_id

---

## call_clicks

Clicks botón llamar.

Campos:
- id
- restaurant_id
- search_id
- created_at

---

## subscriptions

Datos Stripe.

Campos:
- id
- restaurant_id
- stripe_customer_id
- stripe_subscription_id
- status
- renews_at

---

# Relaciones

- owner -> restaurants
- searches -> top5_results
- searches -> battles
- restaurants -> analytics

---

# RLS

## Restaurantes
Solo pueden ver:
- sus establecimientos
- sus estadísticas

## Usuarios
No autenticados.

---

# Índices importantes

- city
- tags
- lat/lng
- subscription_status