🧪 Checklist de pruebas manuales en producción

🔐 Auth

- Registro de nuevo usuario (email + password)
- Confirmación de email (magic link / OTP)
- Inicio de sesión con credenciales correctas
- Inicio de sesión con credenciales incorrectas → mensaje de error
- "He olvidado mi contraseña" → recibir email con enlace, poder resetear
- Cerrar sesión → redirige a página principal
- Sesión expirada → redirige a login, no deja ver panel
- Acceder a /dashboard sin sesión → redirige a login
- Acceder a /categorias como no-staff → redirige a /dashboard

🏠 Landing (/)

- Hero se renderiza con gradiente y texto sin errores
- Sección "Cómo funciona" visible
- Sección "Sé uno de los 100 restaurantes fundadores" visible (con cards Normal vs Fundador)
- Stats banner visible
- CTA "Publica tu restaurante" funciona
- "¿Ya tienes cuenta? Inicia sesión" funciona
- Footer visible con enlaces a T&C, privacidad, aviso legal

🍽️ Flujo público (/) — anónimo

- Seleccionar categoría(s) → avanza a precio
- Seleccionar precio → avanza a zona
- Seleccionar zona → ver resultados
- Top 5: botón "Elegir favorito" → arranca la battle
- Battle: tarjeta con la foto principal de fondo y el nombre encima
- Tocar la tarjeta → abre la modal con el carrusel completo
- Modal: deslizar cambia de foto, dots y flechas también, botón de pantalla completa funciona
- Modal: nombre, descripción y dirección visibles
- Modal: botón de Instagram abre el perfil en pestaña nueva; si no hay `instagram_url`, no aparece
- Modal: no aparecen botones de Llamar, Cómo llegar, Ver menú ni Reservar
- Modal: cerrar con X, con clic en el fondo y con Escape
- Modal: el scroll de la página queda bloqueado mientras está abierta y vuelve al cerrar
- Modal: al elegir, se cierra antes de pasar de ronda
- Battle: deslizar cambia entre las dos tarjetas, la centrada es la que se elige
- Winner: ver restaurante ganador con nombre, descripción, precio, zona, categorías
- Badge "Fundador" visible si el restaurante tiene founder_rank
- Badge "Demo" visible si el restaurante tiene is_demo = true
- Los restaurantes demo aparecen después que los reales
- "Cómo llegar" abre Google Maps con la dirección del restaurante
- "Menú" / "Reservas" enlaces funcionan si están configurados
- Volver atrás desde resultados → mantiene selecciones anteriores
- Top 5 grid muestra los badges correctamente

🏪 Panel del restaurante (dueño)

- Login como dueño → ver sus restaurantes
- Dashboard muestra información correcta
- Crear restaurante: formulario completo (nombre, descripción, teléfono, dirección, precio, imagen, menú, reservas)
- Categorías: seleccionar/deseleccionar categorías existentes
- Crear categoría rápida desde el formulario (si es staff)
- Guardar restaurante → mensaje de éxito, redirige a lista
- Editar restaurante existente → campos precargados
- Ver suscripción (estado, fecha, badge verde si activa)
- Cancelar suscripción / darse de baja

⚙️ Panel staff

- Login como staff → sidebar con enlaces a Categorías y "Crear para un cliente"
- /categorias: crear categoría (sin campo icono)
- /categorias: editar categoría
- /categorias: eliminar categoría (confirmación, no rompe relaciones)
- /categorias: lista cargada correctamente, empty state si no hay
- Crear restaurante para un cliente: toggle "Restaurante demo" visible y funcional
- Editar restaurante de otro dueño: toggle demo visible
- Invitar owner: recibir email con enlace OTP, registrar contraseña, acceder al panel
- Ver restaurantes de todos los dueños
- Badge Fundador/Demo visible en panel cards del staff

💳 Stripe (test mode)

- Iniciar suscripción → redirige a Stripe Checkout (test)
- Completar pago en Stripe test → volver a la app
- Webhook actualiza el estado de suscripción
- Ver en panel que la suscripción aparece como activa

📱 Responsive / UX

- Todas las páginas anteriores en móvil (320px), tablet, desktop
- Modales se cierran con botón X y con clic fuera
- Botones de carga/loading states se muestran durante operaciones lentas
- Errores de red se muestran como toast o mensaje en pantalla

📄 Páginas legales

- /terminos — se renderiza sin errores
- /privacidad — se renderiza sin errores
- /aviso-legal — datos correctos (CIF, dirección)

🖼️ Carrusel de fotos (regresión)

- Con más de una foto: deslizar horizontal cambia de foto
- Con una sola foto: no aparece swipe ni dots
- **Scroll vertical empezando sobre una foto → la página hace scroll normal**
- El scroll vertical nunca cambia de foto ni captura el puntero
- Tras un scroll vertical, el swipe horizontal sigue funcionando
- Dots, flechas y Maximize no seleccionan la tarjeta que los contiene
- Abrir Maximize y cerrar con X / Escape
- Verificar también en la ficha (`/sitio/[id]`), en la modal de la battle y en las cards del panel

**Las tarjetas de batalla no llevan carrusel**: si aparece uno, es un regresión.

🔁 Regresión general

- Navegar entre todas las rutas sin 404 ni 500
- Refrescar página en cada ruta → no pierde estado crítico
- Consola del navegador sin errores (ni warnings de React)