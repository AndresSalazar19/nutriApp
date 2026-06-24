import React from 'react';

export type ArticleStatus = 'active' | 'draft';

export interface Article {
  id: string;
  title: string;
  body: string;
  description: string;
  category: string;
  categoryColor: string;
  cardBg: string;
  status: ArticleStatus;
  date: string;
  is_approved: boolean;
  is_published: boolean;
}

interface ArticleCardProps {
  article: Article;
  onView?: (a: Article) => void;
  onApprove?: (a: Article) => void;
  onDelete?: (a: Article) => void;
}

function DocIcon() {
  return (
    <svg className="w-10 h-10 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
    </svg>
  );
}

export function ArticleCard({ article, onView, onApprove, onDelete }: ArticleCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition flex flex-col">
      {/* Cabecera de color */}
      <div className={`${article.cardBg} h-32 flex flex-col justify-between p-3`}>
        <span
          className={`self-start ${article.categoryColor} text-xs font-semibold px-2.5 py-1 rounded-full`}
        >
          {article.category}
        </span>
        <div className="flex items-center justify-center flex-1">
          <DocIcon />
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 text-sm leading-snug mb-1 line-clamp-2">
          {article.title}
        </h3>
        <p className="text-gray-500 text-xs leading-relaxed mb-3 flex-1 line-clamp-2">
          {article.description}
        </p>

        <span className="text-gray-500 text-xs mb-3">{article.date}</span>

        {/* Acciones */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
          {/* Ver — siempre presente */}
          {onView && (
            <button
              onClick={() => onView(article)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-lg transition"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
              Ver
            </button>
          )}

          {/* Pendiente → Aprobar */}
          {!article.is_approved && onApprove && (
            <button
              onClick={() => onApprove(article)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-nutri-dark hover:bg-nutri-light border border-nutri-medium rounded-lg transition"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Aprobar
            </button>
          )}

          {/* Aprobado → Eliminar */}
          {article.is_approved && onDelete && (
            <button
              onClick={() => onDelete(article)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-admin-accent hover:bg-admin-light border border-admin-medium rounded-lg transition"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
