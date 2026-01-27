import { cargarArchivoXML } from "./js/getXMLData.js";
import { agregarNuevaTarima } from "./js/tarimas.js";
import { generarAddenda } from "./js/generarAddenda.js";
import { inicializarTemas } from "./js/theme.js";

/**
 * Archivo principal de la aplicación
 * Maneja la inicialización y los event listeners principales
 */

// --- EVENT LISTENERS ---
document.addEventListener("DOMContentLoaded", () => {
  console.log("Aplicación iniciada - Generador de Addenda Soriana (Modo Oscuro)");
  
  // Inicializar sistema de temas
  inicializarTemas();
  
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

  // Event listener para mostrar feedback al usuario
  setupFeedbackListeners();
  
  console.log("Todos los event listeners configurados correctamente");
});

/**
 * Configura listeners adicionales para mejorar la experiencia del usuario
 */
function setupFeedbackListeners() {
  // Feedback visual cuando se completan campos importantes
  const camposImportantes = [
    'proveedor', 'tienda', 'entrega', 'cita', 'folio-pedido', 'fecha-entrega'
  ];
  
  camposImportantes.forEach(campo => {
    const elemento = document.getElementById(campo);
    if (elemento) {
      elemento.addEventListener('blur', validarCampoEnTiempoReal);
      elemento.addEventListener('input', limpiarErrores);
    }
  });
}

/**
 * Valida un campo en tiempo real y muestra feedback visual
 * @param {Event} evento - Evento del campo
 */
function validarCampoEnTiempoReal(evento) {
  const campo = evento.target;
  const valor = campo.value.trim();
  
  // Remover clases de estado anterior
  campo.classList.remove('campo-valido', 'campo-error');
  
  if (valor.length > 0) {
    campo.classList.add('campo-valido');
  } else {
    campo.classList.add('campo-error');
  }
}

/**
 * Limpia los errores visuales cuando el usuario empieza a escribir
 * @param {Event} evento - Evento del campo
 */
function limpiarErrores(evento) {
  const campo = evento.target;
  campo.classList.remove('campo-error');
}
