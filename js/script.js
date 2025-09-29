const NPREGUNTAS = 3

let estatDeLaPartida = {
  preguntaActual: 0,
  contadorPreguntes: 0,
  respostesUsuari: [], // Aquí anirem guardant les respostes 
  tempsRestant:30
};

function EsborrarPartida() {
  localStorage.removeItem("partida");
  estatDeLaPartida = {
    preguntaActual: 0,
    contadorPreguntes: 0,
    respostesUsuari: [], // Aquí anirem guardant les respostes 
    tempsRestant:30
  }
  actualitzaMarcador();
};

function actualitzaMarcador() {
  let marcador = document.getElementById("marcador");
  let htmlString = `Preguntes respostes ${estatDeLaPartida.contadorPreguntes}/${NPREGUNTAS} <br>`
  htmlString += `temps partida ${estatDeLaPartida.tempsRestant}`
  htmlString += `
    <div class="progress" role="progressbar" aria-label="Animated striped example" aria-valuenow=" ${(estatDeLaPartida.tempsRestant/30)*100}" aria-valuemin="0" aria-valuemax="100">
      <div class="progress-bar progress-bar-striped progress-bar-animated" style="width:  ${(estatDeLaPartida.tempsRestant/30)*100}%"></div>
    </div>`

  for (let i = 0; i < estatDeLaPartida.respostesUsuari.length; i++) {
    htmlString += `Pregunta  ${i} : <span class='badge text-bg-primary'> 
                            ${(estatDeLaPartida.respostesUsuari[i] == undefined ? "O" : "X")}
                            </span><br>` ;
  }

  htmlString += `<div> <button id="btnBorrar" onclick="EsborrarPartida()" class="btn btn-danger">Borrar Partida</button> </div>`
  marcador.innerHTML = htmlString;

  //ELIMINO TOTS ELS "SELECCIONADA QUE TINGUI" DE DARRERE ENDAVANT PER EVITAR ERRORS
  let seleccio = document.getElementsByClassName("seleccionada")
  for (let k = seleccio.length - 1; k >= 0; k--) {
    seleccio[k].classList.remove("seleccionada")
  }

  //ANEM A MARCAR LES PREGUNTES QUE JA ESTAN SELECCIONADES
  for (let i = 0; i < estatDeLaPartida.respostesUsuari.length; i++) {
    let resposta = estatDeLaPartida.respostesUsuari[i]
    if (resposta != undefined) document.getElementById(`${i}_${resposta}`).classList.add("seleccionada")
  }

  //EMMAGATZEMO L'ESTAT DE LA PARTIDA A LOCALSTORAGE
  localStorage.setItem("partida", JSON.stringify(estatDeLaPartida))
  console.log(estatDeLaPartida)
}


//AQUESTA FUNCIO REACCCIONA A QUAN UN USUARI MARCA UN BOTO (PREGUNTA I RESPOSTA)
function marcarRespuesta(numPregunta, numRespuesta) {
  console.log("Pregunta " + numPregunta + " Resposta " + numRespuesta);
  if (estatDeLaPartida.respostesUsuari[numPregunta] == undefined) {
    estatDeLaPartida.contadorPreguntes++;
    if (estatDeLaPartida.contadorPreguntes == NPREGUNTAS) {
      document.getElementById("btnEnviar").style.display = "block"
    }
  }
  estatDeLaPartida.respostesUsuari[numPregunta] = numRespuesta;
  actualitzaMarcador();
}

