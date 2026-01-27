/**
 * Módulo de utilidades
 * Contiene funciones auxiliares reutilizables
 */

/**
 * Escapa caracteres especiales para XML
 * @param {string} texto - Texto a escapar
 * @returns {string} Texto escapado
 */
export function escaparXML(texto) {
  if (!texto) return '';
  
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Formatea un número a un número específico de decimales
 * @param {number|string} numero - Número a formatear
 * @param {number} decimales - Número de decimales
 * @returns {string} Número formateado
 */
export function formatearNumero(numero, decimales = 2) {
  const num = parseFloat(numero);
  if (isNaN(num)) return '0.00';
  return num.toFixed(decimales);
}

/**
 * Formatea una fecha para mostrarla en formato local
 * @param {string} fechaISO - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
export function formatearFecha(fechaISO) {
  if (!fechaISO) return '';
  
  try {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES');
  } catch (error) {
    console.warn('Error al formatear fecha:', error);
    return fechaISO;
  }
}

/**
 * Debounce function para limitar la frecuencia de ejecución
 * @param {Function} func - Función a ejecutar
 * @param {number} delay - Delay en milisegundos
 * @returns {Function} Función con debounce aplicado
 */
export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Genera un ID único
 * @returns {string} ID único
 */
export function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Muestra un mensaje de error en la consola y opcionalmente al usuario
 * @param {string} mensaje - Mensaje de error
 * @param {Error} error - Objeto de error opcional
 * @param {boolean} mostrarAlUsuario - Si mostrar alert al usuario
 */
export function manejarError(mensaje, error = null, mostrarAlUsuario = false) {
  console.error(mensaje, error);
  
  if (mostrarAlUsuario) {
    const mensajeCompleto = error ? `${mensaje}\n\nDetalles: ${error.message}` : mensaje;
    alert(mensajeCompleto);
  }
}

/**
 * Descarga un archivo con el contenido especificado
 * @param {string} contenido - Contenido del archivo
 * @param {string} nombreArchivo - Nombre del archivo
 * @param {string} tipoMIME - Tipo MIME del archivo
 */
export function descargarArchivo(contenido, nombreArchivo, tipoMIME = 'text/xml') {
  try {
    const blob = new Blob([contenido], { type: tipoMIME });
    const url = URL.createObjectURL(blob);
    
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    enlace.style.display = 'none';
    
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    manejarError('Error al descargar archivo', error, true);
  }
}