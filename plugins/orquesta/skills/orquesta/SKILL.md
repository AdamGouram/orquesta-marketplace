---
name: orquesta
description: Úsala por defecto en cualquier petición de construir, añadir, cambiar, arreglar un bug, refactorizar o investigar algo que lleve más de un paso, toque más de un archivo o pida tests, aunque no se mencione Orquesta. Escribe el plan con evidencia en .orquesta/ y reparte cada tarea al agente y modelo más barato que la resuelve bien.
license: MIT
compatibility: Claude Code, Cowork y chat de claude.ai. Los agentes y los hooks solo funcionan en Claude Code y Cowork.
metadata:
  version: "0.1.0"
---

# Orquesta

Conviertes una petición en un plan con evidencia, lo verificas, lo repartes entre agentes especializados y compruebas el resultado. El objetivo es hacer lo que el usuario pidió de verdad, sin inventar nada, gastando los mínimos tokens.

Lo imprescindible del formato y de la rúbrica está en esta página y en cada agente. Si puedes leerlos, hay más detalle y un ejemplo ficticio en:
- [referencia/formato-tareas.md](referencia/formato-tareas.md): `BRIEF.md`, `TAREAS.md`, `VERIFICACION.md` y `DISENO.md`.
- [referencia/rubrica-niveles.md](referencia/rubrica-niveles.md): niveles, ajustes y escalada.

Si no puedes leerlos (por ejemplo, por permisos), sigue con lo de esta página: no hace falta parar.

## Formato mínimo de `TAREAS.md`

```
# TAREAS: <título>
Petición original: "<cita literal del usuario>"

## Alcance
- Dentro: ...
- Fuera (no hacer): ...

## Supuestos (SIN CONFIRMAR)
- S1: ...

## Preguntas abiertas (bloquean)
- P1: ...

## Tareas
- [ ] T1 · nivel T0 · agente orquesta:rapido · depende de: ninguna
  - Qué: ...
  - Evidencia: [usuario] "..." | [archivo] ruta:línea
  - Aceptación: <comando, test u observación concreta>
  - Estado: pendiente
```

- Evidencia solo de cuatro tipos: `[usuario]` con cita literal, `[archivo]` con ruta y línea, `[web]` con URL abierta, `[comando]` con comando y salida relevante.
- Estados: `pendiente`, `en curso`, `hecho`, `verificado`, `bloqueado` (puede seguir ` — <nota>`).

## Rúbrica de niveles

| Nivel | Agente | Modelo | Cuándo |
| --- | --- | --- | --- |
| T0 | `orquesta:rapido` | haiku | Mecánico, 1 archivo, especificación cerrada, comprobable con un comando |
| T1 | `orquesta:constructor` (`orquesta:investigador` si es buscar información) | sonnet | Por defecto: varios archivos con patrón conocido, tests, investigación con fuentes |
| T2 | `orquesta:arquitecto` | opus | Arquitectura, requisitos ambiguos, refactor transversal, bug difícil, seguridad, pagos o borrado de datos |
| T3 | `orquesta:arquitecto` con `model: "fable"` | fable (u opus si no se permite) | Solo si hace falta tras escalar |

Suben nivel: ambigüedad, más de 5 archivos o varios módulos, modelo de datos, concurrencia o algoritmos no triviales, un intento fallido. Bajan: un solo archivo, patrón que copiar, criterio comprobable con un comando. En duda: el nivel inferior más una verificación. Saltar dos niveles exige `- Justificación de nivel: ...` en la tarea.

## 0. Detecta el entorno

Mira las herramientas que tienes:
- **Tienes la herramienta Agent** (Claude Code o Cowork): flujo completo con los agentes `orquesta:*`.
- **No la tienes** (chat de claude.ai): haz tú cada paso. Si puedes crear archivos, escribe los MD como archivos; si no, ponlos en la respuesta. Empieza la respuesta con una línea del tipo: "Esta petición es T2: te conviene elegir Opus en el selector de modelo."

## 1. Triaje

Si la petición es trivial (una respuesta directa o un cambio de una línea), hazla directamente, no crees archivos y dilo en una línea: "Trivial: lo hago directamente, sin plan."

Todo lo demás sigue el flujo.

## 2. Análisis

Encárgalo al agente `orquesta:analista` (o hazlo tú si no hay agentes). Debe crear la carpeta `.orquesta/AAAA-MM-DD-<slug>/` en la raíz del proyecto con `BRIEF.md` y `TAREAS.md` según el formato de referencia.

Reglas:
- Cita la petición original literalmente.
- Cada tarea lleva al menos una evidencia de tipo `[usuario]`, `[archivo]`, `[web]` o `[comando]`. Una tarea sin evidencia no es una tarea: pasa a "Supuestos" o "Preguntas abiertas".
- Cada tarea lleva nivel (T0–T3), agente, dependencias y un criterio de aceptación comprobable.
- Si hay preguntas abiertas que bloquean, **para** y hazlas todas juntas en un solo mensaje. No sigas hasta tener respuesta.

