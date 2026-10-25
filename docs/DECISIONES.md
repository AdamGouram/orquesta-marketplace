# Decisiones verificadas (F0)

Fecha: 2026-10-25 · Claude Code local: 2.1.293 · Node 22.23.2 · git 2.55.0

Cada decisión cita la página de la documentación oficial donde se comprobó. Si el encargo y la documentación no coinciden, manda la documentación y la diferencia aparece en la sección final.

## Estructura del marketplace

| # | Decisión | Fuente |
| --- | --- | --- |
| D1 | El catálogo va en `.claude-plugin/marketplace.json` con `name`, `owner` y `plugins` obligatorios; cada entrada con `name` y `source` relativo que empieza por `./`. | https://code.claude.com/docs/en/plugins/marketplace-reference |
| D2 | El nombre `orquesta-marketplace` no está reservado (no empieza por `claude-`, `anthropic-`, `claudeai-`…). | https://code.claude.com/docs/en/plugins/marketplace-reference#reserved-names |
| D3 | Dentro de `.claude-plugin/` solo va `plugin.json`; el resto de componentes van en la raíz del plugin. | https://code.claude.com/docs/en/plugins/create.md |
| D4 | `--plugin-dir` debe apuntar a la carpeta de cada plugin, no a la raíz del marketplace. | https://code.claude.com/docs/en/plugins/create.md |

## Plugin portable `orquesta`

| # | Decisión | Fuente |
| --- | --- | --- |
| D5 | Frontmatter de skills limitado a `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`; cualquier otro campo da error al subir a claude.ai. | https://code.claude.com/docs/en/skills |
| D6 | `SKILL.md` por debajo de 500 líneas; el detalle en archivos de apoyo enlazados desde la skill. Descripción con el caso de uso primero (se trunca a 1536 caracteres). | https://code.claude.com/docs/en/skills |
| D7 | Campos admitidos en agentes de plugin: `name`, `description`, `model`, `effort`, `maxTurns`, `tools`, `omitClaudeMd`, entre otros. Ignorados: `permissionMode`, `hooks`, `mcpServers`, `initialPrompt`. | https://code.claude.com/docs/en/plugins/components |
| D8 | `model` admite `haiku`, `sonnet`, `opus`, `fable` o un ID; `effort` admite `low`…`max`; `omitClaudeMd` requiere v2.1.271+. | https://code.claude.com/docs/en/sub-agents |
| D9 | Los agentes del plugin se llaman `orquesta:<nombre>`. | https://code.claude.com/docs/en/plugins/components |
| D10 | `hooks/hooks.json` lleva una clave `hooks` con la misma forma que en settings. Forma exec: `"command": "node"` + `"args": [...]`, sin shell, sin comillas. `${CLAUDE_PLUGIN_ROOT}` se sustituye en `command` y `args`. | https://code.claude.com/docs/en/hooks · https://code.claude.com/docs/en/plugins/manifest-reference |
| D11 | SessionStart: matchers `startup`, `resume`, `clear`, `compact`, `fork`; salida `hookSpecificOutput.additionalContext` (límite del sistema 10 000 caracteres; nosotros nos ponemos 600). | https://code.claude.com/docs/en/hooks |
| D12 | Stop: la entrada trae `stop_hook_active` (true si ya se continúa por un Stop hook); salida `{"decision":"block","reason":"..."}`. Hay además un tope de 8 continuaciones seguidas. | https://code.claude.com/docs/en/hooks |
| D13 | `timeout` de hooks en segundos. Salida 0 = éxito; cualquier código distinto de 2 = error no bloqueante. Los scripts salen siempre con 0. | https://code.claude.com/docs/en/hooks |
| D14 | Chat de claude.ai: carga skills, ignora agentes y hooks. Cowork: carga skills, agentes y hooks. Un `bin/` en la raíz impide instalar en chat y Cowork (no lo usamos). | https://claude.com/docs/plugins/platform-support |
| D15 | Un `CLAUDE.md` en la raíz del plugin no se carga: las instrucciones van en skills. | https://code.claude.com/docs/en/plugins/components |

## Plugin `orquesta-mod`

| # | Decisión | Fuente |
| --- | --- | --- |
| D16 | Mods: Claude Code v2.1.287+ en terminal (tengo 2.1.293). Un plugin es mod si `hooks/hooks.json` tiene `"modules": ["./register.js"]`. | https://code.claude.com/docs/en/plugins/mods/overview.md |
| D17 | El módulo exporta `register(on, options)`; `options` trae los valores de `userConfig` con los defaults rellenos. | https://code.claude.com/docs/en/plugins/mods/reference |
| D18 | `agent.spawn` se dispara antes de arrancar un subagente; el hook devuelve `next({ ...e, model })` para elegir modelo. El tipo trae `subagentType` (formato `<plugin>:<nombre>`) y `model?`. Si un mod fija el modelo en `agent.spawn`, sustituye al parámetro por invocación. | https://code.claude.com/docs/en/plugins/mods/reference · https://code.claude.com/docs/en/sub-agents · https://github.com/anthropics/claude-code/blob/main/mods/types/claude-code.d.ts |
| D19 | Comando propio: `$.command.register({ name, description })` en `session.start` y `on('command.run', { command }, …)` que devuelve `{ text }`. | https://code.claude.com/docs/en/plugins/mods/create |
| D20 | `$.session.usage()` devuelve `{ startedAt, context, rateLimits, cost }`; `context` con `tokens`, `window`, `percent`. | https://code.claude.com/docs/en/plugins/mods/reference |
| D21 | Cada `on()` devuelve un registro con `.catch(handler)`; `claude plugin validate` avisa de hooks sin `.catch` y lista `hooks:` y `calls:`. | https://code.claude.com/docs/en/plugins/mods/create |
| D22 | Reglas de análisis estático: llamadas `$` escritas completas, nombres de evento literales, solo `import` estáticos de archivos del plugin o `claude-code`. | https://code.claude.com/docs/en/plugins/mods/create |
| D23 | Tests: archivos `*.test.ts` con `import { expect, test, mock } from 'claude-code/testing'`; `claude plugin test` sin sesión ni red; los stubs de llamadas a la API devuelven `{ value }`. | https://code.claude.com/docs/en/plugins/mods/test.md |
| D24 | `userConfig`: `type` `string` con `options` para un selector (v2.1.271+), `number` con `min`/`max`, `default`. Con `--plugin-dir` no aparece el diálogo: se configura con `/plugin configure`. | https://code.claude.com/docs/en/plugins/manifest-reference · https://code.claude.com/docs/en/plugins/create.md |
| D25 | Los tipos exactos de mi versión se generan en `.claude-plugin/types/` al cargar el mod con `--plugin-dir` en una sesión interactiva; mandan sobre cualquier página. | https://code.claude.com/docs/en/plugins/mods/create |

