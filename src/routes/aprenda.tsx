/* eslint-disable react-refresh/only-export-components */
import { createRoute } from '@tanstack/react-router';
import { KurioArtwork } from '../components/KurioArtwork';
import { rootRoute } from './__root';

type LearnCategory = 'all' | 'iniciante' | 'seguranca' | 'mercado';

interface LearnSearch {
  category: LearnCategory;
}

const categories = [
  ['all', 'Todos'],
  ['iniciante', 'Guias para Iniciantes'],
  ['seguranca', 'Segurança'],
  ['mercado', 'Raridade e Mercado'],
] as const;

const articles = [
  { title: 'Como funciona a propriedade de NFTs', description: 'Aprenda a colecionar, negociar e verificar ativos digitais com confiança.', date: '12 de setembro', time: 'Leitura de 4 min', category: 'iniciante', variant: 2 },
  { title: 'Escolhendo sua primeira carteira', description: 'Compare carteiras e prepare seus primeiros passos no universo Web3.', date: '13 de setembro', time: 'Leitura de 5 min', category: 'iniciante', variant: 0 },
  { title: 'Como proteger sua carteira', description: 'Proteja suas chaves, seus ativos e sua identidade contra golpes comuns.', date: '15 de setembro', time: 'Leitura de 6 min', category: 'seguranca', variant: 3 },
  { title: 'Assinaturas e permissões seguras', description: 'Entenda o que uma assinatura solicita antes de autorizar uma transação.', date: '18 de setembro', time: 'Leitura de 4 min', category: 'seguranca', variant: 1 },
  { title: 'Raridade, atributos e procedência', description: 'Entenda raridade, metadados, procedência e utilidade em uma coleção.', date: '20 de setembro', time: 'Leitura de 5 min', category: 'mercado', variant: 1 },
  { title: 'Como avaliar um criador digital', description: 'Analise histórico, comunidade, contratos e consistência antes de colecionar.', date: '22 de setembro', time: 'Leitura de 5 min', category: 'mercado', variant: 0 },
  { title: 'Ethereum, Polygon ou Solana?', description: 'Conheça taxas, velocidade e diferenças entre as principais redes.', date: '24 de setembro', time: 'Leitura de 7 min', category: 'iniciante', variant: 2 },
  { title: 'Preço, liquidez e tendências', description: 'Leia movimentos do mercado sem abandonar sua estratégia de coleção.', date: '26 de setembro', time: 'Leitura de 6 min', category: 'mercado', variant: 3 },
] as const;

function validateLearnSearch(value: unknown): LearnSearch {
  const params = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const category = categories.some(([key]) => key === params.category) ? params.category as LearnCategory : 'all';
  return { category };
}

function AprendaPage() {
  const filters = aprendaRoute.useSearch();
  const navigate = aprendaRoute.useNavigate();
  const visibleArticles = filters.category === 'all'
    ? articles
    : articles.filter((article) => article.category === filters.category);

  return (
    <>
      <section className="pb-14 pt-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Diário da Cunhagem</p>
        <h1 className="mx-auto mt-4 max-w-3xl text-[clamp(2.25rem,4vw,3.25rem)] font-bold uppercase leading-[1.2] tracking-[-0.045em] text-foreground">Aprenda sobre Web3 e NFTs</h1>
        <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-muted">Guias diretos para colecionar, negociar e proteger sua propriedade digital. Dos primeiros passos à leitura de raridade e mercado.</p>
      </section>

      <section id="artigos">
        <div className="mb-10 flex flex-wrap justify-center gap-x-7 gap-y-3 border-b border-border/70">
          {categories.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => void navigate({ search: { category: key } })}
              className={`border-b-2 pb-3 text-xs font-bold transition ${filters.category === key ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-primary'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {visibleArticles.map((article) => (
            <article key={article.title} className="group flex h-full flex-col overflow-hidden rounded-xl bg-surface">
              <div className="overflow-hidden">
                <KurioArtwork variant={article.variant} label={article.title} className="aspect-square w-full shrink-0 transition duration-500 group-hover:scale-[1.025]" />
              </div>
              <div className="flex h-full flex-1 flex-col justify-between p-5">
                <div>
                  <p className="text-[9px] font-bold text-muted">{article.date} &nbsp;|&nbsp; {article.time}</p>
                  <h2 className="mt-3 text-xs font-bold leading-5 text-foreground">{article.title}</h2>
                  <p className="mt-2 text-[10px] leading-4 text-muted">{article.description}</p>
                </div>
                <a href="#artigos" className="pt-4 text-[10px] font-bold text-primary">Ler mais →</a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export const aprendaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/aprenda',
  validateSearch: validateLearnSearch,
  component: AprendaPage,
});
