import React, { useState } from 'react';
import { RegistrerServices } from '../../services/Login/LoginServices';

import { FaCheckCircle, FaLeaf, FaArrowLeft } from 'react-icons/fa';
import { FiCircle } from 'react-icons/fi';

interface ForgotPasswordPageProps {
  onGoToLogin?: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onGoToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber && hasSpecialChar;
  const isPasswordMatch = password === confirmPassword;
  const canSubmit =
    email.trim() !== '' && isPasswordValid && isPasswordMatch && confirmPassword !== '';

  const handleBack = () => {
    if (onGoToLogin) {
      onGoToLogin();
      return;
    }
    window.location.href = '/login';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      await RegistrerServices.cambiarContrasena(email, password);
      setSuccess(true);
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      setErrorMsg(
        error?.message || 'Error de conexión. Verifica tu internet o inténtalo de nuevo más tarde.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-md px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-nutri-medium rounded-full flex items-center justify-center">
              <FaLeaf size={16} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-nutri-dark">Recuperar contraseña</h2>
          </div>
          {!success && (
            <button
              type="button"
              onClick={handleBack}
              className="text-nutri-medium hover:text-nutri-dark text-sm font-semibold flex items-center gap-1"
            >
              <FaArrowLeft size={12} /> Volver
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-admin-bg text-admin-accent rounded-lg text-sm text-center">
            {errorMsg}
          </div>
        )}

        {!success ? (
          <>
            <p className="text-gray-500 text-sm mb-6">Ingresa tu correo y tu nueva contraseña.</p>
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="block text-sm text-left font-semibold text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  placeholder="ejemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-nutri-medium focus:border-nutri-medium transition"
                  disabled={isLoading}
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm text-left font-semibold text-gray-700 mb-1">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-nutri-medium focus:border-nutri-medium transition"
                  disabled={isLoading}
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm text-left font-semibold text-gray-700 mb-1">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-nutri-medium focus:border-nutri-medium transition"
                  disabled={isLoading}
                />
              </div>

              <div className="mb-6 bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-xs text-gray-600 font-semibold mb-2">
                  La contraseña debe contener:
                </p>
                <ul className="text-xs space-y-1">
                  <li
                    className={`flex items-center gap-2 ${hasMinLength ? 'text-nutri-medium' : 'text-gray-600'}`}
                  >
                    {hasMinLength ? <FaCheckCircle size={14} /> : <FiCircle size={14} />} Mínimo 8
                    caracteres
                  </li>
                  <li
                    className={`flex items-center gap-2 ${hasUppercase ? 'text-nutri-medium' : 'text-gray-600'}`}
                  >
                    {hasUppercase ? <FaCheckCircle size={14} /> : <FiCircle size={14} />} Al menos
                    una letra mayúscula
                  </li>
                  <li
                    className={`flex items-center gap-2 ${hasNumber ? 'text-nutri-medium' : 'text-gray-600'}`}
                  >
                    {hasNumber ? <FaCheckCircle size={14} /> : <FiCircle size={14} />} Al menos un
                    número
                  </li>
                  <li
                    className={`flex items-center gap-2 ${hasSpecialChar ? 'text-nutri-medium' : 'text-gray-600'}`}
                  >
                    {hasSpecialChar ? <FaCheckCircle size={14} /> : <FiCircle size={14} />} Un
                    carácter especial (Ej: !@#$%)
                  </li>
                </ul>
              </div>

              {!isPasswordMatch && confirmPassword !== '' && (
                <p className="text-admin-accent text-xs mb-4">Las contraseñas deben coincidir.</p>
              )}

              <button
                type="submit"
                disabled={!canSubmit || isLoading}
                className="w-full bg-nutri-medium hover:bg-nutri-dark text-white font-bold py-3 px-4 rounded-xl transition text-sm shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Cambiar contraseña'
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <FaCheckCircle size={40} className="text-nutri-medium mx-auto mb-4" />
            <p className="text-gray-700 font-semibold mb-2">Contraseña actualizada</p>
            <p className="text-gray-500 text-sm mb-6">
              Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <button
              type="button"
              onClick={handleBack}
              className="w-full bg-nutri-medium hover:bg-nutri-dark text-white font-bold py-3 rounded-lg transition text-sm"
            >
              Ir al inicio de sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
