/**
 * @file script.js
 * @description Lògica principal del Quiz Trànsit.
 * Gestiona la càrrega de preguntes, el temporitzador, la navegació
 * i la persistència de la partida via localStorage.
 * @author Jaume Hurtado González
 * @standard JavaScript Standard Style (https://standardjs.com)
 */

const N_PREGUNTES = 10
const TEMPS = 30

let preguntes = []
let idsPreguntes = []
let idTimer = null

let estatDeLaPartida = {
  preguntaActual: 0,
  respostesUsuari: [],
  tempsRestant: TEMPS,
  timestampInici: null
}

/**
 * Desa l'estat actual de la partida i les preguntes al localStorage.
 * S'invoca automàticament cada vegada que l'usuari respon o navega.
 */
function guardarPartida () {
  localStorage.setItem('partida', JSON.stringify(estatDeLaPartida))
  localStorage.setItem('preguntes', JSON.stringify(preguntes))
}

/**
 * Recupera la partida guardada al localStorage.
 * Si existeix una partida prèvia, recalcula el temps restant
 * basant-se en el timestamp d'inici per evitar trampes per refresc.
 * @returns {boolean} `true` si s'ha recuperat una partida, `false` si no n'hi ha cap.
 */
function carregarPartida () {
  const p = localStorage.getItem('partida')
  const q = localStorage.getItem('preguntes')
  if (p && q) {
    estatDeLaPartida = JSON.parse(p)
    preguntes = JSON.parse(q)

    if (estatDeLaPartida.timestampInici) {
      const trans = Math.floor((Date.now() - estatDeLaPartida.timestampInici) / 1000)
      estatDeLaPartida.tempsRestant = Math.max(0, TEMPS - trans)
    }
    return true
  }
  return false
}

/**
 * Reinicia l'estat intern de la partida als valors inicials.
 * No modifica el localStorage — per a això usar `esborrarPartidaUIOnly`.
 */
function reiniciaEstat () {
  estatDeLaPartida = {
    preguntaActual: 0,
    respostesUsuari: Array(N_PREGUNTES).fill(undefined),
    tempsRestant: TEMPS,
    timestampInici: Date.now()
  }
}

/**
 * Esborra la partida del localStorage i reinicia l'estat intern,
 * però NO recàrrega la pàgina (útil per mostrar la pantalla final).
 */
function esborrarPartidaUIOnly () {
  localStorage.removeItem('partida')
  localStorage.removeItem('preguntes')
  reiniciaEstat()
}

/**
 * Esborra la partida completament i recàrrega la pàgina
 * per iniciar un nou quiz des de zero.
 */
function EsborrarPartida () {
  localStorage.removeItem('partida')
  localStorage.removeItem('preguntes')
  reiniciaEstat()
  location.reload()
}

/**
 * Obté (o crea si no existeix) el contenidor del menú de navegació
 * inferior de preguntes. Evita duplicats al DOM.
 * @returns {HTMLElement} L'element contenidor del menú.
 */
function ensureMenuContainer () {
  let menu = document.getElementById('menu-preguntes')
  if (!menu) {
    menu = document.createElement('div')
    menu.id = 'menu-preguntes'
    document.body.appendChild(menu)
  }
  return menu
}

/**
 * Renderitza el menú inferior de botons de navegació entre preguntes.
 * Aplica classes CSS per indicar l'estat de cada pregunta
 * (contestada, no contestada, actual).
 */
function pintarMenu () {
  const menu = ensureMenuContainer()
  menu.replaceChildren()

  for (let i = 0; i < N_PREGUNTES; i++) {
    const btn = document.createElement('button')
    btn.textContent = i + 1
    btn.classList.add('btn-pregunta')

    const respostaGuardada = estatDeLaPartida.respostesUsuari[i]
    if (respostaGuardada !== undefined && respostaGuardada !== null) {
      btn.classList.add('contestada')
    } else {
      btn.classList.add('no-contestada')
    }

    if (estatDeLaPartida.preguntaActual === i) {
      btn.classList.add('actual')
    }

    btn.addEventListener('click', () => {
      guardarResposta()
      estatDeLaPartida.preguntaActual = i
      mostrarPregunta()
      guardarPartida()
      pintarMenu()
    })

    menu.appendChild(btn)
  }
}

/**
 * Renderitza la pregunta actual al DOM, incloent el text, la imatge
 * (si n'hi ha) i els tres botons de resposta amb l'estat visual correcte.
 * També gestiona la visibilitat dels botons de navegació (Anterior/Següent/Finalitza).
 */
