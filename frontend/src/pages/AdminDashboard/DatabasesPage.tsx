import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

// Componentes de tu Sistema UI
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AdminTopBar } from '../../components/layout/AdminTopBar';
import { Button } from '../../components/ui/Button';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { FilterTabs } from '../../components/ui/FilterTabs';

// --- INTERFACES ---
interface Food {
  id: string;
  nombre: string;
  categoria: string;
  kcal: number | null;
  proteinas: number | null;
  carbohidratos: number | null;
  grasas: number | null;
}

// --- MOCK DATA INICIAL ---
const initialFoodsMock: Food[] = [
  { id: '1', nombre: 'Leche de vaca, entera', categoria: 'Lácteos', kcal: 62, proteinas: 3.2, carbohidratos: 4.8, grasas: 3.3 },
  { id: '2', nombre: 'Pechuga de pollo, cruda', categoria: 'Carnes', kcal: 110, proteinas: 23.1, carbohidratos: 0, grasas: 1.2 },
  { id: '3', nombre: 'Banano maduro', categoria: 'Frutas', kcal: 89, proteinas: 1.1, carbohidratos: 22.8, grasas: 0.3 },
  { id: '4', nombre: 'Arroz blanco cocido', categoria: 'Cereales', kcal: 130, proteinas: 2.7, carbohidratos: 28.2, grasas: 0.3 },
  { id: '5', nombre: 'Yogur natural', categoria: 'Lácteos', kcal: 62.5, proteinas: 3.3, carbohidratos: 4.6, grasas: 3.3 },
];

