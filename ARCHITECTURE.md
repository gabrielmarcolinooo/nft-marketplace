# Arquitetura e Decisões Técnicas - Kurio NFT Marketplace

Este documento detalha as escolhas arquiteturais, contratos de API, políticas de estado, tempo real, limitações conhecidas e desvios de design do **Kurio NFT Marketplace**.

---

## 1. Contratos REST e Eventos (Socket.IO)

### 1.1. APIs REST Principais (Mock Service Worker - MSW)
- **Autenticação:**
  * `POST /api/auth/login` — Autentica o utilizador através de credenciais fictícias e devolve um token de sessão simulado.
  * `POST /api/auth/logout` — Invalida a sessão atual no cliente.
- **Catálogo de NFTs:**
  * `GET /api/nfts` — Retorna a listagem de NFTs com suporte a paginação, ordenação (`sort`), filtragem por categoria (`category`), faixa de preço (`minPrice`, `maxPrice`) e termo de busca (`search`).
  * `GET /api/nfts/:id` — Retorna os detalhes de um NFT específico.
- **Carrinho e Cotações:**
  * `GET /api/cart` — Retorna os itens ativos no carrinho do utilizador autenticado e o subtotal em ETH.
  * `POST /api/cart` — Adiciona um novo ativo ao carrinho.
  * `DELETE /api/cart/:id` — Remove um item do carrinho.
  * `POST /api/cart/coupon` — Valida códigos promocionais (ex: cupom inválido simulado).
- **Pedidos e Checkout:**
  * `POST /api/orders` — Cria um novo pedido de compra. Requer chave de idempotência no cabeçalho (`X-Idempotency-Key`) para prevenir dupla cobrança em caso de falhas de rede.

### 1.2. Eventos em Tempo Real (`Socket.IO`)
A aplicação escuta os seguintes eventos emitidos pelo worker do MSW:
- **`nft.updated`**: Atualiza instantaneamente o preço, status de disponibilidade e metadados no catálogo, na página de detalhes e no resumo do carrinho.
- **`order.updated`**: Notifica a alteração de estado de um pedido pendente (confirmação ou recusa com estados terminais).

---

## 2. Política de Sessão
- **Armazenamento:** Baseada em um token de acesso simulado e persistido no `localStorage` do navegador, associado ao objeto do utilizador logado.
- **Ciclo de Vida e Expiração:** Respostas `401 Unauthorized` da API acionam automaticamente um interceptor do Axios que limpa o cache local (`queryClient.clear()`), encerra as instâncias ativas de socket e redireciona o utilizador para o modal de autenticação.
- **Isolamento:** A troca de utilizador limpa integralmente o escopo da sessão anterior para evitar o vazamento de dados de carrinho e carteiras entre diferentes contas.

---

## 3. Estado do Carrinho e Idempotência
- **Persistência Local e Remota:** O estado do carrinho é gerido de forma centralizada pelo TanStack Query, sincronizado com o banco de dados simulado do MSW.
- **Validação de Cotação:** Caso um item do carrinho sofra alteração de preço ou esgote via evento de Socket.IO (`nft.updated`), a aplicação sinaliza visualmente a alteração e **bloqueia o botão de pagamento** no checkout até que o utilizador aceite a nova cotação.
- **Idempotência no Checkout:** Pedidos enviados possuem uma chave de idempotência gerada por sessão, garantindo que interrupções de conexão não dupliquem transações financeiras após a reconexão.

---

## 4. Estratégia de Cache (TanStack Query)
- **Stale Time & Revalidação:** Dados estáticos e coleções possuem um tempo de cache otimizado para evitar requisições redundantes de rede. Mutações (como adicionar ao carrinho ou favoritar) utilizam **atualizações otimistas (*optimistic updates*)** com reversão automática (*rollback*) em caso de falha simulada.
- **Invalidação Cirúrgica:** Após mutações críticas (como a finalização de um pedido), as queries associadas ao catálogo e ao carrinho são invalidadas imediatamente para refletir a baixa de estoque correta.

---

## 5. Reconciliação entre REST e Socket.IO
- **Tolerância a Duplicatas e Eventos Atrasados:** Os manipuladores de eventos de socket registram versões e carimbos de data/hora. Eventos duplicados ou atrasados (que chegam após um estado mais recente) são descartados para evitar regressão visual.
- **Reconexão de Rede:** Após qualquer interrupção e restabelecimento da conexão WebSocket, a aplicação executa automaticamente uma chamada de sincronização REST (`refetch`) nos recursos ativos para garantir consistência de dados sem criar estados duplicados.

---

## 6. Limitações Conhecidas
- O ecossistema de dados e transações é estritamente simulado em ambiente cliente (*client-side*) através do Mock Service Worker (MSW), não havendo persistência real em banco de dados em nuvem ou conexão com smart contracts reais da blockchain Ethereum.
- O fluxo de pagamento simula carteiras criptográficas e saldos fictícios para fins estritamente de demonstração académica e avaliação técnica.

---

## 7. Decisões de UX e Desvios do Figma

**Acessibilidade e Foco:** Implementação rigorosa de indicadores visuais de foco (`focus-visible`) e navegação completa por teclado em modais, gavetas (*drawers*) e menus flutuantes.
**Prevenção de CLS (*Cumulative Layout Shift*):** Utilização de componentes *Skeleton* (`NFTSkeleton.tsx`) durante as requisições assíncronas para manter a estabilidade visual da grelha de NFTs.
**Desvios do Figma:** Fizemos pequenos ajustes responsivos em telas menores de 390px para melhorar a distribuição dos filtros e dos cartões sem quebrar o layout. Além disso, reposicionamos alguns elementos estruturais (divs) que estavam desalinhados no protótipo original do Figma.s
