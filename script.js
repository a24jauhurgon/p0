const N_PREGUNTES = 10;
const TEMPS = 30;

let preguntes = [];
let idsPreguntes = [];
let idTimer = null;

let estatDeLaPartida = {
    preguntaActual: 0,
    respostesUsuari: [],
    tempsRestant: TEMPS,
    timestampInici: null
};

function guardarPartida() {
    localStorage.setItem("partida", JSON.stringify(estatDeLaPartida));
    localStorage.setItem("preguntes", JSON.stringify(preguntes));
}

function carregarPartida() {
    const p = localStorage.getItem("partida");
    const q = localStorage.getItem("preguntes");
    if (p && q) {
        estatDeLaPartida = JSON.parse(p);
        preguntes = JSON.parse(q);

        if (estatDeLaPartida.timestampInici) {
            const trans = Math.floor((Date.now() - estatDeLaPartida.timestampInici) / 1000);
            estatDeLaPartida.tempsRestant = Math.max(0, TEMPS - trans);
        }
        return true;
    }
    return false;
}

function reiniciaEstat() {
    estatDeLaPartida = {
        preguntaActual: 0,
        respostesUsuari: Array(N_PREGUNTES).fill(undefined),
        tempsRestant: TEMPS,
        timestampInici: Date.now()
    };
}

function esborrarPartidaUIOnly() {
    localStorage.removeItem("partida");
    localStorage.removeItem("preguntes");
    reiniciaEstat();
}

function EsborrarPartida() {
    localStorage.removeItem("partida");
    localStorage.removeItem("preguntes");
    reiniciaEstat();
    location.reload();
}

function ensureMenuContainer() {
    let menu = document.getElementById("menu-preguntes");
    if (!menu) {
        menu = document.createElement("div");
        menu.id = "menu-preguntes";
        document.body.appendChild(menu);
    }
    return menu;
}

function pintarMenu() {
    const menu = ensureMenuContainer();
    menu.innerHTML = "";

    for (let i = 0; i < N_PREGUNTES; i++) {
        const btn = document.createElement("button");
        btn.textContent = i + 1;
        btn.classList.add("btn-pregunta");

        if (estatDeLaPartida.respostesUsuari[i] !== undefined && estatDeLaPartida.respostesUsuari[i] !== null) {
            btn.classList.add("contestada");
        } else {
            btn.classList.add("no-contestada");
        }

        if (estatDeLaPartida.preguntaActual === i) {
            btn.classList.add("actual");
        }

        btn.addEventListener("click", () => {
            guardarResposta();
            estatDeLaPartida.preguntaActual = i;
            mostrarPregunta();
            guardarPartida();
            pintarMenu();
        });

        menu.appendChild(btn);
    }
}

function mostrarPregunta() {
    const cont = document.getElementById("pregunta");
    if (!cont) return;
    const p = preguntes[estatDeLaPartida.preguntaActual];
    if (!p) return;

    // Construcción del contenido de la pregunta
    cont.innerHTML = `
      <h3>${estatDeLaPartida.preguntaActual + 1}. ${p.pregunta}</h3>
      ${p.imatge ? `<img src="img/${p.imatge}" alt="imatge" class="img-pregunta"><br>` : ""}

      <div class="opcions">
        <label class="btn-resposta ${estatDeLaPartida.respostesUsuari[estatDeLaPartida.preguntaActual] === 1 ? "seleccionada" : ""}">
          <input type="radio" name="resp" value="1" hidden> ${p.resposta1 ?? ""}
        </label>

        <label class="btn-resposta ${estatDeLaPartida.respostesUsuari[estatDeLaPartida.preguntaActual] === 2 ? "seleccionada" : ""}">
          <input type="radio" name="resp" value="2" hidden> ${p.resposta2 ?? ""}
        </label>

        <label class="btn-resposta ${estatDeLaPartida.respostesUsuari[estatDeLaPartida.preguntaActual] === 3 ? "seleccionada" : ""}">
          <input type="radio" name="resp" value="3" hidden> ${p.resposta3 ?? ""}
        </label>
      </div>
    `;

    // Listener para guardar la respuesta
    document.querySelectorAll('input[name="resp"]').forEach(r => {
        r.addEventListener("change", () => {
            estatDeLaPartida.respostesUsuari[estatDeLaPartida.preguntaActual] = parseInt(r.value, 10);
            guardarPartida();
            pintarMenu();
        });
    });

    // Sincronizar estilo visual (botón seleccionado)
    document.querySelectorAll(".btn-resposta").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".btn-resposta").forEach(b => b.classList.remove("seleccionada"));
            btn.classList.add("seleccionada");
        });
    });

    // Botones de navegación
    const btnAnt = document.getElementById("anterior");
    const btnSeg = document.getElementById("seguent");
    const btnFin = document.getElementById("finalitza");

    if (btnAnt) btnAnt.style.display = estatDeLaPartida.preguntaActual > 0 ? "inline-block" : "none";
    if (btnSeg) btnSeg.style.display = estatDeLaPartida.preguntaActual < (N_PREGUNTES - 1) ? "inline-block" : "none";
    if (btnFin) btnFin.style.display = estatDeLaPartida.preguntaActual === (N_PREGUNTES - 1) ? "inline-block" : "none";

    // Barra de tiempo
    const barra = document.getElementById("barraTemps");
    if (barra) {
        barra.max = TEMPS;
        barra.value = estatDeLaPartida.tempsRestant;
    }
}

