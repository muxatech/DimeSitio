# UI Spec

## Filosofía UI

- Mobile first
- Minimalista
- Ultra rápida
- Pocos clicks
- Diseño tipo TikTok/Tinder

---

# Flujo usuario

## Landing
- CTA inmediato:
  "Encuentra dónde comer"

## Preguntas
Formato tarjetas (3 preguntas MVP):
- ¿Qué te apetece? (categorías)
- ¿Cuánto quieres gastar? (precio 1-3)
- ¿Por qué zona? (selector de zonas)

Deferidas (post-MVP):
- ¿Qué ambiente buscas?
- ¿Cuánta distancia aceptas?

Respuesta rápida:
- Botones grandes
- Swipe opcional (futuro)

---

# Resultado Top 5

Mostrar:
- Imagen
- Nombre
- Zona
- Precio

No se muestra distancia ni rating interno en MVP.

---

# Comparador estilo Tinder

Pantalla:
- Restaurante A vs Restaurante B
- Usuario elige uno
- Animaciones rápidas

Objetivo:
- Obtener restaurante favorito final

---

# Resultado final

Mostrar:
- Restaurante ganador
- Botón llamar
- Cómo llegar
- Ver menú
- Reiniciar búsqueda

---

# Ficha de sitio (página pública `/{locale}/sitio/[id]`)

Página indexable por restaurante, accesible sin auth solo si `active = true`.

**Ruta:** `/{locale}/sitio/[id]` donde `id` es UUIDv4. Ejemplo: `/es/sitio/69bb3b50-1df8-4369-b285-d9018496a5a3` (MUMA Restaurante).

**Fetch (Server Component):** `supabase anon` `select *, restaurant_categories(category_id) + join categories` con `eq('id', id).eq('active', true).single()`. Valida UUID con regex `^[0-9a-f]{8}-...$` antes del query (400 → 404). Si no existe o inactivo → `notFound()` 404.

**UI:**
- `PhotoCarousel` (fotos R2 o `image_url` fallback) con swipe/dots/fullscreen
- Header: nombre + badges (Fundador/Ciutat Vella/€€/dirección)
- Descripción en card + categorías como pills
- Columna CTAs: Llamar (`tel:`), Cómo llegar (`google_maps_url` o `address` fallback), Ver menú, Reservar, Ver Instagram
- `jsonLd` `@type Restaurant` (address, geo, priceRange, servesCuisine, telephone, image)

**SEO:** `generateMetadata` con `title: ${name} | DimeSitio`, `description` 155 chars, `canonical` + `alternates` es/en, `openGraph` con `images[0]`, `twitter summary_large_image`. Entra en `sitemap.ts` dinámico (`/sitemap.xml`).

**i18n:** namespace `Ficha` (`metaFallback`, `notFoundTitle/Desc`).

---

# Panel restaurante

## Dashboard
- Estadísticas
- Estado suscripción
- Establecimientos

## Gestión local
- Editar información
- Tipos de comida
- Teléfono
- Zona
- URL menú
- URL imagen (sin Storage)
- Switch activar/desactivar

## Flujo Staff — Crear para un cliente
### Botones en listado
- Usuario staff ve botón extra: "Crear para un cliente" (además del "Añadir establecimiento" normal)
- Si no está en `staff_users`, solo ve "Añadir establecimiento"
- Click `Crear para un cliente` no va directo al formulario → interstitial `¿Qué founder vas a ofrecer?` con 2 opciones `Founder 39€ (founder_39)` / `Founder 69€ (founder_69)` — staff decide antes de girar el iPad, cliente solo verá una founder después

### Formulario extendido
- Mismos campos que el formulario normal
- Campo extra: "Email del propietario" (input texto, visible siempre)
- Sección Plan: `Standard 29€/mes` + **una sola** `Founder — 39€` *o* `Founder — 69€` según interstitial (`?founder=39|69` → `plan_type=founder_39|founder_69`), la otra founder no se renderiza para que el cliente no vea la alternativa
- Sección `Método de pago`: `Pagar ahora` (QR) / `Enviar enlace por email`
- Botón submit dinámico: `Crear y enviar a pago` (standard), `Crear y cobrar 39€` / `Crear y cobrar 69€` (founder), `Crear y enviar email`

### Pantalla post-creación
- Mensaje: ✅ Datos guardados + planLabel (`Plan Founder — 39€` / `69€` / `Plan Normal — 29€/mes`)
- QR si `redirect`, email confirmación si `email`
- Texto: "Ahora el propietario debe pagar para activar el establecimiento."
- El dueño gira el iPad → escanea QR → Stripe Payment Link (39 o 69) → pone tarjeta

### Página /pago-exitoso
- Mensaje: "Te hemos enviado un email a [email] para acceder a tu panel."
- Instrucciones: "Revisa tu bandeja de entrada y crea una contraseña para gestionar tu restaurante."

Deferido:
- Horarios
- Subida de fotos a Storage

---

# Diseño visual

## Estilo
- Moderno
- Muy limpio
- Colores cálidos
- Grandes imágenes

## Inspiraciones
- Tinder
- Airbnb
- Uber Eats
- Linear

---

# Responsive

Prioridad:
1. Mobile
2. Tablet
3. Desktop

---

# Accesibilidad

- Contraste correcto
- Botones grandes
- Navegable teclado