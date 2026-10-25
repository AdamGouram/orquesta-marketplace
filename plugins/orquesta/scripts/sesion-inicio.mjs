// SessionStart: avisa de las carpetas .orquesta/ con tareas sin verificar.
// Si no hay ninguna, no imprime nada. Nunca falla: sale siempre con 0.
import { carpetas, leerEntrada } from './tareas.mjs'

const MAXIMO = 600

try {
  const entrada = await leerEntrada()
  const cwd = entrada.cwd || process.cwd()

  const conPendientes = carpetas(cwd)
    .map((c) => ({ ...c, sinVerificar: c.tareas.filter((t) => t.estado !== 'verificado') }))
    .filter((c) => c.sinVerificar.length > 0)

  if (conPendientes.length > 0) {
    let texto = 'Orquesta: hay tareas sin verificar.'
    for (const c of conPendientes) {
      const linea = ` ${c.ruta}/TAREAS.md: ${c.sinVerificar.length} sin verificar (${c.sinVerificar.map((t) => t.id).join(', ')}).`
      if (texto.length + linea.length > MAXIMO - 40) {
        texto += ' Y más carpetas.'
        break
      }
      texto += linea
    }
    texto += ' Usa la skill orquesta para continuar.'

    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'SessionStart',
          additionalContext: texto.slice(0, MAXIMO),
        },
      }),
    )
  }
} catch {
  // Si algo falla, no se añade contexto.
}
process.exit(0)
