from fastapi import FastAPI

# Instanciamos la aplicación
app = FastAPI(
    title="NutriApp API",
    description="Backend para gestión de planes nutricionales",
    version="1.0.0"
)

# Definimos el "Hola Mundo"
@app.get("/")
async def root():
    return {
        "message": "¡Bienvenido a NutriApp API!",
        "status": "Online",
        "docs": "/docs"
    }

# Un ejemplo con parámetros (muy común en nutrición)
@app.get("/usuario/{usuario_id}")
async def leer_usuario(usuario_id: int):
    return {"usuario_id": usuario_id, "plan": "Plan Calórico Estándar"}