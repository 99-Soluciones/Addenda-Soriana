import { getContadorTarimas, incrementarContadorTarimas, setContadorTarimas } from "./state.js";

/**
 * Añade un nuevo bloque de formulario para una tarima
 * @return {void}
 */
function agregarNuevaTarima() {
  const numeroTarimaActual = incrementarContadorTarimas();
  const listaTarimasDiv = document.getElementById("tarimas-lista");

  // 1. Crear el contenedor principal
  const nuevoDiv = document.createElement("div");
  nuevoDiv.className = "tarima-item";
  // Guardamos el número en el dataset para poder eliminarlo
  nuevoDiv.dataset.numeroTarima = numeroTarimaActual;

  // 2. Crear el contenido HTML (header con botón y el form-control)
  nuevoDiv.innerHTML = `
    <div class="tarima-item-header">
        <h3>Tarima N° ${numeroTarimaActual}</h3>
        <button class="btn-peligro btn-eliminar-tarima" data-numero-tarima="${numeroTarimaActual}">Eliminar</button>
    </div>
    <div class="form-control">
        <label for="codigo-tarima-${numeroTarimaActual}">Código de Barras (SSCC) de Tarima ${numeroTarimaActual}:</label>
        <input type="text" id="codigo-tarima-${numeroTarimaActual}" class="input-codigo-tarima" data-numero-tarima="${numeroTarimaActual}" placeholder="Código SSCC de la tarima">
    </div>
  `;

  // 3. Añadir el nuevo div al DOM
  listaTarimasDiv.appendChild(nuevoDiv);

  // 4. Asignar el evento de clic al botón que acabamos de crear
  nuevoDiv
    .querySelector(".btn-eliminar-tarima")
    .addEventListener("click", eliminarTarima);
}

/** Elimina una tarima específica y renumera las restantes.
 * @param {Event} e Evento del clic en el botón eliminar
 * @return {void}
 */
function eliminarTarima(e) {
  e.preventDefault(); // Evita comportamientos por defecto

  // Encuentra el contenedor 'tarima-item' más cercano al botón
  const tarimaParaEliminar = e.target.closest(".tarima-item");
  if (tarimaParaEliminar) {
    tarimaParaEliminar.remove(); // Elimina el elemento del DOM
    renumerarTarimas(); // Llama a la función para re-ordenar
  }
}

/** Renumera todas las tarimas en el DOM después de una eliminación.
 * @return {void}
 */
function renumerarTarimas() {
  const listaTarimasDiv = document.getElementById("tarimas-lista");
  const tarimasRestantes = listaTarimasDiv.querySelectorAll(".tarima-item");

  let contador = 1;
  tarimasRestantes.forEach((tarima) => {
    // Actualizar el Título (H3)
    tarima.querySelector("h3").textContent = `Tarima N° ${contador}`;

    // Actualizar la Etiqueta (Label)
    const label = tarima.querySelector("label");
    label.textContent = `Código de Barras (SSCC) de Tarima ${contador}:`;
    label.setAttribute("for", `codigo-tarima-${contador}`);

    // Actualizar el Input
    const input = tarima.querySelector(".input-codigo-tarima");
    input.id = `codigo-tarima-${contador}`;
    input.dataset.numeroTarima = contador;

    // Actualizar el Botón de Eliminar
    const boton = tarima.querySelector(".btn-eliminar-tarima");
    boton.dataset.numeroTarima = contador;

    // Actualizar el dataset del item principal
    tarima.dataset.numeroTarima = contador;

    contador++;
  });

  // Actualizamos el contador global al número de tarimas restantes
  setContadorTarimas(tarimasRestantes.length);
}

/**
 * Limpia todas las tarimas del DOM y resetea el contador
 * @return {void}
 */
function limpiarTarimas() {
  const listaTarimasDiv = document.getElementById("tarimas-lista");
  listaTarimasDiv.innerHTML = "";
  setContadorTarimas(0);
}

export { agregarNuevaTarima, eliminarTarima, renumerarTarimas, limpiarTarimas };