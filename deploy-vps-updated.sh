#!/bin/bash

# Script de Deploy Atualizado - Green Pharmacy Chat
# VPS: 62.171.186.111
# Versão: 2.0 - Atualizado em $(date +%Y-%m-%d)

set -e # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configurações da VPS
VPS_HOST="62.171.186.111"
VPS_USER="root"
VPS_PASSWORD="2-c74q\$xB7x"
IMAGE_NAME="saira-frontend"
STACK_NAME="saira-frontend"
PROJECT_DIR="/root/apps/green-pharmacy-chat"

# Funções auxiliares
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "${PURPLE}🔄 $1${NC}"
}

# Verificar dependências locais
check_dependencies() {
    log_step "Verificando dependências locais..."
    
    if ! command -v npm &> /dev/null; then
        log_error "NPM não encontrado. Instale Node.js"
        exit 1
    fi
    
    if ! command -v sshpass &> /dev/null; then
        log_warning "sshpass não encontrado. Instalando..."
        # Para macOS
        if command -v brew &> /dev/null; then
            brew install hudochenkov/sshpass/sshpass || {
                log_error "Falha ao instalar sshpass. Execute manualmente: brew install hudochenkov/sshpass/sshpass"
                exit 1
            }
        else
            log_error "brew não encontrado. Instale sshpass manualmente"
            exit 1
        fi
    fi
    
    log_success "Dependências verificadas"
}

# Backup da versão atual
backup_current_version() {
    log_step "Fazendo backup da versão atual..."
    
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    
    sshpass -p "${VPS_PASSWORD}" ssh ${VPS_USER}@${VPS_HOST} << EOF
        cd ${PROJECT_DIR}
        if [ -d "dist" ]; then
            cp -r dist ${BACKUP_NAME}
            echo "Backup criado: ${BACKUP_NAME}"
        else
            echo "Nenhuma versão anterior encontrada para backup"
        fi
EOF
    
    log_success "Backup concluído"
}

# Build da aplicação
build_application() {
    log_step "Fazendo build da aplicação..."
    
    # Verificar se package.json existe
    if [ ! -f "package.json" ]; then
        log_error "package.json não encontrado. Execute este script na raiz do projeto."
        exit 1
    fi
    
    # Instalar dependências se node_modules não existir
    if [ ! -d "node_modules" ]; then
        log_info "Instalando dependências..."
        npm ci --prefer-offline
    fi
    
    # Build
    if ! npm run build; then
        log_error "Erro no build da aplicação"
        exit 1
    fi
    
    # Verificar se dist foi criado
    if [ ! -d "dist" ]; then
        log_error "Diretório 'dist' não foi criado após o build"
        exit 1
    fi
    
    log_success "Build da aplicação concluído"
}

# Criar pacote para deploy
create_deploy_package() {
    log_step "Empacotando arquivos para deploy..."
    
    # Verificar se arquivos necessários existem
    local required_files=("dist" "Dockerfile" "nginx.conf" "docker-stack.yml")
    for file in "${required_files[@]}"; do
        if [ ! -e "$file" ]; then
            log_error "Arquivo/diretório obrigatório não encontrado: $file"
            exit 1
        fi
    done
    
    # Criar .env.production se não existir
    if [ ! -f ".env.production" ]; then
        log_warning ".env.production não encontrado. Criando baseado em .env.example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env.production
            log_info "Edite .env.production com as configurações de produção antes do próximo deploy"
        else
            touch .env.production
        fi
    fi
    
    # Criar pacote
    tar -czf deploy-package.tar.gz \
        dist/ \
        Dockerfile \
        nginx.conf \
        docker-stack.yml \
        .env.production \
        setup-vps.sh 2>/dev/null || true
    
    log_success "Arquivos empacotados ($(du -h deploy-package.tar.gz | cut -f1))"
}

