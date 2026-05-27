# Design System — DimeSitio

> Fuente de verdad visual para todas las fases del proyecto.
> Todo el código nuevo debe respetar estos patrones. No introducir nuevos colores, radios, sombras,
> animaciones o patrones de componente sin justificación explícita.

---

## 1. Filosofía

- **Mobile-first, no mobile-only**: Todo se diseña primero para 375px y se expande a tablet/desktop.
  El panel restaurante es un caso crítico — necesita funcionar bien en desktop (tablas, formularios,
  dashboard) sin perder la calidad en móvil.
- **Minimalista**: Menos es más. Sin decoración innecesaria.
- **Rápida**: Pocos clicks, transiciones ágiles (250ms por defecto).
- **Consistente**: Misma paleta, mismos radios, mismas animaciones en toda la app.

---

## 2. Paleta de colores

### Escala principal: stone

| Clase | Hex | Uso |
|-------|-----|-----|
| `stone-900` | `#1c1917` | Fondos primarios, texto headings, bordes seleccionados, badges de ranking, indicador VS |
| `stone-800` | `#292524` | Botones primarios (Continuar, Empezar, Guardar, Elegir favorito) |
| `stone-700` | `#44403c` | Headings en estados de error/vacío, texto secundario fuerte |
| `stone-600` | `#57534e` | Texto en opciones no seleccionadas |
| `stone-500` | `#78716c` | Texto descriptivo, cuerpo de texto secundario |
| `stone-400` | `#a8a29e` | Texto mutado (subtítulos, contadores, placeholders), botón "Atrás" |
| `stone-300` | `#d6d3d1` | Iconos placeholder, bordes de estado "Me da igual" |
| `stone-200` | `#e7e5e4` | Bordes de cards, separadores, inputs no enfocados, fondo de progreso |
| `stone-100` | `#f5f5f4` | Fondos de selección activa, tags, placeholders de imagen |
| `stone-50` | `#fafaf9` | Fondos de secciones alternas (stats banner) |

### Blanco y negros

| Clase | Uso |
|-------|-----|
| `bg-white` | Fondos de página, cards, botones secundarios |
| `text-white` | Texto sobre fondos oscuros |
| `border-white/40` | Borde CTA hero |
| `bg-white/25` + `backdrop-blur-sm` | Glass pills y badges |
| `bg-white/20` | Fondo CTA hero, tags "+N más" |
| `bg-white/10` | Botones navbar en landing |
| `bg-black/45` | Overlay de contraste en carrusel |
| `bg-black/5` | Overlay sutil en cards seleccionadas |

### Acentos

| Clase | Uso |
|-------|-----|
| `bg-red-50` + `text-red-400` | Icono contenedor de error |
| `fill-yellow-400` / `text-yellow-400` | Estrellas en hero |

**Regla**: No usar colores fuera de la familia stone excepto para errores (red) o estrellas (yellow).

---

## 3. Tipografía

### Fuente
- `Plus Jakarta Sans` (pesos: 400, 500, 600, 700, 800)
- Clase Tailwind: `font-sans` (mapeado a `var(--font-jakarta-sans)`)

### Jerarquía

| Elemento | Clases |
|----------|--------|
| Hero título | `text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight` |
| Sección heading | `text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight` |
| Step heading | `text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight` |
| Card título | `text-lg sm:text-xl lg:text-2xl font-bold` |
| Botón primario | `text-base sm:text-lg lg:text-xl font-semibold` |
| Botón secundario | `text-base sm:text-lg font-semibold` |
| Cuerpo descriptivo | `text-sm sm:text-base leading-relaxed text-stone-500` |
| Label / badge | `text-xs sm:text-sm font-medium` |
| Texto mutado | `text-sm text-stone-400` |
| Enlace nav | `text-sm font-medium` |

### Tracking
- `tracking-tight` en todos los headings
- `tracking-widest` solo en label "Enlaces" del footer

### Text Shadow (solo hero)
```css
textShadow: '0 2px 20px rgba(0,0,0,0.3)'   /* h1 */
textShadow: '0 1px 12px rgba(0,0,0,0.25)'  /* subtítulo */
```

---

## 4. Radios de borde

| Clase | Valor | Uso principal |
|-------|-------|---------------|
| `rounded-lg` | 8px | Tags de comida, iconos pequeños |
| `rounded-xl` | 12px | Iconos de opciones, enlaces nav |
| `rounded-2xl` | 16px | **Estándar**: botones, cards, contenedores principales |
| `rounded-3xl` | 24px | Cards de features en problems section |
| `rounded-full` | 9999px | Pills, badges, indicadores VS, dots de carrusel |

**Regla**: El 90% de los elementos deben usar `rounded-2xl`. Solo badges y pills usan `rounded-full`.

---

## 5. Sombras

| Clase | Uso |
|-------|-----|
| `shadow-sm` | Cards en reposo, inputs, botones secundarios |
| `shadow-md` | Hover de cards y opciones seleccionables |
| `shadow-lg` | Botones primarios, navbar "Empezar", VS circle |
| `shadow-xl` | Solo bottom CTA |
| `shadow-lg shadow-stone-200/50` | Botones primarios con tono cálido |

