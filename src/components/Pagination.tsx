import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const visiblePageCount = Math.min(4, totalPages);
  const firstVisiblePage = Math.min(
    Math.max(page - 1, 1),
    totalPages - visiblePageCount + 1,
  );
  const visiblePages = Array.from(
    { length: visiblePageCount },
    (_, index) => firstVisiblePage + index,
  );

  return (
    <nav className="mt-10 flex items-center justify-end gap-2" aria-label="Paginação do catálogo">
      {page > 1 && (
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          aria-label="Página anterior"
          className="grid size-8 place-items-center rounded-[3px] border border-border bg-surface text-muted transition hover:border-primary hover:text-primary"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>
      )}

      {visiblePages.map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          onClick={() => onPageChange(pageNumber)}
          aria-label={`Ir para a página ${pageNumber}`}
          aria-current={pageNumber === page ? 'page' : undefined}
          className={`grid size-8 place-items-center rounded-[3px] border text-xs font-bold transition ${
            pageNumber === page
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-surface text-muted hover:border-primary hover:text-primary'
          }`}
        >
          {pageNumber}
        </button>
      ))}

      {page < totalPages && (
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          aria-label="Próxima página"
          className="grid size-8 place-items-center rounded-[3px] border border-border bg-surface text-muted transition hover:border-primary hover:text-primary"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      )}
    </nav>
  );
}

export default Pagination;
