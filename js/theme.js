/**
 * Módulo para manejar el tema de la aplicación
 * Permite alternar entre tema claro y oscuro
 */

let temaActual = 'oscuro'; // Por defecto oscuro

/**
 * Inicializa el sistema de temas
 */
export function inicializarTemas() {
  // Verificar si hay preferencia guardada
  const temaGuardado = localStorage.getItem('tema-addenda') || 'oscuro';
  aplicarTema(temaGuardado);
  
  // Crear botón de alternancia
  crearBotonAlternarTema();
}

/**
 * Aplica un tema específico
 * @param {string} tema - 'claro' o 'oscuro'
 */
function aplicarTema(tema) {
  const body = document.body;
  
  if (tema === 'claro') {
    body.classList.add('tema-claro');
    body.classList.remove('tema-oscuro');
  } else {
    body.classList.add('tema-oscuro');
    body.classList.remove('tema-claro');
  }
  
  temaActual = tema;
  localStorage.setItem('tema-addenda', tema);
  actualizarIconoTema();
}

/**
 * Alterna entre tema claro y oscuro
 */
export function alternarTema() {
  const nuevoTema = temaActual === 'oscuro' ? 'claro' : 'oscuro';
  aplicarTema(nuevoTema);
}

/**
 * Crea el botón para alternar tema
 */
function crearBotonAlternarTema() {
  const boton = document.createElement('button');
  boton.id = 'btn-alternar-tema';
  boton.className = 'btn-tema';
  boton.innerHTML = '🌙';
  boton.title = 'Alternar tema claro/oscuro';
  boton.addEventListener('click', alternarTema);
  
  // Agregar al final del body
  document.body.appendChild(boton);
}

/**
 * Actualiza el icono del botón de tema
 */
function actualizarIconoTema() {
  const boton = document.getElementById('btn-alternar-tema');
  if (boton) {
    boton.innerHTML = temaActual === 'oscuro' ? '☀️' : '🌙';
    boton.title = `Cambiar a tema ${temaActual === 'oscuro' ? 'claro' : 'oscuro'}`;
  }
}

/**
 * Obtiene el tema actual
 * @returns {string} El tema actual ('claro' o 'oscuro')
 */
export function getTemaActual() {
  return temaActual;
}