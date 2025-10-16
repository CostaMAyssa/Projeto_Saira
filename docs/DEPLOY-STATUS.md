# Status do Deploy - Green Pharmacy Chat

## ✅ Deploy Atualizado em: 11/08/2025

### 🎯 Stack Configurada
- **Nome da Stack**: `saira-frontend`
- **Container**: `saira-frontend_saira-frontend`
- **URL**: https://saira.insignemarketing.com.br

### 📁 Arquivos Atualizados

#### Scripts de Deploy
- ✅ `deploy-vps-updated.sh` - Script principal de deploy
- ✅ `rollback-vps.sh` - Script de rollback/recuperação
- ✅ Ambos scripts corrigidos para usar `saira-frontend`

#### Configurações Docker
- ✅ `Dockerfile` - Simplificado (usa dist já buildado)
- ✅ `docker-stack.yml` - Configuração da stack
- ✅ `nginx.conf` - Configuração do Nginx
- ✅ `.env.production` - Variáveis de ambiente

### 🚀 Como Fazer Deploy Futuro

1. **Deploy Normal**:
   ```bash
   # Na raiz do projeto
   source ~/.nvm/nvm.sh && nvm use 20
   ./deploy-vps-updated.sh
   ```

2. **Rollback (se necessário)**:
   ```bash
   ./rollback-vps.sh
   # ou
   ./rollback-vps.sh backup-20250811-143000
   ```

### 🔧 Monitoramento
```bash
ssh root@62.171.186.111
docker stack services saira-frontend
docker service logs saira-frontend_saira-frontend -f
```

### 📦 Correções Implementadas
- ✅ Magic-bytes melhorados para OGG/Opus no webhook-receiver
- ✅ Fallback de thumbnail para imagens via raw_data
- ✅ Scripts corrigidos para usar stack `saira-frontend`
- ✅ Dockerfile otimizado (sem build no container)
- ✅ Sistema de backup automático

### ⚠️ Importante
- Sempre usar Node 20 via NVM antes do deploy
- Stack correta: `saira-frontend` (não `saira`)
- Deploy webhook já feito com `--no-verify-jwt`
- Arquivos na pasta `docs/` estão atualizados

### 🎉 Status
**TUDO FUNCIONANDO** ✅ 