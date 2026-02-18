import { getDatosCFDI, isDataLoaded } from "./state.js";
import { recolectarDatosGlobales, recolectarDatosTarimas, recolectarDatosProductos } from "./formData.js";
import { validarDatosGlobales, validarTarimas, validarProductos } from "./validacion.js";

/**
 * Función final: Se activa con el botón "Generar Addenda".
 * Recoge TODOS los datos (XML + Formulario) y construye el string.
 * @return {void}
 */
function generarAddenda() {
  try {
    // Verificar que hay datos cargados
    if (!isDataLoaded()) {
      alert("Por favor, cargue primero un archivo XML válido.");
      return;
    }

    const isConsolidada = document.getElementById("select-tipo-addenda").value === "Consolidada";

    const datosCFDI = getDatosCFDI();

    // A. Recolectar datos del formulario ---
    const datosGlobales = recolectarDatosGlobales();


    const tarimas =  isConsolidada ? recolectarDatosTarimas() : [];
    const productosConCodigo = recolectarDatosProductos(datosCFDI.conceptos, isConsolidada);

    // B. Validar todos los datos ---
    const validacionGlobales = validarDatosGlobales(datosGlobales, isConsolidada);
    const validacionTarimas =  isConsolidada ? validarTarimas(tarimas) : { errores: [] };
    const validacionProductos = validarProductos(productosConCodigo, isConsolidada);

    // Mostrar errores si los hay
    const todosLosErrores = [
      ...validacionGlobales.errores,
      ...validacionTarimas.errores,
      ...validacionProductos.errores
    ];

    if (todosLosErrores.length > 0) {
      alert("Se encontraron los siguientes errores:\n\n" + todosLosErrores.join("\n"));
      return;
    }

    // C. Generar la addenda ---
    const addendaCompleta = construirAddenda(datosCFDI, datosGlobales, tarimas, productosConCodigo, isConsolidada);

    // D. Mostrar el resultado ---
    document.getElementById("resultado-xml").value = addendaCompleta.trim();
    
    console.log("Addenda generada exitosamente");
    
  } catch (error) {
    console.error("Error al generar la addenda:", error);
    alert("Ocurrió un error al generar la addenda: " + error.message);
  }
}

/**
 * Construye el XML de la addenda con todos los datos proporcionados
 * @param {Object} datosCFDI - Datos extraídos del CFDI
 * @param {Object} datosGlobales - Datos globales del formulario
 * @param {Array} tarimas - Array de tarimas
 * @param {Array} productosConCodigo - Array de productos con códigos
 * @returns {string} XML de la addenda completa
 */
function construirAddenda(datosCFDI, datosGlobales, tarimas, productosConCodigo, isConsolidada) {
  // Calcular valores necesarios
  const remision = `${datosCFDI.comprobante.Serie || ""}-${datosCFDI.comprobante.Folio}`;
  const fechaRemision = datosCFDI.comprobante.Fecha.substring(0, 10);
  const totalArticulos = datosCFDI.conceptos.length;
  const totalTarimas = tarimas.length;
  
  const subtotal = datosCFDI.comprobante.SubTotal;
  const iva = datosCFDI.impuestos.TasaIVA;
  const total = datosCFDI.comprobante.Total;
  const cantidadTotalBultos = parseFloat(datosGlobales.numeroBultos);

  // Construir secciones del XML
  const articulosXML = construirSeccionArticulos(productosConCodigo, datosGlobales, remision);
  const cajasTarimasXML = isConsolidada ? construirSeccionCajasTarimas(tarimas, datosGlobales, remision, datosCFDI.conceptos.length) : "";
  const articulosPorTarimaXML = isConsolidada ? construirSeccionArticulosPorTarima(productosConCodigo, datosGlobales, remision) : "";

  // Combinar secciones XML eliminando vacías
  const seccionesXML = [articulosXML, cajasTarimasXML, articulosPorTarimaXML]
    .filter(seccion => seccion.trim())
    .join('        ');

  // Construir la addenda completa
  return `<cfdi:Addenda>
    <DSCargaRemisionProv>
        <Remision Id="Remision0" RowOrder="0">
            <Proveedor>${datosGlobales.proveedor}</Proveedor>
            <Remision>${remision}</Remision>
            <Consecutivo>0</Consecutivo>
            <FechaRemision>${fechaRemision}</FechaRemision>
            <Tienda>${datosGlobales.tienda}</Tienda>
            <TipoMoneda>1</TipoMoneda>
            <TipoBulto>1</TipoBulto>
            <EntregaMercancia>${datosGlobales.entrega}</EntregaMercancia>
            <CumpleReqFiscales>true</CumpleReqFiscales>
            <CantidadBultos>${cantidadTotalBultos}</CantidadBultos>
            <Subtotal>${subtotal}</Subtotal>
            <Descuentos>0.00</Descuentos>
            <IEPS>0.00</IEPS>
            <IVA>${iva}</IVA>
            <OtrosImpuestos>0.00</OtrosImpuestos>
            <Total>${total}</Total>
            <CantidadPedidos>1</CantidadPedidos>
            <FechaEntregaMercancia>${datosGlobales.fechaEntrega}</FechaEntregaMercancia>
            ${isConsolidada ? `<EmpaqueEnCajas>true</EmpaqueEnCajas>
            <EmpaqueEnTarimas>true</EmpaqueEnTarimas>
            <CantidadCajasTarimas>${totalTarimas}</CantidadCajasTarimas>
            <Cita>${datosGlobales.cita}</Cita>` : `<FolioNotaEntrada>${datosGlobales.folioNotaEntrada}</FolioNotaEntrada>`}
        </Remision>
        <Pedidos Id="Pedidos0" RowOrder="0">
            <Proveedor>${datosGlobales.proveedor}</Proveedor>
            <Remision>${remision}</Remision>
            <FolioPedido>${datosGlobales.folioPedido}</FolioPedido>
            <Tienda>${datosGlobales.tienda}</Tienda>
            <CantidadArticulos>${totalArticulos}</CantidadArticulos>
        </Pedidos>${seccionesXML}
    </DSCargaRemisionProv>
</cfdi:Addenda>`;
}

