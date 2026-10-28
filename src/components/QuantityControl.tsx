import { Minus, Plus } from 'lucide-react';

interface QuantityControlProps {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  compact?: boolean;
  label?: string;
}

export function QuantityControl({ value, min = 1, max, onChange, disabled, compact, label = 'Quantidade' }: QuantityControlProps) {
  const buttonClass = compact
    ? 'grid size-7 place-items-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-35'
    : 'grid size-11 place-items-center rounded-[14px] bg-primary text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-35';

  return (
    <div className="inline-flex items-center gap-3" aria-label={label}>
      <button type="button" className={buttonClass} onClick={() => onChange(value - 1)} disabled={disabled || value <= min} aria-label="Diminuir quantidade">
        <Minus className={compact ? 'size-3.5' : 'size-5'} strokeWidth={2.4} />
      </button>
      <output className={compact ? 'min-w-4 text-center text-sm' : 'min-w-5 text-center text-lg'} aria-live="polite">{value}</output>
      <button type="button" className={buttonClass} onClick={() => onChange(value + 1)} disabled={disabled || value >= max} aria-label="Aumentar quantidade">
        <Plus className={compact ? 'size-3.5' : 'size-5'} strokeWidth={2.4} />
      </button>
    </div>
  );
}
