const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Processa uma mensagem do cliente e retorna a resposta da IA
 * @param {string} userMessage - Mensagem enviada pelo cliente
 * @param {string} leadId - ID do lead no Kommo
 * @returns {Promise<string>} - Resposta gerada pela IA
 */
async function getAIResponse(userMessage, leadId) {
    try {
        console.log(`🤖 [OpenAI] Processando mensagem do Lead ${leadId}: "${userMessage}"`);

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `Você é Léxia, assistente virtual especializada da Léxia Veículos.

CONTEXTO DA EMPRESA:
- Empresa de locação de veículos e serviços de crédito com garantia de Pix
- Atuação em todo o Brasil
- Foco em atendimento personalizado e soluções rápidas

SUA MISSÃO:
- Atender clientes via WhatsApp de forma cordial e profissional
- Identificar a necessidade do cliente: locação de veículos ou crédito com Pix
- Coletar informações essenciais para qualificar o lead
- Agendar visitas ou encaminhar para especialistas quando necessário

DIRETRIZES DE ATENDIMENTO:
1. Seja sempre cordial, empática e objetiva
2. Use linguagem natural e acessível
3. Faça perguntas claras e diretas
4. Confirme informações importantes
5. Nunca invente informações sobre preços ou disponibilidade
6. Encaminhe para humano quando necessário

INFORMAÇÕES A COLETAR:
Para Locação:
- Tipo de veículo desejado
- Período de locação
- Cidade/região
- Data desejada

Para Crédito:
- Valor necessário
- Prazo desejado
- Possui Pix para garantia
- Finalidade do crédito

RESPOSTAS PROIBIDAS:
- Não forneça valores específicos sem consultar base de dados
- Não prometa aprovação de crédito
- Não faça diagnósticos financeiros
- Não compartilhe dados de outros clientes`
                },
                {
                    role: "user",
                    content: userMessage
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        const aiResponse = completion.choices[0].message.content;
        console.log(`✅ [OpenAI] Resposta gerada: "${aiResponse.substring(0, 100)}..."`);

        return aiResponse;

    } catch (error) {
        console.error('❌ [OpenAI] Erro ao processar mensagem:', error.message);
        
        // Resposta de fallback em caso de erro
        return "Desculpe, estou com dificuldades técnicas no momento. Um de nossos atendentes entrará em contato em breve. Obrigado pela compreensão! 🙏";
    }
}

module.exports = {
    getAIResponse
};
