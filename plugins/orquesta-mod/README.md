# Orquesta (mod)

Complemento del plugin `orquesta` solo para Claude Code (v2.1.287 o posterior). Es un mod: código JavaScript que Claude Code ejecuta dentro de la sesión. No hace llamadas de red ni lanza procesos (`claude plugin validate` lo muestra en su línea `calls:`).

## Qué hace

1. **Fija el modelo de cada agente `orquesta:*`** al arrancar (`agent.spawn`):

   | Agente | Modelo |
   | --- | --- |
   | rapido | haiku |
   | analista, verificador, constructor, investigador, revisor | sonnet |
   | arquitecto | opus |

   Si la llamada pide un modelo más caro (la escalada de la skill: dos revisiones fallidas suben un nivel), se respeta. Nunca pasa de `nivel_maximo`. Los subagentes que no son de Orquesta no se tocan.

2. **Cuenta los agentes lanzados por modelo y por sesión** en su almacén (`$.store`), que guarda las 30 sesiones más recientes.

3. **Añade `/orquesta-coste`**: agentes lanzados por modelo en la sesión, contexto usado, coste si Claude Code lo conoce y límites del plan.

Si cualquier parte falla, el evento sigue como si el mod no estuviera.

## Configuración

| Opción | Valores | Por defecto | Para qué |
| --- | --- | --- | --- |
| `nivel_maximo` | `opus`, `fable` | `opus` | Modelo más caro permitido |
| `max_paralelo` | 1–8 | 3 | Agentes de Orquesta a la vez (lo usa la skill como referencia; el mod no lo impone) |

Se configura al instalar desde `/plugin`, o después con `/plugin configure orquesta-mod@orquesta-marketplace`.

No pongas `CLAUDE_CODE_SUBAGENT_MODEL` con `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1` en tus ajustes: fuerza un modelo en todos los subagentes y anula este enrutado.

## Desarrollo

```bash
claude plugin validate plugins/orquesta-mod --strict
claude plugin test plugins/orquesta-mod
```

Probado con Claude Code 2.1.293 (CLI) y los tipos de mods de la 2.1.308.
