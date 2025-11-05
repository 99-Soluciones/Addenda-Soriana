# Addenda-Soriana

Pequeña aplicación web de una sola página (`HTML`, `CSS` y `JavaScript`) que correrá 100% en tu navegador. No necesitas instalar un servidor ni nada complicado.

## Así es como funciona

1.  **Carga del XML**
    * Tendrás un botón para seleccionar y cargar tu archivo `XML` base.

2.  **Extracción de Datos**
    * El script de `JavaScript` leerá (parseará) el `XML`.
    * Extraerá automáticamente:
        * La lista de productos (`<cfdi:Concepto>`) con su Descripción, Cantidad y Valor Unitario.
        * Datos generales de la factura como Serie, Folio, Fecha, SubTotal, Total e IVA Total.

3.  **Formulario Dinámico**
    * La página mostrará:
        * Un formulario para los datos "globales" que mencionaste (Proveedor, Tienda, Cita, etc.).
        * Una lista con cada producto extraído del `XML`, mostrando sus datos y un campo de texto para que tú ingreses su "Código" (el código de barras/SKU) y a qué tarima corresponde.
        * Un apartado para agregar tarimas y sus datos correspondientes.

4.  **Generación de Addenda**
    * Al presionar un botón, el script tomará toda la información (la del `XML` y la que ingresaste en el formulario).
    * Construirá el bloque de texto `<cfdi:Addenda>` completo y formateado.

5.  **Resultado**
    * Verás un cuadro de texto con la addenda lista para que la copies y pegues al final de tu archivo `XML` original.

> **Nota:** La addenda generada debe pegarse justo antes del cierre `</cfdi:Comprobante>`.
