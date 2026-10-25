# Rúbrica de niveles

Cada tarea recibe un nivel. El nivel decide el agente y, con él, el modelo.

| Nivel | Modelo | effort | Agente | Cuándo |
| --- | --- | --- | --- | --- |
| T0 | haiku | low | `orquesta:rapido` | Mecánico, 1 archivo, especificación cerrada, comprobable con un comando |
| T1 | sonnet | medium | `orquesta:constructor` (o `orquesta:investigador` si es buscar información) | Por defecto: varios archivos con patrón conocido, tests, investigación con fuentes |
| T2 | opus | high | `orquesta:arquitecto` | Arquitectura, requisitos ambiguos, refactor transversal, bug difícil, seguridad, pagos o borrado de datos |
| T3 | fable, u opus si el usuario no permite fable | high (el del agente) | `orquesta:arquitecto` invocado con `model: "fable"` | Solo si `nivel_maximo` lo permite |

## Ajustes

Suben nivel:
- ambigüedad en lo que se pide;
- más de 5 archivos o varios módulos;
- decisiones de modelo de datos;
- concurrencia o algoritmos no triviales;
- un intento previo fallido.

Bajan nivel:
- un solo archivo;
- un patrón existente que copiar;
- criterio de aceptación comprobable con un comando.

En caso de duda: el nivel inferior más una verificación (el revisor la hará).

Nunca saltar dos niveles respecto a lo que indican los ajustes sin escribir `- Justificación de nivel: ...` en la tarea.

## Escalada por fallos

Dos revisiones fallidas seguidas suben la tarea un nivel:

    T0 rapido → T1 constructor → T2 arquitecto → T3 arquitecto con model "fable"

Anota cada subida en la tarea: `- Escalada: T0 → T1, motivo: <fallo concreto>`.

## Nivel global (para el chat)

El nivel global de una petición es el nivel más alto entre sus tareas. En el chat, sin agentes, recomienda al usuario el modelo de ese nivel en la primera línea de la respuesta.

## Por qué así

El modelo más barato que resuelve bien la tarea gasta menos. Una tarea mal resuelta cuesta más que subir de nivel, por eso el revisor comprueba cada tarea y la escalada es automática tras dos fallos.
