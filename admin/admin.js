// Carregar totes les preguntes
async function carregarPreguntes() {
  try {
    const res = await fetch("api.php?action=list");
    const dades = await res.json();

    const tbody = document.getElementById("llistaPreguntes");
    tbody.innerHTML = "";

    dades.forEach(p => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.id}</td>
        <td>${p.pregunta}</td>
        <td>
          1: ${p.resposta1}<br>
          2: ${p.resposta2}<br>
          3: ${p.resposta3}
        </td>
        <td>${p.respostaCorrecta}</td>
        <td>${p.imatge ? `<img src="../img/${p.imatge}" style="max-width:60px">` : ""}</td>
        <td>
          <button class="btn btn-sm btn-warning me-2" onclick="editarPregunta(${p.id})">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="eliminarPregunta(${p.id})">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error carregant preguntes:", err);
  }
}

// Afegir nova pregunta
document.getElementById("formAfegir").addEventListener("submit", async e => {
  e.preventDefault();
  const formData = new FormData(e.target);

  await fetch("api.php?action=add", {
    method: "POST",
    body: formData
  });

  e.target.reset();
  bootstrap.Modal.getInstance(document.getElementById("modalAfegir")).hide();
  carregarPreguntes();
});

// Preparar modal editar
async function editarPregunta(id) {
  const res = await fetch("api.php?action=get&id=" + id);
  const p = await res.json();

  const form = document.getElementById("formEditar");
  form.id.value = p.id;
  form.pregunta.value = p.pregunta;
  form.resposta1.value = p.resposta1;
  form.resposta2.value = p.resposta2;
  form.resposta3.value = p.resposta3;
  form.respostaCorrecta.value = p.respostaCorrecta;
  form.imatge.value = p.imatge;

  new bootstrap.Modal(document.getElementById("modalEditar")).show();
}

// Guardar canvis d'edició
document.getElementById("formEditar").addEventListener("submit", async e => {
  e.preventDefault();
  const formData = new FormData(e.target);

  await fetch("api.php?action=update", {
    method: "POST",
    body: formData
  });

  bootstrap.Modal.getInstance(document.getElementById("modalEditar")).hide();
  carregarPreguntes();
});

// Eliminar pregunta
async function eliminarPregunta(id) {
  if (confirm("Vols eliminar aquesta pregunta?")) {
    await fetch("api.php?action=delete&id=" + id);
    carregarPreguntes();
  }
}

// Carregar preguntes quan s'inicia la pàgina
carregarPreguntes();
