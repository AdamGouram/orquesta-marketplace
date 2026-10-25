---
description: Debe activar la skill orquesta.
tags: [activa]
max_turns: 4
allowed_tools: [Read, Glob, Grep, Skill]
---

El login falla cuando el email tiene mayúsculas: el registro guarda el email tal cual y el login lo compara en minúsculas. Arréglalo en el registro y en el login y añade tests que lo cubran.
