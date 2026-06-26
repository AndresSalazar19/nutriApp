import React, { useState } from 'react';
import { MdAttachFile, MdBiotech, MdNotes, MdSave, MdStraighten, MdTune } from 'react-icons/md';
import { Button } from './Button';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SkinfoldData {
  triceps: string;
  subscapular: string;
  suprailiac: string;
  abdominal: string;
  thigh: string;
}

export interface CircumferenceData {
  waist: string;
  hip: string;
  arm: string;
  thigh: string;
  calf: string;
  neck: string;
}

export interface AnthropometricRecord {
  date: string;
  weight: string;
  height: string;
  bioimpedanceFileName: string | null;
  fatPercent: string;
  muscleMass: string;
  skinfolds: SkinfoldData;
  circumferences: CircumferenceData;
  notes: string;
}

interface AnthropometricFormProps {
  patientName: string;
  onCancel: () => void;
  onSave: (record: AnthropometricRecord) => void;
}

// ─── Helpers de UI (siguen el estilo del proyecto) ──────────────────────────────

function Field({
  label,
  value,
  onChange,
  unit,
  placeholder,
  type = 'number',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500 transition bg-white"
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <h4 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
      <span>{icon}</span> {children}
    </h4>
  );
}

// ─── Componente principal ───────────────────────────────────────────────────────

export function AnthropometricForm({ patientName, onCancel, onSave }: AnthropometricFormProps) {
  const today = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(today);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [fatPercent, setFatPercent] = useState('');
  const [muscleMass, setMuscleMass] = useState('');
  const [notes, setNotes] = useState('');
  const [bioFile, setBioFile] = useState<File | null>(null);

  const [skinfolds, setSkinfolds] = useState<SkinfoldData>({
    triceps: '',
    subscapular: '',
    suprailiac: '',
    abdominal: '',
    thigh: '',
  });
  const [circumferences, setCircumferences] = useState<CircumferenceData>({
    waist: '',
    hip: '',
    arm: '',
    thigh: '',
    calf: '',
    neck: '',
  });

  const updateSkinfold = (field: keyof SkinfoldData, value: string) =>
    setSkinfolds((prev) => ({ ...prev, [field]: value }));
  const updateCircumference = (field: keyof CircumferenceData, value: string) =>
    setCircumferences((prev) => ({ ...prev, [field]: value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setBioFile(file);
  };

  const handleSubmit = () => {
    onSave({
      date,
      weight,
      height,
      bioimpedanceFileName: bioFile ? bioFile.name : null,
      fatPercent,
      muscleMass,
      skinfolds,
      circumferences,
      notes,
    });
  };

  return (
    <div className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-2">
      {/* Encabezado contextual */}
      <p className="text-sm text-gray-500">
        Registrando medición para <span className="font-semibold text-gray-700">{patientName}</span>
      </p>

      {/* ── Medidas básicas ── */}
      <div>
        <SectionTitle icon={<MdStraighten className="w-4 h-4" />}>Medidas Básicas</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fecha" value={date} onChange={setDate} type="date" />
          <Field label="Peso" value={weight} onChange={setWeight} unit="kg" placeholder="72.5" />
          <Field label="Estatura" value={height} onChange={setHeight} unit="m" placeholder="1.60" />
        </div>
      </div>

      {/* ── Bioimpedancia ── */}
      <div>
        <SectionTitle icon={<MdBiotech className="w-4 h-4" />}>
          Resultado de Bioimpedancia
        </SectionTitle>
        <div className="bg-gray-50 rounded-xl p-4">
          <label className="flex flex-col items-center justify-center gap-2 cursor-pointer py-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-green-400 transition">
            <MdAttachFile className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-500">
              {bioFile ? bioFile.name : 'Adjuntar archivo (PDF o imagen)'}
            </span>
            <span className="text-xs text-gray-400">Click para seleccionar</span>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <Field
              label="% Grasa"
              value={fatPercent}
              onChange={setFatPercent}
              unit="%"
              placeholder="32"
            />
            <Field
              label="Masa Muscular"
              value={muscleMass}
              onChange={setMuscleMass}
              unit="kg"
              placeholder="45"
            />
          </div>
        </div>
      </div>

      {/* ── Pliegues cutáneos ── */}
      <div>
        <SectionTitle icon={<MdTune className="w-4 h-4" />}>Pliegues Cutáneos</SectionTitle>
        <div className="grid grid-cols-3 gap-3">
          <Field
            label="Tríceps"
            value={skinfolds.triceps}
            onChange={(v) => updateSkinfold('triceps', v)}
            unit="mm"
          />
          <Field
            label="Subescapular"
            value={skinfolds.subscapular}
            onChange={(v) => updateSkinfold('subscapular', v)}
            unit="mm"
          />
          <Field
            label="Suprailíaco"
            value={skinfolds.suprailiac}
            onChange={(v) => updateSkinfold('suprailiac', v)}
            unit="mm"
          />
          <Field
            label="Abdominal"
            value={skinfolds.abdominal}
            onChange={(v) => updateSkinfold('abdominal', v)}
            unit="mm"
          />
          <Field
            label="Muslo"
            value={skinfolds.thigh}
            onChange={(v) => updateSkinfold('thigh', v)}
            unit="mm"
          />
        </div>
      </div>

      {/* ── Circunferencias ── */}
      <div>
        <SectionTitle icon={<MdStraighten className="w-4 h-4" />}>Circunferencias</SectionTitle>
        <div className="grid grid-cols-3 gap-3">
          <Field
            label="Cintura"
            value={circumferences.waist}
            onChange={(v) => updateCircumference('waist', v)}
            unit="cm"
          />
          <Field
            label="Cadera"
            value={circumferences.hip}
            onChange={(v) => updateCircumference('hip', v)}
            unit="cm"
          />
          <Field
            label="Brazo"
            value={circumferences.arm}
            onChange={(v) => updateCircumference('arm', v)}
            unit="cm"
          />
          <Field
            label="Muslo"
            value={circumferences.thigh}
            onChange={(v) => updateCircumference('thigh', v)}
            unit="cm"
          />
          <Field
            label="Pantorrilla"
            value={circumferences.calf}
            onChange={(v) => updateCircumference('calf', v)}
            unit="cm"
          />
          <Field
            label="Cuello"
            value={circumferences.neck}
            onChange={(v) => updateCircumference('neck', v)}
            unit="cm"
          />
        </div>
      </div>

      {/* ── Notas ── */}
      <div>
        <SectionTitle icon={<MdNotes className="w-4 h-4" />}>Notas</SectionTitle>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Observaciones de la medición..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500 transition bg-white resize-none"
        />
      </div>

      {/* ── Acciones ── */}
      <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="primary" icon={<MdSave className="w-4 h-4" />} onClick={handleSubmit}>
          Guardar Medición
        </Button>
      </div>
    </div>
  );
}
