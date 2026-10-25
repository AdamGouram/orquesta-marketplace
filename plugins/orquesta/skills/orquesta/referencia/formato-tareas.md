# Formato de los archivos de `.orquesta/`

Cada petición no trivial tiene su carpeta `.orquesta/AAAA-MM-DD-<slug>/` en la raíz del proyecto. `<slug>` son 2–5 palabras en minúsculas separadas por guiones.

| Archivo | Quién lo escribe | Contenido |
| --- | --- | --- |
| `BRIEF.md` | analista | Qué se pide y por qué, en pocas líneas |
| `TAREAS.md` | analista; los estados los cambian ejecutores, revisor y verificador | Alcance, supuestos, preguntas y tareas |
| `VERIFICACION.md` | verificador | Resultado de comprobar cada evidencia |
| `DISENO.md` | arquitecto | Decisiones breves antes de tocar código en tareas T2/T3 |

## `BRIEF.md`

    # BRIEF: <título>
    Petición original: "<cita literal del usuario>"

    ## Objetivo
    <1–3 frases: qué quiere conseguir el usuario>

    ## Contexto comprobado
    - <hecho> — [archivo] ruta:línea | [web] URL | [comando] comando → salida

    ## Nivel global
    <T0–T3> · modelo recomendado: <haiku|sonnet|opus|fable> · motivo: <una frase>

## `TAREAS.md`

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

Reglas del formato:
- Los IDs son `T1`, `T2`… en orden; los supuestos `S1`… y las preguntas `P1`…
- La línea de cabecera de cada tarea empieza exactamente por `- [ ] T<n> ·` (o `- [x] T<n> ·` cuando está verificada). Los hooks la leen así.
- `depende de:` lista IDs separados por comas, o `ninguna`.
- `Estado:` vale exactamente uno de: `pendiente`, `en curso`, `hecho`, `verificado`, `bloqueado`. Puede seguirle ` — <nota>` (por ejemplo el fallo de una revisión).
- Solo `verificador` y `revisor` pueden poner `verificado`.
- Si una tarea salta dos niveles respecto a la rúbrica, añade la línea `- Justificación de nivel: ...`.
- Si una tarea sube de nivel por fallos, añade `- Escalada: <de> → <a>, motivo: ...`.

### Evidencia válida

Solo estos cuatro tipos. Cualquier otra cosa no cuenta.

| Tipo | Forma | Cómo se comprueba |
| --- | --- | --- |
| `[usuario]` | `[usuario] "<cita literal>"` | La cita aparece tal cual en la petición o en la conversación |
| `[archivo]` | `[archivo] ruta/relativa:línea` | Abrir el archivo; la línea dice lo que se afirma |
| `[web]` | `[web] https://…` | La URL se ha abierto en esta sesión y dice lo que se afirma |
| `[comando]` | `[comando] <comando> → <salida relevante>` | Repetir el comando da la misma salida relevante |

Una tarea sin evidencia no es una tarea: va a "Supuestos (SIN CONFIRMAR)" o a "Preguntas abiertas".

### Ejemplo — FICTICIO

> Todo este ejemplo es inventado para mostrar el formato. Los archivos, líneas y la URL no existen.

    # TAREAS: Añadir modo oscuro a la página de ajustes (EJEMPLO FICTICIO)
    Petición original: "añade un interruptor de modo oscuro en ajustes"

    ## Alcance
    - Dentro: interruptor en la página de ajustes y guardar la preferencia.
    - Fuera (no hacer): rediseñar otras páginas.

    ## Supuestos (SIN CONFIRMAR)
    - S1: La preferencia se guarda en el navegador y no en el servidor.

    ## Preguntas abiertas (bloquean)
    - (ninguna)

    ## Tareas
    - [ ] T1 · nivel T0 · agente orquesta:rapido · depende de: ninguna
      - Qué: Añadir las variables de color oscuras al archivo de tema.
      - Evidencia: [archivo] src/tema.css:12 (ficticio)
      - Aceptación: `npm test -- tema` pasa
      - Estado: pendiente
    - [ ] T2 · nivel T1 · agente orquesta:constructor · depende de: T1
      - Qué: Interruptor en ajustes que alterna la clase `oscuro` y la recuerda.
      - Evidencia: [usuario] "añade un interruptor de modo oscuro en ajustes" | [web] https://example.com/ficticio
      - Aceptación: test `ajustes.test.ts` "alterna y recuerda" pasa
      - Estado: pendiente

## `VERIFICACION.md`

    # VERIFICACION: <título>
    Fecha: AAAA-MM-DD

    | Tarea | Evidencia | Resultado | Nota |
    | --- | --- | --- | --- |
    | T1 | [archivo] src/x.ts:10 | OK | La línea define la función citada |
    | T2 | [web] https://… | FALLA | La página no dice eso → T2 movida a S2 |

    ## Cambios en TAREAS.md
    - T2 → Supuestos como S2 (evidencia no confirmada)

`Resultado` vale `OK` o `FALLA`. Cada `FALLA` lleva una línea en "Cambios en TAREAS.md".

## `DISENO.md`

    # DISEÑO: <título>

    ## <ID de tarea>: <decisión en una frase>
    - Opciones consideradas: ...
    - Elegida y por qué: ...
    - Riesgos: ...

Máximo 15 líneas por tarea. Se escribe antes de tocar código.
