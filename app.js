let datosCFDI = {
  conceptos: [],
  comprobante: {},
  impuestos: {},
};

document.addEventListener("DOMContentLoaded", () => {
  // Evento para cuando el usuario selecciona un archivo
  document
    .getElementById("archivo-xml")
    .addEventListener("change", cargarArchivoXML);

  // Evento para el botón de generar
  document
    .getElementById("btn-generar")
    .addEventListener("click", generarAddenda);
});

// --- FUNCIONES PRINCIPALES ---

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

  // Callback que se ejecuta cuando el lector termina de leer
  lector.onload = (e) => {
    const xmlTexto = e.target.result;
    procesarXML(xmlTexto);
  };

  // Inicia la lectura del archivo
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

    // Extraer datos del Comprobante (nodo principal)
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
      SubTotal: comprobanteNode.getAttribute("SubTotal"),
      Total: comprobanteNode.getAttribute("Total"),
      Moneda: comprobanteNode.getAttribute("Moneda"),
    };

    // Extraer datos de Impuestos (totales) ---
    const impuestosNode = xmlDoc.querySelector(
      "Comprobante > Impuestos > Traslados"
    );

    console.log(impuestosNode);

    let TasaIVA = "0.00";
    for (const impuesto of impuestosNode.children) {
      if (impuesto.getAttribute("Impuesto") === "002") {
        // IVA
        TasaIVA = impuesto.getAttribute("Importe");
        break;
      }
    }

    datosCFDI.impuestos = {
      TasaIVA: TasaIVA ? TasaIVA : "0.00",
    };

    // Extraer Conceptos (productos)
    const conceptosNodes = xmlDoc.querySelectorAll("Concepto");
    datosCFDI.conceptos = [];

    conceptosNodes.forEach((nodo, index) => {
      const trasladoNode = nodo.querySelector("Traslado");
      datosCFDI.conceptos.push({
        index: index, // Para identificar el input
        Descripcion: nodo.getAttribute("Descripcion"),
        Cantidad: parseFloat(nodo.getAttribute("Cantidad")).toFixed(2), // 2 decimales
        ValorUnitario: parseFloat(nodo.getAttribute("ValorUnitario")).toFixed(
          6
        ), // 6 decimales
        Importe: parseFloat(nodo.getAttribute("Importe")).toFixed(6),
        TasaIVA: trasladoNode
          ? (parseFloat(trasladoNode.getAttribute("TasaOCuota")) * 100).toFixed(
              2
            )
          : "0.00", // 16.00
      });
    });

    // --- 4. Mostrar el formulario y la lista de productos ---
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
  listaProductosDiv.innerHTML = ""; // Limpiar lista anterior

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
                <div class="form-control">
                    <label for="codigo-${producto.index}">Código (SKU/EAN):</label>
                    <input type="text" id="codigo-${producto.index}" class="input-codigo-producto" data-index="${producto.index}">
                </div>
            </div>
        `;
    listaProductosDiv.innerHTML += itemHTML;
  });

  // Mostrar el contenedor principal del formulario
  document.getElementById("formulario-principal").classList.remove("hidden");
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
  const codigoTarima = document.getElementById("codigo-tarima").value;
  const fechaEntrega = document.getElementById("fecha-entrega").value;

  // B. Recolectar datos de los productos (los códigos ingresados) ---
  const inputsCodigos = document.querySelectorAll(".input-codigo-producto");
  let productosConCodigo = [];

  inputsCodigos.forEach((input) => {
    const index = parseInt(input.dataset.index, 10);
    const productoOriginal = datosCFDI.conceptos[index];
    productosConCodigo.push({
      ...productoOriginal, // Copia todos los datos (Cantidad, ValorUnitario, etc.)
      Codigo: input.value, // Agrega el código ingresado por el usuario
    });
  });

  // C. Recolectar datos del CFDI ---
  const remision = `${datosCFDI.comprobante.Serie || ""}-${
    datosCFDI.comprobante.Folio
  }`;

  const fechaRemision = datosCFDI.comprobante.Fecha.substring(0, 10); // Solo YYYY-MM-DD
  const totalArticulos = datosCFDI.conceptos.length;

  const subtotal = datosCFDI.conceptos[0]
    ? datosCFDI.conceptos[0].Importe
    : "0.00";

  const iva = datosCFDI.impuestos.TasaIVA;
  const total = datosCFDI.comprobante.Total;

  const cantidadTotalBultos = productosConCodigo
    .reduce((acc, p) => acc + parseFloat(p.Cantidad), 0)
    .toFixed(2);

  // D. Construir el XML de la Addenda (con Template Literals) ---

  // D.1. Crear los nodos <Articulos>
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

  // D.2. Crear los nodos <ArticulosPorCajaTarima>
  const articulosPorTarimaXML = productosConCodigo
    .map(
      (
        p
      ) => `
        <ArticulosPorCajaTarima Id="ArticulosPorCajaTarima${p.index}" RowOrder="${p.index}">
            <Proveedor>${proveedor}</Proveedor>
            <Remision>${remision}</Remision>
            <FolioPedido>${folioPedido}</FolioPedido>
            <NumeroCajaTarima>1</NumeroCajaTarima>
            <SucursalDistribuir>${entrega}</SucursalDistribuir>
            <Codigo>${p.Codigo}</Codigo>
            <CantidadUnidadCompra>${p.Cantidad}</CantidadUnidadCompra>
        </ArticulosPorCajaTarima>`
    )
    .join("");

  // D.3. Construir la Addenda Completa

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
            <CantidadCajasTarimas>1</CantidadCajasTarimas>
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
        <CajasTarimas Id="CajaTarima0" RowOrder="0">
            <Proveedor>${proveedor}</Proveedor>
            <Remision>${remision}</Remision>
            <NumeroCajaTarima>1</NumeroCajaTarima>
            <CodigoBarraCajaTarima>${codigoTarima}</CodigoBarraCajaTarima>
            <SucursalDistribuir>${entrega}</SucursalDistribuir>
            <CantidadArticulos>${totalArticulos}</CantidadArticulos>
        </CajasTarimas>
        ${articulosPorTarimaXML.trim()}
    </DSCargaRemisionProv>
</cfdi:Addenda>`;

  // --- E. Mostrar el resultado en el textarea ---
  document.getElementById("resultado-xml").value = addendaCompleta.trim();
}
