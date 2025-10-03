const API = "api.php";

async function cargarPreguntas() {
    const res = await fetch(API);
    const preguntas = await res.json();

    const tbody = document.querySelector("#tabla tbody");
    tbody.innerHTML = "";

    preguntas.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
    <td>${p.id}</td>
    <td>
      ${p.pregunta}<br>
      ${p.imatge ? `<img src="../img/${p.imatge}" alt="señal" style="max-width:80px;">` : ""}
    </td>
    <td>
      1: ${p.resposta1}<br>
      2: ${p.resposta2}<br>
      3: ${p.resposta3}
    </td>
    <td>${p.respostaCorrecta}</td>
    <td>
      <button onclick="abrirEditar(${p.id}, '${p.pregunta}', '${p.resposta1}', '${p.resposta2}', '${p.resposta3}', ${p.respostaCorrecta}, '${p.imatge ?? ""}')">Editar</button>
      <button onclick="eliminarPregunta(${p.id})">Eliminar</button>
    </td>
  `;
        tbody.appendChild(tr);
    });
}

function abrirModal(id) {
    document.getElementById(id).style.display = "flex";
}

function cerrarModal(id) {
    document.getElementById(id).style.display = "none";
}

document.getElementById("btn-add").addEventListener("click", () => abrirModal("modal-add"));

document.getElementById("form-add").addEventListener("submit", async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());

    const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if ((await res.json()).success) {
        e.target.reset();
        cerrarModal("modal-add");
        cargarPreguntas();
    }
});

function abrirEditar(id, pregunta, r1, r2, r3, correcta, imatge) {
    const form = document.getElementById("form-edit");
    form.id.value = id;
    form.pregunta.value = pregunta;
    form.r1.value = r1;
    form.r2.value = r2;
    form.r3.value = r3;
    form.correcta.value = correcta;
    form.imatge.value = imatge;
    abrirModal("modal-edit");
}

document.getElementById("form-edit").addEventListener("submit", async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());

    const res = await fetch(API, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if ((await res.json()).success) {
        e.target.reset();
        cerrarModal("modal-edit");
        cargarPreguntas();
    }
});

async function eliminarPregunta(id) {
    if (!confirm("¿Eliminar esta pregunta?")) return;

    const res = await fetch(API, {
        method: "DELETE",
        body: `id=${id}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });

    if ((await res.json()).success) {
        cargarPreguntas();
    }
}

window.onclick = function (e) {
    document.querySelectorAll(".modal").forEach(m => {
        if (e.target === m) m.style.display = "none";
    });
};

cargarPreguntas();
