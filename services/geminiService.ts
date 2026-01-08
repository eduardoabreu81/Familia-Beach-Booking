import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getTravelAdvice = async (query: string, locationContext: string): Promise<string> => {
  if (!apiKey) {
    return "Configuração de API Key ausente. Por favor, configure a chave da API do Google Gemini.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Você é um assistente de viagens amigável e útil para uma família que possui apartamentos na praia.
        O usuário está perguntando sobre: "${query}".
        Contexto dos apartamentos: ${locationContext}.
        
        Responda de forma concisa, amigável e útil. Sugira atividades, lista de compras ou dicas baseadas na pergunta.
        Use emojis para tornar a resposta divertida.
      `,
      config: {
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    return response.text || "Desculpe, não consegui pensar em nada agora.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ocorreu um erro ao consultar o assistente inteligente.";
  }
};