#!/bin/bash

# Configuración de rutas
PROJECT_DIR="/home/nutria/front/nutriApp/backend"
VENV_PATH="/home/nutria/front/nutriApp/venv"
SERVICE_NAME="nutriapp.service"

echo " Iniciando despliegue de NutriApp Backend..."

# 1. Entrar al directorio
cd $PROJECT_DIR || { echo "No se encontró la carpeta del proyecto"; exit 1; }

# 2. Traer cambios de Git (Rama actual)
echo "git -> Trayendo últimos cambios..."
sudo git pull origin desarrollo-backend

# 3. Actualizar dependencias
echo "pip -> Actualizando librerías..."
source $VENV_PATH/bin/activate
pip install -r requirements.txt

# 4. Reiniciar el servicio en Systemd
echo "systemd -> Reiniciando servicio $SERVICE_NAME..."
sudo systemctl daemon-reload
sudo systemctl restart $SERVICE_NAME

# 5. Verificar estado
echo "Verificando estado del servicio..."
sleep 2
STATUS=$(systemctl is-active $SERVICE_NAME)

if [ "$STATUS" = "active" ]; then
    echo "¡Despliegue exitoso! La API está corriendo en el puerto 8083."
else
    echo "Error: El servicio no arrancó correctamente."
    sudo systemctl status $SERVICE_NAME --no-pager
    exit 1
fi

echo "---"
echo "Prueba local: curl http://127.0.0.1:8083"
