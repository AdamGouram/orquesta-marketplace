# Orquesta

Ante cualquier petición de varios pasos, Orquesta:

1. analiza qué hay que hacer de verdad;
2. lo escribe en `.orquesta/AAAA-MM-DD-<slug>/` (`BRIEF.md`, `TAREAS.md`), con cada tarea respaldada por evidencia comprobable;
3. verifica esa evidencia y reparte las tareas entre agentes especializados;
4. usa para cada tarea el modelo más barato que la resuelve bien: Haiku para lo mecánico, Sonnet por defecto y Opus para lo difícil.

Las peticiones triviales se responden directamente, sin archivos.

## Qué hay en este marketplace

| Plugin | Para qué | Dónde funciona |
| --- | --- | --- |
| [`orquesta`](plugins/orquesta/README.md) | Skill de planificación, 7 agentes y hooks de inicio y cierre | Chat de claude.ai (solo la skill), Cowork y Claude Code |
| [`orquesta-mod`](plugins/orquesta-mod/README.md) | Fija el modelo de cada agente con un tope (`opus` o `fable`) y añade `/orquesta-coste` | Solo Claude Code 2.1.287 o posterior |

Van separados para que el chat y Cowork no reciban código que no pueden ejecutar.

## Instalación

El repositorio es privado: para instalar desde él hace falta acceso en GitHub (y, en claude.ai, tener GitHub conectado a tu cuenta).

### Chat de claude.ai y Cowork

En [Customize > Plugins](https://claude.ai/customize/plugins), dentro de claude.ai o de la app de escritorio, elige una de estas dos opciones:

- **Añadir el marketplace:** Add marketplace → `AdamGouram/orquesta-marketplace` → instala `orquesta`.
- **Subir el zip:** Add → Upload plugin → `orquesta.zip` (de la página de versiones del repositorio, o generado con `scripts/empaquetar.ps1`).

En el chat solo se carga la skill: hace ella misma los pasos y te dice al principio qué modelo conviene elegir. En Cowork también se cargan los agentes y los hooks. Un plugin instalado en tu cuenta aparece además en Claude Code como plugin sincronizado.

### Claude Code

```
/plugin marketplace add AdamGouram/orquesta-marketplace
/plugin install orquesta@orquesta-marketplace
/plugin install orquesta-mod@orquesta-marketplace
```

Al instalar `orquesta-mod` se te pregunta el modelo máximo (`opus` por defecto) y cuántos agentes a la vez (3 por defecto). Para cambiarlo después: `/plugin configure orquesta-mod@orquesta-marketplace`.

Para probarlo sin instalar:

```
claude --plugin-dir plugins/orquesta --plugin-dir plugins/orquesta-mod
```

## Uso

Pide algo de varios pasos ("añade descuentos al carrito con tests") y la skill se activa sola, o invócala con `/orquesta:orquesta`. Para auditar un plan ya escrito: `/orquesta:orquesta-verificar`. En Claude Code, `/orquesta-coste` muestra cuántos agentes se lanzaron con cada modelo y el uso de la sesión.

## Cuánto ahorra (y cuándo no)

En las pruebas (ver [`docs/DECISIONES.md`](docs/DECISIONES.md)), entre el 55 % y el 68 % del coste de cada petición fue del hilo principal cuando la sesión corría en Opus: es quien coordina. Para que Orquesta ahorre de verdad:

- usa **Sonnet como modelo de la sesión principal** y deja que el arquitecto use Opus solo en las tareas T2;
- reserva Orquesta para peticiones con varias tareas; en un cambio pequeño, el reparto cuesta más que hacerlo directamente.

Opcional: un subagente propio llamado `Explore` con `model: haiku` hace que la exploración del código también vaya en Haiku (ver la [documentación de subagentes](https://code.claude.com/docs/en/sub-agents)).

No pongas `CLAUDE_CODE_SUBAGENT_MODEL` con `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1`: fuerza un único modelo en todos los subagentes y anula el enrutado.

## Desarrollo

```
claude plugin validate . --strict
claude plugin validate plugins/orquesta --strict
claude plugin validate plugins/orquesta-mod --strict
claude plugin test plugins/orquesta-mod
claude plugin eval plugins/orquesta --runs 1 --ablation none
```

Probado con Claude Code 2.1.293 en Windows 11 y Node 22.

## Licencia

MIT
