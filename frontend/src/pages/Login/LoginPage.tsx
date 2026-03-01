import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: () => void;
  onGoToRegister: () => void;
}

function LoginPage({ onLogin, onGoToRegister }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Por ahora solo navega al dashboard sin autenticación real
    if (onLogin) onLogin();
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Opciones */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" className="accent-green-500" />
                Recordarme
              </label>
              <a href="/forgot-password" className="text-green-600 text-sm hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón */}
            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition text-sm"
            >
              Ingresar
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            ¿No tienes una cuenta?{' '}
            <button
              type="button"
              onClick={onGoToRegister}
              className="text-green-600 font-bold hover:underline"
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