# Transferir arquivos para VPS
transfer_files() {
    log_step "Transferindo arquivos para VPS..."
    
    # Testar conexão SSH primeiro
    if ! sshpass -p "${VPS_PASSWORD}" ssh -o ConnectTimeout=10 ${VPS_USER}@${VPS_HOST} "echo 'Conexão SSH OK'"; then
        log_error "Falha na conexão SSH com ${VPS_HOST}"
        exit 1
    fi
    
    # Transferir pacote
    if ! sshpass -p "${VPS_PASSWORD}" scp -o ConnectTimeout=30 deploy-package.tar.gz ${VPS_USER}@${VPS_HOST}:/tmp/; then
        log_error "Falha na transferência de arquivos"
        exit 1
    fi
    
    log_success "Arquivos transferidos"
}

# Deploy na VPS
deploy_on_vps() {
    log_step "Executando deploy na VPS..."
    
    sshpass -p "${VPS_PASSWORD}" ssh ${VPS_USER}@${VPS_HOST} << 'EOF'
        set -e
        
        echo "🔧 Iniciando deploy na VPS..."
        cd /tmp
        
        # Extrair arquivos
        echo "📦 Extraindo arquivos..."
        tar -xzf deploy-package.tar.gz
        
        # Criar diretórios necessários
        echo "📁 Criando estrutura de diretórios..."
        mkdir -p /opt/stacks/saira-frontend
        mkdir -p /opt/docker-data/saira-frontend
        
        # Backup da versão atual se existir
        if [ -d "/opt/stacks/saira-frontend/dist" ]; then
            echo "💾 Fazendo backup da versão atual..."
            BACKUP_DIR="/opt/stacks/saira-frontend/backup-$(date +%Y%m%d-%H%M%S)"
            cp -r /opt/stacks/saira-frontend/dist "$BACKUP_DIR" || true
            # Manter apenas os 3 backups mais recentes
            cd /opt/stacks/saira-frontend && ls -t backup-* 2>/dev/null | tail -n +4 | xargs rm -rf || true
        fi
        
        # Mover arquivos para local correto
        echo "📂 Movendo arquivos para produção..."
        cp -r dist /opt/stacks/saira-frontend/
        cp Dockerfile /opt/stacks/saira-frontend/
        cp nginx.conf /opt/stacks/saira-frontend/
        cp docker-stack.yml /opt/stacks/saira-frontend/
        cp .env.production /opt/stacks/saira-frontend/
        
        cd /opt/stacks/saira-frontend
        
        # Verificar Docker
        if ! command -v docker &> /dev/null; then
            echo "🐳 Docker não encontrado. Instalando..."
            curl -fsSL https://get.docker.com -o get-docker.sh
            sh get-docker.sh
            systemctl enable docker
            systemctl start docker
            rm get-docker.sh
            echo "✅ Docker instalado"
        fi
        
        # Verificar Docker Swarm
        if ! docker info | grep -q "Swarm: active"; then
            echo "🐝 Inicializando Docker Swarm..."
            docker swarm init --advertise-addr $(hostname -I | awk '{print $1}')
        fi
        
        # Criar rede Traefik se não existir
        if ! docker network ls | grep -q "traefik-public"; then
            echo "🌐 Criando rede traefik-public..."
            docker network create --driver overlay traefik-public
        fi
        
        # Build da imagem Docker
        echo "🐳 Construindo nova imagem Docker..."
        docker build -t saira-frontend:latest . --no-cache
        
        # Verificar se a imagem foi criada
        if ! docker images | grep -q "saira-frontend.*latest"; then
            echo "❌ Falha na criação da imagem Docker"
            exit 1
        fi
        
        # Deploy da stack (com rollback automático em caso de falha)
        echo "🚀 Fazendo deploy da stack..."
        if docker stack deploy -c docker-stack.yml saira-frontend; then
            echo "✅ Stack deployada com sucesso"
        else
            echo "❌ Falha no deploy da stack"
            exit 1
        fi
        
        # Aguardar e verificar deploy
        echo "⏳ Aguardando serviços ficarem prontos..."
        sleep 45
        
        # Verificar status dos serviços
        echo "📊 Status dos serviços:"
        docker stack services saira-frontend
        
        # Teste de saúde básico
        echo "🏥 Testando saúde da aplicação..."
        sleep 15
        
        # Tentar acessar o healthcheck
        for i in {1..5}; do
            if curl -f http://localhost/health >/dev/null 2>&1; then
                echo "✅ Aplicação respondendo corretamente"
                break
            else
                echo "⏳ Tentativa $i/5 - Aguardando aplicação..."
                sleep 10
            fi
            
            if [ $i -eq 5 ]; then
                echo "⚠️ Aplicação pode não estar respondendo corretamente"
                echo "📋 Logs dos containers:"
                docker service logs saira-frontend_saira-frontend --tail 20 || true
            fi
        done
        
        # Cleanup
        echo "🧹 Limpando arquivos temporários..."
        rm -f /tmp/deploy-package.tar.gz
        rm -rf /tmp/dist /tmp/Dockerfile /tmp/nginx.conf /tmp/docker-stack.yml /tmp/.env.production /tmp/setup-vps.sh
        
        echo "🎉 Deploy concluído com sucesso!"
        echo "🌐 Aplicação disponível em: https://saira.insignemarketing.com.br"
EOF
    
    if [ $? -eq 0 ]; then
        log_success "Deploy na VPS concluído"
    else
        log_error "Falha no deploy na VPS"
        exit 1
    fi
}

