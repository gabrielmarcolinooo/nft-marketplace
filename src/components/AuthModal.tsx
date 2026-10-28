import { Eye, EyeOff, X } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { type AuthTab, useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: AuthTab;
}

const authInputClass = 'h-10 w-full rounded-[3px] border border-border bg-transparent px-4 text-xs text-foreground outline-none placeholder:text-[#b99468] focus:border-primary focus:ring-1 focus:ring-primary';

function PasswordInput({ placeholder, autoComplete, value, onChange }: { placeholder: string; autoComplete: string; value?: string; onChange?: (value: string) => void }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input type={visible ? 'text' : 'password'} required autoComplete={autoComplete} placeholder={placeholder} aria-label={placeholder} value={value} onChange={(event) => onChange?.(event.target.value)} className={`${authInputClass} pr-11`} />
      <button type="button" onClick={() => setVisible((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b99468] hover:text-primary" aria-label={visible ? `Ocultar ${placeholder.toLowerCase()}` : `Mostrar ${placeholder.toLowerCase()}`}>
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 18 18" className="size-[18px] shrink-0" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.482h4.844a4.14 4.14 0 0 1-1.797 2.716v2.258h2.909c1.702-1.567 2.684-3.878 2.684-6.615Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.468-.806 5.956-2.18l-2.91-2.258c-.805.54-1.834.86-3.046.86-2.344 0-4.328-1.585-5.037-3.714H.957v2.332A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.963 10.708A5.41 5.41 0 0 1 3.681 9c0-.592.102-1.167.282-1.708V4.96H.957A9 9 0 0 0 0 9c0 1.452.347 2.827.957 4.04l3.006-2.332Z" />
      <path fill="#EA4335" d="M9 3.578c1.322 0 2.508.454 3.441 1.346l2.581-2.582C13.464.892 11.426 0 9 0A9 9 0 0 0 .957 4.96l3.006 2.332C4.672 5.163 6.656 3.578 9 3.578Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0 fill-[#1877F2]" aria-hidden="true">
      <path d="M14.5 8.5V6.7c0-.78.52-.96 1.02-.96h2.63V2.13L14.53 2C10.94 2 9.5 4.12 9.5 6.37V8.5H6.85v4.05H9.5V22h5v-9.45h3.17l.6-4.05H14.5Z" />
    </svg>
  );
}

function SocialButtons() {
  return (
    <div className="space-y-3">
      <button type="button" className="flex h-10 w-full items-center justify-center gap-3 rounded-[3px] border border-border text-xs text-[#cfb28c] transition hover:border-primary">
        <GoogleIcon />Continuar com Google
      </button>
      <button type="button" className="flex h-10 w-full items-center justify-center gap-3 rounded-[3px] border border-border text-xs text-[#cfb28c] transition hover:border-primary">
        <FacebookIcon />Continuar com Facebook
      </button>
    </div>
  );
}

export function AuthModal({ open, onClose, initialTab = 'login' }: AuthModalProps) {
  const { login } = useAuth();
  const [tab, setTab] = useState<AuthTab>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [onClose, open]);

  if (!open) return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (tab === 'register') {
      onClose();
      return;
    }
    setIsSubmitting(true);
    try {
      await login(email, password);
      onClose();
    } catch {
      setError('E-mail ou senha inválidos. Use as credenciais de teste.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[110] grid items-end bg-[#0d0806]/70 md:place-items-center md:overflow-y-auto md:bg-[#0d0806]/30 md:px-4 md:py-6" role="dialog" aria-modal="true" aria-labelledby="auth-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="relative h-[min(100dvh,896px)] w-full overflow-y-auto rounded-t-[30px] bg-[#140d0a] shadow-2xl md:h-auto md:max-h-[calc(100vh-3rem)] md:max-w-[500px] md:rounded-none md:border-b-[9px] md:border-primary md:bg-[#241612]">
        <button type="button" onClick={onClose} aria-label="Fechar autenticação" className="absolute right-5 top-5 text-primary transition hover:text-primary-hover md:right-4 md:top-4"><X className="size-5" /></button>
        <div className="mx-auto flex min-h-full w-full max-w-[390px] flex-col justify-center px-7 pb-12 pt-16 text-center md:max-w-[340px] md:px-4 md:pt-12">
          <h2 id="auth-title" className="text-2xl font-bold md:text-xl">
            <button type="button" onClick={() => setTab('login')} className={tab === 'login' ? 'text-primary' : 'text-foreground'}>Entrar</button>
            <span className="px-2 text-primary">|</span>
            <button type="button" onClick={() => setTab('register')} className={tab === 'register' ? 'text-primary' : 'text-foreground'}>Criar conta</button>
          </h2>

          {tab === 'login' ? (
            <form className="mt-14 md:mt-9" onSubmit={submit}>
              <p className="mb-8 text-[11px] leading-4 text-foreground md:mb-5">Entre para gerenciar sua carteira, coleção e perfil de criador.</p>
              <div className="space-y-3 text-left">
                <input type="email" required autoComplete="email" placeholder="usuario@kurio.com" aria-label="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} className={authInputClass} />
                <PasswordInput placeholder="Senha" autoComplete="current-password" value={password} onChange={setPassword} />
              </div>
              {error && <p role="alert" className="mt-3 text-left text-[11px] leading-4 text-red-300">{error}</p>}
              <button type="button" className="mt-3 block w-full text-right text-xs text-primary hover:text-primary-hover">Esqueceu a senha?</button>
              <Button type="submit" className="mt-10 h-14 w-full rounded-xl md:mt-6 md:h-auto md:rounded-[3px]" disabled={isSubmitting}>{isSubmitting ? 'Entrando...' : 'Entrar'}</Button>
              <div className="my-5 flex items-center gap-3 text-[11px]"><span className="h-px flex-1 bg-border" /><span>Ou continue com</span><span className="h-px flex-1 bg-border" /></div>
              <SocialButtons />
            </form>
          ) : (
            <form className="mt-14 md:mt-9" onSubmit={submit}>
              <p className="mb-5 text-[11px] leading-4 text-foreground">Crie seu perfil de colecionador e conecte uma carteira quando quiser.</p>
              <div className="space-y-3 text-left">
                <input required autoComplete="username" placeholder="Nome de usuário" aria-label="Nome de usuário" className={authInputClass} />
                <input type="email" required autoComplete="email" placeholder="Digite seu e-mail" aria-label="E-mail" className={authInputClass} />
                <PasswordInput placeholder="Senha" autoComplete="new-password" />
                <PasswordInput placeholder="Confirmar senha" autoComplete="new-password" />
              </div>
              <Button type="submit" className="mt-10 h-14 w-full rounded-xl md:mt-6 md:h-auto md:rounded-[3px]">Criar conta</Button>
              <div className="my-5 flex items-center gap-3 text-[11px]"><span className="h-px flex-1 bg-border" /><span>Ou continue com</span><span className="h-px flex-1 bg-border" /></div>
              <SocialButtons />
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
