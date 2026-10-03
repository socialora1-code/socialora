import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ComplianceNotice({ className }: { className?: string }) {
  return (
    <aside
      aria-label="Service notice"
      className={cn('flex gap-3 rounded-2xl border border-border bg-muted/60 p-4 text-sm sm:p-5', className)}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <p className="leading-relaxed text-muted-foreground text-pretty">
        Socialora provides digital social media marketing services and is not affiliated with Instagram, TikTok or
        YouTube. You are responsible for making sure your use of our services complies with the rules of the platform
        you use. We never ask for your password.
      </p>
    </aside>
  )
}