/**
 * Construye la sección de artículos del XML
 * @param {Array} productos - Array de productos
 * @param {Object} datosGlobales - Datos globales
 * @param {string} remision - Número de remisión
 * @returns {string} XML de artículos
 */
function construirSeccionArticulos(productos, datosGlobales, remision) {
  return productos
    .map(
      (p, index) => `
        <Articulos Id="Articulos${index}" RowOrder="${index}">
            <Proveedor>${datosGlobales.proveedor}</Proveedor>
            <Remision>${remision}</Remision>
            <FolioPedido>${datosGlobales.folioPedido}</FolioPedido>
            <Tienda>${datosGlobales.tienda}</Tienda>
            <Codigo>${p.Codigo}</Codigo>
            <CantidadUnidadCompra>${p.Cantidad}</CantidadUnidadCompra>
            <CostoNetoUnidadCompra>${p.ValorUnitario}</CostoNetoUnidadCompra>
            <PorcentajeIEPS>0.00</PorcentajeIEPS>
            <PorcentajeIVA>${p.TasaIVA}</PorcentajeIVA>
        </Articulos>`
    )
    .join("");
}

/**
 * Construye la sección de cajas/tarimas del XML
 * @param {Array} tarimas - Array de tarimas
 * @param {Object} datosGlobales - Datos globales
 * @param {string} remision - Número de remisión
 * @param {number} cantidadArticulos - Cantidad total de artículos
 * @returns {string} XML de cajas/tarimas
 */
function construirSeccionCajasTarimas(tarimas, datosGlobales, remision, cantidadArticulos) {
  return tarimas
    .map((tarima, index) => {
      return `
        <CajasTarimas Id="CajaTarima${index}" RowOrder="${index}">
            <Proveedor>${datosGlobales.proveedor}</Proveedor>
            <Remision>${remision}</Remision>
            <NumeroCajaTarima>${tarima.numero}</NumeroCajaTarima>
            <CodigoBarraCajaTarima>${tarima.codigoBarra}</CodigoBarraCajaTarima>
            <SucursalDistribuir>${datosGlobales.entrega}</SucursalDistribuir>
            <CantidadArticulos>${cantidadArticulos}</CantidadArticulos>
        </CajasTarimas>`;
    })
    .join("");
}

/**
 * Construye la sección de artículos por caja/tarima del XML
 * @param {Array} productos - Array de productos
 * @param {Object} datosGlobales - Datos globales
 * @param {string} remision - Número de remisión
 * @returns {string} XML de artículos por tarima
 */
function construirSeccionArticulosPorTarima(productos, datosGlobales, remision) {
  return productos
    .map(
      (p, index) => `
        <ArticulosPorCajaTarima Id="ArticulosPorCajaTarima${index}" RowOrder="${index}">
            <Proveedor>${datosGlobales.proveedor}</Proveedor>
            <Remision>${remision}</Remision>
            <FolioPedido>${datosGlobales.folioPedido}</FolioPedido>
            <NumeroCajaTarima>${p.NumeroTarima}</NumeroCajaTarima>
            <SucursalDistribuir>${datosGlobales.entrega}</SucursalDistribuir>
            <Codigo>${p.Codigo}</Codigo>
            <CantidadUnidadCompra>${p.Cantidad}</CantidadUnidadCompra>
        </ArticulosPorCajaTarima>`
    )
    .join("");
}

export { generarAddenda };