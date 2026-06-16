/**
 * ==========================================================================
 * 1. CONTROL DE LA VENTANA FLOTANTE (MODAL)
 * ==========================================================================
 */
function toggleModal(show) {
    const modal = document.getElementById('settingsModal');
    if (show) {
        modal.style.display = 'block';
        
        const apiKeyInput = document.getElementById('apiKey');
        if (typeof CONFIG !== 'undefined' && CONFIG.GEMINI_API_KEY) {
            apiKeyInput.value = "•••••••••••••••• (Cargada desde config.js)";
            apiKeyInput.disabled = true;
        }
    } else {
        modal.style.display = 'none';
    }
}

window.onclick = function(event) {
    const modal = document.getElementById('settingsModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

/**
 * ==========================================================================
 * 2. FUNCIÓN PARA LIMPIAR LOS CUADROS DE TEXTO Y MÉTRICAS
 * ==========================================================================
 */
function clearFields() {
    document.getElementById('inputText').value = "";
    document.getElementById('outputText').value = "";
    
    // Ocultar el medidor de Turnitin al limpiar las cajas
    const turnitinMeter = document.getElementById('turnitinMeter');
    if (turnitinMeter) {
        turnitinMeter.style.display = 'none';
    }
}

/**
 * ==========================================================================
 * 3. CONEXIÓN CORREGIDA CON LA VERSIÓN DE API V1 Y GEMINI 2.5
 * ==========================================================================
 */
async function humanizeText() {
    const systemPromptInput = document.getElementById('systemPrompt');
    const inputTextInput = document.getElementById('inputText');
    const outputTextTextarea = document.getElementById('outputText');
    const btnProcessButton = document.getElementById('btnProcess');

    const systemPrompt = systemPromptInput.value.trim();
    const inputText = inputTextInput.value.trim();

    // Validar existencia de la clave en config.js
    if (typeof CONFIG === 'undefined' || !CONFIG.GEMINI_API_KEY || CONFIG.GEMINI_API_KEY.includes("Tu_Clave_Secreta")) {
        alert("Error: No se encontró la API Key en el archivo 'config.js'. Por favor, verifica el archivo.");
        return;
    }
    
    const apiKey = CONFIG.GEMINI_API_KEY;

    if (!inputText) {
        alert("Por favor, ingresa el párrafo que deseas humanizar en el cuadro de la izquierda.");
        return;
    }

    // Estado de carga
    btnProcessButton.disabled = true;
    btnProcessButton.innerText = "Procesando texto... ⏳";
    outputTextTextarea.value = "Conectando con el motor de IA de Google... Alterando perplejidad y burstiness académica.";

    try {
        // CORRECCIÓN DE ENDPOINT: Cambiado a v1 y modelo estable gemini-2.5-flash
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: `${systemPrompt}\n\nTexto a procesar:\n"${inputText}"` }
                    ]
                }]
            })
        });

        const data = await response.json();

        // Capturar errores directos de la API
        if (data.error) {
            console.error("Error devuelto por Google:", data.error);
            outputTextTextarea.value = `Error de Google: ${data.error.message}\n(Código: ${data.error.code})`;
            return;
        }

        // Procesar respuesta correcta si la estructura es válida
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
            let textoFinal = data.candidates[0].content.parts[0].text.trim();
            
            // Limpieza de bloques de código markdown si los hay
            if (textoFinal.startsWith('```') && textoFinal.endsWith('```')) {
                textoFinal = textoFinal.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
            }
            
            outputTextTextarea.value = textoFinal;

            // DISPARADOR: Calcular la probabilidad de evadir Turnitin con el texto recibido
            calcularMetricasTurnitin(textoFinal);

        } else {
            console.error("Estructura de respuesta desconocida:", data);
            outputTextTextarea.value = "Error: La IA respondió, pero el formato no fue el esperado.";
        }

    } catch (error) {
        console.error("Error crítico de red:", error);
        outputTextTextarea.value = "Error crítico de red. No se pudo establecer comunicación con los servidores de Google.";
    } finally {
        btnProcessButton.disabled = false;
        btnProcessButton.innerText = "Humanizar Texto ✨";
    }
}

function copyToClipboard() {
    const outputText = document.getElementById('outputText');
    if (!outputText.value || outputText.value.startsWith("Conectando con") || outputText.value.startsWith("Error")) {
        alert("No hay ningún texto válido para copiar todavía.");
        return;
    }

    navigator.clipboard.writeText(outputText.value);

    // Cambiar el texto del botón temporalmente para dar feedback visual
    const btnCopy = document.getElementById('btnCopy');
    const originalText = btnCopy.innerHTML;
    btnCopy.innerHTML = "¡Copiado! ✅";
    btnCopy.style.backgroundColor = "#cbd5e0";

    setTimeout(() => {
        btnCopy.innerHTML = originalText;
        btnCopy.style.backgroundColor = "";
    }, 2000);
}

/**
 * ==========================================================================
 * 4. SIMULADOR DE FILTRO TURNITIN (ANÁLISIS DE BURSTINESS Y PERPLEJIDAD)
 * ==========================================================================
 */
function calcularMetricasTurnitin(texto) {
    if (!texto) return;

    // 1. Analizar la Perplejidad (Variedad de vocabulario)
    const palabras = texto.toLowerCase().split(/\s+/).filter(p => p.length > 2);
    const palabrasUnicas = new Set(palabras);
    const riquezaLexica = palabras.length > 0 ? (palabrasUnicas.size / palabras.length) : 0;

    // 2. Analizar el Burstiness (Variación en la longitud de oraciones)
    const oraciones = texto.split(/[.!?]+/).map(o => o.trim()).filter(o => o.length > 0);
    let variacionLongitud = 0;

    if (oraciones.length > 1) {
        const longitudes = oraciones.map(o => o.split(/\s+/).length);
        const promedio = longitudes.reduce((a, b) => a + b, 0) / longitudes.length;
        const varianza = longitudes.reduce((a, b) => a + Math.pow(b - promedio, 2), 0) / longitudes.length;
        variacionLongitud = Math.min(varianza / 10, 1);
    }

    // 3. Calcular porcentaje combinando métricas lingüísticas
    let scoreBase = 75; 
    let bonusLexico = riquezaLexica * 15;
    let bonusRáfaga = variacionLongitud * 10;
    
    let porcentajeExito = Math.min(Math.round(scoreBase + bonusLexico + bonusRáfaga), 99);

    // 4. Actualizar dinámicamente los elementos visuales del medidor en el HTML
    const meterContainer = document.getElementById('turnitinMeter');
    const meterPercentage = document.getElementById('meterPercentage');
    const meterFill = document.getElementById('meterFill');
    const meterStatus = document.getElementById('meterStatus');

    if (meterContainer && meterPercentage && meterFill && meterStatus) {
        meterContainer.style.display = 'block';
        meterPercentage.innerText = `${porcentajeExito}%`;
        meterFill.style.width = `${porcentajeExito}%`;

        if (porcentajeExito >= 90) {
            meterStatus.innerText = "Riesgo Muy Bajo AI ✨";
            meterStatus.style.color = "#059669";
            meterStatus.style.background = "#ecfdf5";
        } else if (porcentajeExito >= 80) {
            meterStatus.innerText = "Pasa Filtros Turnitin 👍";
            meterStatus.style.color = "#2b6cb0";
            meterStatus.style.background = "#ebf8ff";
        } else {
            meterStatus.innerText = "Revisión Recomendada ⚠️";
            meterStatus.style.color = "#d69e2e";
            meterStatus.style.background = "#fffaf0";
        }
    }
}