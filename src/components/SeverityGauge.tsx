import { cn } from '@/lib/utils'

function warnaUntuk(score: number) {
  if (score >= 75) return 'bg-negative'
  if (score >= 50) return 'bg-orange-500'
  if (score >= 25) return 'bg-gold'
  return 'bg-positive'
}

export function SeverityGauge({ score, label = 'Virality Score' }: { score: number; label?: string }) {
  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
        <span className="font-medium">{label}</span>
        <span className="font-semibold text-slate-700">{score}/100</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn('h-full rounded-full transition-all', warnaUntuk(score))}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  )
}
