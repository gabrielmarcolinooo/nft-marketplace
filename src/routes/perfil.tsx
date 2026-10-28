/* eslint-disable react-refresh/only-export-components */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createRoute, redirect, useNavigate } from '@tanstack/react-router';
import { AlertTriangle, Download, Eye, EyeOff, Gauge, Heart, Image as ImageIcon, LogOut, MapPin, ShoppingCart, UserRound } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { getSession } from '../services/authService';
import { createWallet, getProfile, getWallets, updateProfile } from '../services/profileService';
import type { CollectorProfile, User, Wallet } from '../types';
import { rootRoute } from './__root';

type ProfileTab = 'profile' | 'wallets' | 'activity' | 'wishlist' | 'offers' | 'downloads' | 'support';

const profileInputClass = 'h-10 w-full rounded-[3px] border border-border bg-surface px-3 text-xs text-foreground outline-none transition placeholder:text-[#a78662] focus:border-primary focus:ring-1 focus:ring-primary';

const profileMenu = [
  { id: 'profile', label: 'Dados do perfil', Icon: UserRound },
  { id: 'wallets', label: 'Carteiras', Icon: MapPin },
  { id: 'activity', label: 'Atividade', Icon: ShoppingCart },
  { id: 'wishlist', label: 'Lista de interesse', Icon: Heart },
  { id: 'offers', label: 'Ofertas', Icon: Gauge },
  { id: 'downloads', label: 'Arquivos baixados', Icon: Download },
  { id: 'support', label: 'Suporte', Icon: AlertTriangle },
] as const;

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <label className="block text-[13px]"><span className="mb-2 block">{label}{required && <span className="ml-1 text-primary">*</span>}</span>{children}</label>;
}

function ProfilePasswordInput({ label }: { label: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <FormField label={label}>
      <div className="relative">
        <input type={visible ? 'text' : 'password'} className={`${profileInputClass} pr-11`} />
        <button type="button" onClick={() => setVisible((current) => !current)} aria-label={visible ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a78662] hover:text-primary">
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </FormField>
  );
}

function ProfileDataTab({ user }: { user: User }) {
  const queryClient = useQueryClient();
  const { data: profile, isPending, isError } = useQuery({ queryKey: ['profile'], queryFn: getProfile });
  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedProfile) => queryClient.setQueryData(['profile'], updatedProfile),
  });

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const ensValue = String(form.get('ensName') ?? '').trim();
    const nextProfile: CollectorProfile = {
      displayName: String(form.get('displayName') ?? '').trim(),
      username: String(form.get('username') ?? '').trim(),
      email: String(form.get('email') ?? '').trim(),
      ensName: ensValue && !ensValue.endsWith('.eth') ? `${ensValue}.eth` : ensValue,
      avatar: profile?.avatar ?? '',
      walletNickname: String(form.get('walletNickname') ?? '').trim(),
    };
    profileMutation.mutate(nextProfile);
  }

  return (
    <div>
      <h1 className="mb-8 text-base font-bold">Perfil do colecionador</h1>
      {isError && <p role="alert" className="mb-5 text-xs text-red-300">Não foi possível carregar os dados do perfil.</p>}
      <form key={profile ? `${profile.username}:${profile.email}:${profile.ensName}` : 'profile-loading'} onSubmit={save} aria-busy={isPending || profileMutation.isPending}>
        <div className="grid gap-x-7 gap-y-6 sm:grid-cols-2">
          <FormField label="Nome de exibição" required><input name="displayName" className={profileInputClass} defaultValue={profile?.displayName || user.name} required /></FormField>
          <FormField label="Nome de usuário" required><input name="username" className={profileInputClass} defaultValue={profile?.username || 'usuario.kurio'} required /></FormField>
          <FormField label="E-mail" required><input name="email" type="email" className={profileInputClass} defaultValue={profile?.email || user.email} required /></FormField>
          <FormField label="Nome ENS" required>
            <div className="flex"><span className="flex h-10 items-center rounded-l-[3px] border border-r-0 border-border bg-surface px-3 text-xs text-[#b99468]">.eth</span><input name="ensName" className={`${profileInputClass} min-w-0 rounded-l-none`} defaultValue={(profile?.ensName || 'usuario').replace(/\.eth$/, '')} required /></div>
          </FormField>
          <FormField label="Apelido da carteira" required><input name="walletNickname" className={profileInputClass} defaultValue={profile?.walletNickname || 'Minha carteira Kurio'} required /></FormField>
          <div>
            <p className="mb-2 text-[13px]">Avatar</p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="grid size-12 place-items-center rounded-full border border-border bg-surface-raised text-primary"><ImageIcon className="size-5" /></div>
              <Button type="button">Alterar</Button>
              <button type="button" className="text-xs text-foreground transition hover:text-primary">Remover</button>
            </div>
          </div>
        </div>

        <section className="mt-8 max-w-[417px]">
          <h2 className="mb-5 text-base font-bold">Alterar senha</h2>
          <div className="space-y-5">
            <ProfilePasswordInput label="Senha atual" />
            <ProfilePasswordInput label="Nova senha" />
            <ProfilePasswordInput label="Confirmar nova senha" />
          </div>
          <Button type="submit" className="mt-8 min-w-[132px]" disabled={profileMutation.isPending}>{profileMutation.isPending ? 'Salvando...' : 'Salvar'}</Button>
          {profileMutation.isSuccess && <span role="status" className="ml-4 text-xs text-primary">Dados salvos.</span>}
          {profileMutation.isError && <span role="alert" className="ml-4 text-xs text-red-300">Não foi possível salvar.</span>}
        </section>
      </form>
    </div>
  );
}

