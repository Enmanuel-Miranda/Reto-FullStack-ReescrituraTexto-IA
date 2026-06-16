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
 * 2. FUNCIÓN PARA LIMPIAR LOS CUADROS DE TEXTO
 * ==========================================================================
 */
function clearFields() {
    document.getElementById('inputText').value = "";
    document.getElementById('outputText').value = "";
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