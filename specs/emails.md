# Sistema de Emails

## Stack

- **Proveedor**: Resend (SMTP + API)
- **Integración**: Supabase Auth (SMTP para emails de Auth) + Edge Function `send-email` (transaccionales custom)
- **From**: `hola@dimesitio.es` (dominio verificado en Resend)

## Tipos de email

### Auth (enviados por Supabase vía SMTP de Resend)

| Tipo | Trigger | Plantilla | ¿Implementado? |
|---|---|---|---|
| **Confirmar registro** | `supabase.auth.signUp()` | `supabase/templates/confirm_signup.html` | Sí |
| **Invitación** (staff→cliente) | `auth.admin.inviteUserByEmail()` | `supabase/templates/invite.html` | Sí (existente) |
| **Restablecer contraseña** | `supabase.auth.resetPasswordForEmail()` | `supabase/templates/reset_password.html` | Sí (frontend nuevo) |
| **Cambio de email** | `updateUser({ email })` | No implementado | No |

### Transaccionales (enviados por Edge Function `send-email` vía Resend API)

| Tipo | Trigger | Destino | ¿Implementado? |
|---|---|---|---|
| **Bienvenida + recibo** (self-service) | `checkout.session.completed` (stripe webhook) | Dueño del restaurante | Sí |
| **Confirmación pago staff** | `checkout.session.completed` (stripe webhook) | Dueño del restaurante | Sí |
| **Primera llamada** | `calls` insert (events edge function) | Dueño del restaurante | Sí |
| **Recibo mensual** | `invoice.paid` (stripe webhook) | Dueño del restaurante | Sí |

## Arquitectura

### Edge Function `send-email`

- POST-only
- Auth interna: verifica `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>`
- Llama a Resend API con `resend@4`
- Registra en `email_logs` cada envío (success/failure)

### Flujo de emails Auth

```
Supabase Auth (signUp/inviteUserByEmail/resetPasswordForEmail)
  → SMTP Resend (configurado en config.toml)
    → Plantilla HTML personalizada (supabase/templates/)
      → Destinatario recibe email con marca DimeSitio
```

### Flujo de emails transaccionales

```
Evento (webhook Edge Function)
  → fetch() interno a /functions/v1/send-email
    → Resend API
      → email_logs insert (sent/failed)
        → Destinatario recibe email
```

## Diseño visual de plantillas

Todas siguen la identidad visual de DimeSitio:

- **Fondo**: `#fafaf9` (stone-50)
- **Card**: `#ffffff` (white) con `border-radius: 16px`
- **Texto título**: `#1c1917` (stone-900), negrita, 24px
- **Texto cuerpo**: `#44403c` (stone-700), 15px
- **Texto secundario**: `#57534e` (stone-600), 14px
- **Botón CTA**: `#292524` (stone-800), texto blanco, `border-radius: 16px`
- **Footer**: `#a8a29e` (stone-400), 12px, línea separadora `#e7e5e4` (stone-200)
- **Responsive**: max-width 480px, centrado

## Configuración

### SMTP en config.toml

```toml
[auth.email.smtp]
enabled = true
host = "smtp.resend.com"
port = 465
user = "resend"
pass = "env(RESEND_API_KEY)"
admin_email = "hola@dimesitio.es"
sender_name = "DimeSitio"
```

### Variables de entorno

| Variable | Dónde | Valor |
|---|---|---|
| `RESEND_API_KEY` | Supabase secrets | `re_...` |
| `RESEND_FROM` | Supabase secrets (opcional) | `DimeSitio <dimesitio@resend.dev>` |

## Pendientes para producción

- [x] Verificar dominio `dimesitio.es` en Resend ✅
- [x] `RESEND_FROM` configurado como `DimeSitio <hola@dimesitio.es>` ✅
- [x] `admin_email` en SMTP configurado como `hola@dimesitio.es` ✅
- [ ] (Automático) Quitar límite sandbox de Resend al verificar dominio ✅