function guardarResposta() {
    const checked = document.querySelector("input[name='resp']:checked");
    if (checked) {
        estatDeLaPartida.respostesUsuari[estatDeLaPartida.preguntaActual] = parseInt(checked.value, 10);
        guardarPartida();
    }
}

function iniciarTimer() {
    const barra = document.getElementById("barraTemps");
    if (barra) {
        barra.max = TEMPS;
        barra.value = estatDeLaPartida.tempsRestant;
    }

    if (idTimer) clearInterval(idTimer);

    if (estatDeLaPartida.tempsRestant <= 0) {
        onTimeUp();
        return;
    }

    idTimer = setInterval(async () => {
        estatDeLaPartida.tempsRestant = Math.max(0, estatDeLaPartida.tempsRestant - 1);
        if (barra) barra.value = estatDeLaPartida.tempsRestant;
        guardarPartida();

        if (estatDeLaPartida.tempsRestant <= 0) {
            clearInterval(idTimer);
            await onTimeUp();
        }
    }, 1000);
}

async function onTimeUp() {
    try {
        const resultat = await obtenirResultat();
        mostrarPantallaFinal(resultat, true);
    } catch (e) {
        console.error(e);
    }
}

async function obtenirResultat() {
    try {
        const res = await fetch("finalitza.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                respostes: estatDeLaPartida.respostesUsuari,
                ids: idsPreguntes
            })
        });
        return await res.json();
    } catch (err) {
        console.error("Error obtenint resultat:", err);
        return { correctes: 0, total: N_PREGUNTES };
    }
}

async function finalitzarPartida() {
    clearInterval(idTimer);
    guardarResposta();
    const resultat = await obtenirResultat();
    mostrarPantallaFinal(resultat, false);
}

function mostrarPantallaFinal(resultat, tempsEsgotat = false) {
    esborrarPartidaUIOnly();

    const cont = document.getElementById("quiz-container");
    if (!cont) return;

    cont.innerHTML = `
  <div class="text-center d-flex flex-column align-items-center gap-2 py-3">
    <h2>${tempsEsgotat ? "Temps finalitzat!" : "Resultat del Quiz"}</h2>
    <p>Has encertat ${resultat.correctes ?? resultat.punts ?? 0} de ${resultat.total ?? N_PREGUNTES}</p>
    <button onclick="location.reload()" class="btn btn-primary">Torna a començar</button>
  </div>
`;

    const menu = document.getElementById("menu-preguntes");
    if (menu) menu.remove();
}

window.addEventListener("DOMContentLoaded", async () => {
    try {
        if (!carregarPartida()) {
            const r = await fetch("getPreguntes.php?n=" + N_PREGUNTES);
            preguntes = await r.json();
            idsPreguntes = preguntes.map(p => p.id);
            reiniciaEstat();
            guardarPartida();
        } else {
            idsPreguntes = preguntes.map(p => p.id);
        }

        // Listeners de navegació
        const btnSeg = document.getElementById("seguent");
        const btnAnt = document.getElementById("anterior");
        const btnFin = document.getElementById("finalitza");

        if (btnSeg) {
            btnSeg.addEventListener("click", () => {
                guardarResposta();
                if (estatDeLaPartida.preguntaActual < N_PREGUNTES - 1) {
                    estatDeLaPartida.preguntaActual++;
                    guardarPartida();
                    mostrarPregunta();
                    pintarMenu();
                }
            });
        }

        if (btnAnt) {
            btnAnt.addEventListener("click", () => {
                guardarResposta();
                if (estatDeLaPartida.preguntaActual > 0) {
                    estatDeLaPartida.preguntaActual--;
                    guardarPartida();
                    mostrarPregunta();
                    pintarMenu();
                }
            });
        }

        if (btnFin) {
            btnFin.addEventListener("click", finalitzarPartida);
        }

        mostrarPregunta();
        pintarMenu();
        iniciarTimer();
    } catch (err) {
        console.error("Error inicialitzant:", err);
    }
});
