import { expect, test } from 'claude-code/testing'
import type { On } from 'claude-code'

// Lo que el motor respondería: el agente arranca con el modelo que le llega,
// o 'sin-tocar' si nadie fijó uno. Y un $.store en memoria.
function motor(on: On, guardado = new Map<string, unknown>()) {
  on('agent.spawn', ($, e) => ({ model: e.model ?? 'sin-tocar' }))
  on('session.id', () => ({ value: 'sesion-1' }))
  on('store.get', ($, e) => ({ value: guardado.get(e.key) }))
  on('store.set', ($, e) => {
    guardado.set(e.key, e.value)
    return { value: undefined }
  })
  return guardado
}

test('un agente de Orquesta recibe el modelo de su tabla', async ($, on) => {
  motor(on)
  expect((await $.agent.spawn({ prompt: 'x', subagentType: 'orquesta:rapido' })).model).toBe('haiku')
  expect((await $.agent.spawn({ prompt: 'x', subagentType: 'orquesta:constructor' })).model).toBe('sonnet')
  expect((await $.agent.spawn({ prompt: 'x', subagentType: 'orquesta:arquitecto' })).model).toBe('opus')
})

test('un modelo pedido más caro se respeta para escalar', async ($, on) => {
  motor(on)
  const r = await $.agent.spawn({ prompt: 'x', subagentType: 'orquesta:rapido', model: 'sonnet' })
  expect(r.model).toBe('sonnet')
})

test('un modelo pedido más barato no baja el de la tabla', async ($, on) => {
  motor(on)
  const r = await $.agent.spawn({ prompt: 'x', subagentType: 'orquesta:arquitecto', model: 'haiku' })
  expect(r.model).toBe('opus')
})

test('el tope nivel_maximo=opus (por defecto) se respeta', async ($, on) => {
  motor(on)
  const r = await $.agent.spawn({ prompt: 'x', subagentType: 'orquesta:arquitecto', model: 'fable' })
  expect(r.model).toBe('opus')
})

test('con nivel_maximo=fable la escalada a fable pasa', { options: { nivel_maximo: 'fable' } }, async ($, on) => {
  motor(on)
  const r = await $.agent.spawn({ prompt: 'x', subagentType: 'orquesta:arquitecto', model: 'fable' })
  expect(r.model).toBe('fable')
})

test('un agente ajeno no se modifica ni se cuenta', async ($, on) => {
  const guardado = motor(on)
  expect((await $.agent.spawn({ prompt: 'x', subagentType: 'Explore' })).model).toBe('sin-tocar')
  expect((await $.agent.spawn({ prompt: 'x', subagentType: 'otro:rapido', model: 'haiku' })).model).toBe('haiku')
  expect((await $.agent.spawn({ prompt: 'x', subagentType: 'orquesta:desconocido' })).model).toBe('sin-tocar')
  expect(guardado.get('spawns')).toBeUndefined()
})

test('cuenta los spawns por modelo y sesión en $.store', async ($, on) => {
  const guardado = motor(on, new Map([['spawns', { 'sesion-0': { opus: 1 } }]]))
  await $.agent.spawn({ prompt: 'x', subagentType: 'orquesta:rapido' })
  await $.agent.spawn({ prompt: 'x', subagentType: 'orquesta:rapido' })
  await $.agent.spawn({ prompt: 'x', subagentType: 'orquesta:revisor' })
  expect(guardado.get('spawns')).toEqual({
    'sesion-0': { opus: 1 },
    'sesion-1': { haiku: 2, sonnet: 1 },
  })
})

test('si el contador falla, el agente arranca igual', async ($, on) => {
  on('agent.spawn', ($, e) => ({ model: e.model ?? 'sin-tocar' }))
  on('session.id', () => ({ value: 'sesion-1' }))
  on('store.get', () => ({ deny: 'store roto' }))
  const r = await $.agent.spawn({ prompt: 'x', subagentType: 'orquesta:rapido' })
  expect(r.model).toBe('haiku')
})

test('/orquesta-coste muestra spawns por modelo y el uso', async ($, on) => {
  motor(on)
  on('command.register', () => ({ value: undefined }))
  on('session.start', ($, e) => ({ cwd: e.cwd }))
  on('session.usage', () => ({
    value: {
      startedAt: 0,
      context: { tokens: 5000, window: 200000, percent: 2.5 },
      rateLimits: [{ kind: 'five_hour', percentUsed: 12 }],
      cost: { usd: 0.4 },
    },
  }))

  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await $.agent.spawn({ prompt: 'x', subagentType: 'orquesta:arquitecto' })
  const salida = await $.command.run({ command: 'orquesta-coste', args: '' })

  expect(salida.text).toContain('Agentes lanzados: opus 1')
  expect(salida.text).toContain('Contexto: 5000 de 200000 tokens (3 %)')
  expect(salida.text).toContain('Coste: 0.40 US$')
  expect(salida.text).toContain('Límite five_hour: 12 % usado')
})
