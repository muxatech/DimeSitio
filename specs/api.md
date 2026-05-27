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

# Panel restaurante (Fase 2)

## Autenticación

El login/registro se gestiona directamente con Supabase Auth desde el frontend
(email + password). No requiere Edge Function específica.

## GET /restaurants/mine

Lista todos los restaurantes que el usuario autenticado puede gestionar.
Busca en `restaurant_admins` donde `user_id = auth.uid()` y joinea `restaurants`.

Output:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Restaurante A",
      "role": "owner",
      "active": true,
      "subscription_status": "active",
      "stats": {
        "impressions": 42,
        "selections": 12,
        "calls": 5
      }
    }
  ]
}
```

Devuelve array — un usuario puede tener varios establecimientos.

## POST /restaurants

Crear un restaurante nuevo. Asigna automáticamente al usuario creador como `owner`
en `restaurant_admins`.

Input:
- name (required)
- description
- phone
- address
- lat, lng
- price_level (required, 1-3)
- zone (required)
- image_url
- menu_url
- category_ids (array de category_id)

Output: restaurant creado

## PATCH /restaurants/:id

Actualizar información de un restaurante. Verifica que el usuario tiene rol
`owner` o `manager` en `restaurant_admins` para ese restaurante.

Input: mismos campos que POST (todos opcionales en PATCH)

## DELETE /restaurants/:id

Eliminar un restaurante. Solo `owner` puede eliminar.

## GET /restaurants/:id/stats

Estadísticas de un restaurante concreto. Verifica permisos vía `restaurant_admins`.

Output:
```json
{
  "impressions_7d": 42,
  "impressions_30d": 180,
  "selections_7d": 12,
  "selections_30d": 55,
  "calls_7d": 5,
  "calls_30d": 20,
  "conversion_rate": 0.12
}
```

---

# Stripe (Fase 3)

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