import React from 'react';

const UnderConstruction: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-sm p-10 max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 mb-6">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8"
          >
            <path d="M3 16.5V21h4.5" />
            <path d="M8 21l10.5-10.5a3 3 0 0 0-4.25-4.25L3.75 16.75A3 3 0 0 0 3 19.5V21z" />
            <path d="M14.5 5.5l4 4" />
            <path d="M9.5 10.5l4 4" />
          </svg>
        </div>

        <h2 className="text-2xl font-semibold text-slate-900 mb-3">Sección en Desarrollo</h2>
        <p className="text-base text-slate-500">
          Estamos trabajando en esta sección para brindarte las mejores herramientas. ¡Estará disponible muy pronto!
        </p>
      </div>
    </div>
  );
};

export default UnderConstruction;
