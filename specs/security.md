
---

# `specs/security.md`

Muy importante desde el inicio.

```md id="5mn39n"
# Security Spec

## Objetivo

Garantizar:
- protección datos
- integridad analytics
- seguridad pagos
- aislamiento restaurantes

---

# Autenticación

## Restaurantes
Supabase Auth.

Passwords:
- nunca almacenadas manualmente
- gestionadas por Supabase

---

# Authorization

## RLS obligatorio

Cada restaurante solo puede acceder:
- a sus establecimientos
- a sus analytics
- a sus pagos

---

# Secrets

Nunca exponer:
- Stripe secret
- Service role key
- Webhook secrets

Uso exclusivo server-side.

---

# Validación inputs

Todos los endpoints deben:
- validar tipos
- limitar tamaños
- sanitizar strings

---

# Rate limiting

Aplicar en:
- búsqueda usuarios
- login
- analytics
- Stripe webhooks

---

# Stripe

## Webhooks
Validar firma siempre.

---

# Anti fraude

## Analytics
Evitar:
- spam llamadas
- impresiones falsas
- eventos duplicados

---

# Logs

Nunca guardar:
- passwords
- tokens
- secrets

---

# GDPR

## Datos usuarios
Guardar mínimos datos posibles.

Usuarios anónimos:
- session_id temporal
- preferencias búsqueda

---

# Seguridad frontend

- CSP headers
- sanitización
- protección XSS
- evitar localStorage sensible

---

# Dependencias

Actualizar periódicamente.

---

# Backups

Usar backups automáticos Supabase.