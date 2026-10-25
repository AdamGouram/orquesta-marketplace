---
description: Debe activar la skill orquesta.
tags: [activa]
max_turns: 4
allowed_tools: [Read, Glob, Grep, Skill]
---

Refactoriza el módulo de pagos para separar la validación de la tarjeta del cálculo de impuestos; ahora está todo en una función de 300 líneas en src/pagos.js y lo usan el checkout y las suscripciones.
