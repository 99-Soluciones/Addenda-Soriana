import { agregarNuevaTarima, limpiarTarimas } from "./tarimas.js";
import { setDatosCFDI, resetDatosCFDI } from "./state.js";

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

  // Resetear estado anterior
  resetDatosCFDI();

  const lector = new FileReader();

  lector.onload = (e) => {
    const xmlTexto = e.target.result;
    procesarXML(xmlTexto);
  };

  lector.onerror = () => {
    console.error("Error al leer el archivo XML");
    alert("Error al leer el archivo. Por favor, inténtelo de nuevo.");
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

    // Verificar errores de parseo
    const parserError = xmlDoc.querySelector("parsererror");
    if (parserError) {
      throw new Error("El archivo XML no tiene un formato válido");
    }

    const comprobanteNode = xmlDoc.querySelector("Comprobante");
    if (!comprobanteNode) {
      throw new Error(
        "Este no parece ser un archivo CFDI 4.0 válido. No se encontró el nodo 'cfdi:Comprobante'."
      );
    }

    // Extraer datos del comprobante
    const comprobante = {
      Serie: comprobanteNode.getAttribute("Serie") || "",
      Folio: comprobanteNode.getAttribute("Folio"),
      Fecha: comprobanteNode.getAttribute("Fecha"),
      SubTotal: parseFloat(comprobanteNode.getAttribute("SubTotal")).toFixed(6),
      Total: comprobanteNode.getAttribute("Total"),
      Moneda: comprobanteNode.getAttribute("Moneda"),
    };

    // Extraer impuestos
    const impuestosNode = xmlDoc.querySelector(
      "Comprobante > Impuestos > Traslados"
    );

    let impuestos = { TasaIVA: "0.00" };

    if (impuestosNode) {
      for (const impuesto of impuestosNode.children) {
        if (impuesto.getAttribute("Impuesto") === "002") {
          impuestos.TasaIVA = impuesto.getAttribute("Importe")
            ? parseFloat(impuesto.getAttribute("Importe")).toFixed(2)
            : "0.00";
          break;
        }
      }
    }

    // Extraer Conceptos (productos) debo agregar una validacion, si hay varios productos repetidos, que se unan
    const conceptosNodes = xmlDoc.querySelectorAll("Concepto");
    const conceptos = [];

    conceptosNodes.forEach((nodo, index) => {
      const trasladoNode = nodo.querySelector("Traslado");
      const descripcion = nodo.getAttribute("Descripcion");
      if (conceptos.some((c) => c.Descripcion === descripcion)) {
        // Si ya existe un concepto con la misma descripción, sumar cantidades e importes
        const conceptoExistente = conceptos.find(
          (c) => c.Descripcion === descripcion
        );
        conceptoExistente.Cantidad = (
          parseFloat(conceptoExistente.Cantidad) +
          parseFloat(nodo.getAttribute("Cantidad"))
        ).toFixed(2);
        conceptoExistente.Importe = (
          parseFloat(conceptoExistente.Importe) +
          parseFloat(nodo.getAttribute("Importe"))
        ).toFixed(6);
      } else {
        conceptos.push({
          index: index,
          Descripcion: nodo.getAttribute("Descripcion"),
          Cantidad: parseFloat(nodo.getAttribute("Cantidad")).toFixed(2),
          ValorUnitario: parseFloat(nodo.getAttribute("ValorUnitario")).toFixed(
            6
          ),
          Importe: parseFloat(nodo.getAttribute("Importe")).toFixed(6),
          TasaIVA: trasladoNode
            ? (
                parseFloat(trasladoNode.getAttribute("TasaOCuota")) * 100
              ).toFixed(2)
            : "0.00",
        });
      }
    });

    // Actualizar el estado global
    setDatosCFDI({
      comprobante,
      impuestos,
      conceptos,
    });

    mostrarFormularios(conceptos);
  } catch (error) {
    console.error("Error al parsear el XML:", error);
    alert(
      "Hubo un error al leer el archivo XML. Por favor, asegúrate de que es un archivo válido.\n\nDetalles: " +
        error.message
    );
    resetDatosCFDI();
  }
}

/**
 * Muestra los formularios ocultos y llena la lista de productos
 * en el DOM (en la página).
 * @param {Array} conceptos Array de conceptos/productos
 * @return {void}
 */
function mostrarFormularios(conceptos) {
  const listaProductosDiv = document.getElementById("productos-lista");
  listaProductosDiv.innerHTML = "";

  if (!conceptos || conceptos.length === 0) {
    listaProductosDiv.innerHTML =
      "<p>No se encontraron productos (conceptos) en el XML.</p>";
    return;
  }

  // Crear un item en el HTML por cada producto
  conceptos.forEach((producto) => {
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
                        <input type="text" id="codigo-${producto.index}" class="input-codigo-producto" data-index="${producto.index}" placeholder="Ingrese el código del producto">
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
  // Limpiar tarimas anteriores y agregar la primera por defecto
  limpiarTarimas();
  agregarNuevaTarima();

  // Mostrar el contenedor principal del formulario
  document.getElementById("formulario-principal").classList.remove("hidden");
}

export { cargarArchivoXML, procesarXML, mostrarFormularios };
