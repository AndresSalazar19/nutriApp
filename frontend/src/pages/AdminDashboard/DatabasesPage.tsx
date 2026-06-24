import React, { useState, useEffect } from 'react';

// Componentes de tu Sistema UI
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AdminTopBar } from '../../components/layout/AdminTopBar';
import { Button } from '../../components/ui/Button';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { SearchInput } from '../../components/ui/SearchInput';

// Importamos el servicio real de composición y sus tipos
import {
  FoodCompositionService,
  FoodComposition,
  FoodCompositionPayload,
} from '../../services/DataBases/FoodCompositionService';

// ==========================================
// CONFIGURACIÓN
// ==========================================
const CATEGORIAS = [
  'Azúcares',
  'Carnes, pescados y huevos',
  'Cereales, tubérculos y plátanos',
  'Frutas',
  'Grasas',
  'Leguminosas',
  'Lácteos',
  'Vegetales',
];

const ITEMS_PER_PAGE = 10;

// ==========================================
// UTILITARIOS
// ==========================================

const InputGroup = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = true,
}: any) => (
  <div>
    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
      {label}
    </label>
    <input
      type={type}
      step="0.01"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required && type === 'text'}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-admin-medium focus:ring-1 focus:ring-admin-medium outline-none transition"
    />
  </div>
);

// ==========================================
// COMPONENTE: MODAL DE FORMULARIO
// ==========================================

function FoodFormModal({
  onClose,
  onSave,
  initialData,
  isSaving,
}: {
  onClose: () => void;
  onSave: (f: Partial<FoodComposition>) => void;
  initialData?: FoodComposition | null;
  isSaving?: boolean;
}) {
  const [f, setF] = useState({
    name: initialData?.name || '',
    category: initialData?.category || CATEGORIAS[0],
    calories_kcal: initialData?.calories_kcal?.toString() || '',
    protein_g: initialData?.protein_g?.toString() || '',
    carbs_g: initialData?.carbs_g?.toString() || '',
    fat_g: initialData?.fat_g?.toString() || '',
  });

  return (
    <Modal isOpen={true} onClose={isSaving ? () => {} : onClose} size="md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-800">
          {initialData ? 'Editar Composición' : 'Nueva Composición (100g)'}
        </h3>
        {!isSaving && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            ×
          </button>
        )}
      </div>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSave({
            ...f,
            id: initialData?.id,
            calories_kcal: f.calories_kcal ? Number(f.calories_kcal) : null,
            protein_g: f.protein_g ? Number(f.protein_g) : null,
            carbs_g: f.carbs_g ? Number(f.carbs_g) : null,
            fat_g: f.fat_g ? Number(f.fat_g) : null,
          });
        }}
      >
        <InputGroup
          label="Nombre del Alimento"
          value={f.name}
          onChange={(e: any) => setF({ ...f, name: e.target.value })}
        />
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Categoría
          </label>
          <select
            value={f.category}
            onChange={(e: any) => setF({ ...f, category: e.target.value })}
            disabled={isSaving}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-admin-medium disabled:bg-gray-50"
          >
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputGroup
            label="Kcal"
            type="number"
            required={false}
            value={f.calories_kcal}
            onChange={(e: any) => setF({ ...f, calories_kcal: e.target.value })}
          />
          <InputGroup
            label="Proteína (g)"
            type="number"
            required={false}
            value={f.protein_g}
            onChange={(e: any) => setF({ ...f, protein_g: e.target.value })}
          />
          <InputGroup
            label="Carbohidratos (g)"
            type="number"
            required={false}
            value={f.carbs_g}
            onChange={(e: any) => setF({ ...f, carbs_g: e.target.value })}
          />
          <InputGroup
            label="Grasa (g)"
            type="number"
            required={false}
            value={f.fat_g}
            onChange={(e: any) => setF({ ...f, fat_g: e.target.value })}
          />
        </div>
        <div className="pt-4 flex justify-end gap-2">
          <Button variant="ghost" type="button" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button variant="danger" type="submit" disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ==========================================
// PÁGINA PRINCIPAL
// ==========================================

