// Mod de Orquesta: fija el modelo de los agentes orquesta:* sin pasar de
// nivel_maximo, cuenta los spawns por modelo y sesión, y añade /orquesta-coste.
// No hace llamadas de red ni lanza procesos.

// Modelo de cada agente según la tabla de agentes de Orquesta.
const MODELO_AGENTE = {
  analista: 'sonnet',
  verificador: 'sonnet',
  rapido: 'haiku',
  constructor: 'sonnet',
  arquitecto: 'opus',
  investigador: 'sonnet',
  revisor: 'sonnet',
}

// De más barato a más caro.
const ORDEN = ['haiku', 'sonnet', 'opus', 'fable']

// Clave de $.store, compartido por todas las sesiones de la máquina.
const CLAVE = 'spawns'
const MAX_SESIONES = 30

// Recuentos de las sesiones de este proceso: { [sesion]: { [modelo]: n } }.
const cuentas = {}

// Posición de un alias o un id completo en ORDEN, o -1 si no se reconoce.
function rango(modelo) {
  if (typeof modelo !== 'string') return -1
  const texto = modelo.toLowerCase()
  return ORDEN.findIndex((nombre) => texto.includes(nombre))
}

// Modelo para un agente orquesta:*, o undefined si el agente no es de Orquesta.
// El mayor entre el de la tabla y el pedido, sin pasar de nivelMaximo.
function elegirModelo(subagentType, pedido, nivelMaximo) {
  if (typeof subagentType !== 'string' || !subagentType.startsWith('orquesta:')) return undefined
  const base = MODELO_AGENTE[subagentType.slice('orquesta:'.length)]
  if (base === undefined) return undefined
  const tope = rango(nivelMaximo) >= 0 ? rango(nivelMaximo) : ORDEN.indexOf('opus')
  return ORDEN[Math.min(Math.max(ORDEN.indexOf(base), rango(pedido)), tope)]
}

// Suma un spawn de `modelo` a la sesión actual y lo guarda en $.store.
async function contar($, modelo) {
  const sesion = await $.session.id()
  const todos = { ...((await $.store.get(CLAVE)) ?? {}) }
  const mias = (cuentas[sesion] ??= { ...(todos[sesion] ?? {}) })
  mias[modelo] = (mias[modelo] ?? 0) + 1

  // La sesión actual pasa al final; se conservan las MAX_SESIONES más recientes.
  delete todos[sesion]
  todos[sesion] = { ...mias }
  for (const vieja of Object.keys(todos).slice(0, -MAX_SESIONES)) delete todos[vieja]
  await $.store.set(CLAVE, todos)
}

// Texto de /orquesta-coste.
async function informe($) {
  const sesion = await $.session.id()
  const guardadas = (await $.store.get(CLAVE)) ?? {}
  const mias = cuentas[sesion] ?? guardadas[sesion] ?? {}
  const spawns = ORDEN.filter((m) => mias[m]).map((m) => `${m} ${mias[m]}`)
  const lineas = [
    'Orquesta · gasto de esta sesión',
    `Agentes lanzados: ${spawns.length > 0 ? spawns.join(' · ') : 'ninguno'}`,
  ]

  const uso = await $.session.usage()
  const { tokens, window, percent } = uso.context
  lineas.push(
    `Contexto: ${tokens ?? '?'} de ${window} tokens${percent === undefined ? '' : ` (${Math.round(percent)} %)`}`,
  )
  if (uso.cost) lineas.push(`Coste: ${uso.cost.usd.toFixed(2)} US$`)
  for (const limite of uso.rateLimits) {
    lineas.push(
      `Límite ${limite.kind}: ${Math.round(limite.percentUsed)} % usado${limite.resetsAt ? `, se reinicia ${limite.resetsAt}` : ''}`,
    )
  }
  return lineas.join('\n')
}

export function register(on, options) {
  on('agent.spawn', async ($, e, next) => {
    const modelo = elegirModelo(e.subagentType, e.model, options.nivel_maximo)
    if (modelo === undefined || e.fork) return next(e)
    const resultado = await next({ ...e, model: modelo })
    await contar($, modelo)
    return resultado
  }).catch(($, e, next) => next(e))

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'orquesta-coste',
      description: 'Muestra los agentes de Orquesta lanzados por modelo y el uso de la sesión',
    })
    return next(e)
  }).catch(($, e, next) => next(e))

  on('command.run', { command: 'orquesta-coste' }, async ($) => {
    return { text: await informe($) }
  }).catch(() => ({ text: 'Orquesta: no se pudo leer el uso de la sesión.' }))
}
