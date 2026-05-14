import React, { useState } from 'react';

// Componentes de tu Sistema UI
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AdminTopBar } from '../../components/layout/AdminTopBar';
import { Button } from '../../components/ui/Button';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { FilterTabs } from '../../components/ui/FilterTabs';

// ==========================================
// 1. INTERFACES Y MOCKS
// ==========================================

interface Food {
  id: string;
  nombre: string;
  categoria: string;
  kcal: number | null;
  proteinas: number | null;
  carbohidratos: number | null;
  grasas: number | null;
}

interface FoodExchange {
  id: string;
  nombre: string;
  categoria: string;
  subcategoria: string;
  peso_neto_g: number | null;
  medida_casera: string;
  kcal: number | null;
  carbohidratos: number | null;
  proteinas: number | null;
  grasas: number | null;
}

const initialFoodsMock: Food[] = [
  { id: '1', nombre: 'Leche de vaca, entera', categoria: 'Lácteos', kcal: 62, proteinas: 3.2, carbohidratos: 4.8, grasas: 3.3 },
  { id: '2', nombre: 'Pechuga de pollo', categoria: 'Carnes', kcal: 110, proteinas: 23.1, carbohidratos: 0, grasas: 1.2 },
  { id: '3', nombre: 'Huevo de gallina', categoria: 'Carnes', kcal: 143, proteinas: 12.6, carbohidratos: 0.7, grasas: 9.5 },
];

const initialExchangeMock: FoodExchange[] = [
  { id: '1', nombre: 'Babaco, sin cáscara', categoria: 'Frutas', subcategoria: 'Bajas en carbohidratos', peso_neto_g: 200, medida_casera: '1 taza llena', kcal: 50, carbohidratos: 10, proteinas: 1, grasas: 0 },
  { id: '2', nombre: 'Mora', categoria: 'Frutas', subcategoria: 'Bajas en carbohidratos', peso_neto_g: 90, medida_casera: '¾ de taza', kcal: 50, carbohidratos: 10, proteinas: 1, grasas: 0 },
  { id: '3', nombre: 'Arroz blanco cocido', categoria: 'Cereales', subcategoria: 'Altos en carbohidratos y bajos en grasas', peso_neto_g: 110, medida_casera: '3/4 de taza', kcal: 150, carbohidratos: 30, proteinas: 4, grasas: 1 },
];

const InputGroup = ({ label, value, onChange, type = "text", placeholder = "" }: any) => (
  <div>
    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</label>
    <input 
      type={type} step="0.01" value={value} onChange={onChange} placeholder={placeholder} required={type === 'text'}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition"
    />
  </div>
);

// ==========================================
// 2. MÓDULO: COMPOSICIÓN (100g)
// ==========================================

