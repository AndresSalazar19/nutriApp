import React from 'react';
import { Badge } from './Badge';

export type ArticleStatus = 'active' | 'draft';

export interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryColor: string;
  cardBg: string;
  status: ArticleStatus;
  date: string;
}

interface ArticleCardProps {
  article: Article;
  onView?:   (a: Article) => void;
  onEdit?:   (a: Article) => void;
  onDownload?: (a: Article) => void;
  onDelete?: (a: Article) => void;
}

function DocIcon() {
  return (
    <svg className="w-12 h-12 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/>
    </svg>
  );
}

export function ArticleCard({ article, onView, onEdit, onDownload, onDelete }: ArticleCardProps) {
  const isDraft = article.status === 'draft';

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition flex flex-col">

      <div className={`${article.cardBg} h-40 flex flex-col justify-between p-3 relative`}>
        <span className={`self-start ${article.categoryColor} text-white text-xs font-semibold px-2.5 py-1 rounded-full`}>
          {article.category}
        </span>
        <div className="flex items-center justify-center flex-1">
          <DocIcon />
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 text-sm leading-snug mb-1">{article.title}</h3>
        <p className="text-gray-400 text-xs leading-relaxed mb-3 flex-1">{article.description}</p>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
          <span className="text-gray-400 text-xs">{article.date}</span>

          <div className="flex items-center gap-1">
            {onView && (
              <button onClick={() => onView(article)}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                title="Ver">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                </svg>
              </button>
            )}
            {onEdit && (
              <button onClick={() => onEdit(article)}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                title="Editar">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                </svg>
              </button>
            )}
            {onDownload && (
              <button onClick={() => onDownload(article)}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                title="Descargar">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            )}
            <Badge variant={isDraft ? 'inactive' : 'active'} label={isDraft ? 'Borrador' : 'Activo'} />
          </div>
        </div>
      </div>
    </div>
  );
}