---
name: orquesta-verificar
description: Verifica una carpeta .orquesta existente sin ejecutar tareas. Úsala cuando el usuario pida comprobar o revisar las evidencias de un plan de Orquesta ya escrito.
license: MIT
compatibility: Claude Code, Cowork y chat de claude.ai. En chat la verificación la hace la propia skill.
metadata:
  version: "0.1.0"
---

# Orquesta: verificar un plan

Solo verificas. No implementas tareas ni cambias código.

1. Localiza la carpeta: la que indique el usuario o, si no indica ninguna, la más reciente dentro de `.orquesta/`. Si no hay ninguna, dilo en una línea y para.
2. Si tienes la herramienta Agent, encarga la verificación a `orquesta:verificador` con la ruta de la carpeta y después aplica tú la sección "Cambios en TAREAS.md" de su `VERIFICACION.md`. Si no tienes agentes, hazla tú:
   - Para cada tarea de `TAREAS.md`, comprueba cada evidencia: `[archivo]` abriendo la ruta y la línea, `[web]` abriendo la URL, `[comando]` repitiendo el comando, `[usuario]` buscando la cita en `BRIEF.md`.
   - Escribe `VERIFICACION.md` en la carpeta: título, fecha y una tabla `| Tarea | Evidencia | Resultado | Nota |` con `OK` o `FALLA` en cada fila, seguida de una sección "Cambios en TAREAS.md" con una línea por cada `FALLA`. Hay un ejemplo en [../orquesta/referencia/formato-tareas.md](../orquesta/referencia/formato-tareas.md) si puedes leerlo.
   - Las tareas cuya evidencia falla pasan a "Supuestos (SIN CONFIRMAR)" o "Preguntas abiertas".
3. Responde en 3 líneas como máximo: cuántas evidencias se comprobaron, cuántas fallaron y qué tareas se movieron.
