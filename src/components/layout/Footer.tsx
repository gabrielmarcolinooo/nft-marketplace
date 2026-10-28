const columns = [
  ['Meu perfil', 'Meu perfil', 'Minha coleção', 'Atividade', 'Estúdio do criador', 'Lista de interesse'],
  ['Central de ajuda', 'Central de ajuda', 'Como comprar NFTs', 'Carteira e segurança', 'Política do mercado', 'Denunciar item'],
  ['Coleções', 'Arte digital', 'Fotografia', 'Música', 'Arte 3D', 'Utilidade'],
];

const benefits = [
  ['W', 'Segurança da carteira', 'Proteja sua carteira e colecione arte digital verificada com confiança.'],
  ['C', 'Criadores em destaque', 'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.'],
  ['D', 'Alertas de lançamentos', 'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.'],
];

const socialNetworks = ['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'YouTube'] as const;

function SocialIcon({ network }: { network: typeof socialNetworks[number] }) {
  if (network === 'Facebook') return <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true"><path d="M14 8.5V6.8c0-.8.5-1 1-1h2.5V2.1L14.2 2C10.9 2 9 4 9 6.5v2H6v4h3V22h5v-9.5h3.2l.6-4H14Z" /></svg>;
  if (network === 'Instagram') return <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" className="fill-current stroke-none" /></svg>;
  if (network === 'Twitter') return <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true"><path d="M22 5.9c-.7.3-1.5.5-2.3.6a4 4 0 0 0 1.8-2.2c-.8.5-1.7.8-2.6 1a4 4 0 0 0-6.9 2.8c0 .3 0 .6.1.9a11.4 11.4 0 0 1-8.3-4.2 4 4 0 0 0 1.2 5.4c-.6 0-1.2-.2-1.8-.5 0 2 1.4 3.6 3.3 4-.4.1-.7.2-1.1.2-.3 0-.5 0-.8-.1a4 4 0 0 0 3.7 2.8A8.1 8.1 0 0 1 2 18.4a11.3 11.3 0 0 0 6.1 1.8c7.4 0 11.4-6.1 11.4-11.4v-.5c.8-.6 1.5-1.4 2-2.3Z" /></svg>;
  if (network === 'LinkedIn') return <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true"><path d="M5 3.8a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4ZM3.1 9.8h3.8V21H3.1V9.8Zm6.1 0h3.6v1.5h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-3.8v-5c0-1.2 0-2.8-1.8-2.8-1.8 0-2.1 1.3-2.1 2.7V21H9.2V9.8Z" /></svg>;
  return <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true"><path d="M21.6 7.2c-.2-1.3-1-2.2-2.3-2.4C17.5 4.5 14.4 4.4 12 4.4s-5.5.1-7.3.4C3.4 5 2.6 5.9 2.4 7.2 2.1 8.5 2 10.3 2 12s.1 3.5.4 4.8c.2 1.3 1 2.2 2.3 2.4 1.8.3 4.9.4 7.3.4s5.5-.1 7.3-.4c1.3-.2 2.1-1.1 2.3-2.4.3-1.3.4-3.1.4-4.8s-.1-3.5-.4-4.8ZM10 15.8V8.2l6 3.8-6 3.8Z" /></svg>;
}

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-[1600px] px-5 md:w-5/6 md:px-0">
      <section className="overflow-hidden bg-[#241612] text-[#f5f1eb]">
        <div className="grid pb-[22px] pt-8 md:grid-cols-[1fr_0.9fr_0.9fr_1.25fr]">
          {benefits.map(([letter, title, description]) => (
            <div key={letter} className="border-[#6f472c] px-4 py-0 first:pl-12 md:border-r">
              <div
                className="flex size-18 min-h-18 min-w-18 flex-none items-center justify-center rounded-full bg-[#d28a4c] text-lg font-bold text-[#140d0a]"
              >
                {letter}
              </div>
              <h3 className="mt-2 text-base font-bold text-[#f5f1eb]">{title}</h3>
              <p className="mt-2 max-w-[215px] text-sm leading-[21px] text-[#cfb28c]">{description}</p>
            </div>
          ))}

          <div className="px-4 pt-4">
            <h3 className="text-base font-bold leading-4 text-[#f5f1eb]">Antecipe-se ao próximo<br />lançamento</h3>
            <form className="mt-4 flex h-10 overflow-hidden rounded-md border border-[#6f472c] bg-[#38220f] focus-within:border-[#d28a4c] md:mt-8" onSubmit={(event) => event.preventDefault()}>
              <input aria-label="E-mail para novidades" type="email" placeholder="digite seu e-mail..." className="min-w-0 flex-1 rounded-l-md rounded-r-none bg-transparent px-3 text-sm text-[#cfb28c] outline-none placeholder:text-[#cfb28c]" />
              <button type="submit" className="rounded-l-none rounded-r-md bg-[#d28a4c] px-4 text-sm font-bold text-[#140d0a] transition hover:bg-[#df9858]">Enviar</button>
            </form>
            <p className="mt-3 text-sm leading-[22px] text-[#cfb28c]">Receba lançamentos selecionados, histórias de criadores e novidades do mercado.</p>
          </div>
        </div>

        <div className="grid items-center bg-[#38220f] py-6 text-sm md:grid-cols-4">
          <strong className="px-8">KURIO</strong>
          <span className="px-8">Feito para colecionadores,<br />criadores e cultura</span>
          <span className="px-8">contato@email.com</span>
          <span className="px-8">+55 11 4002 8922</span>
        </div>

        <div className="grid bg-[#241612] pb-8 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map(([title, ...links]) => (
            <div key={title} className="px-8">
              <h3 className="mb-4 text-base font-bold text-[#f5f1eb]">{title}</h3>
              {links.map((link) => <a key={link} href="#" className="mb-2 block text-sm text-[#f5f1eb] transition hover:text-[#d28a4c]">{link}</a>)}
            </div>
          ))}

          <div className="px-8">
            <h3 className="mb-4 text-base font-bold text-[#f5f1eb]">Redes sociais</h3>
            <div className="flex flex-wrap gap-2">
              {socialNetworks.map((network) => (
                <a key={network} href="#" aria-label={network} className="grid size-8 place-items-center rounded-md border border-[#d28a4c] text-[#d28a4c] transition hover:bg-[#d28a4c] hover:text-[#140d0a]">
                  <SocialIcon network={network} />
                </a>
              ))}
            </div>
            <h3 className="mb-3 mt-6 text-base font-bold text-[#f5f1eb]">Carteiras compatíveis</h3>
            <div className="inline-flex rounded-md border border-[#6f472c] bg-[#140d0a] px-3 py-2 font-mono text-[8px] font-bold text-[#d28a4c]">METAMASK&nbsp; • &nbsp;WALLETCONNECT&nbsp; • &nbsp;COINBASE</div>
          </div>
        </div>
      </section>

      <p className="bg-[#140d0a] py-5 text-center text-sm text-[#f5f1eb]">© 2026 Kurio. Propriedade digital para todos.</p>
    </footer>
  );
}