function mostrarPregunta () {
  const cont = document.getElementById('pregunta')
  if (!cont) return
  const p = preguntes[estatDeLaPartida.preguntaActual]
  if (!p) return

  // Usem textContent per als valors de text per evitar XSS.
  // L'estructura HTML és estàtica i controlada.
  const respostaActual = estatDeLaPartida.respostesUsuari[estatDeLaPartida.preguntaActual]

  const wrapper = document.createElement('div')

  const titol = document.createElement('h3')
  titol.textContent = `${estatDeLaPartida.preguntaActual + 1}. ${p.pregunta}`
  wrapper.appendChild(titol)

  if (p.imatge) {
    const img = document.createElement('img')
    img.src = `img/${p.imatge}`
    img.alt = 'Imatge de la pregunta'
    img.className = 'img-pregunta'
    wrapper.appendChild(img)
    wrapper.appendChild(document.createElement('br'))
  }

  const opcions = document.createElement('div')
  opcions.className = 'opcions'

  ;[p.resposta1, p.resposta2, p.resposta3].forEach((text, idx) => {
    const valor = idx + 1
    const label = document.createElement('label')
    label.className = `btn-resposta${respostaActual === valor ? ' seleccionada' : ''}`

    const input = document.createElement('input')
    input.type = 'radio'
    input.name = 'resp'
    input.value = valor
    input.hidden = true

    label.appendChild(input)
    label.append(` ${text ?? ''}`)
    opcions.appendChild(label)
  })

  wrapper.appendChild(opcions)
  cont.replaceChildren()
  cont.appendChild(wrapper)

  // Assigna events als inputs de ràdio
  document.querySelectorAll('input[name="resp"]').forEach(r => {
    r.addEventListener('change', () => {
      estatDeLaPartida.respostesUsuari[estatDeLaPartida.preguntaActual] = parseInt(r.value, 10)
      guardarPartida()
      pintarMenu()
    })
  })

  // Ressalta visualment el botó de resposta seleccionat
  document.querySelectorAll('.btn-resposta').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-resposta').forEach(b => b.classList.remove('seleccionada'))
      btn.classList.add('seleccionada')
    })
  })

  // Control de visibilitat dels botons de navegació
  const btnAnt = document.getElementById('anterior')
  const btnSeg = document.getElementById('seguent')
  const btnFin = document.getElementById('finalitza')

  if (btnAnt) btnAnt.style.display = estatDeLaPartida.preguntaActual > 0 ? 'inline-block' : 'none'
  if (btnSeg) btnSeg.style.display = estatDeLaPartida.preguntaActual < (N_PREGUNTES - 1) ? 'inline-block' : 'none'
  if (btnFin) btnFin.style.display = estatDeLaPartida.preguntaActual === (N_PREGUNTES - 1) ? 'inline-block' : 'none'

  // Actualitza la barra de progrés del temps
  const barra = document.getElementById('barraTemps')
  if (barra) {
    barra.max = TEMPS
    barra.value = estatDeLaPartida.tempsRestant
  }
}

/**
 * Llegeix el ràdio button marcat i desa la resposta de l'usuari
 * per a la pregunta actual a l'estat de la partida.
 */
function guardarResposta () {
  const checked = document.querySelector("input[name='resp']:checked")
  if (checked) {
    estatDeLaPartida.respostesUsuari[estatDeLaPartida.preguntaActual] = parseInt(checked.value, 10)
    guardarPartida()
  }
}

/**
 * Inicia i gestiona el compte enrere de la pregunta actual (30s).
 * Desa automàticament l'estat global de la partida (temps restant)
 * a localStorage cada segon. Quan el temps s'esgota, crida `onTimeUp`.
 * @async
 */
function iniciarTimer () {
  const barra = document.getElementById('barraTemps')
  if (barra) {
    barra.max = TEMPS
    barra.value = estatDeLaPartida.tempsRestant
  }

  if (idTimer) clearInterval(idTimer)

  // Si ja no hi ha temps en recuperar partida, finalitzar directament
  if (estatDeLaPartida.tempsRestant <= 0) {
    onTimeUp()
    return
  }

  idTimer = setInterval(async () => {
    estatDeLaPartida.tempsRestant = Math.max(0, estatDeLaPartida.tempsRestant - 1)
    if (barra) barra.value = estatDeLaPartida.tempsRestant
    guardarPartida()

    if (estatDeLaPartida.tempsRestant <= 0) {
      clearInterval(idTimer)
      await onTimeUp()
    }
  }, 1000)
}

/**
 * S'executa quan el temporitzador arriba a zero.
 * Recull les respostes actuals i mostra la pantalla de resultat final.
 * @async
 */
async function onTimeUp () {
  try {
    const resultat = await obtenirResultat()
    mostrarPantallaFinal(resultat, true)
  } catch (e) {
    console.error('Error en onTimeUp:', e)
  }
}

