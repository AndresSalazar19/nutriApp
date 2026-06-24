import React from 'react';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyIcon?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  isLoading?: boolean;
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-gray-50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-3 px-4">
          <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyIcon = '📭',
  emptyTitle = 'No hay datos',
  emptyDescription = 'No se encontraron resultados para esta búsqueda.',
  isLoading = false,
}: DataTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        {/* Encabezados */}
        <thead>
          <tr className="text-gray-400 text-xs uppercase border-b border-gray-100">
            {columns.map((col) => (
              <th key={col.key} className={`text-left pb-3 px-4 font-semibold ${col.width ?? ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Cuerpo */}
        <tbody>
          {isLoading ? (
            // Skeletons de carga
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={columns.length} />)
          ) : data.length === 0 ? (
            // Estado vacío
            <tr>
              <td colSpan={columns.length}>
                <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
              </td>
            </tr>
          ) : (
            // Filas de datos
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition"
              >
                {columns.map((col) => (
                  <td key={col.key} className="py-3 px-4">
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
