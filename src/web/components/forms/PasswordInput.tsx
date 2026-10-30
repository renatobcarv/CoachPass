import React, { useState } from 'react'
import { Check, Circle, Eye, EyeOff, Lock } from 'lucide-react'
import { passwordChecks, passwordStrength } from '../../lib/validation'

/** Campo de senha com "ver senha" e aviso de Caps Lock. */
export function PasswordInput({
  id,
  value,
  onChange,
  placeholder = 'Sua senha',
  autoComplete = 'current-password',
  invalid,
  autoFocus,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: 'current-password' | 'new-password'
  invalid?: boolean
  autoFocus?: boolean
}) {
  const [visible, setVisible] = useState(false)
  const [caps, setCaps] = useState(false)
  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => setCaps(e.getModifierState?.('CapsLock') ?? false)

  return (
    <div>
      <div className="relative">
        <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dim)] pointer-events-none" />
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKey}
          onKeyUp={onKey}
          onBlur={() => setCaps(false)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          maxLength={128}
          spellCheck={false}
          aria-invalid={invalid}
          className="cp-field pr-12"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={visible}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full grid place-items-center text-[var(--dim)] hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {caps && <p className="mt-2 text-[12.5px] text-[var(--amber)]">Caps Lock está ativado.</p>}
    </div>
  )
}

/** Barra de força + checklist dos requisitos (cadastro / troca de senha). */
export function PasswordStrength({ value }: { value: string }) {
  if (!value) return null
  const { score, label } = passwordStrength(value)
  const colors = ['', '#ff5d6c', '#ffb547', '#8c82ff', '#2ee6c8']
  return (
    <div className="mt-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 grid grid-cols-4 gap-1">
          {[1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-colors"
              style={{ background: i <= score ? colors[score] : 'rgba(255,255,255,0.1)' }}
            />
          ))}
        </div>
        <span className="cp-mono text-[11px] w-16 text-right" style={{ color: colors[score] }}>
          {label}
        </span>
      </div>
      <ul className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1">
        {passwordChecks(value).map(({ label: l, ok }) => (
          <li key={l} className={`flex items-center gap-1.5 text-[12px] ${ok ? 'text-[var(--cream)]' : 'text-[var(--dim)]'}`}>
            {ok ? <Check className="w-3.5 h-3.5 text-[var(--teal)]" strokeWidth={3} /> : <Circle className="w-3.5 h-3.5" />}
            {l}
          </li>
        ))}
      </ul>
    </div>
  )
}
