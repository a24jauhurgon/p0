let preguntes = [];
let indexActual = 0;
let respostesUsuari = [];

async function carregarPreguntes(n = 5) {
    try {
        const resposta = await fetch(`getPreguntes.php?n=${n}`);
        if (!resposta.ok) throw new Error('Resposta no OK: ' + resposta.status);
        preguntes = await resposta.json();
        indexActual = 0;
        respostesUsuari = new Array(preguntes.length);
        mostrarPregunta();
    } catch (err) {
        console.error("Error carregant preguntes:", err);
        document.getElementById("quiz-container").innerHTML = "<p>Error carregant preguntes. Veure consola.</p>";
    }
}

function mostrarPregunta() {
    const container = document.getElementById("pregunta");
    const p = preguntes[indexActual];
    if (!p) {
        container.innerHTML = "<p>No hi ha preguntes.</p>";
        return;
    }

    const sel = (respostesUsuari[indexActual] !== undefined && respostesUsuari[indexActual] !== null)
        ? respostesUsuari[indexActual]
        : null;

    const html = [];
    html.push(`<h2>Pregunta ${indexActual + 1} / ${preguntes.length}</h2>`);
    html.push(`<p>${p.pregunta}</p>`);
    if (p.imatge) {
        html += `<img src="img/${p.imatge}" alt="senyal" style="max-width:150px; display:block; margin:10px auto;"><br>`;
    }

    html.push('<form id="form-pregunta">');
    p.respostes.forEach((r, i) => {
        const checked = (sel === i) ? "checked" : "";
        html.push(`<label style="display:block; margin:6px 0;">
            <input type="radio" name="opcio" value="${i}" ${checked}> ${r}
        </label>`);
    });
    html.push('</form>');

    container.innerHTML = html.join("");

    document.getElementById("anterior").style.display = (indexActual > 0) ? "inline-block" : "none";
    const ultim = (indexActual === preguntes.length - 1);
    document.getElementById("seguent").style.display = ultim ? "none" : "inline-block";
    document.getElementById("finalitza").style.display = ultim ? "inline-block" : "none";
}

function desaRespostaLocal() {
    const form = document.getElementById("form-pregunta");
    if (!form) return;
    const checked = form.querySelector("input[name='opcio']:checked");
    respostesUsuari[indexActual] = checked ? parseInt(checked.value) : null;
}

document.addEventListener("DOMContentLoaded", () => {
    const btnAnterior = document.getElementById("anterior");
    const btnSeguent = document.getElementById("seguent");
    const btnFinalitza = document.getElementById("finalitza");

    btnAnterior.addEventListener("click", (e) => {
        e.preventDefault();
        desaRespostaLocal();
        if (indexActual > 0) indexActual--;
        mostrarPregunta();
        window.scrollTo(0, 0);
    });

    btnSeguent.addEventListener("click", (e) => {
        e.preventDefault();
        desaRespostaLocal();
        if (indexActual < preguntes.length - 1) indexActual++;
        mostrarPregunta();
        window.scrollTo(0, 0);
    });

    btnFinalitza.addEventListener("click", async (e) => {
        e.preventDefault();
        desaRespostaLocal();
        const respostesEnviar = [];
        for (let i = 0; i < preguntes.length; i++) {
            respostesEnviar.push({
                id: preguntes[i].id,
                resposta: (respostesUsuari[i] === null || respostesUsuari[i] === undefined) ? null : respostesUsuari[i]
            });
        }

        try {
            const resposta = await fetch("finalitza.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ respostes: respostesEnviar })
            });
            if (!resposta.ok) throw new Error('Resposta no OK: ' + resposta.status);
            const resultat = await resposta.json();
            mostrarResultat(resultat);
        } catch (err) {
            console.error("Error enviant respostes:", err);
            document.getElementById("resultat").innerHTML = "<p>Error enviant respostes. Veure consola.</p>";
        }
    });

    carregarPreguntes(5);
});

function mostrarResultat(resultat) {
    const rDiv = document.getElementById("resultat");
    if (resultat && resultat.total !== undefined && resultat.correctes !== undefined) {
        rDiv.innerHTML = `<h2>Resultat final</h2>
                          <p>Has encertat <strong>${resultat.correctes}</strong> de <strong>${resultat.total}</strong> preguntes.</p>
                          <button id="tornar">Tornar a començar</button>`;
        document.getElementById("tornar").addEventListener("click", () => {
            carregarPreguntes(5);
            document.getElementById("resultat").innerHTML = "";
        });
        document.getElementById("pregunta").innerHTML = "";
        document.getElementById("anterior").style.display = "none";
        document.getElementById("seguent").style.display = "none";
        document.getElementById("finalitza").style.display = "none";
    } else {
        rDiv.innerHTML = "<p>Resposta inesperada del servidor.</p>";
    }
}
