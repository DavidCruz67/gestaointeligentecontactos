// ==========================================
// INTELIGÊNCIA ARTIFICIAL (GEMINI API)
// ==========================================

async function extractDataFromImage(base64Image) {
    if (GEMINI_API_KEY.includes('COLE_AQUI')) {
        alert("Atenção: Configure primeiro a sua chave GEMINI_API_KEY no ficheiro 1_config.js");
        return null;
    }

    const cleanBase64 = base64Image.split(',')[1];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const requestBody = {
        contents: [{
            parts: [
                { text: "Extrai as seguintes informações deste cartão num JSON exato: name, company, phone, email. Responde APENAS com o JSON sem markdown." },
                { inline_data: { mime_type: "image/jpeg", data: cleanBase64 } }
            ]
        }],
        generationConfig: { temperature: 0 }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) throw new Error("Erro de comunicação com a IA");

    const result = await response.json();
    const textResponse = result.candidates[0].content.parts[0].text;
    
    // Limpeza de blocos de markdown no JSON
    const jsonString = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);
}
