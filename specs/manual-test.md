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
- Battle: votar entre dos restaurantes → avanza al siguiente par
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

🔁 Regresión general

- Navegar entre todas las rutas sin 404 ni 500
- Refrescar página en cada ruta → no pierde estado crítico
- Consola del navegador sin errores (ni warnings de React)