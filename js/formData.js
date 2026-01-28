/**
 * Módulo para recolección de datos del formulario
 * Maneja la extracción de datos desde los elementos del DOM
 */

/**
 * Recolecta los datos globales del formulario
 * @returns {Object} Objeto con todos los datos globales
 */
export function recolectarDatosGlobales() {
  const isConsolidada = document.getElementById("select-tipo-addenda").value === "Consolidada";
  const cita = isConsolidada ? document.getElementById("cita").value.trim() : '';
  const folioNotaEntrada = isConsolidada ? '' : document.getElementById("folio-nota-entrada").value.trim();
  return {
    proveedor: document.getElementById("proveedor").value.trim(),
    tienda: document.getElementById("tienda").value.trim(),
    entrega: document.getElementById("entrega").value.trim(),
    cita,
    folioNotaEntrada,
    numeroBultos: document.getElementById("bultos").value.trim(),
    folioPedido: document.getElementById("folio-pedido").value.trim(),
    fechaEntrega: document.getElementById("fecha-entrega").value,
  };
}

/**
 * Recolecta los datos de las tarimas desde el DOM
 * @returns {Array} Array con los datos de todas las tarimas
 */
export function recolectarDatosTarimas() {
  const inputsTarimas = document.querySelectorAll(".input-codigo-tarima");
  const tarimas = [];
  
  inputsTarimas.forEach((input) => {
    if (input.value.trim()) {
      tarimas.push({
        numero: input.dataset.numeroTarima,
        codigoBarra: input.value.trim(),
      });
    }
  });
  
  return tarimas;
}

/**
 * Recolecta los datos de productos con sus códigos y asignaciones de tarima
 * @param {Array} conceptosCFDI - Array de conceptos del CFDI
 * @returns {Array} Array con los productos enriquecidos con códigos y tarimas
 */
export function recolectarDatosProductos(conceptosCFDI,isConsolidada) {
  const inputsCodigos = document.querySelectorAll(".input-codigo-producto");
  const productosConCodigo = [];

  inputsCodigos.forEach((input) => {
    const index = parseInt(input.dataset.index, 10);
    const productoOriginal = conceptosCFDI[index];

    if (productoOriginal && input.value.trim()) {
      const inputTarima = document.getElementById(`tarima-${index}`);
      
      productosConCodigo.push({
        ...productoOriginal,
        Codigo: input.value.trim(),
        NumeroTarima: isConsolidada ? (inputTarima.value || "1") : "",
      });
    }
  });

  return productosConCodigo;
}

/**
 * Cuenta el total de productos que tienen código asignado
 * @returns {number} Número de productos con código
 */
export function contarProductosConCodigo() {
  const inputsCodigos = document.querySelectorAll(".input-codigo-producto");
  let contador = 0;
  
  inputsCodigos.forEach((input) => {
    if (input.value.trim()) {
      contador++;
    }
  });
  
  return contador;
}

/**
 * Verifica si todos los campos requeridos están completos
 * @returns {Object} Objeto con el resultado de la verificación
 */
export function verificarFormularioCompleto() {
  const datosGlobales = recolectarDatosGlobales();

  const isConsolidada = document.getElementById("select-tipo-addenda").value === "Consolidada";

  const tarimas = isConsolidada ? recolectarDatosTarimas() : [];
  
  const productosConCodigo = contarProductosConCodigo();
  
  const problemas = [];
  
  // Verificar datos globales
  Object.entries(datosGlobales).forEach(([key, value]) => {
    if (!value || value.length === 0) {
      problemas.push(`Campo ${key} está vacío`);
    }
  });
  
  // Verificar tarimas solo si es consolidada
  if (isConsolidada && tarimas.length === 0) {
    problemas.push('No hay tarimas configuradas');
  }
  
  // Verificar productos
  if (productosConCodigo === 0) {
    problemas.push('No hay productos con código asignado');
  }
  
  return {
    completo: problemas.length === 0,
    problemas
  };
}