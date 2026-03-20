import React, { useState } from 'react';
import { RegistrerServices } from '../../services/Login/LoginServices';

interface LoginPageProps {
  onLogin: (role: string) => void;
  onGoToRegister: () => void;
}

function LoginPage({ onLogin, onGoToRegister }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setErrorMsg('Por favor, ingresa correo y contraseña.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      // Usamos el servicio que acabamos de crear y tipar
      const result = await RegistrerServices.iniciarSesion(email, password);

      // Validamos la respuesta usando la estructura de tu ApiResponse
      if (result.status?.isSuccessfully && result.statusCode === 200) {
        
        // Gracias a la interfaz, TypeScript sabe que result.data tiene la propiedad role
        const userRole = result.data.role;
        
        // Aquí debes guardar el token/estado de sesión en tu app 
        // (idealmente a través de tu hook useAuth o Context API)
        
        // Redirigimos al usuario según su rol
        if (onLogin) onLogin(userRole);
        
      } else {
        // Si la API responde con un 200 pero isSuccessfully es false, o si es un 400/500
        setErrorMsg('Credenciales inválidas o error en el servidor.');
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setErrorMsg('Error de conexión. Verifica tu internet o inténtalo de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen font-sans">

      {/* Panel izquierdo verde */}
      <div className="w-5/12 bg-gradient-to-br from-green-500 to-green-800 flex flex-col items-center justify-center px-10 text-white text-center relative overflow-hidden">
        {/* Círculos decorativos */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white opacity-10 rounded-full" />
        <div className="absolute bottom-16 right-8 w-48 h-48 bg-white opacity-10 rounded-full" />
        <div className="absolute top-1/2 right-0 w-24 h-24 bg-white opacity-10 rounded-full" />

        <div className="z-10 flex flex-col items-center">
          {/* Logo */}
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
            <span className="text-3xl">🥗</span>
          </div>
          <h1 className="text-4xl font-bold mb-1">NutrIA</h1>
          <p className="text-green-200 text-sm mb-6">Plataforma Profesional</p>

          <p className="text-lg mb-8 max-w-xs leading-relaxed">
            Gestiona tus pacientes con inteligencia artificial
          </p>

          <ul className="space-y-3 text-left w-full max-w-xs">
            {[
              'Planes nutricionales personalizados',
              'Seguimiento en tiempo real',
              'Base de alimentos ecuatorianos',
              'Comunicación segura con pacientes',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-white rounded-full flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="w-7/12 bg-green-50 flex flex-col items-center justify-center px-12 relative">
        <a href="/" className="absolute top-6 left-8 text-green-600 text-sm hover:underline">
          ← Volver al inicio
        </a>

        <div className="bg-white rounded-2xl shadow-md p-10 w-full max-w-md">
          <h2 className="text-3xl font-bold text-green-900 mb-1">Iniciar Sesión</h2>
          <p className="text-gray-400 text-sm mb-7">Ingresa a tu panel profesional</p>

          {/* Mostrar mensaje de error si existe */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm text-left font-semibold text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                placeholder="nutricionista@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition"
                disabled={isLoading}
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm text-left font-semibold text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="········"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:border-green-500 transition"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  disabled={isLoading}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Opciones */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" className="accent-green-500" disabled={isLoading} />
                Recordarme
              </label>
              <a href="/forgot-password" className="text-green-600 text-sm hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white font-bold py-3 rounded-lg transition text-sm flex justify-center items-center ${
                isLoading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>

          {/* Enlace a registro */}
          <p className="text-center text-sm text-gray-500 mt-5">
            ¿No tienes una cuenta?{' '}
            <button
              type="button"
              onClick={onGoToRegister}
              className="text-green-600 font-bold hover:underline bg-transparent border-none cursor-pointer"
              disabled={isLoading}
            >
              Regístrate
            </button>
          </p>
        </div>

        <p className="absolute bottom-5 text-xs text-gray-400 text-center">
          Al iniciar sesión, aceptas nuestros Términos de Servicio y Política de Privacidad
        </p>
      </div>
    </div>
  );
}

export default LoginPage;