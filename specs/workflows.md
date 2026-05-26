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

# Moderación futura

- Revisar restaurantes fake
- Control calidad imágenes
- Bloqueos fraude