function FoodFormModal({ onClose, onSave, initialData }: { onClose: () => void; onSave: (f: Partial<Food>) => void; initialData?: Food | null }) {
  const [f, setF] = useState({
    nombre: initialData?.nombre || '',
    categoria: initialData?.categoria || 'Lácteos',
    kcal: initialData?.kcal?.toString() || '',
    pro: initialData?.proteinas?.toString() || '',
    carb: initialData?.carbohidratos?.toString() || '',
    gras: initialData?.grasas?.toString() || ''
  });

  return (
    <Modal isOpen={true} onClose={onClose} size="md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-800">{initialData ? 'Editar Composición' : 'Nueva Composición (100g)'}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
      </div>
      <form className="space-y-4" onSubmit={(e) => {
        e.preventDefault();
        onSave({ ...f, id: initialData?.id, kcal: Number(f.kcal), proteinas: Number(f.pro), carbohidratos: Number(f.carb), grasas: Number(f.gras) } as any);
      }}>
        <InputGroup label="Nombre del Alimento" value={f.nombre} onChange={(e:any)=>setF({...f, nombre: e.target.value})} />
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Categoría</label>
          <select value={f.categoria} onChange={(e:any)=>setF({...f, categoria: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-red-500">
            {['Lácteos', 'Carnes', 'Frutas', 'Vegetales', 'Cereales', 'Leguminosas', 'Grasas', 'Azúcares'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputGroup label="Kcal" type="number" value={f.kcal} onChange={(e:any)=>setF({...f, kcal: e.target.value})} />
          <InputGroup label="Proteína" type="number" value={f.pro} onChange={(e:any)=>setF({...f, pro: e.target.value})} />
          <InputGroup label="Carbs" type="number" value={f.carb} onChange={(e:any)=>setF({...f, carb: e.target.value})} />
          <InputGroup label="Grasa" type="number" value={f.gras} onChange={(e:any)=>setF({...f, gras: e.target.value})} />
        </div>
        <div className="pt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="danger" type="submit">Guardar</Button>
        </div>
      </form>
    </Modal>
  );
}

function ComposicionModule() {
  const [foods, setFoods] = useState<Food[]>(initialFoodsMock);
  const [activeTab, setActiveTab] = useState('Todos');
  const [foodToEdit, setFoodToEdit] = useState<Food | null | undefined>(null);

  const TABS = [{ label: 'Todos', count: foods.length }, ...Array.from(new Set(foods.map(f => f.categoria))).map(c => ({ label: c, count: foods.filter(f => f.categoria === c).length }))];
  
  const handleSave = (data: Partial<Food>) => {
    if (data.id) setFoods(foods.map(f => f.id === data.id ? { ...f, ...data } as Food : f));
    else setFoods([{ ...data, id: Date.now().toString() } as Food, ...foods]);
    setFoodToEdit(null);
  };

  const columns: Column<Food>[] = [
    { key: 'nombre', header: 'Alimento', render: (row) => <div><p className="font-bold text-xs">{row.nombre}</p><p className="text-[10px] text-gray-400">{row.categoria}</p></div> },
    { key: 'kcal', header: 'Kcal', render: (r) => <span className="text-xs">{r.kcal}</span> },
    { key: 'pro', header: 'P', render: (r) => <span className="text-xs">{r.proteinas}g</span> },
    { key: 'carb', header: 'C', render: (r) => <span className="text-xs">{r.carbohidratos}g</span> },
    { key: 'acc', header: 'Acciones', render: (r) => (
      <div className="flex gap-1">
        <button onClick={()=>setFoodToEdit(r)} className="p-1 text-blue-500 hover:bg-blue-50 rounded">✎</button>
        <button onClick={()=>setFoods(foods.filter(f=>f.id!==r.id))} className="p-1 text-red-500 hover:bg-red-50 rounded">🗑</button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
        <div>
          <h3 className="text-xs font-bold uppercase">Base de Composición (100g)</h3>
          <p className="text-xs text-gray-400">Datos nutricionales para cálculos matemáticos precisos.</p>
        </div>
        <Button variant="danger"  onClick={() => setFoodToEdit(undefined)}>+ Nuevo Registro</Button>
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <FilterTabs tabs={TABS} active={activeTab} onChange={setActiveTab} accentColor="red" />
        <div className="mt-4"><DataTable columns={columns} data={activeTab === 'Todos' ? foods : foods.filter(f=>f.categoria===activeTab)} keyExtractor={r => r.id} /></div>
      </div>
      {foodToEdit !== null && <FoodFormModal initialData={foodToEdit} onClose={()=>setFoodToEdit(null)} onSave={handleSave} />}
    </div>
  );
}

// ==========================================
// 3. MÓDULO: INTERCAMBIOS (PORCIONES)
// ==========================================

const SUBCATEGORIAS = [
  "Bajas en carbohidratos", "Medias en carbohidratos", "Deshidratadas",
  "Altos en carbohidratos y bajos en grasas", "Medios en carbohidratos y bajos en grasas", "Medios en carbohidratos y medios en grasas",
  "Enteros - altos en grasas", "Semidescremados - medios en grasas", "Descremados - bajos en grasas", "Quesos",
  "Bajos en grasas", "Medios en grasas", "Altos en grasas", "Embutidos",
  "Libre consumo", "Azúcares y alimentos azucarados"
];

function ExchangeFormModal({ onClose, onSave, initialData }: { onClose: () => void; onSave: (f: Partial<FoodExchange>) => void; initialData?: FoodExchange | null }) {
  const [f, setF] = useState({
    nombre: initialData?.nombre || '',
    categoria: initialData?.categoria || 'Frutas',
    sub: initialData?.subcategoria || SUBCATEGORIAS[0],
    peso: initialData?.peso_neto_g?.toString() || '',
    medida: initialData?.medida_casera || '',
    kcal: initialData?.kcal?.toString() || '',
    pro: initialData?.proteinas?.toString() || '',
    carb: initialData?.carbohidratos?.toString() || '',
    gras: initialData?.grasas?.toString() || ''
  });

  return (
    <Modal isOpen={true} onClose={onClose} size="md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-800">{initialData ? 'Editar Intercambio' : 'Nuevo Intercambio'}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
      </div>
      <form className="space-y-4" onSubmit={(e) => {
        e.preventDefault();
        onSave({ ...f, id: initialData?.id, subcategoria: f.sub, peso_neto_g: Number(f.peso), kcal: Number(f.kcal), proteinas: Number(f.pro), carbohidratos: Number(f.carb), grasas: Number(f.gras) } as any);
      }}>
        <InputGroup label="Nombre del Alimento" value={f.nombre} onChange={(e:any)=>setF({...f, nombre: e.target.value})} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Categoría</label>
            <select value={f.categoria} onChange={(e:any)=>setF({...f, categoria: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-red-500">
              {['Frutas', 'Vegetales', 'Cereales', 'Lácteos', 'Carnes', 'Grasas', 'Azúcares'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Subcategoría</label>
            <select value={f.sub} onChange={(e:any)=>setF({...f, sub: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-red-500">
              {SUBCATEGORIAS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputGroup label="Peso (g)" type="number" value={f.peso} onChange={(e:any)=>setF({...f, peso: e.target.value})} />
          <InputGroup label="Medida Casera" value={f.medida} onChange={(e:any)=>setF({...f, medida: e.target.value})} placeholder="Ej. 1 unidad mediana" />
        </div>
        <div className="grid grid-cols-4 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
          <InputGroup label="Kcal" type="number" value={f.kcal} onChange={(e:any)=>setF({...f, kcal: e.target.value})} />
          <InputGroup label="C" type="number" value={f.carb} onChange={(e:any)=>setF({...f, carb: e.target.value})} />
          <InputGroup label="P" type="number" value={f.pro} onChange={(e:any)=>setF({...f, pro: e.target.value})} />
          <InputGroup label="G" type="number" value={f.gras} onChange={(e:any)=>setF({...f, gras: e.target.value})} />
        </div>
        <div className="pt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="danger" type="submit">Guardar Intercambio</Button>
        </div>
      </form>
    </Modal>
  );
}

function IntercambioModule() {
  const [foods, setFoods] = useState<FoodExchange[]>(initialExchangeMock);
  const [activeTab, setActiveTab] = useState('Todos');
  const [exchangeToEdit, setExchangeToEdit] = useState<FoodExchange | null | undefined>(null);

  const TABS = [{ label: 'Todos', count: foods.length }, ...Array.from(new Set(foods.map(f => f.categoria))).map(c => ({ label: c, count: foods.filter(f => f.categoria === c).length }))];

  const handleSave = (data: Partial<FoodExchange>) => {
    if (data.id) setFoods(foods.map(f => f.id === data.id ? { ...f, ...data } as FoodExchange : f));
    else setFoods([{ ...data, id: Date.now().toString() } as FoodExchange, ...foods]);
    setExchangeToEdit(null);
  };

  const columns: Column<FoodExchange>[] = [
    { key: 'nom', header: 'Alimento', render: (r) => <div><p className="font-bold text-xs">{r.nombre}</p><p className="text-[10px] text-gray-400 font-medium">{r.subcategoria}</p></div> },
    { key: 'por', header: 'Equivalencia', render: (r) => <span className="text-xs font-bold text-red-600">{r.peso_neto_g}g ({r.medida_casera})</span> },
    { key: 'mac', header: 'Macros Porción', render: (r) => <span className="text-[10px] bg-gray-50 p-1 rounded text-gray-500 font-bold">{r.kcal}Kcal | {r.carbohidratos}C | {r.proteinas}P</span> },
    { key: 'acc', header: 'Acciones', render: (r) => (
      <div className="flex gap-1">
        <button onClick={()=>setExchangeToEdit(r)} className="p-1 text-blue-500 hover:bg-blue-50 rounded">✎</button>
        <button onClick={()=>setFoods(foods.filter(f=>f.id!==r.id))} className="p-1 text-red-500 hover:bg-red-50 rounded">🗑</button>
      </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
        <div>
          <h3 className="text-xs font-bold uppercase">Lista de Intercambios (Porciones)</h3>
          <p className="text-xs text-gray-400">Define qué alimentos reemplazan a otros por porción.</p>
        </div>
        <Button variant="danger" onClick={() => setExchangeToEdit(undefined)}>+ Nuevo Intercambio</Button>
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <FilterTabs tabs={TABS} active={activeTab} onChange={setActiveTab} accentColor="red" />
        <div className="mt-4"><DataTable columns={columns} data={activeTab === 'Todos' ? foods : foods.filter(f=>f.categoria===activeTab)} keyExtractor={r => r.id} /></div>
      </div>
      {exchangeToEdit !== null && <ExchangeFormModal initialData={exchangeToEdit} onClose={()=>setExchangeToEdit(null)} onSave={handleSave} />}
    </div>
  );
}

// ==========================================
// 4. PÁGINA PRINCIPAL
// ==========================================

export default function DatabasesPage() {
  const [activeNav, setActiveNav] = useState('Bases de Datos');
  const [mode, setMode] = useState<'composicion' | 'intercambio'>('composicion');

  return (
    <AdminLayout activeNav={activeNav} onNavChange={setActiveNav}>
      <AdminTopBar title="Gestión de Bases de Datos" />
      <div className="px-8 pb-8 pt-4">
        <div className="flex items-center gap-4 mb-6 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 inline-flex">
          <button onClick={() => setMode('composicion')} className={`px-4 py-2 rounded-lg text-xs font-bold transition ${mode === 'composicion' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>🍎 Composición (100g)</button>
          <button onClick={() => setMode('intercambio')} className={`px-4 py-2 rounded-lg text-xs font-bold transition ${mode === 'intercambio' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>⚖️ Intercambios</button>
        </div>
        {mode === 'composicion' ? <ComposicionModule /> : <IntercambioModule />}
      </div>
    </AdminLayout>
  );
}