// --- COMPONENTE MODAL PARA CREAR / EDITAR ALIMENTO ---
function FoodFormModal({
  onClose,
  onSave,
  initialData
}: {
  onClose: () => void;
  onSave: (food: Partial<Food>) => void;
  initialData?: Food | null;
}) {
  const isEditing = !!initialData;

  // Si hay initialData, llenamos los estados con esos valores (Modo Editar)
  const [nombre, setNombre] = useState(initialData?.nombre || '');
  const [categoria, setCategoria] = useState(initialData?.categoria || 'Lácteos');
  const [kcal, setKcal] = useState(initialData?.kcal?.toString() || '');
  const [proteinas, setProteinas] = useState(initialData?.proteinas?.toString() || '');
  const [carbohidratos, setCarbohidratos] = useState(initialData?.carbohidratos?.toString() || '');
  const [grasas, setGrasas] = useState(initialData?.grasas?.toString() || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialData?.id,
      nombre,
      categoria,
      kcal: kcal === '' ? null : Number(kcal),
      proteinas: proteinas === '' ? null : Number(proteinas),
      carbohidratos: carbohidratos === '' ? null : Number(carbohidratos),
      grasas: grasas === '' ? null : Number(grasas),
    });
  };

  const InputGroup = ({ label, value, onChange, type = "text", placeholder = "" }: any) => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">{label}</label>
      <input
        type={type} step="0.01" value={value} onChange={onChange} placeholder={placeholder} required={type === 'text'}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition"
      />
    </div>
  );

  return (
    <Modal isOpen={true} onClose={onClose} size="md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-gray-800 text-lg leading-tight">
            {isEditing ? 'Editar Alimento' : 'Nuevo Alimento'}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {isEditing ? 'Modifica los valores del alimento seleccionado.' : 'Ingresa los datos por cada 100 gramos.'}
          </p>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm transition">
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputGroup label="Nombre del Alimento" value={nombre} onChange={(e: any) => setNombre(e.target.value)} placeholder="Ej. Manzana verde" />

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Categoría</label>
          <select
            value={categoria} onChange={(e) => setCategoria(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition"
          >
            <option value="Lácteos">Lácteos</option>
            <option value="Carnes">Carnes, pescados y huevos</option>
            <option value="Frutas">Frutas</option>
            <option value="Vegetales">Vegetales</option>
            <option value="Cereales">Cereales y tubérculos</option>
            <option value="Leguminosas">Leguminosas</option>
            <option value="Grasas">Grasas</option>
            <option value="Azúcares">Azúcares</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputGroup label="Kcal" type="number" value={kcal} onChange={(e: any) => setKcal(e.target.value)} placeholder="0.00" />
          <InputGroup label="Proteínas (g)" type="number" value={proteinas} onChange={(e: any) => setProteinas(e.target.value)} placeholder="0.00" />
          <InputGroup label="Carbohidratos (g)" type="number" value={carbohidratos} onChange={(e: any) => setCarbohidratos(e.target.value)} placeholder="0.00" />
          <InputGroup label="Grasas (g)" type="number" value={grasas} onChange={(e: any) => setGrasas(e.target.value)} placeholder="0.00" />
        </div>

        <div className="pt-4 mt-2 border-t border-gray-100 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition">
            Cancelar
          </button>
          <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition">
            {isEditing ? 'Guardar Cambios' : 'Crear Alimento'}
          </button>
        </div>
      </form>
    </Modal>
  );
}


// --- PÁGINA PRINCIPAL ---
export default function DatabasesPage() {
  const [activeNav, setActiveNav] = useState('Bases de Datos');

  // Estados para datos y UI
  const [foods, setFoods] = useState<Food[]>(initialFoodsMock);
  const [activeCategoryTab, setActiveCategoryTab] = useState('Todos');

  // Estado para controlar el Modal (null = cerrado, undefined = crear, Food = editar)
  const [foodToEdit, setFoodToEdit] = useState<Food | null | undefined>(null);

  // Estados para el Excel
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [sqlOutput, setSqlOutput] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- TABS (Categorías dinámicas) ---
  const uniqueCategories = Array.from(new Set(foods.map(f => f.categoria)));
  const TABS = [
    { label: 'Todos', count: foods.length },
    ...uniqueCategories.map(cat => ({
      label: cat,
      count: foods.filter(f => f.categoria === cat).length
    }))
  ];

  const filteredFoods = activeCategoryTab === 'Todos'
    ? foods
    : foods.filter(f => f.categoria === activeCategoryTab);

  // --- LÓGICA DE CRUD MANUAL ---
  const handleSaveFood = (foodData: Partial<Food>) => {
    if (foodData.id) {
      // EDITAR
      setFoods(foods.map(f => f.id === foodData.id ? { ...f, ...foodData } as Food : f));
    } else {
      // CREAR
      const newFood: Food = {
        ...foodData as Food,
        id: Date.now().toString(),
      };
      setFoods([newFood, ...foods]);
    }
    setFoodToEdit(null); // Cierra el modal
  };

  const handleDeleteFood = (id: string, nombre: string) => {
    const confirmDelete = window.confirm(`¿Estás seguro de eliminar "${nombre}"?`);
    if (confirmDelete) {
      setFoods(foods.filter(f => f.id !== id));
    }
  };

  // --- LÓGICA DE EXCEL Y SQL ---
  const formatSqlValue = (value: any, isText: boolean = false) => {
    if (value === null || value === undefined || value === '' || String(value).trim() === '') return 'NULL';
    if (isText) return `'${String(value).replace(/'/g, "''")}'`;
    return Number(value);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadMessage('Procesando archivo maestro...');
    setSqlOutput('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        let allSqlStatements: string[] = [];

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const sheetData = XLSX.utils.sheet_to_json(worksheet, { range: 1, defval: null });

          const sheetSql = sheetData.map((row: any) => {
            if (!row['Alimento']) return null;
            const values = [
              formatSqlValue(row['Alimento'], true), formatSqlValue(sheetName, true), formatSqlValue(row['Kcal']),
              formatSqlValue(row['Carbohidratos']), formatSqlValue(row['Proteínas']), formatSqlValue(row['Grasas']),
              formatSqlValue(row['Calcio (mg)']), formatSqlValue(row['Potasio (mg)']), formatSqlValue(row['Sodio (mg)']),
              formatSqlValue(row['Zinc (mg)']), formatSqlValue(row['vit C (mg)']), formatSqlValue(row['vit A (µg)']),
              formatSqlValue(row['folatos (µg)']), formatSqlValue(row['100 gramos a taza']), formatSqlValue(row['100 gramos a cda']),
              formatSqlValue(row['100 gramos a unidad'])
            ];
            return `INSERT INTO alimentos (nombre, categoria, kcal, carbohidratos, proteinas, grasas, calcio_mg, potasio_mg, sodio_mg, zinc_mg, vit_c_mg, vit_a_ug, folatos_ug, porcion_taza, porcion_cda, porcion_unidad) VALUES (${values.join(', ')});`;
          }).filter(Boolean);
          allSqlStatements = [...allSqlStatements, ...sheetSql.map(s => s as string)];
        });

        setSqlOutput(allSqlStatements.join('\n'));
        setUploadMessage(`¡Éxito! Generados ${allSqlStatements.length} INSERTs.`);
      } catch (err) {
        setUploadMessage('Error al procesar el Excel.');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // --- COLUMNAS DE LA TABLA ---
  const columns: Column<Food>[] = [
    {
      key: 'nombre',
      header: 'Alimento',
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-700 text-xs">{row.nombre}</p>
          <p className="text-[10px] text-gray-400 uppercase font-medium mt-0.5">{row.categoria}</p>
        </div>
      )
    },
    { key: 'kcal', header: 'Kcal', render: (row) => <span className="text-xs font-medium">{row.kcal ?? '-'}</span> },
    { key: 'pro', header: 'Prot (g)', render: (row) => <span className="text-xs">{row.proteinas ?? '-'}</span> },
    { key: 'carb', header: 'Carb (g)', render: (row) => <span className="text-xs">{row.carbohidratos ?? '-'}</span> },
    { key: 'gras', header: 'Grasa (g)', render: (row) => <span className="text-xs">{row.grasas ?? '-'}</span> },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (row) => (
        <div className="flex items-center gap-1">
          {/* Botón Editar */}
          <button
            onClick={() => setFoodToEdit(row)}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition"
            title="Editar alimento"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>

          {/* Botón Eliminar */}
          <button
            onClick={() => handleDeleteFood(row.id, row.nombre)}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition"
            title="Eliminar alimento"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )
    }
  ];

  return (
    <AdminLayout activeNav={activeNav} onNavChange={setActiveNav}>
      <AdminTopBar title="Gestión de Bases de Datos" />

      <div className="px-8 pb-8 pt-4 space-y-6">

        {/* --- SECCIÓN DE CARGA EXCEL --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">Cargar Maestro de Alimentos</h3>
            <div className="relative">
              <input
                type="file" accept=".xls,.xlsx" ref={fileInputRef} className="hidden" id="excel-upload"
                onChange={handleFileUpload} disabled={isUploading}
              />
              <label
                htmlFor="excel-upload"
                className={`w-full flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-xl cursor-pointer transition
                  ${isUploading ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200 hover:bg-red-100'}`}
              >
                <span className="text-3xl mb-2">📊</span>
                <p className="text-xs font-semibold text-red-600">
                  {isUploading ? 'Generando Script...' : 'Subir archivo .xls / .xlsx'}
                </p>
                <p className="text-[10px] text-gray-400 mt-1 text-center px-4">
                  Se detectarán las categorías automáticamente.
                </p>
              </label>
            </div>
            {uploadMessage && (
              <div className={`mt-4 p-3 rounded-lg text-xs font-medium ${uploadMessage.includes('Éxito') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {uploadMessage}
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-xl shadow-sm p-6 flex flex-col h-[230px]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-gray-300 uppercase">Resultado SQL (INSERTs)</h3>
              {sqlOutput && (
                <button
                  onClick={() => { navigator.clipboard.writeText(sqlOutput); alert('Copiado'); }}
                  className="text-[10px] bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                >
                  Copiar Todo
                </button>
              )}
            </div>
            <textarea
              readOnly value={sqlOutput} placeholder="El código SQL aparecerá aquí..."
              className="flex-1 w-full bg-gray-900 text-green-400 font-mono text-[10px] p-3 rounded-lg resize-none focus:ring-0 border-none"
            />
          </div>
        </div>

        {/* --- SECCIÓN DE DATOS (TABLA Y FILTROS) --- */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">

          <div className="flex flex-col gap-4 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800 text-base">Alimentos Registrados</h3>
                <p className="text-xs text-gray-400">Listado actual clasificado por tipo</p>
              </div>
              <Button variant="danger" onClick={() => setFoodToEdit(undefined)}>
                + Nuevo Alimento
              </Button>
            </div>

            <FilterTabs
              tabs={TABS}
              active={activeCategoryTab}
              onChange={(tab) => setActiveCategoryTab(tab)}
              accentColor="red"
            />
          </div>

          <DataTable
            columns={columns}
            data={filteredFoods}
            keyExtractor={(row) => row.id}
            emptyIcon="🥗"
            emptyTitle={`No hay ${activeCategoryTab === 'Todos' ? 'alimentos' : activeCategoryTab.toLowerCase()}`}
            emptyDescription="Aún no hay registros en esta categoría."
          />

        </div>

      </div>

      {/* --- RENDERIZADO DEL MODAL --- */}
      {foodToEdit !== null && (
        <FoodFormModal
          initialData={foodToEdit}
          onClose={() => setFoodToEdit(null)}
          onSave={handleSaveFood}
        />
      )}
    </AdminLayout>
  );
}