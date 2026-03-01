import React, { useState } from 'react';

interface RegisterPageProps {
  onGoToLogin: () => void;
}

function RegisterPage({ onGoToLogin }: RegisterPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    birthDate: '',
    licenseNumber: '',
    university: '',
    specialties: '',
    yearsExperience: '',
    password: '',
    confirmPassword: '',
  });
  const [certFiles, setCertFiles] = useState([]);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleFileChange = (e) => {
    setCertFiles(Array.from(e.target.files));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí irá la lógica de registro real
    console.log('Registro enviado', form);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-8 px-4">

      {/* Volver */}
      <div className="w-full max-w-4xl mb-4">
        <button
          onClick={onGoToLogin}
          className="text-green-700 text-sm hover:underline flex items-center gap-1"
        >
          ← Volver al inicio
        </button>
      </div>

      {/* Card principal */}
      <div className="bg-white rounded-2xl shadow-md w-full max-w-4xl px-10 py-8">

        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-3 shadow">
            <span className="text-xl">🥗</span>
          </div>
          <h1 className="text-2xl font-bold text-green-700">Crear Cuenta</h1>
          <p className="text-gray-400 text-sm mt-1">Únete a nuestra red profesional</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Grid 2 columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2">

            {/* ── Columna Izquierda ── */}
            <div>
              <h2 className="text-green-600 font-semibold text-sm mb-4 border-b-2 border-green-500 pb-1 inline-block">
                Información Personal
              </h2>

              {/* Nombre completo */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  placeholder="Ingresa tu nombre completo"
                  value={form.fullName}
                  onChange={e => update('fullName', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 transition bg-white"
                />
              </div>

              {/* Email + Teléfono en fila */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="ejemplo@email.com"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 transition bg-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    placeholder="0999 123 456"
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 transition bg-white"
                  />
                </div>
              </div>

              {/* Fecha de nacimiento */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Fecha de nacimiento
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="DD/MM/AAAA"
                    value={form.birthDate}
                    onChange={e => update('birthDate', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 transition bg-white pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">📅</span>
                </div>
              </div>

              {/* Seguridad */}
              <h2 className="text-green-600 font-semibold text-sm mb-4 border-b-2 border-green-500 pb-1 inline-block">
                Seguridad
              </h2>

              {/* Contraseña */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-green-500 transition bg-white"
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

              {/* Confirmar contraseña */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={e => update('confirmPassword', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-green-500 transition bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Columna Derecha ── */}
            <div>
              <h2 className="text-green-600 font-semibold text-sm mb-4 border-b-2 border-green-500 pb-1 inline-block">
                Información Profesional
              </h2>

              {/* Número de licencia */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Número de licencia profesional
                </label>
                <input
                  type="text"
                  placeholder="Ej: 1234-5678"
                  value={form.licenseNumber}
                  onChange={e => update('licenseNumber', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 transition bg-white"
                />
              </div>

              {/* Universidad */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Universidad
                </label>
                <input
                  type="text"
                  placeholder="Nombre de tu universidad"
                  value={form.university}
                  onChange={e => update('university', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 transition bg-white"
                />
              </div>

              {/* Especialidades */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Especialidades
                </label>
                <input
                  type="text"
                  placeholder="Ej: Nutrición deportiva, Pediátrica"
                  value={form.specialties}
                  onChange={e => update('specialties', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 transition bg-white"
                />
              </div>

              {/* Años de experiencia */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Años de experiencia
                </label>
                <input
                  type="number"
                  placeholder="Ej: 5"
                  min="0"
                  value={form.yearsExperience}
                  onChange={e => update('yearsExperience', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 transition bg-white"
                />
              </div>

              {/* Subir certificaciones */}
              <h2 className="text-green-600 font-semibold text-sm mb-4 border-b-2 border-green-500 pb-1 inline-block">
                Subir certificaciones y títulos
              </h2>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Seleccionar archivos
                </label>
                <label className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-400 bg-white cursor-pointer hover:border-green-400 transition">
                  <span>
                    {certFiles.length > 0
                      ? certFiles.map(f => f.name).join(', ')
                      : 'Seleccionar archivos'}
                  </span>
                  <span className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white text-base flex-shrink-0">
                    ＋
                  </span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG o PNG. Máx. 5MB por archivo.</p>
              </div>
            </div>
          </div>

          {/* Términos */}
          <div className="flex items-center gap-2 mt-2 mb-5">
            <input
              type="checkbox"
              id="terms"
              checked={acceptTerms}
              onChange={e => setAcceptTerms(e.target.checked)}
              className="accent-green-500 w-4 h-4"
            />
            <label htmlFor="terms" className="text-xs text-gray-500">
              Acepto los{' '}
              <a href="#" className="text-green-600 font-semibold hover:underline">
                Términos de Servicio
              </a>{' '}
              y{' '}
              <a href="#" className="text-green-600 font-semibold hover:underline">
                Política de Privacidad
              </a>
            </label>
          </div>

          {/* Botón */}
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition text-sm shadow-sm"
          >
            Crear cuenta
          </button>
        </form>

        {/* Link a login */}
        <div className="text-center mt-5">
          <p className="text-sm text-gray-500">
            ¿Ya tienes una cuenta?{' '}
            <button
              onClick={onGoToLogin}
              className="text-green-600 font-bold hover:underline"
            >
              Iniciar sesión Cambio
            </button>
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-gray-400 text-center mt-5 pb-4">
        Al crear cuenta, aceptas nuestros Términos de Servicio y Política de Privacidad
      </p>
    </div>
  );
}

export default RegisterPage;
