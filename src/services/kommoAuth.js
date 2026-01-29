const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * Renova o token de acesso do Kommo usando refresh token ou client credentials
 * @returns {Promise<string>} - Novo access token
 */
async function refreshAccessToken() {
    try {
        const subdomain = process.env.KOMMO_SUBDOMAIN;
        const clientId = process.env.KOMMO_CLIENT_ID;
        const clientSecret = process.env.KOMMO_CLIENT_SECRET;
        const redirectUri = process.env.KOMMO_REDIRECT_URI || 'https://example.com';

        console.log('🔄 [Kommo Auth] Tentando renovar token de acesso...');

        // Tentar obter refresh token do arquivo de cache (se existir)
        const refreshToken = loadRefreshToken();

        let response;

        if (refreshToken) {
            console.log('🔑 [Kommo Auth] Usando refresh token existente...');
            
            // Renovar usando refresh token
            response = await axios.post(
                `https://${subdomain}.kommo.com/oauth2/access_token`,
                {
                    client_id: clientId,
                    client_secret: clientSecret,
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken,
                    redirect_uri: redirectUri
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        } else {
            console.log('⚠️ [Kommo Auth] Refresh token não encontrado');
            console.log('⚠️ [Kommo Auth] É necessário fazer autenticação OAuth manual primeiro');
            
            throw new Error('Refresh token não disponível. Autenticação OAuth manual necessária.');
        }

        const { access_token, refresh_token, expires_in } = response.data;

        console.log('✅ [Kommo Auth] Token renovado com sucesso');
        console.log(`⏰ [Kommo Auth] Expira em: ${expires_in} segundos (${expires_in / 3600} horas)`);

        // Salvar novos tokens
        saveTokens(access_token, refresh_token);

        // Atualizar variável de ambiente em memória
        process.env.KOMMO_ACCESS_TOKEN = access_token;

        return access_token;

    } catch (error) {
        console.error('❌ [Kommo Auth] Erro ao renovar token:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        throw error;
    }
}

/**
 * Gera a URL de autorização OAuth para obter o código inicial
 * @returns {string} - URL de autorização
 */
function getAuthorizationUrl() {
    const subdomain = process.env.KOMMO_SUBDOMAIN;
    const clientId = process.env.KOMMO_CLIENT_ID;
    const redirectUri = process.env.KOMMO_REDIRECT_URI || 'https://example.com';

    const authUrl = `https://${subdomain}.kommo.com/oauth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `state=random_state_string`;

    return authUrl;
}

/**
 * Troca o código de autorização por tokens de acesso
 * @param {string} authCode - Código de autorização recebido do OAuth
 * @returns {Promise<object>} - Tokens de acesso e refresh
 */
async function exchangeCodeForTokens(authCode) {
    try {
        const subdomain = process.env.KOMMO_SUBDOMAIN;
        const clientId = process.env.KOMMO_CLIENT_ID;
        const clientSecret = process.env.KOMMO_CLIENT_SECRET;
        const redirectUri = process.env.KOMMO_REDIRECT_URI || 'https://example.com';

        console.log('🔄 [Kommo Auth] Trocando código de autorização por tokens...');

        const response = await axios.post(
            `https://${subdomain}.kommo.com/oauth2/access_token`,
            {
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'authorization_code',
                code: authCode,
                redirect_uri: redirectUri
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        const { access_token, refresh_token, expires_in } = response.data;

        console.log('✅ [Kommo Auth] Tokens obtidos com sucesso');

        // Salvar tokens
        saveTokens(access_token, refresh_token);

        // Atualizar variável de ambiente
        process.env.KOMMO_ACCESS_TOKEN = access_token;

        return {
            access_token,
            refresh_token,
            expires_in
        };

    } catch (error) {
        console.error('❌ [Kommo Auth] Erro ao trocar código por tokens:', error.response?.data);
        throw error;
    }
}

/**
 * Salva tokens em arquivo para persistência
 */
function saveTokens(accessToken, refreshToken) {
    try {
        const tokensPath = path.join(__dirname, '../../.tokens.json');
        
        const tokens = {
            access_token: accessToken,
            refresh_token: refreshToken,
            updated_at: new Date().toISOString()
        };

        fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));
        console.log('💾 [Kommo Auth] Tokens salvos em:', tokensPath);

    } catch (error) {
        console.error('❌ [Kommo Auth] Erro ao salvar tokens:', error.message);
    }
}

/**
 * Carrega refresh token do arquivo de cache
 * @returns {string|null} - Refresh token ou null
 */
function loadRefreshToken() {
    try {
        const tokensPath = path.join(__dirname, '../../.tokens.json');
        
        if (!fs.existsSync(tokensPath)) {
            return null;
        }

        const tokensData = fs.readFileSync(tokensPath, 'utf8');
        const tokens = JSON.parse(tokensData);

        return tokens.refresh_token || null;

    } catch (error) {
        console.error('❌ [Kommo Auth] Erro ao carregar refresh token:', error.message);
        return null;
    }
}

/**
 * Verifica se o token atual está válido e renova se necessário
 * @returns {Promise<boolean>} - True se o token está válido
 */
async function ensureValidToken() {
    try {
        const { validateToken } = require('./kommoService');
        
        const isValid = await validateToken();

        if (!isValid) {
            console.log('⚠️ [Kommo Auth] Token inválido, tentando renovar...');
            await refreshAccessToken();
            return true;
        }

        console.log('✅ [Kommo Auth] Token válido');
        return true;

    } catch (error) {
        console.error('❌ [Kommo Auth] Erro ao validar/renovar token:', error.message);
        return false;
    }
}

module.exports = {
    refreshAccessToken,
    getAuthorizationUrl,
    exchangeCodeForTokens,
    ensureValidToken,
    saveTokens,
    loadRefreshToken
};
