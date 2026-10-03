import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export const inputClassName =
  'block h-12 w-full min-w-0 rounded-xl border border-input bg-card px-4 text-base outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 aria-invalid:border-destructive aria-invalid:ring-destructive/20'

export function FormField({
  id,
  label,
  helper,
  error,
  optional,
  className,
  multiline,
  ...props
}: {
  id: string
  label: string
  helper?: string
  error?: string
  optional?: boolean
  className?: string
  multiline?: boolean
} & Omit<ComponentProps<'input'> & ComponentProps<'textarea'>, 'id' | 'className'>) {
  const describedBy = [helper ? `${id}-helper` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('min-w-0', className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {optional && <span className="ml-1 font-normal text-muted-foreground">(optional)</span>}
      </label>
      {multiline ? (
        <textarea
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(inputClassName, 'mt-2 h-auto min-h-36 resize-y py-3 leading-relaxed')}
          {...(props as ComponentProps<'textarea'>)}
        />
      ) : (
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(inputClassName, 'mt-2')}
          {...(props as ComponentProps<'input'>)}
        />
      )}
      {helper && (
        <p id={`${id}-helper`} className="mt-2 text-sm text-muted-foreground">
          {helper}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
