import { cargarArchivoXML, procesarXML } from "./js/getXMLData";

let datosCFDI = {
  conceptos: [],
  comprobante: {},
  impuestos: {},
};

// Contador para las tarimas
let contadorTarimas = 0;

// --- EVENT LISTENERS ---
document.addEventListener("DOMContentLoaded", () => {
  // Evento para cuando el usuario selecciona un archivo
  document
    .getElementById("archivo-xml")
    .addEventListener("change", cargarArchivoXML);

  // Evento para el botón de generar
  document
    .getElementById("btn-generar")
    .addEventListener("click", generarAddenda);

  // Evento para el botón de agregar tarima
  document
    .getElementById("btn-agregar-tarima")
    .addEventListener("click", (e) => {
      e.preventDefault(); // Prevenir recarga si estuviera en un form
      agregarNuevaTarima(); // Llama a la función sin argumentos
    });
});

/**
 * Carga el archivo XML seleccionado por el usuario y se procesan los datos.
 * @param {Event} evento Evento del input file
 * @return {void}
 */
function cargarArchivoXML(evento) {
  const archivo = evento.target.files[0];
  if (!archivo) {
    console.error("No se seleccionó ningún archivo.");
    return;
  }

  const lector = new FileReader();

  lector.onload = (e) => {
    const xmlTexto = e.target.result;
    procesarXML(xmlTexto);
  };

  lector.readAsText(archivo);
}

/**
 * Parsea el texto XML y extrae la información relevante.
 * @param {string} xmlTexto Texto del archivo XML
 * @return {void}
 */
function procesarXML(xmlTexto) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlTexto, "application/xml");

    const comprobanteNode = xmlDoc.querySelector("Comprobante");
    if (!comprobanteNode) {
      alert(
        "Error: Este no parece ser un archivo CFDI 4.0 válido. No se encontró el nodo 'cfdi:Comprobante'."
      );
      return;
    }

    datosCFDI.comprobante = {
      Serie: comprobanteNode.getAttribute("Serie") || "",
      Folio: comprobanteNode.getAttribute("Folio"),
      Fecha: comprobanteNode.getAttribute("Fecha"),
      SubTotal: parseFloat(comprobanteNode.getAttribute("SubTotal")).toFixed(6),
      Total: comprobanteNode.getAttribute("Total"),
      Moneda: comprobanteNode.getAttribute("Moneda"),
    };

    const impuestosNode = xmlDoc.querySelector(
      "Comprobante > Impuestos > Traslados"
    );

    for (const impuesto of impuestosNode.children) {
      if (impuesto.getAttribute("Impuesto") === "002") {
        datosCFDI.impuestos = {
          TasaIVA: impuesto.getAttribute("Importe")
            ? parseFloat(impuesto.getAttribute("Importe")).toFixed(2)
            : "0.00",
        };
        break;
      }
    }

    // Extraer Conceptos (productos)
    const conceptosNodes = xmlDoc.querySelectorAll("Concepto");
    datosCFDI.conceptos = [];

    conceptosNodes.forEach((nodo, index) => {
      const trasladoNode = nodo.querySelector("Traslado");
      datosCFDI.conceptos.push({
        index: index,
        Descripcion: nodo.getAttribute("Descripcion"),
        Cantidad: parseFloat(nodo.getAttribute("Cantidad")).toFixed(2),
        ValorUnitario: parseFloat(nodo.getAttribute("ValorUnitario")).toFixed(
          6
        ),
        Importe: parseFloat(nodo.getAttribute("Importe")).toFixed(6),
        TasaIVA: trasladoNode
          ? (parseFloat(trasladoNode.getAttribute("TasaOCuota")) * 100).toFixed(
              2
            )
          : "0.00",
      });
    });

    mostrarFormularios();
  } catch (error) {
    console.error("Error al parsear el XML:", error);
    alert(
      "Hubo un error al leer el archivo XML. Por favor, asegúrate de que es un archivo válido. \nDetalles para el soporte: " +
        error.message
    );
  }
}

/**
 * Muestra los formularios ocultos y llena la lista de productos
 * en el DOM (en la página).
 * @return {void}
 */
