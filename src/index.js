require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { validateToken } = require('./services/kommoService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// Rotas
const webhookRoutes = require('./routes/webhook');
const authRoutes = require('./routes/auth');

app.use('/webhook', webhookRoutes);
app.use('/auth', authRoutes);

// Rota raiz
app.get('/', (req, res) => {
    res.json({
        service: 'Léxia Bot - Atendimento Automático via WhatsApp',
        status: 'online',
        version: '1.0.0',
        endpoints: {
            webhook: 'POST /webhook/kommo',
            test: 'GET /webhook/test',
            testMessage: 'POST /webhook/test',
            auth: 'GET /auth',
            authCallback: 'GET /auth/callback?code=CODE',
            refreshToken: 'POST /auth/refresh'
        },
        timestamp: new Date().toISOString()
    });
});

// Rota de health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Tratamento de erro 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint não encontrado',
        path: req.path,
        method: req.method
    });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
    console.error('❌ [SERVER] Erro não tratado:', err);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: err.message
    });
});

// Inicialização do servidor
async function startServer() {
    try {
        console.log('\n' + '='.repeat(80));
        console.log('🚀 INICIANDO LÉXIA BOT - SERVIDOR DE ATENDIMENTO AUTOMÁTICO');
        console.log('='.repeat(80));

        // Validar variáveis de ambiente
        console.log('\n📋 Validando configurações...');
        
        const requiredEnvVars = [
            'OPENAI_API_KEY',
            'KOMMO_SUBDOMAIN',
            'KOMMO_CLIENT_ID',
            'KOMMO_CLIENT_SECRET',
            'KOMMO_ACCESS_TOKEN'
        ];

        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        
        if (missingVars.length > 0) {
            console.error('❌ Variáveis de ambiente ausentes:', missingVars.join(', '));
            process.exit(1);
        }

        console.log('✅ Todas as variáveis de ambiente configuradas');

        // Validar token do Kommo
        console.log('\n🔐 Validando token do Kommo...');
        const tokenValid = await validateToken();
        
        if (!tokenValid) {
            console.warn('⚠️ Token do Kommo pode estar inválido ou expirado');
            console.warn('⚠️ O servidor continuará rodando, mas o envio de mensagens pode falhar');
        }

        // Iniciar servidor
        app.listen(PORT, '0.0.0.0', () => {
            console.log('\n' + '='.repeat(80));
            console.log(`✅ SERVIDOR ONLINE NA PORTA ${PORT}`);
            console.log('='.repeat(80));
            console.log(`\n📍 URL do Webhook: https://3000-ipejxvri8lz0t93zmnozf-bb9ba7e6.us2.manus.computer/webhook/kommo`);
            console.log(`\n🧪 Teste: curl -X GET https://3000-ipejxvri8lz0t93zmnozf-bb9ba7e6.us2.manus.computer/webhook/test`);
            console.log('\n' + '='.repeat(80));
            console.log('🎯 Aguardando webhooks do Kommo...\n');
        });

    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

// Tratamento de sinais de encerramento
process.on('SIGTERM', () => {
    console.log('\n⚠️ SIGTERM recebido. Encerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n⚠️ SIGINT recebido. Encerrando servidor...');
    process.exit(0);
});

// Iniciar
startServer();
