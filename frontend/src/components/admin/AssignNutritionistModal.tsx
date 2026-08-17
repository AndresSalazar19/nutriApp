import React, { useState, useEffect } from 'react';
import { NutritionistService, NutritionistProfile } from '../../services/NutritionistService';
import { PatientNutritionistService } from '../../services/PatientNutritionist/patientNutritionistService';
import { Spinner } from '../ui/Spinner';

interface Props {
  patientId: string;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AssignNutritionistModal({
  patientId,
  patientName,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [nutritionists, setNutritionists] = useState<NutritionistProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      NutritionistService.getAll('verified') // Solo traemos los verificados
        .then(setNutritionists)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleAssign = async (nutritionistId: string) => {
    setIsAssigning(true);
    try {
      await PatientNutritionistService.create({
        patient_id: patientId,
        nutritionist_id: nutritionistId,
      });
      onSuccess();
      onClose();
    } catch (err) {
      alert('Error al asignar nutricionista');
    } finally {
      setIsAssigning(false);
    }
  };

  if (!isOpen) return null;

  const filtered = nutritionists.filter((n) =>
    n.user.person.first_name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center gap-3">
            <h3 className="font-bold text-lg leading-tight">Asignar a {patientName}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
          <input
            className="w-full mt-4 p-2 border rounded-lg text-sm"
            placeholder="Buscar nutricionista..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="max-h-60 overflow-y-auto p-2">
          {loading ? (
            <Spinner size="sm" />
          ) : (
            filtered.map((nutri) => (
              <button
                key={nutri.id}
                onClick={() => handleAssign(nutri.user.id)}
                disabled={isAssigning}
                className="w-full text-left p-3 hover:bg-gray-50 rounded-lg flex items-center gap-3 transition"
              >
                <div className="w-8 h-8 rounded-full bg-admin-light flex items-center justify-center text-xs font-bold">
                  {nutri.user.person.first_name[0]}
                  {nutri.user.person.last_name[0]}
                </div>
                <span className="text-sm font-medium">
                  {nutri.user.person.first_name} {nutri.user.person.last_name}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
