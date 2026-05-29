# DimeSitio — Roadmap de Desarrollo MVP

> Fuente principal de ejecución del proyecto.
> Todo desarrollo debe responder a una fase de este documento.

---

## Fase 0: Fundación

**Objetivo:** Infraestructura base funcionando localmente.

### Backend / DB
- [x] Inicializar proyecto Supabase (`supabase init`)
- [x] Configurar `config.toml` (puertos, schema, seed)
- [x] Definir schema SQL inicial:
  - `restaurants` (id, name, description, image_url, food_type, price_range, zone, lat, lng, phone, menu_url, active, created_at)
  - `categories` (id, name, icon)
  - `restaurant_categories` (restaurant_id, category_id)
  - `subscriptions` (id, restaurant_id, stripe_customer_id, stripe_subscription_id, status, current_period_end, created_at)
  - `impressions` (id, restaurant_id, session_id, created_at)
  - `selections` (id, restaurant_id, session_id, round, created_at)
  - `calls` (id, restaurant_id, session_id, created_at)
- [x] Crear seed SQL con 15-20 restaurantes ficticios
- [x] Aplicar migración + seed (`supabase db reset`)
- [x] Configurar RLS básico (lectura pública para restaurants, escritura solo autenticado)

### Frontend
- [x] Inicializar Next.js (App Router) + TypeScript
- [x] Configurar Tailwind CSS
- [x] Configurar Supabase client (anónimo, para queries públicas)
- [x] Configurar ESLint + Prettier
- [x] Crear layout base (viewport mobile-first, font, colores)

### Dependencias
- Ninguna. Fase 0 no depende de nada.

### Milestone: `fundacion-lista`
- `supabase db reset` pasa sin errores
- `npm run dev` muestra pantalla en blanco con layout base

---

## Fase 1: Flujo de Usuario (Core MVP)

**Objetivo:** Usuario anónimo llega, responde preguntas, obtiene un restaurante recomendado.

### Frontend
- [x] **Landing page**: hero con CTA "Encuentra dónde comer"
- [x] **Flujo de preguntas** (componente tarjetas):
  - [x] "¿Qué te apetece?" → categorías (botones grandes)
  - [x] "¿Cuánto quieres gastar?" → rango precio
  - [ ] "¿Qué ambiente buscas?" → tags *(deferido — post-MVP)*
  - [ ] "¿Cuánta distancia aceptas?" → slider/radio *(deferido — post-MVP)*
- [x] **Top 5**: grid de 5 tarjetas con imagen, nombre, tipo, distancia, precio, rating
- [x] **Comparador Tinder 1v1**:
  - [x] Mostrar Restaurante A vs Restaurante B
  - [x] Tap/click para elegir favorito
  - [x] Animación de transición
  - [x] Eliminatoria hasta que queda 1
