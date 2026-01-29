# 🤖 Léxia Bot - Atendimento Automático via WhatsApp

Sistema de atendimento automático integrado com Kommo CRM e OpenAI GPT para responder mensagens de clientes via WhatsApp de forma inteligente e personalizada.

## 🎯 Funcionalidades

- ✅ Recebimento de mensagens via webhook do Kommo CRM
- ✅ Processamento inteligente com OpenAI GPT-4
- ✅ Envio automático de respostas para o cliente no WhatsApp
- ✅ Sistema de logs detalhado para auditoria
- ✅ Renovação automática de token OAuth do Kommo
- ✅ Interface web para autenticação OAuth
- ✅ Endpoints de teste e validação

## 🏗️ Arquitetura

```
Cliente WhatsApp
    ↓
Kommo CRM (recebe mensagem)
    ↓
Webhook → Léxia Bot Server
    ↓
OpenAI GPT (processa e gera resposta)
    ↓
Kommo API (envia resposta)
    ↓
Cliente WhatsApp (recebe resposta)
```

## 📦 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **OpenAI API** - Inteligência Artificial
- **Kommo API** - CRM e WhatsApp
- **Axios** - Cliente HTTP

## 🚀 Deploy no Render

### Variáveis de Ambiente Necessárias:

```env
PORT=3000
NODE_ENV=production

OPENAI_API_KEY=sua_chave_openai
KOMMO_SUBDOMAIN=alelexia
KOMMO_CLIENT_ID=seu_client_id
KOMMO_CLIENT_SECRET=seu_client_secret
KOMMO_ACCESS_TOKEN=seu_access_token
KOMMO_REDIRECT_URI=https://seu-app.onrender.com/auth/callback
```

### Passos para Deploy:

1. **Criar Web Service no Render**
   - Conectar repositório GitHub
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Configurar Variáveis de Ambiente**
   - Adicionar todas as variáveis listadas acima no painel do Render

3. **Fazer Autenticação OAuth**
   - Acessar: `https://seu-app.onrender.com/auth`
   - Autorizar acesso ao Kommo
   - Copiar código e acessar callback

4. **Configurar Webhook no Kommo**
   - URL: `https://seu-app.onrender.com/webhook/kommo`
   - Evento: Mensagem recebida no chat

## 📡 Endpoints

### Webhook
- `POST /webhook/kommo` - Recebe mensagens do Kommo

### Autenticação
- `GET /auth` - Página de autenticação OAuth
- `GET /auth/callback?code=CODE` - Callback OAuth
- `POST /auth/refresh` - Renovar token manualmente

### Testes
- `GET /` - Status do servidor
- `GET /health` - Health check
- `GET /webhook/test` - Teste de conectividade
- `POST /webhook/test` - Simular mensagem

## 🧪 Testando Localmente

```bash
# Instalar dependências
npm install

# Configurar .env
cp .env.example .env
# Editar .env com suas credenciais

# Iniciar servidor
npm start

# Testar endpoint
curl http://localhost:3000/webhook/test
```

## 📝 Logs

Todos os webhooks recebidos são salvos em:
```
logs/webhook_TIMESTAMP.json
```

## 🔐 Segurança

- Tokens armazenados em variáveis de ambiente
- Refresh token salvo em arquivo local (não versionado)
- Validação automática de token antes de enviar mensagens
- Logs detalhados para auditoria

## 🤝 Suporte

Para dúvidas ou problemas:
- Email: contato@lexiaveiculos.com.br
- WhatsApp: (XX) XXXXX-XXXX

## 📄 Licença

Propriedade de Léxia Veículos - Todos os direitos reservados.