function imprimirJuego(data) {
  let contenidor = document.getElementById("questionari");
  let htmlString = "";
  htmlString += `<div> <h2>Quiz de preguntes variades</h2> </div> `;

  // htmlString += `<div> 
  //       <button id="btnAnterior" class="btn btn-secondary">Anterior Pregunta</button>
  //       <button id="btnSeguent" class="btn btn-secondary">Seguent Pregunta</button>
  //     </div> `
  for (let i = 0; i < NPREGUNTAS; i++) {
    htmlString += `<div class="pregunta oculta" id=${i}> `;

    htmlString += `<h3> ${data.preguntes[i].pregunta} </h3> `;
    htmlString += `<img src="img/${data.preguntes[i].imatge}" alt="imatge pregunta ${i + 1}"> <br>`;

    for (let j = 0; j < data.preguntes[i].respostes.length; j++) {
      htmlString += `<button id=${i}_${j} preg="${i}" resp="${j}" class="btn btn-primary"> 
                                ${data.preguntes[i].respostes[j]} 
                            </button> `;
    }
    htmlString += `</div> `;
  }

  //DELEGACIO D'EVENTS
  //FEM QUE ESCOLTI EL PARE I DESPRES AMB UN IF VEIEM SI ENS INTERESA QUI HA FET CLICK
  //DESPRES RECUPEREM LA INFORMACIO DEL e.target 
  contenidor.addEventListener('click', function (e) {
    console.log("han clickado a " + e.target)
    if (e.target.classList.contains('btn')) {
      console.log("esto si es un boton que tiene los datos" + e.target.getAttribute("preg") + "--" + e.target.getAttribute("resp"))
      marcarRespuesta(e.target.getAttribute("preg"), e.target.getAttribute("resp"))
    }
  });

  htmlString += `<button id="btnEnviar"  class="btn btn-danger"  style="display:none" >Enviar Respuestas</button>`

  contenidor.innerHTML = htmlString;
  
  
  document.getElementById("0").classList.remove("oculta")
 
   
  // GESTIÖP DEL TIMER
  idTimer=setInterval(function(){
    console.log(estatDeLaPartida.tempsRestant)
      if (estatDeLaPartida.tempsRestant>0) {
            estatDeLaPartida.tempsRestant--
          }
          actualitzaMarcador();
  },1000);


  // //LISTENERS BOTONS
  // document.getElementById('btnSeguent').addEventListener('click', function () {
  //   if (estatDeLaPartida.preguntaActual < NPREGUNTAS - 1) {
  //     document.getElementById(estatDeLaPartida.preguntaActual).classList.add("oculta");
  //     estatDeLaPartida.preguntaActual++;
  //     document.getElementById(estatDeLaPartida.preguntaActual).classList.remove("oculta");
  //   }

  //   // Ocultar/mostrar botones
  //   if (estatDeLaPartida.preguntaActual === NPREGUNTAS - 1) {
  //     document.getElementById("btnSeguent").classList.add("oculta");
  //   } else {
  //     document.getElementById("btnSeguent").classList.remove("oculta");
  //   }

  //   if (estatDeLaPartida.preguntaActual === 0) {
  //     document.getElementById("btnAnterior").classList.add("oculta");
  //   } else {
  //     document.getElementById("btnAnterior").classList.remove("oculta");
  //   }
  // });

  // document.getElementById('btnAnterior').addEventListener('click', function () {
  //   if (estatDeLaPartida.preguntaActual > 0) {
  //     document.getElementById(estatDeLaPartida.preguntaActual).classList.add("oculta");
  //     estatDeLaPartida.preguntaActual--;
  //     document.getElementById(estatDeLaPartida.preguntaActual).classList.remove("oculta");
  //   }

  //   // Ocultar/mostrar botones
  //   if (estatDeLaPartida.preguntaActual === NPREGUNTAS - 1) {
  //     document.getElementById("btnSeguent").classList.add("oculta");
  //   } else {
  //     document.getElementById("btnSeguent").classList.remove("oculta");
  //   }

  //   if (estatDeLaPartida.preguntaActual === 0) {
  //     document.getElementById("btnAnterior").classList.add("oculta");
  //   } else {
  //     document.getElementById("btnAnterior").classList.remove("oculta");
  //   }
  // });

  document.getElementById("btnEnviar").addEventListener("click", function () {
    const url = "recollida.php"; // cambia por tu endpoint
    // 1) Enviar como JSON
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contadorPreguntes: estatDeLaPartida.contadorPreguntes,
        respostesUsuari: estatDeLaPartida.respostesUsuari
      })
    })
      .then(res => res.text())
      .then(data => console.log("JSON ->", data));

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

    // 3) Enviar como x-www-form-urlencoded
    let params = new URLSearchParams();
    params.append("contadorPreguntes", estatDeLaPartida.contadorPreguntes);
    params.append("respostesUsuari", JSON.stringify(estatDeLaPartida.respostesUsuari));

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
    })
      .then(res => res.text())
      .then(data => console.log("URLEncoded ->", data));
  })

}

window.addEventListener('DOMContentLoaded', (event) => {
  //CARREGO DE LOCALSTORAGE LA INFORMACIO DE LA PARTIDA
  fetch('js/data.json')
    .then(response => response.json())
    .then(data => {
      imprimirJuego(data);
      if (localStorage.partida) {
        estatDeLaPartida = JSON.parse(localStorage.getItem("partida"));
        actualitzaMarcador()
      }
    });
});
