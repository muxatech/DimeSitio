# API Spec

## Arquitectura

Frontend consume:
- Supabase Auth
- Supabase Edge Functions

Nunca acceder directamente a lógica sensible.

---

# Endpoints MVP

## POST /search/start

Inicia búsqueda usuario.

Input:
- session_id
- location
- initial_answers

Output:
- search_id

---

## POST /search/answer

Guarda respuesta usuario.

Input:
- search_id
- question_id
- answer

Output:
- next_question
- progress

---

## POST /search/top5

Genera Top 5 restaurantes.

Input:
- search_id

Output:
- restaurants[]

---

## POST /battle/select

Guarda elección Tinder.

Input:
- battle_id
- selected_restaurant_id

Output:
- next_battle
- final_result opcional

---

## POST /analytics/call

Registra click llamar.

Input:
- restaurant_id
- search_id

---

# Restaurante Auth

## POST /restaurant/login

## POST /restaurant/register

## POST /restaurant/logout

---

# Dashboard restaurante

## GET /restaurant/stats

Output:
- top5_count
- wins_count
- call_clicks
- conversion_rate

---

## POST /restaurant/update

Actualizar información negocio.

---

# Stripe

## POST /stripe/create-checkout

Generar checkout suscripción.

---

## POST /stripe/webhook

Eventos:
- checkout.session.completed
- customer.subscription.updated
- customer.subscription.deleted

---

# Validaciones

Todas las APIs deben:
- validar input
- sanitizar strings
- controlar rate limits

---

# Response format

Formato estándar:

```json
{
  "success": true,
  "data": {},
  "error": null
}