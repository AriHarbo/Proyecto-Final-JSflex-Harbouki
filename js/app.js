let api_key = "a4fc2fd02a5291cab537d1220a802760";
let standingsData = null;

async function fetchStandings() {
	try {
		const response = await fetch('https://v3.football.api-sports.io/standings?league=9&season=2024', {
			method: "GET",
			headers: {
				"x-rapidapi-host": "v3.football.api-sports.io",
				"x-rapidapi-key": api_key
			},
			parameters: {
				"country": "World"
			}
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		standingsData = data; // Guardar los datos en una variable global
		return standingsData;
	} catch (err) {
		console.error(err);
	}
}


const botonGrupos = document.getElementById("verGrupos");
const vistaGrupos = document.getElementById("grupos");
const grupoTemplate = document.getElementById("grupoTemplate");
const predicciones = document.getElementById("section-predicciones"); // Para la seccion de predicciones, usada mas abajo.

let gruposMostrados = false; // Variable booleana para que no se creen nuevos grupos cada vez que se apreta el boton.

vistaGrupos.style.display = "none";

botonGrupos.addEventListener("click", async function(event) {
    event.preventDefault();

    predicciones.style.display = "none";
    vistaGrupos.style.display = "grid"; // Asegúrate de que vistaGrupos esté configurado para grid en CSS

    if (!gruposMostrados) {
        try {
            const res = await fetchStandings();
            const copa = res.response;
            console.log(copa);

            copa[0].league.standings.forEach((grupo, i = 0) => {
                // Clonar el grupo
                const nuevoGrupo = grupoTemplate.cloneNode(true);
                nuevoGrupo.id = ""; // Limpiar el id

                // Configurar estilos de la cuadrícula
                nuevoGrupo.style.display = "grid";
                nuevoGrupo.style.gridTemplateColumns = "1fr 1fr 1fr 1fr"; // Ejemplo de definición de columnas

                const nombreGrupo = nuevoGrupo.querySelector("#nombreGrupo");
                nombreGrupo.innerHTML = grupo[i].group;

                // Obtener el contenedor de la tabla
                const tabla = nuevoGrupo.querySelector("table");

                grupo.forEach((equipo, j) => {
                    // Clonar la fila de equipo
                    const filaTemplate = nuevoGrupo.querySelector("tr.abajo");
                    const nuevoEquipoFila = filaTemplate.cloneNode(true);

                    nuevoEquipoFila.querySelector(".equipo").innerHTML = equipo.team.name;
                    nuevoEquipoFila.querySelector(".partidosJugados").innerHTML = equipo.all.played;
                    nuevoEquipoFila.querySelector(".partidosGanados").innerHTML = equipo.all.win;
                    nuevoEquipoFila.querySelector(".partidosEmpatados").innerHTML = equipo.all.draw;
                    nuevoEquipoFila.querySelector(".partidosPerdidos").innerHTML = equipo.all.lose;
                    nuevoEquipoFila.querySelector(".golesFavor").innerHTML = equipo.all.goals.for;
                    nuevoEquipoFila.querySelector(".golesContra").innerHTML = equipo.all.goals.against;
                    nuevoEquipoFila.querySelector(".diferenciaGoles").innerHTML = equipo.all.goals.for - equipo.all.goals.against;
                    nuevoEquipoFila.querySelector(".puntos").innerHTML = equipo.points;

                    const logoImg = document.createElement("img");
                    logoImg.src = equipo.team.logo; // Asignar la URL del logo
                    logoImg.alt = equipo.team.name; // Asignar un texto alternativo para accesibilidad
                    logoImg.style.width = "20px"
                    logoImg.style.margin = "0"
                    nuevoEquipoFila.querySelector(".img").appendChild(logoImg);

                    // Añadir la nueva fila a la tabla
                    tabla.appendChild(nuevoEquipoFila);
                });

                // Eliminar la fila de plantilla original
                nuevoGrupo.querySelector("tr.abajo").remove();

                // Añadir el nuevo grupo al contenedor de grupos
                vistaGrupos.appendChild(nuevoGrupo);
            });

            const abajos = document.querySelectorAll('.abajo');
            abajos.forEach((abajo, index) => {
                if (index < 2) {
                    abajo.style.backgroundColor = 'green';
                }
            });

            gruposMostrados = true;

        } catch (error) {
            console.error('Error al cargar los datos:', error);
            // Aquí puedes manejar el error, por ejemplo mostrando un mensaje al usuario o ejecutando alguna acción alternativa.
        }
    }
});


const btnPredicciones = document.getElementById("prediccion");
const grupoPrediccion = document.getElementById("prediccionClonado");
const btnSiguiente = document.getElementById("siguiente");
let prediccionesMostradas = false;

// Subi las variables que son para la faseEliminatoria, asi los uso en todo momento de las prediccioness
const siguienteFase = document.getElementsByClassName("siguiente");
const faseEliminatoria = document.getElementById("eliminatorias");
const siguienteFaseBtn = document.getElementById("siguienteFaseBtn"); // Suponiendo que tienes un botón con este ID
const tituloGanadorFinal = document.getElementById("ganador"); 
faseEliminatoria.style.display = "none";
siguienteFaseBtn.style.display = "none"; // Ocultar el botón de la siguiente fase inicialmente
//

let ganadoresA = [];
let ganadoresB = [];
let ganadoresC = [];
let ganadoresD = [];
//
let equiposSeleccionados;
let equiposNecesarios;
let fase;
let enfrentamientoIndex;
const ganadores = {}; // Objeto para almacenar los ganadores por enfrentamiento

predicciones.style.display = "none";

btnPredicciones.addEventListener("click", async function(event) {
    event.preventDefault();
    ganadoresA = [];
    ganadoresB = [];
    ganadoresC = [];
    ganadoresD = [];

    equiposSeleccionados = 0; // Contador de equipos seleccionados
    equiposNecesarios = 4; // Número de equipos necesarios para la fase actual
    fase = 0;
    enfrentamientoIndex = 0; // Contador para identificar enfrentamientos

    vistaGrupos.style.display = "none";
    btnSiguiente.style.display = "none";
    faseEliminatoria.style.display = "none";
    predicciones.style.display = "grid";

    const contenedorGanador = document.getElementById("contenedor-ganador");
    contenedorGanador.innerHTML = ''; // Limpiar contenido


    try {
        const res = await fetchStandings();
        const copaAmerica = res.response;

        const contenedorPredicciones = document.querySelector('.predicciones');
        contenedorPredicciones.innerHTML = '';

        copaAmerica[0].league.standings.forEach((grupo, i) => {
            const grupoCopa = grupoPrediccion.cloneNode(true);
            grupoCopa.id = ""; // Elimino el ID para evitar duplicados
            grupoCopa.style.display = "grid";

            const nombreGrupo = grupoCopa.querySelector(".nombreGrupo");
            nombreGrupo.innerHTML = grupo[i].group;

            const contenedorEquipos = grupoCopa.querySelector(".btn-grupo");

            // Eliminar el botón vacío inicial si existe
            grupoCopa.removeChild(contenedorEquipos);

            grupo.forEach((equipo, j) => {
                const nuevoEquipoBtn = contenedorEquipos.cloneNode(true);

                const logo = nuevoEquipoBtn.querySelector(".imagen-equipo");
                logo.src = equipo.team.logo;
                logo.alt = equipo.team.name;

                nuevoEquipoBtn.querySelector(".nombreEquipo").innerHTML = equipo.team.name;

                grupoCopa.appendChild(nuevoEquipoBtn);
            })

            contenedorPredicciones.appendChild(grupoCopa);
        });

        const botones = document.querySelectorAll(".btn-grupo");

        botones.forEach(function(boton) {
            boton.addEventListener("click", function(event) {
                event.preventDefault();

                const grupoCopa = boton.closest(".grupoPrediccion");
                const textoNombreGrupo = grupoCopa.querySelector(".nombreGrupo").innerText;

                const nombreSeleccion = boton.querySelector(".nombreEquipo").innerText;
                const imagenSeleccion = boton.querySelector(".imagen-equipo").src;

                const seleccion = {
                    nombre: nombreSeleccion,
                    imagen: imagenSeleccion
                };

                let position = 0;

                if (textoNombreGrupo == "Group A") {
                    if (ganadoresA.length < 2) {
                        position = ganadoresA.length + 1;
                        boton.style.backgroundColor = "rgb(0, 250, 0)";
                        boton.style.border = "1px solid black";
                        ganadoresA.push(seleccion);
                        boton.querySelector(".position").innerText = position;
                        const checkbox = boton.querySelector(".seleccionar");
                        checkbox.checked = true;
                        boton.disabled = true;
                    }
                } else if (textoNombreGrupo == "Group B") {
                    if (ganadoresB.length < 2) {
                        position = ganadoresB.length + 1;
                        boton.style.backgroundColor = "rgb(0, 250, 0)";
                        boton.style.border = "1px solid black";
                        ganadoresB.push(seleccion);
                        boton.querySelector(".position").innerText = position;
                        const checkbox = boton.querySelector(".seleccionar");
                        checkbox.checked = true;
                        boton.disabled = true;
                    }
                } else if (textoNombreGrupo == "Group C") {
                    if (ganadoresC.length < 2) {
                        position = ganadoresC.length + 1;
                        boton.style.backgroundColor = "rgb(0, 250, 0)";
                        boton.style.border = "1px solid black";
                        ganadoresC.push(seleccion);
                        boton.querySelector(".position").innerText = position;
                        const checkbox = boton.querySelector(".seleccionar");
                        checkbox.checked = true;
                        boton.disabled = true;
                    }
                } else if (textoNombreGrupo == "Group D") {
                    if (ganadoresD.length < 2) {
                        position = ganadoresD.length + 1;
                        boton.style.backgroundColor = "rgb(0, 250, 0)";
                        boton.style.border = "1px solid black";
                        ganadoresD.push(seleccion);
                        boton.querySelector(".position").innerText = position;
                        const checkbox = boton.querySelector(".seleccionar");
                        checkbox.checked = true;
                        boton.disabled = true;
                    }
                }
                if (ganadoresA.length == 2 && ganadoresB.length == 2 && ganadoresC.length == 2 && ganadoresD.length == 2) {
                    btnSiguiente.style.display = "block";
                }
            });
        });

    } catch (error) {
        console.error('Error al cargar los datos:', error);
    }
});


Array.from(siguienteFase).forEach(element => {
    element.addEventListener("click", function(event) {
        event.preventDefault();

    

        predicciones.style.display = "none";
        faseEliminatoria.style.display = "flex";
        siguienteFaseBtn.style.display = "none"; // Ocultar el botón de la siguiente fase

        const contenedorEnfrentamientos = faseEliminatoria.querySelector('.contenedor-enfrentamientos');
        contenedorEnfrentamientos.innerHTML = ''; // Limpiar los enfrentamientos

        if (fase === 0) {
            const tituloFase = faseEliminatoria.querySelector("#cuartos");
            const tituloAnterior = faseEliminatoria.querySelector("#final");
            tituloAnterior.style.backgroundColor = "#959595";
            tituloFase.style.backgroundColor = "#FE2725";

            const enfrentamientos = [
                { equipo1: ganadoresA[0], equipo2: ganadoresB[1] },
                { equipo1: ganadoresB[0], equipo2: ganadoresA[1] },
                { equipo1: ganadoresC[0], equipo2: ganadoresD[1] },
                { equipo1: ganadoresD[0], equipo2: ganadoresC[1] }
            ];

            enfrentamientos.forEach((enfrentamiento, index) => {
                const enfrentamientoDiv = document.createElement('div');
                enfrentamientoDiv.classList.add('enfrentamiento');
                enfrentamientoDiv.setAttribute('data-enfrentamiento-id', enfrentamientoIndex);

                const equipo1Btn = document.createElement('button');
                equipo1Btn.classList.add('btn-grupo');
                equipo1Btn.setAttribute('data-enfrentamiento-id', enfrentamientoIndex); // Guardar enfrentamientoId en el botón
                equipo1Btn.innerHTML = `
                    <img class="imagen-equipo" src="${enfrentamiento.equipo1.imagen}" alt="${enfrentamiento.equipo1.nombre}">
                    <h3 class="nombreEquipo">${enfrentamiento.equipo1.nombre}</h3>
                    <input type="checkbox" class="seleccionar" style="display:none;">`;

                const versus = document.createElement('h3');
                versus.classList.add('versus');
                versus.innerText = 'VS';

                const equipo2Btn = document.createElement('button');
                equipo2Btn.classList.add('btn-grupo');
                equipo2Btn.setAttribute('data-enfrentamiento-id', enfrentamientoIndex); // Guardar enfrentamientoId en el botón
                equipo2Btn.innerHTML = `
                    <img class="imagen-equipo" src="${enfrentamiento.equipo2.imagen}" alt="${enfrentamiento.equipo2.nombre}">
                    <h3 class="nombreEquipo">${enfrentamiento.equipo2.nombre}</h3>
                    <input type="checkbox" class="seleccionar" style="display:none;">`;

                enfrentamientoDiv.appendChild(equipo1Btn);
                enfrentamientoDiv.appendChild(versus);
                enfrentamientoDiv.appendChild(equipo2Btn);

                contenedorEnfrentamientos.appendChild(enfrentamientoDiv);

                equipo1Btn.addEventListener('click', function() {
                    const id = equipo1Btn.getAttribute('data-enfrentamiento-id');
                    manejarClickEquipo(enfrentamiento.equipo1, id, equipo1Btn, equipo2Btn);
                });

                equipo2Btn.addEventListener('click', function() {
                    const id = equipo2Btn.getAttribute('data-enfrentamiento-id');
                    manejarClickEquipo(enfrentamiento.equipo2, id, equipo2Btn, equipo1Btn);
                });

                enfrentamientoIndex++;
            });

            fase++;
        } else if (fase === 1) {
            const tituloFase = faseEliminatoria.querySelector("#semis");
            const tituloAnterior = faseEliminatoria.querySelector("#cuartos");
            tituloAnterior.style.backgroundColor = "#959595";
            tituloFase.style.backgroundColor = "#FE2725";

            equiposSeleccionados = 0; // Reinicia el contador de equipos seleccionados
            equiposNecesarios = 2; // Número de equipos necesarios para las semifinales

            // Crear enfrentamientos de semifinales
            const enfrentamientosSemis = [
                { equipo1: ganadores[0], equipo2: ganadores[1] },
                { equipo1: ganadores[2], equipo2: ganadores[3] }
            ];

            enfrentamientosSemis.forEach((enfrentamiento, index) => {
                const enfrentamientoDiv = document.createElement('div');
                enfrentamientoDiv.classList.add('enfrentamiento');
                enfrentamientoDiv.setAttribute('data-enfrentamiento-id', enfrentamientoIndex);

                const equipo1Btn = document.createElement('button');
                equipo1Btn.classList.add('btn-grupo');
                equipo1Btn.setAttribute('data-enfrentamiento-id', enfrentamientoIndex); // Guardar enfrentamientoId en el botón
                equipo1Btn.innerHTML = `
                    <img class="imagen-equipo" src="${enfrentamiento.equipo1.imagen}" alt="${enfrentamiento.equipo1.nombre}">
                    <h3 class="nombreEquipo">${enfrentamiento.equipo1.nombre}</h3>
                    <input type="checkbox" class="seleccionar" style="display:none;">`;

                const versus = document.createElement('h3');
                versus.classList.add('versus');
                versus.innerText = 'VS';

                const equipo2Btn = document.createElement('button');
                equipo2Btn.classList.add('btn-grupo');
                equipo2Btn.setAttribute('data-enfrentamiento-id', enfrentamientoIndex); // Guardar enfrentamientoId en el botón
                equipo2Btn.innerHTML = `
                    <img class="imagen-equipo" src="${enfrentamiento.equipo2.imagen}" alt="${enfrentamiento.equipo2.nombre}">
                    <h3 class="nombreEquipo">${enfrentamiento.equipo2.nombre}</h3>
                    <input type="checkbox" class="seleccionar" style="display:none;">`;

                enfrentamientoDiv.appendChild(equipo1Btn);
                enfrentamientoDiv.appendChild(versus);
                enfrentamientoDiv.appendChild(equipo2Btn);

                contenedorEnfrentamientos.appendChild(enfrentamientoDiv);

                equipo1Btn.addEventListener('click', function() {
                    const id = equipo1Btn.getAttribute('data-enfrentamiento-id');
                    manejarClickEquipo(enfrentamiento.equipo1, id, equipo1Btn, equipo2Btn);
                });

                equipo2Btn.addEventListener('click', function() {
                    const id = equipo2Btn.getAttribute('data-enfrentamiento-id');
                    manejarClickEquipo(enfrentamiento.equipo2, id, equipo2Btn, equipo1Btn);
                });

                enfrentamientoIndex++;
            });

            fase++;
        } else if (fase === 2) {
            const tituloFase = faseEliminatoria.querySelector("#final");
            const tituloAnterior = faseEliminatoria.querySelector("#semis");
            tituloAnterior.style.backgroundColor = "#959595";
            tituloFase.style.backgroundColor = "#FE2725";

            equiposSeleccionados = 0; // Reiniciar el contador de equipos seleccionados
            equiposNecesarios = 1; // Número de equipos necesarios para la final

            // Crear partido de la final
            const enfrentamientoFinal = { equipo1: ganadores[4], equipo2: ganadores[5] };

            const enfrentamientoDiv = document.createElement('div');
            enfrentamientoDiv.classList.add('enfrentamiento');
            enfrentamientoDiv.setAttribute('data-enfrentamiento-id', enfrentamientoIndex);

            const equipo1Btn = document.createElement('button');
            equipo1Btn.classList.add('btn-grupo');
            equipo1Btn.setAttribute('data-enfrentamiento-id', enfrentamientoIndex); // Guardar enfrentamientoId en el botón
            equipo1Btn.innerHTML = `
                <img class="imagen-equipo" src="${enfrentamientoFinal.equipo1.imagen}" alt="${enfrentamientoFinal.equipo1.nombre}">
                <h3 class="nombreEquipo">${enfrentamientoFinal.equipo1.nombre}</h3>
                <input type="checkbox" class="seleccionar" style="display:none;">`;

            const versus = document.createElement('h3');
            versus.classList.add('versus');
            versus.innerText = 'VS';

            const equipo2Btn = document.createElement('button');
            equipo2Btn.classList.add('btn-grupo');
            equipo2Btn.setAttribute('data-enfrentamiento-id', enfrentamientoIndex); // Guardar enfrentamientoId en el botón
            equipo2Btn.innerHTML = `
                <img class="imagen-equipo" src="${enfrentamientoFinal.equipo2.imagen}" alt="${enfrentamientoFinal.equipo2.nombre}">
                <h3 class="nombreEquipo">${enfrentamientoFinal.equipo2.nombre}</h3>
                <input type="checkbox" class="seleccionar" style="display:none;">`;

            enfrentamientoDiv.appendChild(equipo1Btn);
            enfrentamientoDiv.appendChild(versus);
            enfrentamientoDiv.appendChild(equipo2Btn);

            contenedorEnfrentamientos.appendChild(enfrentamientoDiv);

            // Agrego eventos de clickeo a cada boton
            equipo1Btn.addEventListener('click', function() {
                const id = equipo1Btn.getAttribute('data-enfrentamiento-id');
                manejarClickEquipo(enfrentamientoFinal.equipo1, id, equipo1Btn, equipo2Btn);
            });

            equipo2Btn.addEventListener('click', function() {
                const id = equipo2Btn.getAttribute('data-enfrentamiento-id');
                manejarClickEquipo(enfrentamientoFinal.equipo2, id, equipo2Btn, equipo1Btn);
            });

            enfrentamientoIndex++;
            fase++;
        }
        else if(fase === 3){
            faseEliminatoria.style.display = "none";

            const mostrarGanador = document.createElement("h1");
            mostrarGanador.classList.add("ganador");

             const ganadorFinal = ganadores[6]; // 6 es el enfrentamientoId de la final

            mostrarGanador.innerText = `GANADOR: ${ganadorFinal.nombre}`;

    
            const contenedorGanador = document.getElementById("contenedor-ganador");
            contenedorGanador.innerHTML = ''; // Limpiar contenido previo si lo hubiera
            contenedorGanador.appendChild(mostrarGanador);

    
            contenedorGanador.style.display = "block";
        }
    });
});

function manejarClickEquipo(equipo, enfrentamientoId, equipoBtnSeleccionado, equipoBtnOtro) {
    equipoBtnSeleccionado.style.backgroundColor = "rgb(0, 250, 0)";
    equipoBtnSeleccionado.style.border = "1px solid black";

    // Deshabilitar el otro botón del enfrentamiento
    equipoBtnOtro.disabled = true;
    equipoBtnOtro.style.backgroundColor = "grey";
    equipoBtnOtro.style.border = "1px solid black";
    
    // Deshabilitar el botón seleccionado para evitar clics adicionales
    equipoBtnSeleccionado.disabled = true;

    // Aca guardo el equipo ganador para poder usarlo
    ganadores[enfrentamientoId] = equipo;

    equiposSeleccionados++;

    if (equiposSeleccionados === equiposNecesarios) {
        siguienteFaseBtn.style.display = "block";
    }
}