function WalletsTab({ user }: { user: User }) {
  const queryClient = useQueryClient();
  const [sameWallet, setSameWallet] = useState(false);
  const { data: wallets = [], isPending, isError } = useQuery({ queryKey: ['wallets'], queryFn: getWallets });
  const primaryWallet = wallets.find((wallet) => wallet.isPrimary);
  const walletMutation = useMutation({
    mutationFn: createWallet,
    onSuccess: (updatedWallets) => queryClient.setQueryData(['wallets'], updatedWallets),
  });

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const wallet: Omit<Wallet, 'id'> = {
      label: String(form.get('walletLabel') ?? '').trim(),
      address: String(form.get('walletAddress') ?? '').trim(),
      network: String(form.get('network')) as Wallet['network'],
      provider: String(form.get('provider')) as Wallet['provider'],
      isPrimary: true,
    };
    walletMutation.mutate(wallet);
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div><h1 className="text-base font-bold">Carteira principal</h1><p className="mt-1 text-xs text-[#b99468]">Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.</p></div>
        <button type="button" className="text-sm text-primary hover:text-primary-hover">Adicionar</button>
      </div>
      {isError && <p role="alert" className="mt-5 text-xs text-red-300">Não foi possível carregar as carteiras.</p>}
      <form key={primaryWallet?.id ?? (isPending ? 'wallet-loading' : 'new-wallet')} onSubmit={save} className="mt-8" aria-busy={isPending || walletMutation.isPending}>
        <div className="grid gap-x-7 gap-y-5 sm:grid-cols-2">
          <FormField label="Nome de exibição" required><input name="displayName" className={profileInputClass} defaultValue={user.name} required /></FormField>
          <FormField label="Apelido da carteira" required><input name="walletLabel" className={profileInputClass} defaultValue={primaryWallet?.label || 'Carteira principal'} required /></FormField>
          <FormField label="Rede" required><select name="network" className={`${profileInputClass} text-[#b99468]`} defaultValue={primaryWallet?.network ?? ''} required><option value="" disabled>Selecione uma rede</option><option>Ethereum</option><option>Polygon</option><option>Solana</option></select></FormField>
          <FormField label="Nome do perfil" required><input name="profileName" className={profileInputClass} defaultValue="Colecionador Kurio" required /></FormField>
          <FormField label="Endereço da carteira" required><input name="walletAddress" className={profileInputClass} defaultValue={primaryWallet?.address ?? ''} placeholder="Endereço 0x da carteira" required /></FormField>
          <FormField label="ENS ou carteira secundária"><input name="secondaryWallet" className={profileInputClass} placeholder="ENS ou carteira secundária (opcional)" /></FormField>
          <FormField label="Tipo de carteira" required><select name="provider" className={`${profileInputClass} text-[#b99468]`} defaultValue={primaryWallet?.provider ?? ''} required><option value="" disabled>Selecione uma carteira</option><option>MetaMask</option><option>WalletConnect</option><option>Coinbase Wallet</option></select></FormField>
          <FormField label="Código de indicação" required><input name="referralCode" className={profileInputClass} required /></FormField>
          <FormField label="E-mail" required><input name="email" type="email" className={profileInputClass} defaultValue={user.email} required /></FormField>
          <FormField label="Nome ENS" required><div className="flex"><span className="flex h-10 items-center rounded-l-[3px] border border-r-0 border-border bg-surface px-3 text-xs text-[#b99468]">.eth</span><input name="ensName" className={`${profileInputClass} min-w-0 rounded-l-none`} defaultValue="usuario" required /></div></FormField>
        </div>
        <Button type="submit" className="mt-8" disabled={walletMutation.isPending}>{walletMutation.isPending ? 'Salvando...' : 'Salvar carteira'}</Button>
        {walletMutation.isSuccess && <span role="status" className="ml-4 text-xs text-primary">Carteira salva.</span>}
        {walletMutation.isError && <span role="alert" className="ml-4 text-xs text-red-300">Não foi possível salvar.</span>}
      </form>

      <section className="mt-8 border-t border-border pt-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div><h2 className="text-base font-bold">Carteira secundária</h2><p className="mt-1 text-xs text-[#b99468]">Você ainda não adicionou uma carteira secundária.</p></div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={sameWallet} onChange={(event) => setSameWallet(event.target.checked)} className="size-4 appearance-none rounded-full border border-primary checked:border-[4px] checked:border-primary" />Igual à carteira principal</label>
            <button type="button" className="font-bold text-primary hover:text-primary-hover">Adicionar</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function PlaceholderTab({ title }: { title: string }) {
  return <section><h1 className="text-base font-bold">{title}</h1><p className="mt-4 max-w-xl text-sm leading-6 text-muted">Esta área ficará disponível para acompanhar suas informações e atividades na Kurio.</p></section>;
}

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');

  if (!user) return null;

  async function signOut() {
    await logout();
    await navigate({ to: '/', search: { search: '', category: 'all', sort: 'recent', page: 1, network: 'all', minPrice: '0.02', maxPrice: '12.30' } });
  }

  const activeLabel = profileMenu.find((item) => item.id === activeTab)?.label ?? '';

  return (
    <section className="grid min-h-[950px] items-start gap-7 pb-16 lg:grid-cols-[310px_minmax(0,1fr)]">
      <aside className="bg-[#241612]">
        <h2 className="px-3 pb-2 pt-4 text-lg font-bold">Meu perfil</h2>
        <nav aria-label="Menu do perfil">
          {profileMenu.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return <button key={id} type="button" onClick={() => setActiveTab(id)} className={`flex h-[45px] w-full items-center gap-3 border-l-[6px] px-3 text-left text-sm transition ${active ? 'border-primary bg-primary/5 text-primary' : 'border-transparent text-primary hover:bg-primary/5'}`}><Icon className="size-4" strokeWidth={1.6} />{label}</button>;
          })}
          <button type="button" onClick={() => void signOut()} className="flex h-[50px] w-full items-center gap-3 border-t border-border px-[18px] text-left text-sm font-bold text-primary transition hover:bg-primary/5"><LogOut className="size-4" />Sair</button>
        </nav>
      </aside>

      <div className="min-w-0">
        {activeTab === 'profile' && <ProfileDataTab user={user} />}
        {activeTab === 'wallets' && <WalletsTab user={user} />}
        {!['profile', 'wallets'].includes(activeTab) && <PlaceholderTab title={activeLabel} />}
      </div>
    </section>
  );
}

export const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/perfil',
  beforeLoad: async () => {
    try {
      const session = await getSession();
      if (session) return;
    } catch {
      // A rota privada permanece fechada quando a sessão não pode ser validada.
    }

    throw redirect({
      to: '/',
      search: { search: '', category: 'all', sort: 'recent', page: 1, network: 'all', minPrice: '0.02', maxPrice: '12.30', auth: 'login' },
    });
  },
  component: ProfilePage,
});