/**
 * Envia les respostes de l'usuari al servidor (`finalitza.php`) via POST
 * i retorna el resultat amb el nombre d'encerts.
 * @async
 * @returns {Promise<{correctes: number, total: number}>} Resultat del quiz.
 */
async function obtenirResultat () {
  try {
    const res = await fetch('finalitza.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        respostes: estatDeLaPartida.respostesUsuari,
        ids: idsPreguntes
      })
    })
    return await res.json()
  } catch (err) {
    console.error('Error obtenint resultat:', err)
    return { correctes: 0, total: N_PREGUNTES }
  }
}

/**
 * Finalitza manualment la partida (botó "Finalitza").
 * Atura el temporitzador, desa la darrera resposta i mostra el resultat.
 * @async
 */
async function finalitzarPartida () {
  clearInterval(idTimer)
  guardarResposta()
  const resultat = await obtenirResultat()
  mostrarPantallaFinal(resultat, false)
}

/**
 * Substitueix el contingut del quiz per la pantalla de resultat final.
 * Elimina el menú de navegació i mostra l'opció de tornar a començar.
 * @param {{correctes?: number, punts?: number, total?: number}} resultat - Dades del resultat.
 * @param {boolean} [tempsEsgotat=false] - Indica si la partida ha acabat per temps.
 */
function mostrarPantallaFinal (resultat, tempsEsgotat = false) {
  esborrarPartidaUIOnly()

  const cont = document.getElementById('quiz-container')
  if (!cont) return

  // Construïm la pantalla final amb createElement per evitar XSS
  const wrapper = document.createElement('div')
  wrapper.className = 'text-center d-flex flex-column align-items-center gap-2 py-3'

  const titol = document.createElement('h2')
  titol.textContent = tempsEsgotat ? 'Temps finalitzat!' : 'Resultat del Quiz'

  const info = document.createElement('p')
  info.textContent = `Has encertat ${resultat.correctes ?? resultat.punts ?? 0} de ${resultat.total ?? N_PREGUNTES}`

  const btnRestart = document.createElement('button')
  btnRestart.textContent = 'Torna a començar'
  btnRestart.className = 'btn btn-primary'
  btnRestart.addEventListener('click', () => location.reload())

  wrapper.appendChild(titol)
  wrapper.appendChild(info)
  wrapper.appendChild(btnRestart)

  cont.replaceChildren()
  cont.appendChild(wrapper)

  const menu = document.getElementById('menu-preguntes')
  if (menu) menu.remove()
}

/**
 * Punt d'entrada principal. S'executa quan el DOM és completament carregat.
 * Recupera o inicia una partida nova, registra tots els events de navegació
 * i arrenca el temporitzador.
 * @async
 * @listens DOMContentLoaded
 */
window.addEventListener('DOMContentLoaded', async () => {
  try {
    if (!carregarPartida()) {
      // Partida nova: sol·licitem preguntes aleatòries al servidor
      const r = await fetch('getPreguntes.php?n=' + N_PREGUNTES)
      preguntes = await r.json()
      idsPreguntes = preguntes.map(p => p.id)
      reiniciaEstat()
      guardarPartida()
    } else {
      idsPreguntes = preguntes.map(p => p.id)
    }

    const btnSeg = document.getElementById('seguent')
    const btnAnt = document.getElementById('anterior')
    const btnFin = document.getElementById('finalitza')
    const btnReiniciar = document.getElementById('reiniciar')

    if (btnSeg) {
      btnSeg.addEventListener('click', () => {
        guardarResposta()
        if (estatDeLaPartida.preguntaActual < N_PREGUNTES - 1) {
          estatDeLaPartida.preguntaActual++
          guardarPartida()
          mostrarPregunta()
          pintarMenu()
        }
      })
    }

    if (btnAnt) {
      btnAnt.addEventListener('click', () => {
        guardarResposta()
        if (estatDeLaPartida.preguntaActual > 0) {
          estatDeLaPartida.preguntaActual--
          guardarPartida()
          mostrarPregunta()
          pintarMenu()
        }
      })
    }

    if (btnFin) {
      btnFin.addEventListener('click', finalitzarPartida)
    }

    // Reinici manual: demana confirmació per evitar pèrdues accidentals
    if (btnReiniciar) {
      btnReiniciar.addEventListener('click', () => {
        if (confirm('Segur que vols reiniciar la partida?')) {
          EsborrarPartida()
        }
      })
    }

    mostrarPregunta()
    pintarMenu()
    iniciarTimer()
  } catch (err) {
    console.error('Error inicialitzant el quiz:', err)
  }
})
