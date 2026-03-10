import React, { useState } from 'react';
import { FormState, FormErrors, RegisterPageProps } from './types';
import { PersonalInfoStep } from './PersonalInfoStep';
import { ProfessionalInfoStep } from './ProfessionalInfoStep';
import { SecurityStep } from './SecurityStep';
import { useFormValidation } from './useFormValidation';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

function RegisterPage({ onGoToLogin }: RegisterPageProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [senescytFile, setSenescytFile] = useState<File | null>(null);
  const [touched, setTouched] = useState<Set<keyof FormState>>(new Set());
  const [form, setForm] = useState<FormState>({
    fullName: '',
    cedula: '',
    birthDate: '',
    gender: '',
    phone: '',
    specialties: '',
    yearsExperience: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { errors, isStepValid } = useFormValidation(form, step);

  // Marks field as touched and updates state
  const update = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setTouched(prev => {
      const next = new Set(prev);
      next.add(field);
      return next;
    });
  };

  // Only pass errors for fields the user has already interacted with
  const displayErrors: FormErrors = Object.fromEntries(
    Object.entries(errors).filter(([field]) => touched.has(field as keyof FormState))
  );

  const nextStep = () => {
    setTouched(new Set());
    setStep(prev => Math.min(prev + 1, 3));
  };
  const prevStep = () => {
    setTouched(new Set());
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step < 3) {
      nextStep();
      return;
    }

    setIsSubmitting(true);

    try {
      const cvBase64 = cvFile ? await fileToBase64(cvFile) : null;
      const senescytBase64 = senescytFile ? await fileToBase64(senescytFile) : null;

      const registrationPayload = {
        personalInfo: {
          fullName: form.fullName,
          cedula: form.cedula,
          birthDate: form.birthDate,
          gender: form.gender,
          phone: form.phone,
        },
        professionalInfo: {
          specialties: form.specialties,
          yearsExperience: Number(form.yearsExperience),
          documents: {
            cv: cvBase64,
            senescyt: senescytBase64
          }
        },
        security: {
          email: form.email,
          password: form.password,
        },
        metadata: {
          acceptedTerms: acceptTerms,
          registeredAt: new Date().toISOString()
        }
      };

      console.log('📦 Objeto JSON puro listo para enviar a la API:', registrationPayload);
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('¡Registro exitoso revisa la consola!');
      onGoToLogin();

    } catch (error) {
      console.error('❌ Error procesando el registro:', error);
      alert('Ocurrió un error al procesar los archivos. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-8 px-4">

      {/* Botón Volver */}
      <div className="w-full max-w-xl mb-4">
        <button
          onClick={onGoToLogin}
          className="text-green-700 text-sm hover:underline flex items-center gap-1 disabled:opacity-50"
          disabled={isSubmitting}
        >
          ← Volver al inicio
        </button>
      </div>

      {/* Contenedor Principal */}
      <div className="bg-white rounded-2xl shadow-md w-full max-w-xl px-6 md:px-10 py-8">

        {/* Encabezado */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-3 shadow">
            <span className="text-xl">🥗</span>
          </div>
          <h1 className="text-2xl font-bold text-green-700">Crear Cuenta</h1>
          <p className="text-gray-400 text-sm mt-1">Paso {step} de 3</p>
        </div>

        {/* Barra de Progreso */}
        <div className="flex justify-between mb-8 gap-2">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-colors duration-300 ${step >= i ? 'bg-green-500' : 'bg-gray-100'
                }`}
            />
          ))}
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>

          {step === 1 && (
            <PersonalInfoStep form={form} update={update} errors={displayErrors} />
          )}

          {step === 2 && (
            <ProfessionalInfoStep
              form={form}
              update={update}
              cvFile={cvFile}
              setCvFile={setCvFile}
              senescytFile={senescytFile}
              setSenescytFile={setSenescytFile}
            />
          )}

          {step === 3 && (
            <SecurityStep
              form={form}
              update={update}
              acceptTerms={acceptTerms}
              setAcceptTerms={setAcceptTerms}
              errors={displayErrors}
            />
          )}

          {/* Botones de Acción */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                disabled={isSubmitting}
                className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 rounded-xl text-gray-600 font-semibold transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Atrás
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !isStepValid}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-xl transition text-sm shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {isSubmitting
                ? 'Procesando...'
                : (step === 3 ? 'Finalizar Registro' : 'Continuar')}
            </button>
          </div>

        </form>

        {/* Enlace al Login */}
        <div className="text-center mt-6 border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-500">
            ¿Ya tienes una cuenta?{' '}
            <button
              type="button"
              onClick={onGoToLogin}
              disabled={isSubmitting}
              className="text-green-600 font-bold hover:underline bg-transparent border-none cursor-pointer disabled:opacity-50 disabled:hover:no-underline"
            >
              Iniciar sesión
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}

export default RegisterPage;
