# API Spec

## Arquitectura

Frontend consume:
- Supabase Auth
- Supabase Edge Functions

Nunca acceder directamente a lógica sensible.

---

# Endpoints MVP

> **Nota**: El filtrado de restaurantes, generación del Top 5 y lógica de batalla 1v1 se ejecutan **completamente en cliente** (React + TanStack Query + Zustand). No existen Edge Functions para search/battle. Solo se usan Edge Functions para eventos y CRUD del panel restaurante.

## Supabase queries directas (cliente público)

- `GET /restaurants?select=*,restaurant_categories(category_id)&active=eq.true` — restaurantes activos
- `GET /categories?select=*` — categorías de comida

## Event tracking (Edge Functions)

### POST /events/impression

Registra que un restaurante apareció en el Top 5 de un usuario.

### POST /events/selection

Registra que un restaurante fue seleccionado como favorito en batalla.

### POST /events/call

Registra click en botón llamar de un restaurante ganador.

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
- price_level (required, 1-3)
- zone (required)
- image_url
- menu_url
- active
- category_ids (array de category_id)

Output: restaurant creado

## PATCH /restaurants/:id

Actualizar información de un restaurante. Verifica que el usuario tiene acceso
como admin en `restaurant_admins` para ese restaurante (rol `owner` — el rol `manager`
existe en backend pero no se expone en frontend MVP).

Input: mismos campos que POST (todos opcionales en PATCH), más `active` (boolean)

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