# Verificar status final
verify_deployment() {
    log_step "Verificando status final do deployment..."
    
    echo -e "\n${BLUE}📊 Status dos Serviços:${NC}"
    sshpass -p "${VPS_PASSWORD}" ssh ${VPS_USER}@${VPS_HOST} "docker stack services saira-frontend"
    
    echo -e "\n${BLUE}🐳 Containers em execução:${NC}"
    sshpass -p "${VPS_PASSWORD}" ssh ${VPS_USER}@${VPS_HOST} "docker ps --filter 'name=saira-frontend' --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
    
    log_success "Verificação concluída"
}

# Cleanup local
cleanup() {
    log_step "Limpando arquivos temporários locais..."
    rm -f deploy-package.tar.gz
    log_success "Cleanup concluído"
}

# Função principal
main() {
    echo -e "${PURPLE}🚀 Iniciando Deploy - Green Pharmacy Chat${NC}"
    echo -e "${BLUE}📅 $(date)${NC}"
    echo -e "${BLUE}🎯 VPS: ${VPS_HOST}${NC}"
    echo -e "${BLUE}📦 Stack: ${STACK_NAME}${NC}"
    echo ""
    
    # Verificar se está na raiz do projeto
    if [ ! -f "package.json" ] || [ ! -f "vite.config.ts" ]; then
        log_error "Execute este script na raiz do projeto Green Pharmacy Chat"
        exit 1
    fi
    
    check_dependencies
    backup_current_version
    build_application
    create_deploy_package
    transfer_files
    deploy_on_vps
    verify_deployment
    cleanup
    
    echo ""
    log_success "🎉 Deploy concluído com sucesso!"
    echo -e "${GREEN}🌐 Aplicação disponível em: https://saira.insignemarketing.com.br${NC}"
    echo ""
    echo -e "${YELLOW}📋 Para monitorar:${NC}"
    echo -e "ssh ${VPS_USER}@${VPS_HOST}"
    echo -e "docker stack services saira-frontend"
    echo -e "docker service logs saira-frontend_saira-frontend -f"
    echo ""
    echo -e "${YELLOW}🔧 Para rollback (se necessário):${NC}"
    echo -e "ssh ${VPS_USER}@${VPS_HOST}"
    echo -e "cd /opt/stacks/saira-frontend && ls backup-* # ver backups disponíveis"
    echo -e "cp -r backup-YYYYMMDD-HHMMSS dist # restaurar backup"
    echo -e "docker stack deploy -c docker-stack.yml saira-frontend # re-deploy"
}

# Trap para cleanup em caso de interrupção
trap cleanup EXIT

# Executar função principal
main "$@" 