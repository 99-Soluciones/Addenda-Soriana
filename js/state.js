/**
 * Módulo para manejar el estado global de la aplicación
 * Este módulo centraliza el manejo de datos y proporciona funciones
 * para acceder y modificar el estado de manera controlada.
 */

// Estado global de la aplicación
let appState = {
  datosCFDI: {
    conceptos: [],
    comprobante: {},
    impuestos: {},
  },
  contadorTarimas: 0,
  isLoaded: false,
};

/**
 * Obtiene los datos del CFDI
 * @returns {Object} Los datos del CFDI
 */
export function getDatosCFDI() {
  return appState.datosCFDI;
}

/**
 * Actualiza los datos del CFDI
 * @param {Object} nuevosDatos - Los nuevos datos del CFDI
 */
export function setDatosCFDI(nuevosDatos) {
  appState.datosCFDI = { ...appState.datosCFDI, ...nuevosDatos };
  appState.isLoaded = true;
}

/**
 * Resetea los datos del CFDI
 */
export function resetDatosCFDI() {
  appState.datosCFDI = {
    conceptos: [],
    comprobante: {},
    impuestos: {},
  };
  appState.isLoaded = false;
}

/**
 * Obtiene el contador de tarimas
 * @returns {number} El contador actual de tarimas
 */
export function getContadorTarimas() {
  return appState.contadorTarimas;
}

/**
 * Incrementa el contador de tarimas
 * @returns {number} El nuevo valor del contador
 */
export function incrementarContadorTarimas() {
  appState.contadorTarimas++;
  return appState.contadorTarimas;
}

/**
 * Establece el contador de tarimas
 * @param {number} valor - El nuevo valor del contador
 */
export function setContadorTarimas(valor) {
  appState.contadorTarimas = valor;
}

/**
 * Verifica si hay datos cargados
 * @returns {boolean} True si hay datos cargados
 */
export function isDataLoaded() {
  return appState.isLoaded;
}

/**
 * Obtiene todo el estado de la aplicación (para debugging)
 * @returns {Object} El estado completo de la aplicación
 */
export function getAppState() {
  return { ...appState };
}