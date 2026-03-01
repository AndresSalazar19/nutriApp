#!/bin/bash

# Configuración
PROJECT_DIR="/home/nutria/front/nutriApp"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "Iniciando despliegue automático..."

# 1. Entrar al directorio
cd $PROJECT_DIR

# 2. Bajar cambios de la rama actual
echo "Trayendo cambios de Git..."
sudo git pull origin feature/web-mobile-login

# 3. Entrar al frontend y procesar
cd $FRONTEND_DIR

echo "Instalando dependencias nuevas..."
sudo npm install --legacy-peer-deps

echo "Construyendo aplicación (Build)..."
sudo npm run build

# 4. Asegurar permisos para Nginx
echo "Ajustando permisos de carpetas..."
sudo chmod -R 755 $FRONTEND_DIR/build

echo "¡Despliegue terminado! Revisa http://147.93.176.210:82"
