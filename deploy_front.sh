#!/bin/bash

# Configuración
PROJECT_DIR="/home/nutria/front/nutriApp"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "[deploy] Iniciando despliegue automático..."

# 1. Entrar al directorio
cd $PROJECT_DIR

# 2. Bajar cambios de la rama indicada a la actual
echo "[pull] Trayendo cambios de feature/web-mobile-login a la rama actual..."

# Esta línea evita el error fatal de "ramas divergentes" diciéndole a Git que haga un merge clásico
sudo git config pull.rebase false

# Hacemos el pull SIN sudo (trae los cambios de esa rama a la que tengas activa)
sudo git pull origin feature/web-mobile-login

# 3. Entrar al frontend y procesar
cd $FRONTEND_DIR

echo "[deps] Instalando dependencias nuevas..."
# SIN sudo, para que los paquetes le pertenezcan a 'nutria' y no a 'root'
sudo npm install --legacy-peer-deps

echo "[build] Construyendo aplicación (Build)..."
sudo npm run build

# 4. Asegurar permisos para Nginx
echo "[permissions] Ajustando permisos de carpetas..."
# Aquí SÍ usamos sudo porque la carpeta pública la lee Nginx
sudo chmod -R 755 $FRONTEND_DIR/build

echo "OK ¡Despliegue terminado! Revisa http://147.93.176.210:82"
