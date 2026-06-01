# Workflows

## Flujo usuario

1. Usuario entra
2. Empieza preguntas
3. Sistema filtra restaurantes
4. Genera Top 5
5. Usuario elige favoritos
6. Sistema obtiene ganador
7. Usuario llama restaurante

---

# Flujo restaurante

1. Registro
2. Crear establecimiento
3. Configurar perfil
4. Activar suscripción Stripe
5. Aparece en resultados

---

# Flujo suscripción

1. Restaurante paga
2. Stripe confirma webhook
3. Sistema activa establecimiento
4. Renovación automática mensual

---

# Flujo analytics

## Top 5
Cada aparición:
- guardar impresión

## Comparador
Cada selección:
- guardar ganador

## Llamada
Cada click:
- guardar evento

---

---

# Flujo emails

## Invitación staff → cliente

1. Staff crea restaurante para cliente
2. Se genera Stripe Checkout Session
3. Cliente paga
4. Webhook `checkout.session.completed`:
   - Activa restaurante
   - Envía email de invitación (Auth SMTP)
   - Envía email de confirmación de pago (transaccional)
5. Cliente recibe email de invitación → crea cuenta → accede al panel

## Autoservicio

1. Usuario se registra → email de confirmación de registro (Auth SMTP)
2. Usuario inicia sesión, crea restaurante, paga
3. Webhook `checkout.session.completed`:
   - Activa restaurante
   - Envía email de bienvenida + recibo (transaccional)

## Primera llamada

1. Usuario final llama a un restaurante desde la app
2. Edge Function `events` inserta en `calls`
3. Si es la primera llamada de ese restaurante:
   - Obtiene email del dueño
   - Envía email de notificación (transaccional)

## Facturación mensual

1. Stripe cobra suscripción
2. Webhook `invoice.paid`:
   - Renueva suscripción
   - Envía email de recibo al dueño (transaccional)

---

# Moderación futura

- Revisar restaurantes fake
- Control calidad imágenes
- Bloqueos fraude