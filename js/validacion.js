/**
 * Módulo para validación de datos
 * Contiene todas las funciones de validación necesarias para la aplicación
 */

/**
 * Valida si un texto no está vacío
 * @param {string} texto - Texto a validar
 * @returns {boolean} True si es válido
 */
export function validarTextoNoVacio(texto) {
  return typeof texto === 'string' && texto.trim().length > 0;
}

/**
 * Valida si un número es válido y mayor a 0
 * @param {number|string} numero - Número a validar
 * @returns {boolean} True si es válido
 */
export function validarNumeroPositivo(numero) {
  const num = parseFloat(numero);
  return !isNaN(num) && num > 0;
}

/**
 * Valida si una fecha está en formato válido
 * @param {string} fecha - Fecha a validar
 * @returns {boolean} True si es válida
 */
export function validarFecha(fecha) {
  if (!fecha) return false;
  const fechaObj = new Date(fecha);
  return !isNaN(fechaObj.getTime());
}

/**
 * Valida los datos globales del formulario
 * @param {Object} datos - Objeto con los datos a validar
 * @returns {Object} Objeto con resultado de validación y errores
 */
export function validarDatosGlobales(datos, isConsolidada) {
  const errores = [];
  
  if (!validarTextoNoVacio(datos.proveedor)) {
    errores.push('El número de proveedor es requerido');
  }
  
  if (!validarTextoNoVacio(datos.tienda)) {
    errores.push('El número de tienda es requerido');
  }
  
  if (!validarTextoNoVacio(datos.entrega)) {
    errores.push('El lugar de entrega es requerido');
  }
  
  if (!validarTextoNoVacio(datos.cita) && isConsolidada) {
    errores.push('El número de cita es requerido');
  }
  
  if (!validarTextoNoVacio(datos.folioPedido)) {
    errores.push('El folio de pedido es requerido');
  }

  if (!validarTextoNoVacio(datos.folioNotaEntrada) && !isConsolidada) {
    errores.push('El folio de nota de entrada es requerido');
  }
  
  if (!validarFecha(datos.fechaEntrega)) {
    errores.push('La fecha de entrega es requerida y debe ser válida');
  }
  
  return {
    valido: errores.length === 0,
    errores
  };
}

/**
 * Valida los datos de productos
 * @param {Array} productos - Array de productos con códigos
 * @returns {Object} Objeto con resultado de validación y errores
 */
export function validarProductos(productos, isConsolidada) {
  const errores = [];
  
  if (!Array.isArray(productos) || productos.length === 0) {
    errores.push('No hay productos para validar');
    return { valido: false, errores };
  }
  
  productos.forEach((producto, index) => {
    if (!validarTextoNoVacio(producto.Codigo)) {
      errores.push(`El producto ${index + 1} necesita un código válido`);
    }
    
    if (!validarNumeroPositivo(producto.NumeroTarima) && isConsolidada) {
      errores.push(`El producto ${index + 1} necesita un número de tarima válido`);
    }
  });
  
  return {
    valido: errores.length === 0,
    errores
  };
}

/**
 * Valida los datos de tarimas
 * @param {Array} tarimas - Array de tarimas
 * @returns {Object} Objeto con resultado de validación y errores
 */
export function validarTarimas(tarimas) {
  const errores = [];
  
  if (!Array.isArray(tarimas) || tarimas.length === 0) {
    errores.push('Debe haber al menos una tarima');
    return { valido: false, errores };
  }
  
  tarimas.forEach((tarima, index) => {
    if (!validarTextoNoVacio(tarima.codigoBarra)) {
      errores.push(`La tarima ${index + 1} necesita un código de barras válido`);
    }
  });
  
  return {
    valido: errores.length === 0,
    errores
  };
}