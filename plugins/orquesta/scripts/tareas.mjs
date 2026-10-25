// Lectura de las carpetas .orquesta/ compartida por los hooks.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ESTADOS = ['pendiente', 'en curso', 'hecho', 'verificado', 'bloqueado']

// Lee todo stdin y lo devuelve como objeto; {} si no hay JSON válido.
export async function leerEntrada() {
  let texto = ''
  for await (const trozo of process.stdin) texto += trozo
  try {
    return JSON.parse(texto)
  } catch {
    return {}
  }
}

// Devuelve [{ id, estado }] a partir del texto de un TAREAS.md.
export function leerTareas(texto) {
  const tareas = []
  let actual = null
  for (const linea of texto.split(/\r?\n/)) {
    const cabecera = linea.match(/^- \[[ xX]\] (T\d+)\b/)
    if (cabecera) {
      actual = { id: cabecera[1], estado: 'pendiente' }
      tareas.push(actual)
      continue
    }
    const estado = linea.match(/^\s+- Estado:\s*(.*)$/)
    if (actual && estado) {
      const valor = estado[1].trim().toLowerCase()
      actual.estado = ESTADOS.find((e) => valor.startsWith(e)) ?? 'pendiente'
    }
  }
  return tareas
}

// Carpetas de .orquesta/ con TAREAS.md, de la más reciente a la más antigua.
export function carpetas(cwd) {
  const raiz = join(cwd, '.orquesta')
  let nombres
  try {
    nombres = readdirSync(raiz, { withFileTypes: true })
  } catch {
    return []
  }
  const lista = []
  for (const d of nombres) {
    if (!d.isDirectory()) continue
    const archivo = join(raiz, d.name, 'TAREAS.md')
    try {
      const { mtimeMs } = statSync(archivo)
      lista.push({
        nombre: d.name,
        ruta: `.orquesta/${d.name}`,
        mtimeMs,
        tareas: leerTareas(readFileSync(archivo, 'utf8')),
      })
    } catch {
      // Carpeta sin TAREAS.md: no cuenta.
    }
  }
  return lista.sort((a, b) => b.mtimeMs - a.mtimeMs)
}
