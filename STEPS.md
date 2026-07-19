# Pasos de Implementación y Verificación — Documentación de physure

Este archivo detalla todos los pasos completados durante la transformación de la landing page en una suite de documentación técnica interactiva y verificada para la librería **physure**.

---

## 📋 Resumen de Pasos Realizados

### 1. Verificación Técnica de la Librería
Inspeccionamos el código fuente real de `physure` para asegurar que la documentación refleje la realidad del sistema:
* **Compilador JIT:** Verificamos que `@jit` funciona con un analizador simbólico (`TracerQuantity`) y `RationalUnit` para validar dimensiones en tiempo de compilación. Genera un kernel optimizado mediante `exec` de Python.
* **Correlación de Incertidumbre:** Confirmamos que el modo de correlación por defecto (`"correlated"`) realiza un seguimiento de linaje con UUIDs para escalares y utiliza un almacén global (`CovarianceStore`) para realizar propagaciones afines de matrices (`J * Sigma * J.T`) en vectores.
* **JAX Functional API:** Comprobamos la estructura de `FunctionalState` como un *JAX Pytree* para realizar seguimiento de covarianza de forma pura (`add(a, b, state)`, `sub(a, b, state)`).
* **Matemática Simbólica:** Verificamos el uso de `SymbolicQuantity` y `SymbolicExpression` integrados con SymPy para realizar derivadas, integrales y resolución de ecuaciones físicas.
* **Integración con Pandas:** Confirmamos la existencia del dtype `physure[unit]` (como `physure[m/s]`) y de la extensión de Series `physureArray` para validación estricta de columnas.
* **IO & Serialización:** Analizamos las funciones `to_hdf5` y `from_hdf5` (CF conventions) y el accessor para xarray.

### 2. Corrección de Errores Críticos de la Documentación Previa
Corregimos varios errores e inconsistencias con respecto a la implementación real:
* **Eliminación de `.ito()`:** El método de conversión *in-place* no existe en la librería. Se instruyó a usar `q = q.to(...)`.
* **Eliminación de `.value`:** La propiedad de acceso al valor numérico no existe. Se reemplazó por `.magnitude` (o el alias `.m`).
* **Cambio de DimensionError a IncompatibleUnitsError:** Se aclaró que la suma de dimensiones incompatibles lanza `IncompatibleUnitsError` (que es el comportamiento real en `_arithmetic_mixin.py`).
* **Corrección de las Constantes Exportadas:** Confirmamos que `physure.constants` exporta únicamente `c`, `h`, `G` y `k`. Se eliminaron las referencias a `k_B` y `N_A` inexistentes.
* **Cambio en el Modo por Defecto:** Se actualizó la descripción para reflejar que la propagación por defecto es `"correlated"`.

### 3. Creación y Actualización de Páginas de Documentación
Diseñamos e implementamos 8 páginas completas usando el framework Astro:
* **`index.astro` (Overview):** Introducción de la librería con tabla de rendimiento y características clave.
* **`install.astro` (Instalación):** Instrucciones detalladas de instalación para pip/uv, extras (`[native]`, `[all]`) y compilación local desde código fuente.
* **`quickstart.astro` (Guía Rápida):** Tutorial paso a paso que cubre creación de cantidades, conversión de unidades, propagación básica, REPL y tensores.
* **`guide.astro` (Guía del Usuario):** Documento técnico exhaustivo que explica los 12 aspectos arquitectónicos de la librería.
* **`api.astro` (Referencia API):** Firma y descripción detallada de constructores, propiedades de `Quantity`, métodos, funciones de módulo y excepciones.
* **`examples.astro` (Ejemplos):** 8 ejemplos prácticos organizados por dominio (mecánica, ingeniería, JIT, Pandas, etc.).
* **`cli.astro` (CLI & REPL):** Modos de uso del REPL interactivo y la sintaxis de la gramática MeasureNote.
* **`changelog.astro` (Historial):** Timeline interactivo de versiones de la v0.1.0 a la v0.1.8.

### 4. Corrección de Sintaxis de Astro (Llaveros `{}`)
* Las llaves `{` y `}` dentro de bloques `<pre><code>` (ej. en f-strings de Python, diccionarios de variables, y atributos de xarray) provocaban fallos de compilación en el compilador de Astro, ya que este intentaba interpretarlas como JSX dinámico.
* Implementamos un script automatizado en Python que recorre todos los archivos `.astro` y escapa las llaves internas a entidades HTML `&#123;` y `&#125;`.

### 5. Compilación y Validación Final
* Ejecutamos `pnpm build` para asegurar un empaquetado libre de advertencias y errores.
* Todas las 8 rutas estáticas fueron generadas correctamente en el directorio `/dist`.