### Comprobado en los tipos de la versión (F2)

Tipos leídos de `claude-code.d.ts` que genera Claude Code 2.1.308 (la copia del motor de la app de escritorio; el CLI es 2.1.293 y con él pasan validate y test). En F3, el CLI 2.1.293 escribió sus propios tipos en `plugins/orquesta-mod/.claude-plugin/types/` y coinciden en `subagentType`, `model?` y `fork`.

| # | Decisión | Fuente |
| --- | --- | --- |
| D25a | `AgentSpawnInput.subagentType` es el tipo resuelto (un agente de plugin, `Explore`, `fork`…). `model?` es el parámetro `model` de la herramienta Agent tal como llega; si un hook lo fija, elige el modelo del subagente. `fork: true` ignora `model`. No hay campo de esfuerzo. | `claude-code.d.ts`, `export type AgentSpawnInput` |
| D25b | `AgentSpawnResult.model` es obligatorio; desde un hook puede ser un alias. | `claude-code.d.ts`, `export type AgentSpawnResult` |
| D25c | `Register = (on, options: PluginOptions) => unknown`; `.catch(handler)` recibe `next` reutilizable: si el hook ya llamó a `next`, `next(e)` devuelve el mismo resultado sin volver a ejecutar nada. | `claude-code.d.ts`, `Register`, `Caught` |
| D25d | En tests, `test(nombre, { options }, cuerpo)` da al plugin sus valores de `userConfig`. | `claude-code.d.ts`, `TestOptions` |
| D25e | `$.store.get/set/delete` son por plugin; `SessionUsage.cost` es `{ usd }` y puede faltar. | `claude-code.d.ts`, `store`, `SessionUsage` |

## Evals

| # | Decisión | Fuente |
| --- | --- | --- |
| D26 | Suite en `evals/<caso>/prompt.md` + `graders/*.md`. Para saber si la skill se activó: grader `tool_used` con `tool: Skill` e `input_match`. Para exigir que NO se active: `min: 0`, `max: 0` y `arm: both`. | https://code.claude.com/docs/en/plugin-evals |
| D27 | Cada caso se ejecuta 3 veces con plugin y 3 sin él por defecto; todo cuenta contra tu plan. `--runs 1 --ablation none` para iterar barato. | https://code.claude.com/docs/en/plugin-evals |
| D28 | En Windows nativo no hay sandbox: no se puede conceder `Bash` a las evals; sí `Write`/`Edit` y las herramientas de solo lectura. | https://code.claude.com/docs/en/plugin-evals |

## Diferencias con el encargo

1. **`$.store` no es por sesión.** Es el almacén del plugin, compartido entre todas las sesiones de la máquina (límite 4 MiB). El contador se guarda bajo una clave con el id de sesión (`$.session.id()`). Fuente: https://code.claude.com/docs/en/plugins/mods/reference
2. **Escalada de nivel y mod.** Si el mod fijase siempre el modelo de la tabla, "dos fallos seguidos: sube un nivel" no tendría efecto al pedir otro modelo en la invocación. Solución: la skill escala cambiando de agente (rapido → constructor → arquitecto) y, para T3, invoca `arquitecto` con el parámetro `model`. Regla del mod: `modelo = el mayor entre el de la tabla y el pedido`, sin superar nunca `nivel_maximo` (orden haiku < sonnet < opus < fable). Fuente: https://code.claude.com/docs/en/sub-agents
3. **Esfuerzo T3 (`xhigh`).** En la lista de campos de `AgentSpawnInput` del archivo de tipos público no aparece ningún campo de esfuerzo; el esfuerzo lo fija el `effort` del agente. `arquitecto` queda en `high` según la tabla; T3 se distingue por el modelo. Se revisará con los tipos de la versión (D25).
4. **Tipos del mod.** No hay un comando para obtenerlos: Claude Code los escribe al cargar un mod. Se usaron los que escribe la guía integrada `plugin-authoring` para el motor 2.1.308 (D25a–D25e).
6. **`max_paralelo`.** Un hook tiene 10 s de tiempo propio y `$.clock.sleep` cuenta dentro de ese límite, así que el mod no puede hacer esperar a un subagente hasta que haya hueco; solo podría rechazarlo. El mod declara la opción y la skill la respeta como referencia. Fuente: https://code.claude.com/docs/en/plugins/mods/reference#limits
5. **Evals sin Bash en Windows** (D28): los casos no pueden ejecutar comandos de shell.
