# Orquesta

Plugin que convierte cualquier petición en un plan con evidencia y lo reparte entre agentes, usando para cada tarea el modelo más barato que la resuelve bien.

## Qué hace

1. **Triaje**: lo trivial se hace directamente, sin archivos.
2. **Análisis** (`orquesta:analista`): escribe `.orquesta/AAAA-MM-DD-<slug>/BRIEF.md` y `TAREAS.md`. Cada tarea lleva evidencia `[usuario]`, `[archivo]`, `[web]` o `[comando]`.
3. **Verificación** (`orquesta:verificador`): comprueba cada evidencia y escribe `VERIFICACION.md`.
4. **Ejecución**: cada tarea al agente de su nivel, respetando dependencias, como máximo 3 a la vez.
5. **Revisión** (`orquesta:revisor`): ejecuta el criterio de aceptación y marca `verificado` o devuelve la tarea. Dos fallos seguidos suben un nivel.
6. **Cierre**: resumen de 5 líneas como máximo.

## Componentes

| Componente | Chat | Cowork | Claude Code |
| --- | --- | --- | --- |
| Skill `orquesta` | Sí (hace ella misma los pasos y te recomienda modelo) | Sí | Sí |
| Skill `orquesta-verificar` | Sí | Sí | Sí |
| Agentes `analista`, `verificador`, `rapido`, `constructor`, `arquitecto`, `investigador`, `revisor` | No | Sí | Sí |
| Hooks `SessionStart` y `Stop` (Node) | No | Sí | Sí |

## Agentes y modelos

| Agente | Modelo | Esfuerzo | Nivel |
| --- | --- | --- | --- |
| rapido | haiku | low | T0 |
| constructor | sonnet | medium | T1 |
| investigador | sonnet | medium | T1 (investigación) |
| analista | sonnet | medium | análisis |
| verificador | sonnet | high | verificación |
| revisor | sonnet | medium | revisión |
| arquitecto | opus | high | T2 y T3 |

Para forzar estos modelos y poner un tope (`opus` o `fable`), instala también el plugin `orquesta-mod` (solo Claude Code).

## Hooks

- **SessionStart** (`startup|resume`): si hay carpetas `.orquesta/` con tareas sin verificar, añade al contexto un aviso de 600 caracteres como máximo.
- **Stop**: si en la carpeta activa (la de `TAREAS.md` más reciente) hay tareas `hecho` sin verificar o `en curso`, pide a Claude que las cierre antes de terminar. No repite el bloqueo si ya se está continuando por este hook. Si algo falla, no bloquea.

Requieren `node` en el `PATH`. No hacen llamadas de red.

## Uso

Pide cualquier cosa de varios pasos ("añade un formulario de contacto con validación y tests") y la skill se activa sola, o invócala con `/orquesta:orquesta`. Para auditar un plan existente: `/orquesta:orquesta-verificar`.
