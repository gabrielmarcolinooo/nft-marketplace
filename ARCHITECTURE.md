# Arquitetura e Decisões Técnicas - Kurio NFT Marketplace

Este documento detalha as escolhas arquiteturais, contratos de API, estratégias de estado, tempo real e desvios de design adotados no desenvolvimento do Kurio NFT Marketplace.

## 1. Stack e Organização do Projeto
O projeto foi estruturado utilizando a seguinte stack obrigatória:
- **Interface:** React + TypeScript com Vite como bundler.
- **Roteamento:** TanStack Router (com suporte a rotas dinâmicas e proteção de páginas privadas).
- **Gerenciamento de Estado Remoto:** TanStack Query para cache, sincronização e mutações.
- **Cliente HTTP:** Axios para todas as chamadas de API.
- **Mocking (MSW):** Mock Service Worker interceptando requisições REST e simulando o protocolo Socket.IO via `@mswjs/socket.io-binding`.
- **Estilização:** Tailwind CSS combinado com componentes adaptados do shadcn/ui.
- **Qualidade e Testes:** Playwright para testes E2E/regressão visual e Lighthouse para auditorias de performance.

## 2. Estratégia de Cache e Sincronização (TanStack Query)
- **Stale Time & Refetch:** Configurado com *staleTime* moderado para dados estáticos (perfil e carteiras) e revalidação inteligente em mutações do catálogo e do carrinho.
- **Atualizações Otimistas (Optimistic Updates):** Aplicadas nas ações de adicionar/remover favoritos e itens do carrinho. Caso a mutação falle no servidor simulado, o TanStack Query executa um *rollback* automático do cache para manter a consistência visual.
- **Invalidação Cirúrgica:** Após a confirmação bem-sucedida de um pedido (`POST /api/orders`), as queries de carrinho e catálogo são invalidadas para refletir imediatamente a baixa de estoque.

## 3. Tempo Real e Reconciliação (Socket.IO)
A aplicação escuta eventos em tempo real (`nft.updated`, `order.updated`) utilizando o cliente oficial do Socket.IO conectado ao worker do MSW:
- **Injeção de Cache:** Os eventos recebidos atualizam diretamente o cache do TanStack Query (`queryClient.setQueryData`), evitando *refetches* desnecessários de rede.
- **Validação de Versão / Conflito:** Para cumprir a regra de não aceitar cotações desatualizadas, se um evento `nft.updated` alterar o preço de um item presente no carrinho, a aplicação invalida a cotação atual e bloqueia o botão de pagamento até que o usuário revise o novo valor.
- **Ciclo de Vida:** Subscrições e ouvintes de sockets são limpos no encerramento do componente (`useEffect cleanup`) e totalmente desconectados em caso de *logout*, evitando vazamento de dados entre usuários diferentes.

## 4. Política de Sessão
- A autenticação baseia-se em um token simulado armazenado no `localStorage`.
- Um interceptor do Axios monitora respostas `401 Unauthorized`. Caso ocorra expiração da sessão ou logout, o sistema limpa o cache local (`queryClient.clear()`), desconecta as instâncias de socket e redireciona o usuário para a tela de login, preservando o contexto de retorno.

## 5. Contratos da API (Resumo dos Recursos Mocks)
- **Autenticação:** `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/logout`.
- **Catálogo:** `GET /api/nfts` (suporta paginação, ordenação, busca textual e filtros combinados por categoria/preço) e `GET /api/nfts/:id`.
- **Carrinho e Cotação:** `GET /api/cart`, `POST /api/cart`, `DELETE /api/cart/:id` e validação de cupons.
- **Pedidos:** `POST /api/orders` (suporta chave de idempotência no header para evitar cobranças duplicadas em caso de timeout).
- **Perfil e Carteiras:** Endpoints de consulta e mutação de dados do usuário e endereços de carteiras (principal e secundária).

## 6. Decisões de UX, Acessibilidade e Desvios do Figma
- **Foco e Teclado:** Adicionados indicadores visuais de foco (`focus-visible`) em todos os elementos interativos para garantir conformidade com as diretrizes de acessibilidade WCAG (navegação completa por teclado em modais e drawers).
- **Skeletons (Shimmer Effect):** Implementados nas listagens e detalhes para prevenir saltos de layout (*Cumulative Layout Shift - CLS*) durante o carregamento assíncrono.
- **Responsividade Mobile:** O layout adapta-se fluidamente para viewports de 390px, incorporando uma barra de navegação inferior fixa (Bottom Nav), gavetas de filtros deslizantes e cartões empilhados no checkout.
