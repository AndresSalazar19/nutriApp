import React, { useState } from 'react';
import { RegistrerServices } from '../../services/Login/LoginServices';
import { FaLeaf } from 'react-icons/fa';
import { PasswordVisibilityToggle } from '../../components/PasswordVisibilityToggle';

interface LoginPageProps {
  onLogin: (userData: { userId: string; email: string; role: string; token: string }) => void;
  onGoToRegister: () => void;
  onGoToChangePassword: () => void;
}

function LoginPage({ onLogin, onGoToRegister, onGoToChangePassword }: LoginPageProps) {
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
        if (result.data.user.role === 'patient') {
          setErrorMsg(
            'Esta plataforma es solo para nutricionistas y administradores. Los pacientes no tienen acceso.',
          );
          return;
        }

        if (onLogin)
          onLogin({
            userId: result.data.user.id,
            email: result.data.user.email,
            role: result.data.user.role,
            token: result.data.access_token,
          });
      } else {
        // Si la API responde con un 200 pero isSuccessfully es false, o si es un 400/500
        setErrorMsg('Credenciales inválidas o error en el servidor.');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setErrorMsg('Error de conexión. Verifica tu internet o inténtalo de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen font-sans">
      {/* Panel izquierdo verde */}
      <div className="w-5/12 bg-gradient-to-br from-nutri-medium to-nutri-dark flex flex-col items-center justify-center px-10 text-white text-center relative overflow-hidden">
        {/* Círculos decorativos */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white opacity-10 rounded-full" />
        <div className="absolute bottom-16 right-8 w-48 h-48 bg-white opacity-10 rounded-full" />
        <div className="absolute top-1/2 right-0 w-24 h-24 bg-white opacity-10 rounded-full" />

        <div className="z-10 flex flex-col items-center">
          {/* Logo */}
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
            <FaLeaf size={32} className="text-nutri-medium" />
          </div>
          <h1 className="text-4xl font-bold mb-1 text-white">NutrIA</h1>
          <p className="text-nutri-light text-sm mb-6">Plataforma Profesional</p>

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
      <div className="w-7/12 bg-slate-50 flex flex-col items-center justify-center px-12 relative">
        <div className="bg-white rounded-2xl shadow-md p-10 w-full max-w-md">
          <h2 className="text-3xl font-bold text-nutri-dark mb-1">Iniciar Sesión</h2>
          <p className="text-gray-500 text-sm mb-7">Ingresa a tu panel profesional</p>

          {/* Mostrar mensaje de error si existe */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-admin-bg text-admin-accent rounded-lg text-sm text-center">
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
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-nutri-medium focus:border-nutri-medium transition"
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
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-nutri-medium focus:border-nutri-medium transition"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-nutri-medium focus:outline-none"
                  disabled={isLoading}
                >
                  <PasswordVisibilityToggle
                    visible={showPassword}
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </button>
              </div>
            </div>

            {/* Opciones */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" className="accent-nutri-medium" disabled={isLoading} />
                Recordarme
              </label>
              <button
                type="button"
                onClick={onGoToChangePassword}
                className="text-nutri-medium text-sm hover:underline bg-transparent border-none p-0"
                disabled={isLoading}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Botón submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full text-white font-bold py-3 rounded-lg transition text-sm flex justify-center items-center ${
                isLoading
                  ? 'bg-nutri-light cursor-not-allowed'
                  : 'bg-nutri-medium hover:bg-nutri-dark'
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
              className="text-nutri-medium font-bold hover:underline bg-transparent border-none cursor-pointer"
              disabled={isLoading}
            >
              Regístrate
            </button>
          </p>
        </div>

        <p className="absolute bottom-5 text-xs text-gray-500 text-center">
          Al iniciar sesión, aceptas nuestros Términos de Servicio y Política de Privacidad
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
