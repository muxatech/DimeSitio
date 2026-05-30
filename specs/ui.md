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

### Formulario extendido
- Mismos campos que el formulario normal
- Campo extra al final: "Email del propietario" (input texto, visible siempre)
- Botón submit: "Crear y enviar a pago" (texto diferente al normal "Crear establecimiento")

### Pantalla post-creación
- Mensaje: ✅ Datos guardados
- Texto: "Ahora el propietario debe pagar para activar el establecimiento."
- Botón grande: "Ir a pago →" (abre Stripe Checkout en nueva pestaña/mismo navegador)
- El dueño gira el iPad y pulsa el botón → Stripe → pone su tarjeta

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