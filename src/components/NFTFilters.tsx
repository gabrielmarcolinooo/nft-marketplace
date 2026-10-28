import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { CatalogSearch } from '../routes';

interface NFTFiltersProps {
  filters: CatalogSearch;
  onChange: (updates: Partial<CatalogSearch>) => void;
}

export function NFTFilters({ filters, onChange }: NFTFiltersProps) {
  const [search, setSearch] = useState(filters.search);

  useEffect(() => {
    if (search === filters.search) return;

    const timeout = window.setTimeout(() => {
      onChange({ search: search.trim(), page: 1 });
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [filters.search, onChange, search]);

  return (
    <div className="mb-8 grid gap-3 border border-border bg-surface p-4 md:grid-cols-[minmax(240px,1fr)_200px_220px]">
      <label className="relative">
        <span className="sr-only">Buscar no catálogo</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por título ou descrição"
          className="h-11 w-full border border-border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </label>

      <label>
        <span className="sr-only">Categoria</span>
        <select
          value={filters.category}
          onChange={(event) => onChange({ category: event.target.value, page: 1 })}
          className="h-11 w-full border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="all">Todas as categorias</option>
          <option value="Arte">Arte</option>
          <option value="Colecionáveis">Colecionáveis</option>
          <option value="Fotografia">Fotografia</option>
          <option value="Música">Música</option>
        </select>
      </label>

      <label>
        <span className="sr-only">Ordenar NFTs</span>
        <select
          value={filters.sort}
          onChange={(event) => onChange({ sort: event.target.value as CatalogSearch['sort'], page: 1 })}
          className="h-11 w-full border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="price-asc">Menor preço</option>
          <option value="price-desc">Maior preço</option>
          <option value="title-asc">Título: A–Z</option>
          <option value="title-desc">Título: Z–A</option>
        </select>
      </label>
    </div>
  );
}

export default NFTFilters;