function mostrarFormularios() {
  const listaProductosDiv = document.getElementById("productos-lista");
  listaProductosDiv.innerHTML = "";

  if (datosCFDI.conceptos.length === 0) {
    listaProductosDiv.innerHTML =
      "<p>No se encontraron productos (conceptos) en el XML.</p>";
  }

  // Crear un item en el HTML por cada producto
  datosCFDI.conceptos.forEach((producto) => {
    const itemHTML = `
            <div class="producto-item">
                <p class="descripcion">${producto.Descripcion}</p>
                <p class="detalles">
                    Cantidad: <strong>${producto.Cantidad}</strong> | 
                    Valor Unitario: <strong>$${producto.ValorUnitario}</strong>
                </p>
                <div class="producto-item-controles">
                    <div class="form-control">
                        <label for="codigo-${producto.index}">Código (SKU/EAN):</label>
                        <input type="text" id="codigo-${producto.index}" class="input-codigo-producto" data-index="${producto.index}">
                    </div>
                    <div class="form-control form-control-small">
                        <label for="tarima-${producto.index}">N° Tarima:</label>
                        <input type="number" id="tarima-${producto.index}" class="input-tarima-producto" data-index="${producto.index}" min="1" value="1">
                    </div>
                </div>
            </div>
        `;
    listaProductosDiv.innerHTML += itemHTML;
  });

  // --- Lógica para Tarimas ---
  // Limpiar tarimas anteriores y reiniciar contador
  document.getElementById("tarimas-lista").innerHTML = "";
  contadorTarimas = 0;

  // Agregar la primera tarima por defecto
  agregarNuevaTarima();

  // Mostrar el contenedor principal del formulario
  document.getElementById("formulario-principal").classList.remove("hidden");
}

/**
 * Añade un nuevo bloque de formulario para una tarima
 * @return {void}
 */
function agregarNuevaTarima() {
  contadorTarimas++; // Aumenta el contador global
  const numeroTarimaActual = contadorTarimas;

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
        <input type="text" id="codigo-tarima-${numeroTarimaActual}" class="input-codigo-tarima" data-numero-tarima="${numeroTarimaActual}">
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
  contadorTarimas = tarimasRestantes.length;
}

/**
 * Función final: Se activa con el botón "Generar Addenda".
 * Recoge TODOS los datos (XML + Formulario) y construye el string.
 * @return {void}
 */