- [x] **Pantalla resultado final**:
  - [x] Restaurante ganador (imagen grande, nombre, tipo, precio, distancia)
  - [x] Botón "Llamar" (tel://)
  - [x] Botón "Cómo llegar" (Google Maps)
  - [x] Botón "Ver menú" (link externo)
  - [x] Botón "Empezar de nuevo"

### Backend / DB
- [x] Edge Function `GET /restaurants` (filtrado server-side si es necesario, o直接用 query directa desde cliente)
- [x] Edge Function `POST /events/impression` (tracking anónimo)
- [x] Edge Function `POST /events/selection`
- [x] Edge Function `POST /events/call`

### Dependencias
- DB: `restaurants`, `categories`, `restaurant_categories` deben existir (Fase 0)
- Seed con restaurantes debe estar cargado (Fase 0)
- Frontend necesita Supabase client configurado (Fase 0)

### Milestone: `usuario-llega-a-ganador`
- Usuario anónimo completa flujo completo: landing → preguntas → Top 5 → comparador → ganador → botón llamar
- Sin login en ningún paso
- Sin errores de consola

---

## Fase 2: Panel Restaurante

**Objetivo:** Restaurantes pueden registrarse, gestionar su perfil y activar su cuenta.

> **Importante**: Todo el panel debe respetar `specs/design-system.md`.
>
> **Modelo multi-establecimiento**: Un usuario puede gestionar varios restaurantes
> (ej: dueño de 3 locales). Cada establecimiento funciona de forma autónoma:
> perfil propio, estadísticas propias, suscripción propia (Fase 3).
> La tabla `restaurant_admins` es la clave: relaciona usuarios con restaurantes
> y asigna roles (owner = control total, manager = solo editar).
> No introducir nuevos colores, radios, sombras ni patrones de componente sin justificación.
> El panel debe sentirse como parte de la misma app, no como un dashboard separado.

### Frontend
- [x] Pantalla de login/registro (email + password, Supabase Auth)
- [x] Dashboard:
  - Estadísticas básicas (impresiones, selecciones, llamadas)
  - Estado suscripción (activa/inactiva)
  - Lista de establecimientos
- [x] Formulario de creación/edición de establecimiento:
  - Nombre
  - Descripción
  - Tipo de comida (selector categorías)
  - Rango de precio
  - Zona (selector desde ZONES + "Otra...")
  - Dirección (sin coordenadas)
  - Teléfono
  - URL menú
  - URL imagen (sin Storage)
  - Switch "Activo" (solo edición)
- [x] Nav lateral con secciones: Dashboard, Establecimientos, Suscripción
- [x] Página de suscripción (placeholder para Stripe Fase 3)

### Backend / DB
- [x] Edge Function `POST /restaurants` (crear, requiere auth)
- [x] Edge Function `PATCH /restaurants/:id` (editar, permisos owner)
- [x] Edge Function `DELETE /restaurants/:id`
- [x] Edge Function `GET /restaurants/mine` (lista del restaurante autenticado)
- [x] Edge Function `GET /restaurants/:id/stats` (estadísticas)
- [x] RLS actualizado: escritura solo para admin via `restaurant_admin` table

### DB nuevas tablas
- [x] `restaurant_admins` (id, restaurant_id, user_id, role, created_at) — relación usuario-restaurante

### Observaciones
- **Sin Storage**: Las imágenes son URL externas (no upload a Supabase Storage). Se difiere a Fase 3+ si es necesario.
- **Sin coordenadas**: `lat`/`lng` eliminados del formulario. "Cómo llegar" usa Google Maps Search con dirección textual.
- **Sin roles manager**: El backend soporta `owner`/`manager` en DB, pero el frontend solo expone `owner`. Manager es dead code para MVP.
- **Sin horarios**: Campo diferido a futura iteración.

### Dependencias
- Auth de Supabase debe estar habilitado (Fase 0)
- DB tabla `restaurants` existente (Fase 0)
- Storage configurado (Fase 0)

### Milestone: `restaurante-gestiona-perfil`
- Restaurante se registra, crea establecimiento, sube foto, edita datos
- Los cambios se reflejan en el flujo de usuario (Fase 1)
- Sin errores RLS

---

## Fase 3: Suscripciones Stripe

**Objetivo:** Restaurantes pagan 29€/mes y su establecimiento se activa en la app.

### Frontend
- [ ] Página de suscripción en el panel restaurante
- [ ] Botón "Activar suscripción" → redirige a Stripe Checkout
- [ ] Botón "Gestionar suscripción" → redirige a Stripe Customer Portal
- [ ] Indicador visual de estado (activo/suspendido/vencido)

### Backend / DB
- [ ] Edge Function `POST /stripe/create-checkout-session`
- [ ] Edge Function `POST /stripe/create-customer-portal-session`
- [ ] Edge Function `POST /stripe/webhook` (recibir eventos de Stripe):
  - `checkout.session.completed` → crear/actualizar subscription
  - `invoice.paid` → renovar período
  - `customer.subscription.deleted` → desactivar
- [ ] Edge Function `POST /stripe/verify` (verificar estado suscripción para frontend)

### DB
- Tabla `subscriptions` ya definida en Fase 0

### Dependencias
- Panel restaurante funcional (Fase 2) — necesario para gestionar suscripción
- Cuenta Stripe creada con producto "DimeSitio - Plan Mensual" (29€)
- Webhooks apuntando a la Edge Function
- RLS actualizado: solo restaurante activo aparece en queries de Fase 1

### Milestone: `pago-funcional`
- Restaurante paga → establecimiento aparece en resultados de usuario
- Suscripción se renueva automáticamente
- Stripe webhook responde 200

---

## Fase 4: Analytics y Dashboard Métricas

**Objetivo:** Restaurantes ven datos reales de su rendimiento en la app.

### Frontend
- [ ] Dashboard restaurante con gráficos y números:
  - Total impresiones (veces en Top 5)
  - Ratio de selección (veces ganador / impresiones)
  - CTR botón llamar
  - Evolución temporal (últimos 7/30 días)
- [ ] Tabla de eventos recientes

### Backend / DB
- [ ] Edge Function `GET /analytics/:restaurant_id` (agregaciones)
  - `COUNT(impressions)` agrupado por día
  - `COUNT(selections)` donde ganó
  - `COUNT(calls)`
- [ ] Edge Function `GET /analytics/:restaurant_id/events` (events recientes, paginados)

### Dependencias
- Tracking de eventos funcionando (Fase 1)
- Panel restaurante funcionando (Fase 2)

### Milestone: `dashboard-con-datos`
- Restaurante ve estadísticas reales de sus eventos
- Datos coinciden con eventos generados en Fase 1

---

## Fase 5: Pulido y Launch

**Objetivo:** Producto listo para producción.

### Frontend
- [x] SEO básico: meta tags, Open Graph, sitemap.xml
- [ ] Responsive refinado (mobile → tablet → desktop)
- [x] Loading states, error states, empty states en todos los componentes
- [x] Optimización de imágenes (next/image)
- [ ] Página 404
- [ ] Términos y condiciones, política de privacidad

### Backend / DB
- [ ] Rate limiting en Edge Functions
- [ ] Logs estructurados
- [ ] Backup plan de DB
- [ ] Revisión de RLS (penetration test básico)

### Infraestructura
- [ ] Deploy Supabase a producción (proyecto cloud)
- [ ] Deploy frontend a Vercel
- [ ] Dominio personalizado
- [ ] Stripe webhooks en producción
- [ ] Monitoreo básico (uptime, errores)

### Dependencias
- Fases 0-4 completadas y estables

### Milestone: `produccion`
- App accesible desde dominio público
- Stripe cobra en producción
- Usuarios pueden completar flujo completo
- Restaurantes pueden darse de alta y pagar

---

## Resumen de Milestones

| # | Milestone | Fases requeridas | ¿Qué valida? |
|---|-----------|-----------------|--------------|
| M0 | `fundacion-lista` | Fase 0 | DB migrada + proyecto frontend corriendo |
| M1 | `usuario-llega-a-ganador` | Fase 0, 1 | Core flow completo sin login |
| M2 | `restaurante-gestiona-perfil` | Fase 0, 1, 2 | CRUD restaurante + auth |
| M3 | `pago-funcional` | Fase 0, 1, 2, 3 | Stripe conecta y activa establecimiento |
| M4 | `dashboard-con-datos` | Fase 0-4 | Métricas visibles desde panel |
| M5 | `produccion` | Fase 0-5 | App en producción, dominio público |

---

## Orden de ejecución recomendado

```
Fase 0 → Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5
  (base)   (core MVP) (panel)  (pagos)  (datos)  (launch)
```

Fase 0 y 1 son la **ruta crítica**. Fases 2-4 pueden solaparse parcialmente con Fase 1 si hay más de un desarrollador, pero idealmente se ejecutan en serie para minimizar rewrites.

---

## Principios de desarrollo

1. **MVP primero**: Fase 1 es el corazón. Todo lo demás es mejora.
2. **Sin login de usuarios**: Usuarios finales nunca se autentican. Sesión anónima (client-side UUID).
3. **Sin sobreingeniería**: Preferir queries directas desde cliente antes que edge functions complejas. Edge functions solo para lógica que requiere secretos (Stripe) o procesamiento pesado.
4. **Seed data realista**: Restaurantes ficticios pero creíbles para desarrollo y demo.
5. **Mobile first**: Todo se prueba primero en 375px viewport.
6. **RLS por defecto**: Toda tabla tiene Row Level Security desde el día 1.
