const axios = require('axios');

/**
 * Envia uma mensagem para um lead no Kommo via WhatsApp
 * @param {number} chatId - ID do chat no Kommo
 * @param {string} message - Mensagem a ser enviada
 * @returns {Promise<object>} - Resposta da API do Kommo
 */
async function sendMessage(chatId, message) {
    try {
        const subdomain = process.env.KOMMO_SUBDOMAIN;
        const accessToken = process.env.KOMMO_ACCESS_TOKEN;

        if (!accessToken) {
            throw new Error('KOMMO_ACCESS_TOKEN não configurado');
        }

        console.log(`📤 [Kommo] Enviando mensagem para chat ${chatId}`);

        const url = `https://${subdomain}.kommo.com/api/v4/talks/messages`;

        const payload = {
            talk_id: chatId,
            message: {
                type: 'text',
                text: message
            }
        };

        const response = await axios.post(url, payload, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`✅ [Kommo] Mensagem enviada com sucesso para chat ${chatId}`);
        return response.data;

    } catch (error) {
        console.error('❌ [Kommo] Erro ao enviar mensagem:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        throw error;
    }
}

/**
 * Adiciona uma nota ao lead no Kommo
 * @param {number} leadId - ID do lead
 * @param {string} noteText - Texto da nota
 * @returns {Promise<object>} - Resposta da API do Kommo
 */
async function addNoteToLead(leadId, noteText) {
    try {
        const subdomain = process.env.KOMMO_SUBDOMAIN;
        const accessToken = process.env.KOMMO_ACCESS_TOKEN;

        console.log(`📝 [Kommo] Adicionando nota ao lead ${leadId}`);

        const url = `https://${subdomain}.kommo.com/api/v4/leads/${leadId}/notes`;

        const payload = {
            note_type: 'common',
            params: {
                text: noteText
            }
        };

        const response = await axios.post(url, payload, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`✅ [Kommo] Nota adicionada ao lead ${leadId}`);
        return response.data;

    } catch (error) {
        console.error('❌ [Kommo] Erro ao adicionar nota:', error.message);
        throw error;
    }
}

/**
 * Valida se o token de acesso está funcionando
 * @returns {Promise<boolean>} - True se o token é válido
 */
async function validateToken() {
    try {
        const subdomain = process.env.KOMMO_SUBDOMAIN;
        const accessToken = process.env.KOMMO_ACCESS_TOKEN;

        const url = `https://${subdomain}.kommo.com/api/v4/account`;

        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        console.log(`✅ [Kommo] Token válido - Conta: ${response.data.name}`);
        return true;

    } catch (error) {
        console.error('❌ [Kommo] Token inválido ou expirado:', error.response?.status);
        return false;
    }
}

module.exports = {
    sendMessage,
    addNoteToLead,
    validateToken
};
