# 🥑 NutriApp - Monorepo

Este repositorio contiene todo el código fuente del sistema NutriApp, dividido en tres partes:
* **Backend:** API REST con Python (FastAPI).
* **Frontend:** Panel Web con React.js.
* **Mobile:** App móvil con React Native (Expo).

---

## 📋 Requisitos Previos

Antes de empezar, asegúrate de tener instalado:
1.  **Git**
2.  **Node.js** (Versión LTS recomendada)
3.  **Python 3.10+**
4.  **Expo Go** (App instalada en tu celular Android/iOS)

---

## 🚀 1. Configuración del Backend (FastAPI)

El servidor debe estar corriendo para que la web y la app móvil funcionen.

1.  Abre una terminal en la carpeta raíz y entra al backend:
    ```bash
    cd backend
    ```

2.  Crea tu entorno virtual (solo la primera vez):
    ```bash
    python -m venv venv
    ```

3.  Activa el entorno virtual:
    * **Windows (PowerShell):**
        ```powershell
        .\venv\Scripts\Activate.ps1
        ```
    * **Mac / Linux:**
        ```bash
        source venv/bin/activate
        ```

4.  Instala las librerías necesarias:
    ```bash
    pip install -r requirements.txt
    ```

5.  **Levantar el servidor:**
    *(Usamos `0.0.0.0` para que la App Móvil pueda verlo en la red Wi-Fi)*
    ```bash
    uvicorn app.main:app --reload --host 0.0.0.0
    ```
    ✅ *El backend estará disponible en:* `http://localhost:8000`

---

## 💻 2. Configuración del Frontend Web (React)

1.  Abre una **nueva terminal** y entra a la carpeta frontend:
    ```bash
    cd frontend
    ```

2.  Instala las dependencias:
    ```bash
    npm install
    ```

3.  Arranca el proyecto:
    ```bash
    npm start
    ```
    ✅ *La web se abrirá automáticamente en:* `http://localhost:3000`

---

## 📱 3. Configuración de la App Móvil (Expo)

1.  Abre una **tercera terminal** y entra a la carpeta mobile:
    ```bash
    cd mobile
    ```

2.  Instala las dependencias:
    ```bash
    npm install
    ```

3.  Arranca el servidor de desarrollo (limpiando caché para evitar errores):
    ```bash
    npx expo start -c
    ```

4.  **Para probar en tu celular:**
    * Asegúrate de que tu celular y tu PC estén conectados al **mismo Wi-Fi**.
    * Abre la app **Expo Go** en tu teléfono.
    * Escanea el código QR que aparece en la terminal.

---

## 🛠️ Solución de Problemas Comunes

### 🔴 Error: "La ejecución de scripts está deshabilitada en este sistema"
Si al activar el entorno de Python en Windows te sale error, ejecuta este comando en PowerShell como Administrador:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
