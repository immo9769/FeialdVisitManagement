#!/usr/bin/env bash
# ===================================================================
# Enterprise Field Visit & CRM System - Server Deployment Script
# Orchestrates Docker Compose Build, Startup, and Health Verification
# ===================================================================

set -e

# Visual styling
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}${BOLD}"
echo "======================================================================"
echo "    Enterprise Field Visit & CRM System - Docker Deployment CLI       "
echo "======================================================================"
echo -e "${NC}"

# Detect Docker Compose command (docker compose plugin vs legacy docker-compose)
if docker compose version >/dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
    COMPOSE_CMD="docker-compose"
else
    echo -e "${RED}[ERROR] Neither 'docker compose' nor 'docker-compose' found on this system.${NC}"
    echo "Please install Docker and Docker Compose before running this deployment script."
    exit 1
fi

# Ensure .env file exists
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo -e "${YELLOW}[!] .env file not found. Copying defaults from .env.example...${NC}"
        cp .env.example .env
        echo -e "${GREEN}[✓] Created .env with default configurations.${NC}"
    else
        echo -e "${RED}[ERROR] Missing .env and .env.example file.${NC}"
        exit 1
    fi
fi

# Load environment variables for reporting
set -a
source .env
set +a

ACTION="${1:-up}"

case "$ACTION" in
    up)
        echo -e "${BLUE}[1/3] Building container images with Compose...${NC}"
        $COMPOSE_CMD build

        echo -e "${BLUE}[2/3] Starting services in background...${NC}"
        $COMPOSE_CMD up -d

        echo -e "${BLUE}[3/3] Awaiting container healthchecks...${NC}"
        echo -e "Waiting for database and backend services to initialize..."
        sleep 10

        $COMPOSE_CMD ps

        echo ""
        echo -e "${GREEN}${BOLD}======================================================================"
        echo -e "  ✓ FIELD VISIT CRM SYSTEM DEPLOYED SUCCESSFULLY!                     "
        echo -e "======================================================================${NC}"
        echo -e "  🌐 Web Application:     ${BOLD}http://localhost:${FRONTEND_PORT:-80}${NC}"
        echo -e "  📡 Spring Boot REST API: ${BOLD}http://localhost:${BACKEND_PORT:-4000}/api${NC}"
        echo -e "  📚 OpenAPI Swagger Docs: ${BOLD}http://localhost:${BACKEND_PORT:-4000}/swagger-ui.html${NC}"
        echo -e "  🗄️  SQL Server Port:     ${BOLD}${DB_PORT:-1433}${NC}"
        echo ""
        echo -e "  ${YELLOW}Default Admin Credentials:${NC}"
        echo -e "  Email:    ${BOLD}admin@crm.com${NC}"
        echo -e "  Password: ${BOLD}Password@123${NC}"
        echo -e "${GREEN}======================================================================${NC}"
        ;;

    down)
        echo -e "${YELLOW}Stopping and removing application containers...${NC}"
        $COMPOSE_CMD down
        echo -e "${GREEN}[✓] Application stopped.${NC}"
        ;;

    restart)
        echo -e "${YELLOW}Restarting application services...${NC}"
        $COMPOSE_CMD restart
        echo -e "${GREEN}[✓] Services restarted.${NC}"
        $COMPOSE_CMD ps
        ;;

    logs)
        SERVICE="${2:-}"
        if [ -n "$SERVICE" ]; then
            $COMPOSE_CMD logs -f "$SERVICE"
        else
            $COMPOSE_CMD logs -f
        fi
        ;;

    status)
        echo -e "${BLUE}Current Container Status:${NC}"
        $COMPOSE_CMD ps
        ;;

    update)
        echo -e "${BLUE}Pulling latest git changes...${NC}"
        git pull origin main || git pull origin master
        echo -e "${BLUE}Rebuilding and restarting containers...${NC}"
        $COMPOSE_CMD up -d --build
        echo -e "${GREEN}[✓] Update complete.${NC}"
        $COMPOSE_CMD ps
        ;;

    *)
        echo -e "${YELLOW}Usage: ./deploy.sh [up | down | restart | logs [service] | status | update]${NC}"
        exit 1
        ;;
esac
