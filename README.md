
# Kurio - NFT Marketplace

Implementação do desafio Frontend de um Marketplace de NFTs, focado na experiência de descoberta, compra e gestão de conta do colecionador. O projeto é responsivo (desktop e mobile) e consome uma API simulada integralmente pelo lado do cliente.

##  Tecnologias Utilizadas

- **Interface:** React + TypeScript + Vite
- **Roteamento:** TanStack Router
- **Gestão de Estado:** TanStack Query
- **Cliente HTTP:** Axios
- **Mock de API:** Mock Service Worker (MSW)
- **Tempo Real:** Socket.IO Client (simulado via MSW)
- **Estilização:** Tailwind CSS + shadcn/ui
- **Testes E2E:** Playwright
- **Auditoria:** Lighthouse

##  Deploy

- **Repositório:** (https://github.com/gabrielmarcolinooo/nft-marketplace)]
- **URL Pública:** (https://nftmarketplacedesafio.netlify.app/)]

##  Instalação e Configuração

Certifique-se de ter o Node.js instalado (versão 18+ recomendada).

```bash
# Clone o repositório
git clone [https://github.com/seu-usuario/nft-marketplace.git](https://github.com/seu-usuario/nft-marketplace.git)
cd nft-marketplace

# Instale as dependências
npm install
```


##  Comandos Disponíveis

* `npm run dev`: Inicia o servidor de desenvolvimento com MSW ativo.
* `npm run build`: Compila a aplicação para produção.
* `npm run preview`: Inicia um servidor local para visualizar a build de produção.
* `npm run lint`: Executa a verificação de código (ESLint) e tipos (TypeScript).
* `npm run test:e2e`: Executa a suíte de testes E2E com Playwright em modo headless.
* `npm run test:e2e:ui`: Abre a interface interativa do Playwright.
* `npm run lighthouse`: Executa a auditoria do Lighthouse.

##  Credenciais de Teste (Mock)

Para acessar as áreas privadas (Carrinho, Pagamento, Perfil, Carteiras), utilize as seguintes credenciais fictícias:

* **E-mail:** `colecionador@kurio.com`
* **Palavra-passe:** `Kurio2026!`

##  Cenários de Teste e Mocks (MSW)

A aplicação utiliza o MSW para simular a API REST e o WebSocket (`@mswjs/socket.io-binding`). O MSW está ativo tanto em desenvolvimento como na build de demonstração.

**Para simular falhas específicas no fluxo:**

* **Cupom Inválido:** Ao finalizar a compra, insira o código `INVALIDO` para forçar um erro de validação.
* **Falha de Pagamento:** Ao confirmar a compra, selecione a carteira "Reserva" para forçar uma transação recusada.
* **Conflito de Disponibilidade:** Aguarde 30 segundos na tela de checkout; um evento de WebSocket simulará que um dos NFTs esgotou ou mudou de preço, bloqueando a compra até atualização.
* **Reset de Estado:** Para limpar o banco de dados simulado e restaurar os dados iniciais, basta fazer logout e atualizar a página.


