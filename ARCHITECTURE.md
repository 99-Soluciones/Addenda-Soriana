# Generador de Addenda Soriana - Arquitectura Mejorada

## Estructura de Archivos

```
/
├── index.html         # Interfaz principal
├── app.js             # Punto de entrada y coordinación
├── style.css          # Estilos mejorados con validación visual
├── README.md          # Esta documentación
└── js/
    ├── state.js       #  Manejo centralizado del estado
    ├── validacion.js  #  Validaciones de datos
    ├── formData.js    #  Recolección de datos del formulario
    ├── utils.js       #  Utilidades reutilizables
    ├── getXMLData.js  #  Procesamiento de XML
    ├── tarimas.js     #  Manejo de tarimas
    └── generarAddenda.js #  Generación de addenda
```

## Arquitectura Modular

### 1. **state.js** - Gestor de Estado Global
- **Propósito**: Centralizar el manejo del estado de la aplicación
- **Funciones principales**:
  - `getDatosCFDI()` - Obtener datos del CFDI
  - `setDatosCFDI(datos)` - Actualizar datos del CFDI
  - `getContadorTarimas()` - Obtener contador de tarimas
  - `incrementarContadorTarimas()` - Incrementar contador
  - `isDataLoaded()` - Verificar si hay datos cargados

### 2. **validacion.js** - Sistema de Validación
- **Propósito**: Validar todos los datos antes de generar la addenda
- **Funciones principales**:
  - `validarDatosGlobales(datos)` - Validar formulario principal
  - `validarProductos(productos)` - Validar productos con códigos
  - `validarTarimas(tarimas)` - Validar tarimas
  - `validarTextoNoVacio(texto)` - Validación básica de texto

### 3. **formData.js** - Recolector de Datos
- **Propósito**: Extraer datos del DOM de manera organizada
- **Funciones principales**:
  - `recolectarDatosGlobales()` - Datos del formulario principal
  - `recolectarDatosTarimas()` - Datos de todas las tarimas
  - `recolectarDatosProductos(conceptos)` - Productos con códigos
  - `verificarFormularioCompleto()` - Verificar completitud

### 4. **utils.js** - Utilidades
- **Propósito**: Funciones auxiliares reutilizables
- **Funciones principales**:
  - `escaparXML(texto)` - Escapar caracteres especiales
  - `formatearNumero(numero, decimales)` - Formatear números
  - `descargarArchivo(contenido, nombre)` - Descargar archivos
  - `manejarError(mensaje, error)` - Manejo de errores

## Flujo de la Aplicación

1. **Carga de XML** (`getXMLData.js`)
   - Usuario selecciona archivo XML
   - Se parsea y valida el XML
   - Se actualiza el estado global con `setDatosCFDI()`
   - Se muestran los formularios

2. **Gestión de Tarimas** (`tarimas.js`)
   - Usuario puede agregar/eliminar tarimas
   - Se actualiza el contador en el estado global
   - Se renumeran automáticamente

3. **Generación de Addenda** (`generarAddenda.js`)
   - Se recolectan todos los datos del formulario
   - Se validan todos los datos
   - Se construye el XML de la addenda
   - Se muestra el resultado

## Mejoras Implementadas

### **Manejo de Estado Robusto**
- Estado centralizado en lugar de variables globales
- Funciones específicas para acceder y modificar el estado
- Verificación de datos cargados antes de operar

### **Sistema de Validación Completo**
- Validación en tiempo real de campos
- Feedback visual para el usuario
- Mensajes de error descriptivos
- Validación antes de generar addenda

### **Manejo de Errores**
- Try-catch en operaciones críticas
- Mensajes de error informativos
- Logging para debugging
- Recuperación graceful de errores

### **Responsive Design**
- Adaptación a dispositivos móviles
- Grid system flexible
- Interfaz usable en pantallas pequeñas

