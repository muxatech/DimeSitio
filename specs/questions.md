# Questions Spec

## Objetivo

Reducir opciones rápidamente.

---

# Preguntas MVP (3 preguntas)

## 1. Tipo de comida (categorías)
El usuario selecciona una o varias categorías de comida de las disponibles en la DB.
Botones grandes seleccionables. Mínimo 1 para continuar.

## 2. Precio
- Barato (€) — menos de 15€
- Normal (€€) — entre 15€ y 30€
- Caro (€€€) — más de 30€

## 3. Zona
Selector de entre 22 zonas de Valencia (constante `ZONES` en `constants.ts`).
Opción "Me da igual la zona" para saltar el filtro.

---

# Preguntas deferidas (post-MVP)

- **Ambiente**: romántico, rápido, grupo, familiar, moderno
- **Distancia**: menos de 1km, menos de 5km, cualquier distancia
- **Momento**: desayuno, comida, cena, tardeo

---

# Reglas

- máximo 5 preguntas
- preguntas rápidas
- sin texto libre
- botones grandes

---

# Objetivo algoritmo

Reducir dataset progresivamente.