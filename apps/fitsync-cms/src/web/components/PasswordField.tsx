import React, { forwardRef, useId, useState } from 'react';
import { CheckCircle2, Circle, Eye, EyeOff, Lock, XCircle } from 'lucide-react';
import { checkPassword, type PasswordContext } from '@/lib/passwordPolicy';
import { cn } from './ui/utils';

type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  iconClassName?: string;
  toggleClassName?: string;
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { className, iconClassName, toggleClassName, id, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="relative">
      <Lock
        aria-hidden="true"
        className={cn('w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400', iconClassName)}
      />
      <input
        ref={ref}
        id={inputId}
        type={visible ? 'text' : 'password'}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        {...props}
        className={cn(className, 'pr-12')}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        aria-pressed={visible}
        aria-controls={inputId}
        className={cn(
          'absolute right-1 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-md text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#000346] dark:focus-visible:ring-[#C5C5CE]',
          toggleClassName,
        )}
      >
        {visible ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
      </button>
    </div>
  );
});

interface PasswordRequirementsProps {
  id?: string;
  password: string;
  context?: PasswordContext;
  showErrors?: boolean;
  className?: string;
}

export function PasswordRequirements({ id, password, context, showErrors = false, className }: PasswordRequirementsProps) {
  const rules = checkPassword(password, context);
  const empty = password.length === 0;
  const metCount = empty ? 0 : rules.filter((rule) => rule.met).length;
  const pct = Math.round((metCount / rules.length) * 100);
  const barColor = pct === 100 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div id={id} className={cn('mt-3', className)}>
      <div className="h-1 w-full rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden" aria-hidden="true">
        <div className={cn('h-full transition-all duration-300', empty ? 'bg-transparent' : barColor)} style={{ width: `${pct}%` }} />
      </div>
      <p className="sr-only" aria-live="polite">
        {metCount} de {rules.length} requisitos de senha atendidos.
      </p>
      <ul className="mt-3 grid gap-1.5 sm:grid-cols-2" aria-label="Requisitos da senha">
        {rules.map((rule) => {
          const met = !empty && rule.met;
          const failed = showErrors && !met;
          const Icon = met ? CheckCircle2 : failed ? XCircle : Circle;
          return (
            <li
              key={rule.id}
              className={cn(
                'flex items-start gap-2 text-xs leading-snug transition-colors',
                met
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : failed
                    ? 'text-red-500 dark:text-red-400'
                    : 'text-slate-500 dark:text-zinc-400',
              )}
            >
              <Icon className="w-3.5 h-3.5 mt-px flex-shrink-0" aria-hidden="true" />
              <span>
                {rule.label}
                <span className="sr-only">{met ? ' (atendido)' : ' (pendente)'}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