export default function DatabasesPage() {
  const [activeNav, setActiveNav] = useState('Bases de Datos');

  // Estados de Datos
  const [foods, setFoods] = useState<FoodComposition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [foodToEdit, setFoodToEdit] = useState<FoodComposition | null | undefined>(null);

  // Estados de Filtros y Paginación
  const [activeTab, setActiveTab] = useState('Todos');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // FETCH INICIAL
  useEffect(() => {
    setIsLoading(true);
    FoodCompositionService.getAll()
      .then((data) => setFoods(data))
      .catch((err) => console.error('Error al cargar alimentos:', err))
      .finally(() => setIsLoading(false));
  }, []);

  // --- LÓGICA DE FILTRADO ---
  const uniqueCategories = Array.from(new Set(foods.map((f) => f.category)));
  const TABS = [
    { label: 'Todos', count: foods.length },
    ...uniqueCategories.map((c) => ({
      label: c,
      count: foods.filter((f) => f.category === c).length,
    })),
  ];

  const filteredFoods = foods.filter((f) => {
    const matchesTab = activeTab === 'Todos' ? true : f.category === activeTab;
    const matchesSearch = search === '' || f.name.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // --- LÓGICA DE PAGINACIÓN ---
  const totalPages = Math.max(1, Math.ceil(filteredFoods.length / ITEMS_PER_PAGE));
  const paginatedFoods = filteredFoods.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Funciones de Manejo de Estado
  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setCurrentPage(1); // Resetear a la página 1 al cambiar categoría
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1); // Resetear a la página 1 al escribir
  };

  // GUARDAR / ACTUALIZAR EN LA API
  const handleSave = async (data: Partial<FoodComposition>) => {
    setIsSaving(true);
    try {
      if (data.id) {
        const updatedFood = await FoodCompositionService.update(
          data.id,
          data as FoodCompositionPayload,
        );
        setFoods(foods.map((f) => (f.id === data.id ? updatedFood : f)));
      } else {
        const newFood = await FoodCompositionService.create(data as FoodCompositionPayload);
        setFoods([newFood, ...foods]);
      }
      setFoodToEdit(null);
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('No se pudo guardar. Revisa la consola.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar "${name}"?`)) {
      try {
        await FoodCompositionService.delete(id);
        setFoods(foods.filter((f) => f.id !== id));
      } catch (error) {
        alert('Error al eliminar el alimento.');
      }
    }
  };

  const columns: Column<FoodComposition>[] = [
    {
      key: 'name',
      header: 'Alimento',
      render: (row) => (
        <div>
          <p className="font-bold text-xs text-gray-900">{row.name}</p>
          <p className="text-[10px] text-gray-500">{row.category}</p>
        </div>
      ),
    },
    {
      key: 'kcal',
      header: 'Kcal',
      render: (r) => <span className="text-xs">{r.calories_kcal ?? '-'}</span>,
    },
    {
      key: 'pro',
      header: 'Proteína',
      render: (r) => <span className="text-xs">{r.protein_g ?? '-'}g</span>,
    },
    {
      key: 'carb',
      header: 'Carbs',
      render: (r) => <span className="text-xs">{r.carbs_g ?? '-'}g</span>,
    },
    {
      key: 'gras',
      header: 'Grasa',
      render: (r) => <span className="text-xs">{r.fat_g ?? '-'}g</span>,
    },
    {
      key: 'acc',
      header: 'Acciones',
      render: (r) => (
        <div className="flex gap-1">
          <button
            onClick={() => setFoodToEdit(r)}
            className="p-1.5 text-gray-500 hover:text-admin-dark hover:bg-admin-light rounded transition"
            title="Editar"
          >
            ✎
          </button>
          <button
            onClick={() => handleDelete(r.id, r.name)}
            className="p-1.5 text-admin-accent hover:text-admin-dark hover:bg-admin-light rounded transition"
            title="Eliminar"
          >
            🗑
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout activeNav={activeNav} onNavChange={setActiveNav}>
      <AdminTopBar title="Base de Datos Nutricional" />

      <div className="px-8 pb-8 pt-6 space-y-6 bg-admin-bg">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
              Composición de Alimentos (100g)
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Datos nutricionales base consumidos desde tu API.
            </p>
          </div>
          <Button variant="danger" onClick={() => setFoodToEdit(undefined)}>
            + Nuevo Alimento
          </Button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 min-h-[400px]">
          {/* Barra de Búsqueda y Filtros con SELECT */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <SearchInput
                placeholder="Buscar por alimento..."
                value={search}
                onChange={handleSearchChange}
                className="w-full md:w-72"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <label className="text-sm text-gray-500 font-medium whitespace-nowrap">
                Categoría:
              </label>
              <select
                value={activeTab}
                onChange={(e) => handleTabChange(e.target.value)}
                className="w-full md:w-auto border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-admin-medium bg-white shadow-sm cursor-pointer"
              >
                {TABS.map((tab) => (
                  <option key={tab.label} value={tab.label}>
                    {tab.label} ({tab.count})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabla de Datos */}
          <div className="mt-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <div className="w-8 h-8 border-4 border-admin-accent border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-sm">Cargando alimentos desde el servidor...</p>
              </div>
            ) : (
              <>
                <DataTable
                  columns={columns}
                  data={paginatedFoods}
                  keyExtractor={(r) => r.id}
                  emptyIcon="🥗"
                  emptyTitle="Sin resultados"
                  emptyDescription={
                    search
                      ? `No se encontraron alimentos que coincidan con "${search}".`
                      : `No hay alimentos en la categoría "${activeTab}".`
                  }
                />

                {/* Controles de Paginación con SELECT */}
                {filteredFoods.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between mt-5 pt-4 border-t border-gray-50 gap-4">
                    <p className="text-xs text-gray-500">
                      Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{' '}
                      {Math.min(currentPage * ITEMS_PER_PAGE, filteredFoods.length)} de{' '}
                      {filteredFoods.length} alimentos
                    </p>

                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-500 font-medium">Ir a la página:</label>
                      <select
                        value={currentPage}
                        onChange={(e) => setCurrentPage(Number(e.target.value))}
                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-admin-medium bg-white shadow-sm cursor-pointer"
                      >
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <option key={page} value={page}>
                            Página {page} de {totalPages}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {foodToEdit !== null && (
        <FoodFormModal
          initialData={foodToEdit}
          onClose={() => setFoodToEdit(null)}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}
    </AdminLayout>
  );
}