**Regla**: `shadow-sm` para todo en reposo. `shadow-lg` solo para elementos que necesitan destacar (CTAs principales).

---

## 6. Espaciado

### Gap system (mobile → tablet → desktop)

| Uso | Mobile | Tablet (sm) | Desktop (lg) |
|-----|--------|-------------|--------------|
| Secciones de paso | `gap-6` | `gap-8` | `gap-10` |
| Contenedores de botones | `gap-2.5` | `gap-3` | `gap-4` |
| Grid de cards | `gap-3` | `gap-4` | `gap-6` |
| Layout hero | `gap-8` | — | `gap-10` |

### Padding system

| Contexto | Mobile | Tablet (sm) | Desktop (lg) |
|----------|--------|-------------|--------------|
| Outer page | `px-5 py-6` | `px-8 py-10` | `px-12 py-16` |
| Sections | `px-6 py-20` | `px-8 py-28` | `px-12 py-32` |
| Botones primarios | `py-4` | `py-4` | `py-5` |
| Botones opción | `px-4 py-3` | `px-5 py-3.5` | `px-6 py-4` |
| Card content | `p-4` | `p-5` | `p-6` |

---

## 7. Animaciones (Framer Motion)

### Patrones obligatorios

#### A. Transiciones de paso
```tsx
<motion.div
  key={key}
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -16 }}
  transition={{ duration: 0.25, ease: 'easeInOut' }}
/>
```

#### B. Stagger children (listas de opciones)
```tsx
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}
```

#### C. whileHover / whileTap en todos los botones
```tsx
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.97 }}
```

#### D. Scroll reveal (landing sections)
```tsx
initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true, margin: '-80px' }}
transition={{ duration: 0.5 }}
```

### Reglas de animación
- Duración estándar: **250ms** (página y batallas), **400ms** (progreso), **500ms** (entrada), **600ms** (carrusel)
- Easing estándar: `easeInOut` o `[0.25, 0.1, 0.25, 1]` (carrusel)
- `AnimatePresence mode="wait"` para transiciones de contenido que cambia
- No animar más de 100ms de retardo entre elementos hijos (staggerChildren: 0.04-0.08)

---

## 8. Patrones de botones

### Primario (acción principal)
```tsx
className="w-full rounded-2xl bg-stone-800 py-4 text-base font-semibold text-white shadow-lg shadow-stone-200/50 transition-all hover:bg-stone-700 sm:py-4 sm:text-lg lg:py-5 lg:text-xl"
```

### Secundario (sobre fondo blanco)
```tsx
className="inline-flex items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white py-4 text-base font-semibold text-stone-700 shadow-sm transition-all hover:bg-stone-50 hover:shadow-md"
```

### Deshabilitado
```tsx
className="w-full rounded-2xl bg-stone-200 py-4 text-base font-semibold text-stone-400"
```
Sin shadow, sin hover.

### Glass (sobre fondo oscuro/imagen)
```tsx
className="inline-flex items-center gap-3 rounded-2xl border border-white/40 bg-white/20 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-white/30"
```

### Atrás
```tsx
className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-stone-400 transition-colors hover:text-stone-600"
```

---

## 9. Patrones de cards

### Card restaurante (Top5)
```tsx
className="flex items-center gap-4 overflow-hidden rounded-2xl border border-stone-200 bg-white pr-4 shadow-sm transition-all hover:shadow-md sm:flex-col sm:gap-0 sm:p-0 sm:pr-0"
```

### Card batalla
```tsx
className="relative w-full overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-all sm:flex-1"
```
- Seleccionada: `border-stone-900 ring-2 ring-stone-200 ring-offset-2`
- No seleccionada: `border-stone-200 hover:shadow-md`

### Card info (winner)
```tsx
className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6"
```

---

## 10. Glassmorphism

Solo para elementos sobre el hero (fondo oscuro con imagen):
```tsx
bg-white/25 backdrop-blur-sm
```

O para la navbar en scroll:
```tsx
bg-white/90 backdrop-blur-md
```

**Regla**: No usar glassmorphism en secciones con fondo blanco. Ahí usar fondos sólidos.

---

## 11. Formularios

### Inputs
Para el panel restaurante, usar este patrón:
```tsx
className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm transition-all placeholder:text-stone-400 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-200 sm:px-5 sm:py-3.5 sm:text-base"
```
- Focus: `border-stone-900 ring-2 ring-stone-200`
- Placeholder: `text-stone-400`
- Deshabilitado: `bg-stone-100 text-stone-400 cursor-not-allowed`

### Labels
```tsx
className="text-sm font-medium text-stone-700 sm:text-base"
```

### Select / dropdown
Usar mismo patrón que inputs, con `appearance-none` y un icono chevron personalizado.

### Checkboxes / radios
Usar el patrón de botones seleccionables del flujo existente, NO checkboxes HTML nativos:
```tsx
className={cn(
  'rounded-2xl border-2 px-4 py-3 text-sm font-medium shadow-sm transition-all',
  selected
    ? 'border-stone-900 bg-stone-100 text-stone-900'
    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:shadow-md'
)}
```

