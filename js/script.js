const NPREGUNTAS=3

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Allow: GET, POST, OPTIONS, PUT, DELETE");
$method = $_SERVER['REQUEST_METHOD'];
if($method == "OPTIONS") {
    die();
}

let estatDeLaPartida = {
    contadorPreguntes: 0,
    respostesUsuari: []
};

function actualitzarMarcador() {
    let marcador = document.getElementById("marcador");
    let htmlString = `Preguntes respostes ${estatDeLaPartida.contadorPreguntes}/${NPREGUNTAS} <br>`
    for(let i = 0; i < estatDeLaPartida.respostesUsuari.length; i++) {
        htmlString+= `Pregunta  ${i} : <span class='badge text-bg-primary'> 
                            ${(estatDeLaPartida.respostesUsuari[i]==undefined?"O":"X")}
                            </span><br>` 
    }
    marcador.innerHTML =htmlString;
}

function marcarRespuesta(numPregunta, numResposta) {
    console.log("Pregunta " + (numPregunta) + " Resposta " + (numResposta));
    if(estatDeLaPartida.respostesUsuari[numPregunta] == undefined) {
        estatDeLaPartida.contadorPreguntes++;
        if (estatDeLaPartida.contadorPreguntes == NPREGUNTAS) {
            document.getElementById("btnEnviar").style.display = "block"
        }
    }
    estatDeLaPartida.respostesUsuari[numPregunta] = numResposta;
    console.log(estatDeLaPartida);
    actualitzarMarcador();
}

function renderJuego(data) {
    let contenidor = document.getElementById("questionari");

    let htmlString = "";

    for(let i = 0; i < NPREGUNTAS; i++) {
        htmlString+=`<h3> ${data.preguntes[i].pregunta} </h3> `;
        htmlString+=`<img src="${data.preguntes[i].imatge}" alt="imatge pregunta ${i+1}"> <br>`;

        for (let j=0; j < data.preguntes[i].respostes.length ; j++){
                htmlString+=`<button preg="${i}" resp="${j}" class="btn btn-primary" "> 
                                ${data.preguntes[i].respostes[j]} 
                            </button> `;
        }
    }

    contenidor.addEventListener("click", function(e) {
        console.log("Han clickado a " + e.target);
        if(e.target.classList.contains("btn")) {
            console.log("Han clickado a un boton que tiene los datos" + e.target.getAttribute("preg") + "--" + e.target.getAttribute("resp"))
            marcarRespuesta(e.target.getAttribute("preg"), e.target.getAttribute("resp"))
        }
    });

    htmlString+=`<button id="btnEnviar" class="btn btn-danger"  style="display:none" >Enviar Respuestas</button>`
            
    contenidor.innerHTML=htmlString;

    document.getElementById("btnEnviar").addEventListener("click", function() {
        const url = "recollida.php"; // cambia por tu endpoint

        // 2) Enviar como FormData (simulando formulario multipart)
        let formData = new FormData();
        formData.append("contadorPreguntes", estatDeLaPartida.contadorPreguntes);
        formData.append("respostesUsuari", JSON.stringify(estatDeLaPartida.respostesUsuari));

        fetch(url, {
            method: "POST",
            body: formData
        })
        .then(res => res.text())
        .then(data => console.log("FormData ->", data));
    })
}

globalThis.addEventListener("DOMContentLoaded", (event) => {

    fetch('js/data.json')
    .then(response => response.json())
    .then(preg => renderJuego(preg));
});