Markdown
# Humanizador de Texto Académico

Este proyecto ha sido desarrollado como solución para el Caso Práctico de entornos web, diseñado específicamente bajo los estándares de redacción científica de las universidades peruanas. La aplicación optimiza textos de investigación (tesis, artículos, monografías) modificando sus patrones de Perplejidad y Ráfaga (Burstiness) para evadir los algoritmos de detección de Inteligencia Artificial (como Turnitin), manteniendo estrictamente el rigor metodológico y las Normas APA.

---

## 🛠️ Tecnologías Utilizadas

Al ser un desarrollo enfocado en la ligereza y rapidez de ejecución, se utilizó una arquitectura pura de cliente sin dependencias pesadas:

*   **HTML5:** Estructura semántica de la interfaz, paneles en paralelo y modales de configuración.
*   **CSS3:** Diseño responsivo, variables de entorno visuales y animaciones fluidas para los estados de carga.
*   **JavaScript (ES6+):** Lógica de control del DOM, peticiones asíncronas (`Fetch API`), procesamiento de respuestas y el algoritmo local de medición estadística de Turnitin.
*   **Google Gemini API (Modelo 2.5 Flash):** Motor de inteligencia artificial de última generación para el procesamiento y reestructuración lingüística del texto académico.

---

## 📂 Estructura del Proyecto

```text
humanizador-tesis/
│
├── config.js           # Variables de configuración local (API Key)
├── index.html          # Estructura e interfaz gráfica de la aplicación
├── README.md           # Documentación técnica del proyecto (Este archivo)
│
├── css/
│   └── styles.css      # Estilos visuales y animaciones
│
└── js/
    └── app.js          # Conexión a la IA

```
---
## 💻 Instalación y Uso Local
La aplicación funciona de forma directa en cualquier computadora sin necesidad de instalar programas adicionales o consolas de comandos complejas.

* **Paso 1:** Conseguir tu API Key Gratis
Entra a Google AI Studio con tu cuenta de Gmail.

Haz clic en el botón azul "Get API Key" (Obtener clave de API).

Selecciona "Create API Key in new project", copia el código generado y guárdalo un momento.

* **Paso 2:** Clonar el Proyecto
Abre tu consola o Git Bash y copia el siguiente comando para descargar los archivos en tu computadora:

```
git clone [https://github.com/Enmanuel-Miranda/Reto-FullStack-ReescrituraTexto-IA.git]
```
* **Paso 3:** Configurar tu Clave
Abre el archivo config.js que está en la raíz del proyecto con cualquier editor de texto o código.

Pega tu clave de Google entre las comillas:
```
JavaScript
   const CONFIG = {
       GEMINI_API_KEY: "TU_CLAVE_AQUÍ"
   };
```
Guarda y cierra el archivo.

* **Paso 4:** Abrir la Aplicación
Busca el archivo index.html en la carpeta del proyecto y dale doble clic. Se abrirá automáticamente en tu navegador web listo para usar.


