import React, { useEffect, useState } from 'react';
import { StepProps } from './types';
import { SectionTitle } from './SectionTitle';
import { InputField } from './InputField';
import { Especialidad } from '../../services/Registrer/Especialidad';
import { RegistrerServices } from '../../services/Registrer/RegisterServices';
  
export interface ProfessionalStepProps extends StepProps {
  cvFile: File | null;
  setCvFile: React.Dispatch<React.SetStateAction<File | null>>;
  senescytFile: File | null;
  setSenescytFile: React.Dispatch<React.SetStateAction<File | null>>;
}

export const ProfessionalInfoStep: React.FC<ProfessionalStepProps> = ({ 
  form, 
  update, 
  cvFile, 
  setCvFile, 
  senescytFile, 
  setSenescytFile 
}) => {

  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);

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


  return (
    <div className="animate-fade-in">

      <SectionTitle>Información Profesional</SectionTitle>

      {/* Especialidades desde backend */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Especialidades
        </label>

        <select
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
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
      </div>

      {/* Años de experiencia */}
      <InputField 
        label="Años de experiencia" 
        field="yearsExperience" 
        type="number" 
        form={form} 
        update={update} 
        placeholder="Ej: 5" 
      />

      <SectionTitle>Documentos Requeridos</SectionTitle>

      {/* Curriculum Vitae */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Curriculum Vitae (PDF)
        </label>

        <label className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-400 bg-white cursor-pointer hover:border-green-400 transition">

          <span className="truncate pr-2">
            {cvFile ? cvFile.name : 'Seleccionar archivo'}
          </span>

          <span className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white text-base flex-shrink-0">
            ＋
          </span>

          <input 
            type="file" 
            accept=".pdf" 
            onChange={e => e.target.files && setCvFile(e.target.files[0])} 
            className="hidden" 
          />

        </label>
      </div>

      {/* Registro Senescyt */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Registro Senescyt (PDF o Imagen)
        </label>

        <label className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-400 bg-white cursor-pointer hover:border-green-400 transition">

          <span className="truncate pr-2">
            {senescytFile ? senescytFile.name : 'Seleccionar archivo'}
          </span>

          <span className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white text-base flex-shrink-0">
            ＋
          </span>

          <input 
            type="file" 
            accept=".pdf,.jpg,.jpeg,.png" 
            onChange={e => e.target.files && setSenescytFile(e.target.files[0])} 
            className="hidden" 
          />

        </label>

        <p className="text-xs text-gray-400 mt-1">
          PDF, JPG o PNG. Máx. 5MB por archivo.
        </p>

      </div>

    </div>
  );
};