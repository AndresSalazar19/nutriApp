import React, { useEffect, useRef, useState } from 'react';
import { FormErrors, StepProps } from './types';
import { SectionTitle } from './SectionTitle';
import { InputField } from './InputField';
import { Especialidad } from '../../services/Registrer/Especialidad';
import { RegistrerServices } from '../../services/Registrer/RegisterServices';

export interface ProfessionalStepProps extends StepProps {
  cvFile: File | null;
  setCvFile: React.Dispatch<React.SetStateAction<File | null>>;
  senescytFile: File | null;
  setSenescytFile: React.Dispatch<React.SetStateAction<File | null>>;
  errors?: FormErrors;
}

export const ProfessionalInfoStep: React.FC<ProfessionalStepProps> = ({
  form,
  update,
  cvFile,
  setCvFile,
  senescytFile,
  setSenescytFile,
  errors = {},
}) => {

  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [cvFileError, setCvFileError] = useState<string>('');
  const [senescytFileError, setSenescytFileError] = useState<string>('');
  const cvInputRef = useRef<HTMLInputElement>(null);
  const senescytInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const cargarEspecialidades = async () => {
      try {
        const response = await RegistrerServices.consultarEspecialidades();
        if (response.status.isSuccessfully) {
          setEspecialidades(response.data);
        }
      } catch (error) {
        console.error("Error cargando especialidades", error);
      }
    };
    cargarEspecialidades();
  }, []);

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setCvFileError('Solo se aceptan archivos PDF para el Curriculum Vitae.');
      setCvFile(null);
      if (cvInputRef.current) cvInputRef.current.value = '';
      return;
    }

    setCvFileError('');
    setCvFile(file);
  };

  const handleSenescytChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const name = file.name.toLowerCase();
    const validExt = name.endsWith('.pdf') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png');

    if (!validTypes.includes(file.type) && !validExt) {
      setSenescytFileError('Solo se aceptan archivos PDF, JPG o PNG para el Registro Senescyt.');
      setSenescytFile(null);
      if (senescytInputRef.current) senescytInputRef.current.value = '';
      return;
    }

    setSenescytFileError('');
    setSenescytFile(file);
  };

  return (
    <div className="animate-fade-in">

      <SectionTitle>Información Profesional</SectionTitle>

      {/* Especialidades desde backend */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Especialidades <span className="text-red-500">*</span>
        </label>

        <select
          className={`w-full border rounded-lg px-3 py-2.5 text-sm ${errors.specialties ? 'border-red-400' : 'border-gray-200'}`}
          value={form.specialties || ""}
          onChange={e => update("specialties", e.target.value)}
        >
          <option value="">Seleccione una especialidad</option>
          {especialidades.map(e => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>

        {errors.specialties && (
          <p className="text-xs text-red-500 mt-1">{errors.specialties}</p>
        )}
      </div>

      {/* Años de experiencia */}
      <InputField
        label="Años de experiencia"
        field="yearsExperience"
        type="number"
        form={form}
        update={update}
        placeholder="Ej: 5"
        error={errors.yearsExperience}
      />

      <SectionTitle>Documentos Requeridos</SectionTitle>

      {/* Curriculum Vitae */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Curriculum Vitae (PDF) <span className="text-red-500">*</span>
        </label>

        <label className={`flex items-center justify-between border rounded-lg px-3 py-2.5 text-sm text-gray-400 bg-white cursor-pointer hover:border-green-400 transition ${cvFileError ? 'border-red-400' : 'border-gray-200'}`}>
          <span className="truncate pr-2">
            {cvFile ? cvFile.name : 'Seleccionar archivo'}
          </span>
          <span className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white text-base flex-shrink-0">
            ＋
          </span>
          <input
            ref={cvInputRef}
            type="file"
            accept=".pdf"
            onChange={handleCvChange}
            className="hidden"
          />
        </label>

        {cvFileError && (
          <p className="text-xs text-red-500 mt-1">{cvFileError}</p>
        )}
      </div>

      {/* Registro Senescyt */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Registro Senescyt (PDF o Imagen) <span className="text-red-500">*</span>
        </label>

        <label className={`flex items-center justify-between border rounded-lg px-3 py-2.5 text-sm text-gray-400 bg-white cursor-pointer hover:border-green-400 transition ${senescytFileError ? 'border-red-400' : 'border-gray-200'}`}>
          <span className="truncate pr-2">
            {senescytFile ? senescytFile.name : 'Seleccionar archivo'}
          </span>
          <span className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white text-base flex-shrink-0">
            ＋
          </span>
          <input
            ref={senescytInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleSenescytChange}
            className="hidden"
          />
        </label>

        {senescytFileError && (
          <p className="text-xs text-red-500 mt-1">{senescytFileError}</p>
        )}

        <p className="text-xs text-gray-400 mt-1">
          PDF, JPG o PNG. Máx. 5MB por archivo.
        </p>
      </div>

    </div>
  );
};