---

## 12. Tablas (panel restaurante)

Para el dashboard y listados del panel:
```tsx
<div className="w-full overflow-hidden rounded-2xl border border-stone-200 shadow-sm">
  <table className="w-full text-left text-sm">
    <thead className="bg-stone-50">
      <tr>
        <th className="px-4 py-3 font-semibold text-stone-700 sm:px-5">Cabecera</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-stone-200">
      <tr className="bg-white transition-colors hover:bg-stone-50">
        <td className="px-4 py-3 text-stone-900 sm:px-5">Dato</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 13. Iconos

- Usar siempre **Lucide React**
- Tamaños estándar por contexto:

| Contexto | Tamaño |
|----------|--------|
| Inline con texto | `h-3.5 w-3.5` |
| Botón / acción | `h-5 w-5` |
| Icono en contenedor (h-12 a h-16) | `h-7 w-7` |
| Placeholder imagen | `h-8 w-8` a `h-12 w-12` |

### Contenedor de icono estándar
```tsx
className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-900 shadow-lg"
```

---

## 14. Responsive

### Breakpoints activos

| Prefijo | Mínimo | Uso principal |
|---------|--------|---------------|
| `sm:` | 640px | **El más usado** — layout column→row, padding, text sizing |
| `md:` | 768px | Solo hero title scaling |
| `lg:` | 1024px | Segundo más usado — espaciado, columnas extra, sizing grande |
| `xl:` | 1280px | Solo container width y padding extremo |

### Reglas responsive
1. `sm:` es obligatorio en casi todo — es donde ocurre el salto de mobile a tablet
2. No usar `max-*` breakpoints a menos que sea estrictamente necesario
3. Los layouts deben ser column en mobile y row en sm/tablet
4. Las tablas del panel deben ser scrollables horizontalmente en mobile (`overflow-x-auto`)

---

## 15. Copywriting

- Tono: **directo, informal, español de España** (no latinoamericano)
- Tratar al usuario de **tú**
- Sin emojis (excepto el ❤️ del footer "Hecho en Valencia ❤️")
- Botones: verbos en infinitivo o imperativo: "Continuar", "Guardar cambios", "Añadir establecimiento", "Eliminar", "Cambiar filtros"
- Errores: tono cercano pero sin disculpas excesivas. "Vaya, algo salió mal" en lugar de "Lo sentimos, ha ocurrido un error"

---

## 16. Estados de UI obligatorios

Cada componente interactivo debe manejar:

| Estado | Implementación |
|--------|----------------|
| **Loading** | Spinner: `h-10 w-10 animate-spin rounded-full border-[3px] border-stone-200 border-t-stone-900` + texto en `text-sm text-stone-400` |
| **Empty** | Icono (Frown `h-12 w-12 text-stone-300`) + texto + botón de acción |
| **Error** | Icono contenedor (`bg-red-50 h-14 w-14 rounded-2xl`) + título + descripción + botón "Reintentar" |
| **Disabled** | Botón: `bg-stone-200 text-stone-400` sin shadow ni hover |

---

## 17. Panel Restaurante — Directrices específicas

El panel restaurante debe sentirse como **parte de la misma app**, no como un dashboard separado.

### Layout del panel
- Sidebar/header con fondo `stone-900` o blanco con borde `stone-200`
- Mismo sistema de espaciado que el flujo principal
- Móvil: menú hamburguesa. Desktop: sidebar fija o header horizontal
- Contenido: `max-w-5xl` con `px-6 sm:px-8 lg:px-12`

### Secciones del panel
- Dashboard: cards con métricas usando el patrón de cards existente
- Establecimientos: tabla responsive + botón "Añadir establecimiento" (patrón primario)
- Suscripción: card de estado con badge "Activa" (bg-stone-900 text-white rounded-full) o "Inactiva" (bg-stone-200 text-stone-400)

### Formularios del panel
- Usar React Hook Form + Zod para validación
- Inputs, labels, botones según patrones de las secciones 11 y 8
- Upload de imágenes: botón secundario con icono de upload
- Los formularios largos deben dividirse en secciones con headings

### Navegación
- Móvil: bottom nav o hamburger menu con links
- Desktop: sidebar con iconos + texto
- Links: Dashboard, Establecimientos, Suscripción, Cerrar sesión

---

## 18. Resumen de reglas innegociables

1. **No añadir colores** fuera de la familia stone (excepto red para errores)
2. **No cambiar radios**: `rounded-2xl` es el estándar
3. **No cambiar sombras**: `shadow-sm` reposo, `shadow-lg` CTAs
4. **No cambiar animaciones**: 250ms transiciones, stagger children 0.04-0.08
5. **Mobile-first**: diseñar para 375px primero, expandir con `sm:` → `lg:`
6. **Mismos iconos**: siempre Lucide React, tamaños según contexto
7. **Mismo tono**: todas las pantallas deben parecer de la misma aplicación
8. **Sin login de usuarios finales**: solo restaurantes se autentican (Supabase Auth email/password)
9. **Estados siempre**: loading, empty, error, disabled en todos los componentes
