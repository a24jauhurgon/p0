// admin/admin.js

// --- Referencias principales ---
const tbody = document.querySelector("#taulaPreguntes tbody");
const modal = document.getElementById("modalPregunta");
const form = document.getElementById("formulariPregunta");
const btnAfegir = document.getElementById("btnAfegir");
const btnTancarModal = document.getElementById("btnTancarModal");
const btnOrdenar = document.getElementById("btnOrdenar");

let ordreAsc = true; // Orden ascendente por defecto

// --- Cargar preguntas ---
async function carregarPreguntes() {
  try {
    const res = await fetch(`api.php?action=list`);
    if (!res.ok) throw new Error("Error de connexió amb l'API");

    let dades = await res.json();

    // Ordenar según la dirección seleccionada
    dades.sort((a, b) => ordreAsc ? a.id - b.id : b.id - a.id);

    tbody.innerHTML = "";

    if (!Array.isArray(dades) || dades.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No hi ha preguntes</td></tr>`;
      return;
    }

    dades.forEach(p => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${p.id}</td>
        <td>${p.pregunta}</td>
        <td>
          ${p.imatge
            ? `<img src="../img/${p.imatge}" alt="imatge" style="max-height:60px;border-radius:6px;">`
            : "—"}
        </td>
        <td>
          1️⃣ ${p.resposta1}<br>
          2️⃣ ${p.resposta2}<br>
          3️⃣ ${p.resposta3}
        </td>
        <td>${p.respostaCorrecta}</td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="editarPregunta(${p.id})">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="eliminarPregunta(${p.id})">🗑️</button>
        </td>
      `;
      tbody.appendChild(fila);
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error carregant preguntes</td></tr>`;
  }
}

// --- Abrir modal (centrado) ---
function obrirModal(p = null) {
  modal.style.display = "flex"; // flexbox centrado
  document.getElementById("titolModal").textContent = p ? "Editar Pregunta" : "Afegir Pregunta";

  form.reset();

  if (p) {
    form.id.value = p.id;
    form.pregunta.value = p.pregunta;
    form.resposta1.value = p.resposta1;
    form.resposta2.value = p.resposta2;
    form.resposta3.value = p.resposta3;
    form.respostaCorrecta.value = p.respostaCorrecta;
  } else {
    form.id.value = "";
  }
}

// --- Cerrar modal ---
btnTancarModal.addEventListener("click", () => {
  modal.style.display = "none";
});

// --- Botón añadir ---
btnAfegir.addEventListener("click", () => obrirModal());

// --- Enviar formulario (add/update) ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const id = formData.get("id");
  formData.append("action", id ? "update" : "add");

  const res = await fetch("api.php", { method: "POST", body: formData });
  const resultat = await res.json();

  if (resultat.ok) {
    modal.style.display = "none";
    await carregarPreguntes();
  } else {
    alert("Error al guardar la pregunta");
  }
});

// --- Editar pregunta ---
async function editarPregunta(id) {
  const res = await fetch(`api.php?action=get&id=${id}`);
  const p = await res.json();
  obrirModal(p);
}

// --- Eliminar pregunta ---
async function eliminarPregunta(id) {
  if (!confirm("Vols eliminar aquesta pregunta?")) return;
  const formData = new FormData();
  formData.append("action", "delete");
  formData.append("id", id);

  const res = await fetch("api.php", { method: "POST", body: formData });
  const resultat = await res.json();

  if (resultat.ok) {
    await carregarPreguntes();
  } else {
    alert("Error eliminant la pregunta");
  }
}

// --- Ordenar asc/desc ---
btnOrdenar.addEventListener("click", () => {
  ordreAsc = !ordreAsc;
  btnOrdenar.textContent = ordreAsc ? "↑ Ascendent" : "↓ Descendent";
  carregarPreguntes();
});

// --- Inicializar ---
carregarPreguntes();