function generarAddenda() {
  // A. Recolectar datos del formulario global ---
  const proveedor = document.getElementById("proveedor").value;
  const tienda = document.getElementById("tienda").value;
  const entrega = document.getElementById("entrega").value;
  const cita = document.getElementById("cita").value;
  const folioPedido = document.getElementById("folio-pedido").value;
  const fechaEntrega = document.getElementById("fecha-entrega").value;

  // B. Recolectar datos de TARIMAS ---
  const inputsTarimas = document.querySelectorAll(".input-codigo-tarima");
  let tarimas = [];
  inputsTarimas.forEach((input) => {
    tarimas.push({
      numero: input.dataset.numeroTarima,
      codigoBarra: input.value,
    });
  });
  const totalTarimas = tarimas.length;

  // C. Recolectar datos de PRODUCTOS (con código y tarima) ---
  const inputsCodigos = document.querySelectorAll(".input-codigo-producto");
  let productosConCodigo = [];

  inputsCodigos.forEach((input) => {
    const index = parseInt(input.dataset.index, 10);
    const productoOriginal = datosCFDI.conceptos[index];

    const inputTarima = document.getElementById(`tarima-${index}`);

    productosConCodigo.push({
      ...productoOriginal,
      Codigo: input.value,
      NumeroTarima: inputTarima.value || "1", // Asignar tarima 1 por defecto
    });
  });

  // D. Recolectar datos del CFDI ---
  const remision = `${datosCFDI.comprobante.Serie || ""}-${
    datosCFDI.comprobante.Folio
  }`;

  const fechaRemision = datosCFDI.comprobante.Fecha.substring(0, 10);
  const totalArticulos = datosCFDI.conceptos.length;

  const subtotal = datosCFDI.comprobante.SubTotal; // Usamos el subtotal real
  const iva = datosCFDI.impuestos.TasaIVA;
  const total = datosCFDI.comprobante.Total;

  const cantidadTotalBultos = productosConCodigo
    .reduce((acc, p) => acc + parseFloat(p.Cantidad), 0)
    .toFixed(2);

  // E. Construir el XML de la Addenda ---

  // E.1. Crear los nodos <Articulos> (esto no cambia)
  const articulosXML = productosConCodigo
    .map(
      (p) => `
        <Articulos Id="Articulos${p.index}" RowOrder="${p.index}">
            <Proveedor>${proveedor}</Proveedor>
            <Remision>${remision}</Remision>
            <FolioPedido>${folioPedido}</FolioPedido>
            <Tienda>${tienda}</Tienda>
            <Codigo>${p.Codigo}</Codigo>
            <CantidadUnidadCompra>${p.Cantidad}</CantidadUnidadCompra>
            <CostoNetoUnidadCompra>${p.ValorUnitario}</CostoNetoUnidadCompra>
            <PorcentajeIEPS>0.00</PorcentajeIEPS>
            <PorcentajeIVA>${p.TasaIVA}</PorcentajeIVA>
        </Articulos>`
    )
    .join("");

  // E.2. Crear los nodos <CajasTarimas> (NUEVO: Bucle)
  const articulosEnEstaTarima = datosCFDI.conceptos.length;

  const cajasTarimasXML = tarimas
    .map((tarima, index) => {
      // Contar cuántos artículos tiene esta tarima, de momento lo dejo comentado por si se necesita

      //   const articulosEnEstaTarima = productosConCodigo.filter(
      //     (p) => p.NumeroTarima == tarima.numero
      //   ).length;
      return `
        <CajasTarimas Id="CajaTarima${index}" RowOrder="${index}">
            <Proveedor>${proveedor}</Proveedor>
            <Remision>${remision}</Remision>
            <NumeroCajaTarima>${tarima.numero}</NumeroCajaTarima>
            <CodigoBarraCajaTarima>${tarima.codigoBarra}</CodigoBarraCajaTarima>
            <SucursalDistribuir>${entrega}</SucursalDistribuir>
            <CantidadArticulos>${articulosEnEstaTarima}</CantidadArticulos>
        </CajasTarimas>`;
    })
    .join("");

  // E.3. Crear los nodos <ArticulosPorCajaTarima> (NUEVO: usa p.NumeroTarima)
  const articulosPorTarimaXML = productosConCodigo
    .map(
      (p) => `
        <ArticulosPorCajaTarima Id="ArticulosPorCajaTarima${p.index}" RowOrder="${p.index}">
            <Proveedor>${proveedor}</Proveedor>
            <Remision>${remision}</Remision>
            <FolioPedido>${folioPedido}</FolioPedido>
            <NumeroCajaTarima>${p.NumeroTarima}</NumeroCajaTarima>
            <SucursalDistribuir>${entrega}</SucursalDistribuir>
            <Codigo>${p.Codigo}</Codigo>
            <CantidadUnidadCompra>${p.Cantidad}</CantidadUnidadCompra>
        </ArticulosPorCajaTarima>`
    )
    .join("");

  // E.4. Construir la Addenda Completa (NUEVO: usa totalTarimas)
  const addendaCompleta = `<cfdi:Addenda>
    <DSCargaRemisionProv>
        <Remision Id="Remision0" RowOrder="0">
            <Proveedor>${proveedor}</Proveedor>
            <Remision>${remision}</Remision>
            <Consecutivo>0</Consecutivo>
            <FechaRemision>${fechaRemision}</FechaRemision>
            <Tienda>${tienda}</Tienda>
            <TipoMoneda>1</TipoMoneda>
            <TipoBulto>1</TipoBulto>
            <EntregaMercancia>${entrega}</EntregaMercancia>
            <CumpleReqFiscales>true</CumpleReqFiscales>
            <CantidadBultos>${cantidadTotalBultos}</CantidadBultos>
            <Subtotal>${subtotal}</Subtotal>
            <Descuentos>0.00</Descuentos>
            <IEPS>0.00</IEPS>
            <IVA>${iva}</IVA>
            <OtrosImpuestos>0.00</OtrosImpuestos>
            <Total>${total}</Total>
            <CantidadPedidos>1</CantidadPedidos>
            <FechaEntregaMercancia>${fechaEntrega}</FechaEntregaMercancia>
            <EmpaqueEnCajas>true</EmpaqueEnCajas>
            <EmpaqueEnTarimas>true</EmpaqueEnTarimas>
            <CantidadCajasTarimas>${totalTarimas}</CantidadCajasTarimas>
            <Cita>${cita}</Cita>
        </Remision>
        <Pedidos Id="Pedidos0" RowOrder="0">
            <Proveedor>${proveedor}</Proveedor>
            <Remision>${remision}</Remision>
            <FolioPedido>${folioPedido}</FolioPedido>
            <Tienda>${tienda}</Tienda>
            <CantidadArticulos>${totalArticulos}</CantidadArticulos>
        </Pedidos>
        ${articulosXML.trim()}
        ${cajasTarimasXML.trim()}
        ${articulosPorTarimaXML.trim()}
    </DSCargaRemisionProv>
</cfdi:Addenda>`;

  // --- F. Mostrar el resultado en el textarea ---
  document.getElementById("resultado-xml").value = addendaCompleta.trim();
}
