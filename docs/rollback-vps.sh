#!/bin/bash

# Script de Rollback - Green Pharmacy Chat
# VPS: 62.171.186.111
# Versão: 1.0

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
STACK_NAME="saira-frontend"

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

# Verificar dependências
check_dependencies() {
    if ! command -v sshpass &> /dev/null; then
        log_error "sshpass não encontrado. Instale com: brew install hudochenkov/sshpass/sshpass"
        exit 1
    fi
}

# Listar backups disponíveis
list_backups() {
    log_step "Listando backups disponíveis..."
    
    echo -e "\n${BLUE}📋 Backups disponíveis na VPS:${NC}"
    sshpass -p "${VPS_PASSWORD}" ssh ${VPS_USER}@${VPS_HOST} << 'EOF'
        cd /opt/stacks/saira-frontend
        if ls backup-* 1> /dev/null 2>&1; then
            echo "Backups encontrados:"
            ls -la backup-* | awk '{print $9 " (" $5 " bytes) - " $6 " " $7 " " $8}'
        else
            echo "Nenhum backup encontrado"
        fi
EOF
}

# Executar rollback
execute_rollback() {
    local backup_name="$1"
    
    if [ -z "$backup_name" ]; then
        log_error "Nome do backup não fornecido"
        exit 1
    fi
    
    log_step "Executando rollback para: $backup_name"
    
    sshpass -p "${VPS_PASSWORD}" ssh ${VPS_USER}@${VPS_HOST} << EOF
        set -e
        cd /opt/stacks/saira-frontend
        
        # Verificar se o backup existe
        if [ ! -d "$backup_name" ]; then
            echo "❌ Backup $backup_name não encontrado"
            exit 1
        fi
        
        echo "💾 Fazendo backup da versão atual antes do rollback..."
        if [ -d "dist" ]; then
            cp -r dist "backup-pre-rollback-\$(date +%Y%m%d-%H%M%S)"
        fi
        
        echo "🔄 Restaurando backup: $backup_name"
        rm -rf dist
        cp -r "$backup_name" dist
        
        echo "🐳 Reconstruindo imagem Docker..."
        docker build -t saira-frontend:latest . --no-cache
        
        echo "🚀 Re-deployando stack..."
        docker stack deploy -c docker-stack.yml saira-frontend
        
        echo "⏳ Aguardando serviços ficarem prontos..."
        sleep 30
        
        echo "🏥 Testando saúde da aplicação..."
        sleep 10
        
        # Tentar acessar o healthcheck
        for i in {1..5}; do
            if curl -f http://localhost/health >/dev/null 2>&1; then
                echo "✅ Rollback concluído com sucesso"
                break
            else
                echo "⏳ Tentativa \$i/5 - Aguardando aplicação..."
                sleep 10
            fi
            
            if [ \$i -eq 5 ]; then
                echo "⚠️ Aplicação pode não estar respondendo após rollback"
                echo "📋 Logs dos containers:"
                docker service logs saira-frontend_saira-frontend --tail 20 || true
            fi
        done
        
        echo "📊 Status final dos serviços:"
        docker stack services saira-frontend
EOF
    
    if [ $? -eq 0 ]; then
        log_success "Rollback concluído"
    else
        log_error "Falha no rollback"
        exit 1
    fi
}

# Função principal
main() {
    echo -e "${PURPLE}🔄 Script de Rollback - Green Pharmacy Chat${NC}"
    echo -e "${BLUE}📅 $(date)${NC}"
    echo -e "${BLUE}🎯 VPS: ${VPS_HOST}${NC}"
    echo ""
    
    check_dependencies
    list_backups
    
    echo ""
    echo -e "${YELLOW}💡 Como usar:${NC}"
    echo -e "1. Execute: ${GREEN}./rollback-vps.sh backup-20240811-143000${NC}"
    echo -e "2. Ou execute interativamente: ${GREEN}./rollback-vps.sh${NC}"
    echo ""
    
    # Se foi fornecido um argumento, executar rollback
    if [ $# -eq 1 ]; then
        execute_rollback "$1"
        
        echo ""
        log_success "🎉 Rollback concluído!"
        echo -e "${GREEN}🌐 Aplicação disponível em: https://saira.insignemarketing.com.br${NC}"
        echo ""
        echo -e "${YELLOW}📋 Para monitorar:${NC}"
        echo -e "ssh ${VPS_USER}@${VPS_HOST}"
        echo -e "docker stack services saira-frontend"
        echo -e "docker service logs saira-frontend_saira-frontend -f"
        
    else
        # Modo interativo
        echo -e "${YELLOW}📝 Digite o nome do backup para rollback (ex: backup-20240811-143000):${NC}"
        read -p "Backup: " backup_choice
        
        if [ -n "$backup_choice" ]; then
            echo ""
            echo -e "${RED}⚠️  ATENÇÃO: Isso irá substituir a versão atual pela versão do backup.${NC}"
            echo -e "${YELLOW}Deseja continuar? (y/N):${NC}"
            read -p "" confirm
            
            if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
                execute_rollback "$backup_choice"
                
                echo ""
                log_success "🎉 Rollback concluído!"
                echo -e "${GREEN}🌐 Aplicação disponível em: https://saira.insignemarketing.com.br${NC}"
            else
                log_info "Rollback cancelado pelo usuário"
            fi
        else
            log_warning "Nenhum backup selecionado"
        fi
    fi
}

# Executar função principal
main "$@" 