/**
 * @file admin/admin.js
 * @description Panell d'administració del Quiz Trànsit.
 * Gestiona el CRUD complet de preguntes via crides fetch a `api.php`,
 * incloent ordenació i pujada d'imatges.
 * @author Jaume Hurtado González
 * @standard JavaScript Standard Style (https://standardjs.com)
 */

// --- Referències principals al DOM ---
const tbody = document.querySelector('#taulaPreguntes tbody')
const modal = document.getElementById('modalPregunta')
const form = document.getElementById('formulariPregunta')
const btnAfegir = document.getElementById('btnAfegir')
const btnTancarModal = document.getElementById('btnTancarModal')
const btnOrdenar = document.getElementById('btnOrdenar')

/** @type {boolean} Controla si l'ordre de la taula és ascendent o descendent per ID. */
let ordreAsc = true

/**
 * Carrega totes les preguntes des de `api.php?action=list`,
 * les ordena segons `ordreAsc` i les renderitza a la taula HTML.
 * En cas d'error de xarxa, mostra un missatge d'error a la taula.
 * @async
 */
async function carregarPreguntes () {
  try {
    const res = await fetch('api.php?action=list')
    if (!res.ok) throw new Error("Error de connexió amb l'API")

    let dades = await res.json()

    // Ordenació local per ID segons la preferència de l'usuari
    dades.sort((a, b) => ordreAsc ? a.id - b.id : b.id - a.id)

    tbody.innerHTML = ''

    if (!Array.isArray(dades) || dades.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hi ha preguntes</td></tr>'
      return
    }

    // Renderitzem cada fila de manera segura usant createElement
    dades.forEach(p => {
      const fila = document.createElement('tr')

      const tdId = document.createElement('td')
      tdId.textContent = p.id

      const tdPregunta = document.createElement('td')
      tdPregunta.textContent = p.pregunta

      const tdImatge = document.createElement('td')
      if (p.imatge) {
        const img = document.createElement('img')
        img.src = `../img/${p.imatge}`
        img.alt = 'Imatge de la pregunta'
        img.style.maxHeight = '60px'
        img.style.borderRadius = '6px'
        tdImatge.appendChild(img)
      } else {
        tdImatge.textContent = '—'
      }

      const tdRespostes = document.createElement('td')
      tdRespostes.innerHTML = `1️⃣ ${p.resposta1}<br>2️⃣ ${p.resposta2}<br>3️⃣ ${p.resposta3}`

      const tdCorrecta = document.createElement('td')
      tdCorrecta.textContent = p.respostaCorrecta

      const tdAccions = document.createElement('td')

      const btnEditar = document.createElement('button')
      btnEditar.className = 'btn btn-warning btn-sm'
      btnEditar.textContent = '✏️'
      btnEditar.addEventListener('click', () => editarPregunta(p.id))

      const btnEliminar = document.createElement('button')
      btnEliminar.className = 'btn btn-danger btn-sm'
      btnEliminar.textContent = '🗑️'
      btnEliminar.addEventListener('click', () => eliminarPregunta(p.id))

      tdAccions.appendChild(btnEditar)
      tdAccions.appendChild(btnEliminar)

      fila.append(tdId, tdPregunta, tdImatge, tdRespostes, tdCorrecta, tdAccions)
      tbody.appendChild(fila)
    })
  } catch (err) {
    console.error('Error carregant preguntes:', err)
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error carregant preguntes</td></tr>'
  }
}

/**
 * Obre el modal de creació/edició de preguntes.
 * Si es passa un objecte `p`, omple el formulari per editar.
 * Si no es passa res, neteja el formulari per crear una nova pregunta.
 * @param {Object|null} [p=null] - Dades de la pregunta a editar (opcional).
 */
function obrirModal (p = null) {
  modal.style.display = 'flex'
  document.getElementById('titolModal').textContent = p ? 'Editar Pregunta' : 'Afegir Pregunta'

  form.reset()

  if (p) {
    form.id.value = p.id
    form.pregunta.value = p.pregunta
    form.resposta1.value = p.resposta1
    form.resposta2.value = p.resposta2
    form.resposta3.value = p.resposta3
    form.respostaCorrecta.value = p.respostaCorrecta
  } else {
    form.id.value = ''
  }
}

// --- Tancar modal ---
btnTancarModal.addEventListener('click', () => {
  modal.style.display = 'none'
})

// --- Botó per obrir el modal en mode "afegir" ---
btnAfegir.addEventListener('click', () => obrirModal())

/**
 * Gestiona l'enviament del formulari de creació/edició.
 * Determina si és una operació `add` o `update` basant-se en el camp `id`.
 * @listens submit
 * @async
 */
form.addEventListener('submit', async (e) => {
  e.preventDefault()
  const formData = new FormData(form)
  const id = formData.get('id')
  formData.append('action', id ? 'update' : 'add')

  const res = await fetch('api.php', { method: 'POST', body: formData })
  const resultat = await res.json()

  if (resultat.ok) {
    modal.style.display = 'none'
    await carregarPreguntes()
  } else {
    alert('Error al guardar la pregunta')
  }
})

/**
 * Recupera les dades d'una pregunta pel seu ID i obre el modal d'edició.
 * @async
 * @param {number} id - L'identificador de la pregunta a editar.
 */
async function editarPregunta (id) {
  const res = await fetch(`api.php?action=get&id=${id}`)
  const p = await res.json()
  obrirModal(p)
}

/**
 * Elimina una pregunta de la base de dades després de confirmar amb l'usuari.
 * Actualitza la taula automàticament si l'operació té èxit.
 * @async
 * @param {number} id - L'identificador de la pregunta a eliminar.
 */
async function eliminarPregunta (id) {
  if (!confirm('Vols eliminar aquesta pregunta?')) return
  const formData = new FormData()
  formData.append('action', 'delete')
  formData.append('id', id)

  const res = await fetch('api.php', { method: 'POST', body: formData })
  const resultat = await res.json()

  if (resultat.ok) {
    await carregarPreguntes()
  } else {
    alert('Error eliminant la pregunta')
  }
}

// --- Canviar l'ordre de la taula (ascendent / descendent) ---
btnOrdenar.addEventListener('click', () => {
  ordreAsc = !ordreAsc
  btnOrdenar.textContent = ordreAsc ? '↑ Ascendent' : '↓ Descendent'
  carregarPreguntes()
})

// --- Inicialitzar la taula en carregar el panell ---
carregarPreguntes()
