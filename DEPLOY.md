# 🚀 Guia de Deploy - Saíra

Este guia contém todas as instruções para fazer o deploy da aplicação Saira na sua VPS usando Portainer Stack com deploy automático.

## 📋 Pré-requisitos

### VPS
- Ubuntu 20.04+ ou CentOS 7+
- Mínimo 2GB RAM, 2 vCPUs
- Docker e Docker Swarm
- Traefik configurado
- Domínio configurado: `saira.insignemarketing.com.br`

### Desenvolvimento
- Node.js 18+
- Docker
- Git
- Acesso SSH à VPS

## 🔧 Configuração Inicial da VPS

### 1. Executar script de configuração
```bash
# Na sua VPS, execute como root:
curl -fsSL https://raw.githubusercontent.com/seu-usuario/green-pharmacy-chat/main/setup-vps.sh | bash
```

Ou manualmente:
```bash
# Copiar o arquivo para a VPS
scp setup-vps.sh root@sua-vps.com:/tmp/
ssh root@sua-vps.com
chmod +x /tmp/setup-vps.sh
/tmp/setup-vps.sh
```

### 2. Configurar DNS
Configure o DNS do domínio `saira.insignemarketing.com.br` para apontar para o IP da sua VPS.

## 🚀 Métodos de Deploy

### Método 1: Deploy Manual (Build Local + Transferência)

```bash
# 1. Build local e empacotamento
./build-and-deploy.sh

# 2. Transferir para VPS
scp saira-frontend-*.tar.gz root@sua-vps.com:/tmp/

# 3. Carregar imagem na VPS
ssh root@sua-vps.com
docker load < /tmp/saira-frontend-*.tar.gz
cd /opt/stacks/saira
docker stack deploy -c docker-stack.yml saira
```

### Método 2: Deploy Manual (Build Direto na VPS)

```bash
# 1. Clonar repositório na VPS
ssh root@sua-vps.com
cd /opt/stacks/saira
git clone https://github.com/seu-usuario/green-pharmacy-chat.git .
npm install
npm run build

# 2. Build da imagem Docker
docker build -t saira-frontend:latest .

# 3. Deploy da stack
docker stack deploy -c docker-stack.yml saira
```

### Método 3: Deploy Automático (GitHub Actions)

#### Configurar Secrets no GitHub
No seu repositório GitHub, vá em Settings > Secrets and variables > Actions e adicione:

```
DOCKER_REGISTRY=registry.hub.docker.com  # ou seu registry
DOCKER_USERNAME=seu-usuario
DOCKER_PASSWORD=sua-senha
VPS_HOST=sua-vps.com
VPS_USER=root
VPS_SSH_KEY=sua-chave-ssh-privada
```

#### Configurar chave SSH
```bash
# Gerar chave SSH (se não tiver)
ssh-keygen -t rsa -b 4096 -C "deploy@saira"

# Copiar chave pública para VPS
ssh-copy-id -i ~/.ssh/id_rsa.pub root@sua-vps.com

# Adicionar chave privada como secret VPS_SSH_KEY no GitHub
cat ~/.ssh/id_rsa
```

#### Deploy automático
O deploy será executado automaticamente a cada push na branch `main` ou `master`.

### Método 4: Deploy com Script Automatizado

```bash
# Editar configurações no script
nano deploy.sh
# Alterar VPS_HOST, VPS_USER, etc.

# Executar deploy
./deploy.sh
```

## ⚙️ Configuração de Ambiente

### Variáveis de Ambiente
Edite o arquivo `.env.production` com suas configurações:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
VITE_SUPABASE_FUNCTIONS_URL=https://seu-projeto.supabase.co/functions/v1
VITE_EVOLUTION_API_URL=https://sua-evolution-api.com
VITE_EVOLUTION_API_KEY=sua-chave-evolution
VITE_APP_URL=https://saira.insignemarketing.com.br
```

## 📊 Monitoramento

### Verificar status dos serviços
```bash
# Status da stack
docker stack services saira

# Logs do serviço
docker service logs saira_saira-frontend -f

# Status detalhado
docker stack ps saira
```

### Traefik Dashboard
Acesse: `http://ip-da-vps:8080`

### Health Check
```bash
curl -f https://saira.insignemarketing.com.br/health
```

## 🔄 Manutenção

### Atualizar aplicação
```bash
# Método 1: GitHub Actions (automático)
git push origin main

# Método 2: Manual
ssh root@sua-vps.com
cd /opt/stacks/saira
git pull
docker build -t saira-frontend:latest .
docker stack deploy -c docker-stack.yml saira
```

### Backup
```bash
# Backup da configuração
ssh root@sua-vps.com
tar -czf saira-backup-$(date +%Y%m%d).tar.gz /opt/stacks/saira
```

### Rollback
```bash
# Voltar para versão anterior
docker service update --image saira-frontend:previous saira_saira-frontend
```

## 🐛 Troubleshooting

### Problemas comuns

#### 1. Serviço não inicia
```bash
# Verificar logs
docker service logs saira_saira-frontend

# Verificar imagem
docker images | grep saira-frontend

# Recriar serviço
docker service update --force saira_saira-frontend
```

#### 2. SSL não funciona
```bash
# Verificar Traefik
docker service logs traefik_traefik

# Verificar DNS
nslookup saira.insignemarketing.com.br

# Forçar renovação SSL
docker exec $(docker ps -q -f name=traefik) traefik --certificatesresolvers.letsencrypt.acme.caserver=https://acme-v02.api.letsencrypt.org/directory
```

#### 3. Aplicação não carrega
```bash
# Verificar health check
curl -f https://saira.insignemarketing.com.br/health

# Verificar nginx
docker exec -it $(docker ps -q -f name=saira) nginx -t

# Reiniciar serviço
docker service update --force saira_saira-frontend
```

### Logs úteis
```bash
# Logs da aplicação
docker service logs saira_saira-frontend -f

# Logs do Traefik
docker service logs traefik_traefik -f

# Logs do sistema
journalctl -u docker -f
```

## 🌐 URLs Importantes

- **Aplicação**: https://saira.insignemarketing.com.br
- **Health Check**: https://saira.insignemarketing.com.br/health
- **Traefik Dashboard**: http://ip-da-vps:8080

## 📞 Suporte

Em caso de problemas:
1. Verificar logs conforme instruções acima
2. Consultar documentação do Docker Swarm
3. Verificar configuração do Traefik
4. Contatar suporte técnico

---

**Última atualização**: $(date)
**Versão**: 1.0.0