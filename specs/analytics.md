# Analytics Spec

## Objetivo

Medir:
- efectividad recomendaciones
- comportamiento usuarios
- rendimiento restaurantes
- conversión llamadas

---

# Eventos principales

## search_started

Cuando usuario inicia búsqueda.

Guardar:
- timestamp
- session_id
- ubicación aproximada

---

## question_answered

Cada respuesta usuario.

Guardar:
- question_id
- answer
- search_id

---

## top5_generated

Cuando se genera Top 5.

Guardar:
- restaurantes mostrados
- scores
- posición

---

## battle_completed

Cuando usuario elige restaurante.

Guardar:
- restaurante ganador
- restaurante perdedor

---

## final_winner

Restaurante final elegido.

---

## call_clicked

Usuario pulsa llamar.

Evento más importante del MVP.

---

# Métricas dashboard restaurante

## Impresiones
Veces en Top 5.

## Wins
Veces ganador final.

## Call CTR
Clicks llamar / impresiones.

## Conversion rate
Ganador final / impresiones.

---

# KPIs globales

## Usuario
- tiempo decisión
- búsquedas completadas
- abandono

## Negocio
- restaurantes activos
- MRR
- churn mensual

---

# Retención datos

## Eventos crudos
12 meses.

## Agregados
Indefinido.

---

# Privacidad

No almacenar:
- nombres usuarios
- teléfonos usuarios
- datos sensibles

---

# Futuro

## Recomendación IA
Usar analytics para:
- mejorar scoring
- personalización
- rankings dinámicos