## 2b. Revisión del nivel

Antes de verificar, revisa tú los niveles que puso el analista. Es obligatorio y no se delega.

Hace falta una tarea T2 para `orquesta:arquitecto` cuando se cumple cualquiera de estas condiciones:
- la petición pide decidir algo ("decide tú", "elige cómo", "diseña");
- hay que elegir cómo representar algo nuevo (estructura de datos, campos, formato, API pública);
- el `BRIEF.md` o los supuestos contienen una decisión de diseño que tomó el analista (una representación, una fórmula, una estructura elegida entre varias posibles).

Si se cumple y no existe esa tarea:
1. Añade al principio de "Tareas" una tarea `nivel T2 · agente orquesta:arquitecto · depende de: ninguna` cuyo "Qué" sea tomar esa decisión, escribirla en `DISENO.md` e implementarla. Evidencia: la cita del usuario que obliga a decidir. Si ya había una tarea que implementaba ese diseño, fusiónala en esta y elimínala, para que no haya dos tareas con el mismo trabajo.
2. Haz que las tareas que usan esa decisión dependan de ella y quita de sus "Qué" el diseño que había fijado el analista.
3. Pasa a "Supuestos (SIN CONFIRMAR)" las decisiones que el analista dio por tomadas, como propuestas para el arquitecto.
4. Añade a la nueva tarea `- Justificación de nivel: revisión de la skill, requiere decisión de diseño`.

## 3. Verificación del plan

Encárgala a `orquesta:verificador`, que es independiente del analista. Comprueba cada evidencia (abre el archivo y la línea, la URL, repite el comando) y escribe solo `VERIFICACION.md`. Después, tú aplicas su sección "Cambios en TAREAS.md": las tareas cuya evidencia falla salen de "Tareas" y pasan a "Supuestos (SIN CONFIRMAR)" o a "Preguntas abiertas". Si eso deja preguntas que bloquean, para y pregunta.

## 4. Ejecución

Reparte las tareas pendientes:
- Cada tarea va al agente de su nivel (ver rúbrica). Respeta `depende de`: no lances una tarea hasta que sus dependencias estén en `verificado`.
- Como máximo 3 agentes a la vez (o el `max_paralelo` que haya configurado el usuario en `orquesta-mod`). Lanza en paralelo las tareas independientes en un mismo mensaje.
- Antes de lanzar una tarea, cambia su estado a `en curso` en `TAREAS.md`.
- El encargo a cada agente es **autocontenido** y no lleva nada más que esto:

```
Tarea <ID> de .orquesta/<carpeta>/TAREAS.md
Qué: <texto de la tarea>
Evidencia: <evidencias de la tarea>
Aceptación: <criterio de aceptación>
Rutas: <rutas exactas de archivos a leer o cambiar>
Al terminar: cambia el Estado de <ID> a "hecho" en TAREAS.md y responde con un resumen de 3 líneas y los archivos tocados.
```

Usa `subagent_type: "orquesta:<agente>"` y `run_in_background: false`: un agente en segundo plano no puede pedir permisos y se le deniegan los comandos. Para trabajar en paralelo, pon varias llamadas Agent en el mismo mensaje. No pases el parámetro `model` salvo en la escalada a T3.

## 5. Revisión

Para cada tarea en `hecho`, lanza `orquesta:revisor` con el ID y el criterio de aceptación. El revisor ejecuta los comandos o tests del criterio y:
- marca `verificado`, o
- la devuelve a `pendiente` con el fallo concreto anotado en la tarea.

Escalada: si una tarea falla la revisión dos veces seguidas, súbela un nivel y reasígnala:
`orquesta:rapido` → `orquesta:constructor` → `orquesta:arquitecto` → `orquesta:arquitecto` con `model: "fable"` (T3; si el usuario no permite fable, el mod lo deja en opus). Anota la subida en `TAREAS.md` con el motivo.

Solo `verificador` y `revisor` ponen `verificado`. Tú nunca.

## 6. Cierre

Responde en 5 líneas como máximo:
1. Qué se hizo (IDs verificados).
2. Qué quedó pendiente o bloqueado y por qué.
3. Si existe el comando `/orquesta-coste`, sugiere ejecutarlo para ver el gasto por modelo.

## Reglas que no se rompen

- No inventes archivos, líneas, URLs, comandos ni salidas. Si no lo has visto, es un supuesto.
- No implementes durante el análisis.
- No pongas `verificado` sin haber ejecutado el criterio de aceptación.
- Los ejemplos de la referencia son ficticios: no los copies como si fueran reales.
- Escribe en español todo lo que vaya a leer el usuario.
