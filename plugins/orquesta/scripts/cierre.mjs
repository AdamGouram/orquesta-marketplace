// Stop: no deja terminar si en la carpeta .orquesta/ activa hay tareas
// "hecho" sin verificar o "en curso". La activa es la de TAREAS.md más reciente.
// Si ya se continúa por un Stop hook, o si algo falla, deja terminar (exit 0).
import { carpetas, leerEntrada } from './tareas.mjs'

try {
  const entrada = await leerEntrada()

  if (entrada.stop_hook_active !== true) {
    const [activa] = carpetas(entrada.cwd || process.cwd())
    const abiertas = activa
      ? activa.tareas.filter((t) => t.estado === 'hecho' || t.estado === 'en curso')
      : []

    if (abiertas.length > 0) {
      const lista = abiertas.map((t) => `${t.id} (${t.estado})`).join(', ')
      process.stdout.write(
        JSON.stringify({
          decision: 'block',
          reason: `Orquesta: en ${activa.ruta}/TAREAS.md quedan tareas sin cerrar: ${lista}. Revisa las "hecho" con orquesta:revisor y termina o marca como bloqueadas las "en curso" antes de acabar.`,
        }),
      )
    }
  }
} catch {
  // Si algo falla, no se bloquea.
}
process.exit(0)
