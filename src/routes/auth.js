const express = require('express');
const router = express.Router();
const { 
    getAuthorizationUrl, 
    exchangeCodeForTokens,
    refreshAccessToken 
} = require('../services/kommoAuth');

/**
 * Página inicial de autenticação
 * GET /auth
 */
router.get('/', (req, res) => {
    const authUrl = getAuthorizationUrl();
    
    res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Léxia Bot - Autenticação Kommo</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    max-width: 800px;
                    margin: 50px auto;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }
                .container {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    padding: 40px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                }
                h1 {
                    text-align: center;
                    margin-bottom: 10px;
                }
                .subtitle {
                    text-align: center;
                    opacity: 0.9;
                    margin-bottom: 30px;
                }
                .btn {
                    display: block;
                    width: 100%;
                    padding: 15px;
                    background: white;
                    color: #667eea;
                    text-align: center;
                    text-decoration: none;
                    border-radius: 10px;
                    font-weight: bold;
                    font-size: 18px;
                    margin: 20px 0;
                    transition: transform 0.2s;
                }
                .btn:hover {
                    transform: scale(1.05);
                }
                .info {
                    background: rgba(255, 255, 255, 0.2);
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                }
                .step {
                    margin: 15px 0;
                    padding-left: 30px;
                    position: relative;
                }
                .step:before {
                    content: "✓";
                    position: absolute;
                    left: 0;
                    font-weight: bold;
                }
                code {
                    background: rgba(0, 0, 0, 0.3);
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-family: monospace;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🤖 Léxia Bot</h1>
                <p class="subtitle">Autenticação com Kommo CRM</p>
                
                <div class="info">
                    <h3>📋 Instruções:</h3>
                    <div class="step">Clique no botão abaixo para autorizar o acesso ao Kommo</div>
                    <div class="step">Faça login na sua conta Kommo</div>
                    <div class="step">Autorize o aplicativo Léxia Bot</div>
                    <div class="step">Você será redirecionado de volta com o código de autorização</div>
                    <div class="step">Copie o código da URL e cole no campo abaixo</div>
                </div>

                <a href="${authUrl}" class="btn" target="_blank">
                    🔐 Autorizar Acesso ao Kommo
                </a>

                <div class="info">
                    <h3>🔑 Após autorizar:</h3>
                    <p>Você será redirecionado para uma URL como:</p>
                    <code>https://example.com?code=CODIGO_AQUI&state=...</code>
                    <p style="margin-top: 15px;">Copie o <strong>código</strong> e acesse:</p>
                    <code>/auth/callback?code=SEU_CODIGO_AQUI</code>
                </div>
            </div>
        </body>
        </html>
    `);
});

/**
 * Callback OAuth - recebe o código e troca por tokens
 * GET /auth/callback?code=CODIGO
 */
router.get('/callback', async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).send(`
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <title>Erro - Código Ausente</title>
                    <style>
                        body { font-family: Arial; max-width: 600px; margin: 50px auto; padding: 20px; }
                        .error { background: #fee; border: 2px solid #f00; padding: 20px; border-radius: 10px; }
                    </style>
                </head>
                <body>
                    <div class="error">
                        <h2>❌ Erro</h2>
                        <p>Código de autorização não fornecido.</p>
                        <p>Acesse: <code>/auth/callback?code=SEU_CODIGO</code></p>
                    </div>
                </body>
                </html>
            `);
        }

        console.log('🔄 [Auth] Recebido código de autorização:', code.substring(0, 10) + '...');

        const tokens = await exchangeCodeForTokens(code);

        res.send(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Sucesso - Autenticação Concluída</title>
                <style>
                    body { 
                        font-family: Arial; 
                        max-width: 800px; 
                        margin: 50px auto; 
                        padding: 20px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                    }
                    .success { 
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(10px);
                        padding: 30px; 
                        border-radius: 15px;
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    }
                    .token {
                        background: rgba(0, 0, 0, 0.3);
                        padding: 15px;
                        border-radius: 8px;
                        word-break: break-all;
                        font-family: monospace;
                        margin: 15px 0;
                        font-size: 12px;
                    }
                    h2 { margin-top: 0; }
                </style>
            </head>
            <body>
                <div class="success">
                    <h2>✅ Autenticação Concluída com Sucesso!</h2>
                    <p>Os tokens foram salvos e o servidor já está usando o novo token de acesso.</p>
                    
                    <h3>🔑 Access Token:</h3>
                    <div class="token">${tokens.access_token}</div>
                    
                    <h3>🔄 Refresh Token:</h3>
                    <div class="token">${tokens.refresh_token}</div>
                    
                    <h3>⏰ Expira em:</h3>
                    <p>${tokens.expires_in} segundos (${(tokens.expires_in / 3600).toFixed(2)} horas)</p>
                    
                    <hr style="margin: 30px 0; border: 1px solid rgba(255,255,255,0.3);">
                    
                    <h3>📋 Próximos Passos:</h3>
                    <ol>
                        <li>O servidor já está usando o novo token automaticamente</li>
                        <li>Configure o webhook no Kommo para apontar para este servidor</li>
                        <li>Teste enviando uma mensagem via WhatsApp</li>
                    </ol>
                    
                    <p style="margin-top: 30px; text-align: center;">
                        <a href="/" style="color: white; text-decoration: underline;">← Voltar para a página inicial</a>
                    </p>
                </div>
            </body>
            </html>
        `);

    } catch (error) {
        console.error('❌ [Auth] Erro no callback:', error);
        
        res.status(500).send(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Erro - Falha na Autenticação</title>
                <style>
                    body { font-family: Arial; max-width: 600px; margin: 50px auto; padding: 20px; }
                    .error { background: #fee; border: 2px solid #f00; padding: 20px; border-radius: 10px; }
                    pre { background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
                </style>
            </head>
            <body>
                <div class="error">
                    <h2>❌ Erro na Autenticação</h2>
                    <p>${error.message}</p>
                    <pre>${JSON.stringify(error.response?.data || {}, null, 2)}</pre>
                    <p><a href="/auth">← Tentar novamente</a></p>
                </div>
            </body>
            </html>
        `);
    }
});

/**
 * Endpoint para renovar token manualmente
 * POST /auth/refresh
 */
router.post('/refresh', async (req, res) => {
    try {
        const newToken = await refreshAccessToken();
        
        res.json({
            success: true,
            message: 'Token renovado com sucesso',
            access_token: newToken,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
