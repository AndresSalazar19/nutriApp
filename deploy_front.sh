#!/bin/bash

# Configuración
PROJECT_DIR="/home/nutria/front/nutriApp"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "🚀 Iniciando despliegue automático..."

# 1. Entrar al directorio
cd $PROJECT_DIR

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> aeee5b44a50778e7922379a04811f3de9d44b3ee
# 2. Bajar cambios de la rama indicada a la actual
echo "📥 Trayendo cambios de feature/web-mobile-login a la rama actual..."

# Esta línea evita el error fatal de "ramas divergentes" diciéndole a Git que haga un merge clásico
sudo git config pull.rebase false

# Hacemos el pull SIN sudo (trae los cambios de esa rama a la que tengas activa)
<<<<<<< HEAD
=======
# 2. Bajar cambios de la rama actual
echo "Trayendo cambios de Git..."
>>>>>>> 0baa9001b7f796510626d223b80445342c3f6263
=======
>>>>>>> aeee5b44a50778e7922379a04811f3de9d44b3ee
sudo git pull origin feature/web-mobile-login

# 3. Entrar al frontend y procesar
cd $FRONTEND_DIR

echo "📦 Instalando dependencias nuevas..."
# SIN sudo, para que los paquetes le pertenezcan a 'nutria' y no a 'root'
sudo npm install --legacy-peer-deps

echo "🏗️ Construyendo aplicación (Build)..."
sudo npm run build

# 4. Asegurar permisos para Nginx
echo "🔐 Ajustando permisos de carpetas..."
# Aquí SÍ usamos sudo porque la carpeta pública la lee Nginx
sudo chmod -R 755 $FRONTEND_DIR/build

<<<<<<< HEAD
echo "✅ ¡Despliegue terminado! Revisa http://147.93.176.210:82"
=======
echo "✅ ¡Despliegue terminado! Revisa http://147.93.176.210:82"
>>>>>>> aeee5b44a50778e7922379a04811f3de9d44b3ee
