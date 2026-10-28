import kurioCollection from '../assets/kurio-ape-collection.png';
import { cn } from '../lib/utils';

const positions = ['0% 0%', '100% 0%', '0% 100%', '100% 100%'];

interface KurioArtworkProps {
  variant?: number;
  className?: string;
  label?: string;
}

export function KurioArtwork({ variant = 0, className, label }: KurioArtworkProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn('bg-no-repeat', className)}
      style={{ backgroundImage: `url(${kurioCollection})`, backgroundSize: '200% 200%', backgroundPosition: positions[variant % 4] }}
    />
  );
}
