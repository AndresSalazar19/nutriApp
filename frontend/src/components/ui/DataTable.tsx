import React from 'react';
import { EmptyState } from './EmptyState';
import { Spinner } from './Spinner';

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
            <tr>
              <td colSpan={columns.length} className="py-20 text-center">
                <Spinner color="text-nutri-admin" text="Cargando registros..." />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
              </td>
            </tr>
          ) : (
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
