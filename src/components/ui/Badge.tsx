import { cn } from '@/lib/utils'
import type { Klasifikasi, LevelRisiko, Sentimen, StatusPenanganan, Trend } from '@/types'

const POSITIVE = 'bg-success-soft text-success-text ring-success/20'
const NEGATIVE = 'bg-danger-soft text-danger-text ring-danger/25'
const NEUTRAL = 'bg-neutral-soft text-slate-500 ring-slate-400/20'
const WARNING = 'bg-warning-soft text-warning-text ring-warning/25'
const INFO = 'bg-info-soft text-info-text ring-info/20'

const sentimenStyle: Record<Sentimen, string> = {
  Positif: POSITIVE,
  Netral: NEUTRAL,
  Negatif: NEGATIVE,
}

const levelStyle: Record<LevelRisiko, string> = {
  Low: POSITIVE,
  Medium: WARNING,
  High: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  Critical: NEGATIVE,
}

const trendStyle: Record<Trend, string> = {
  Naik: NEGATIVE,
  Turun: POSITIVE,
  Stabil: NEUTRAL,
}

const klasifikasiStyle: Record<Klasifikasi, string> = {
  Positif: POSITIVE,
  Negatif: NEGATIVE,
  'Potensi Negatif': WARNING,
}

const statusStyle: Record<StatusPenanganan, string> = {
  'Belum Ditindaklanjuti': NEUTRAL,
  Didisposisikan: INFO,
  Diproses: WARNING,
  Selesai: POSITIVE,
}

function BaseBadge({ label, style }: { label: string; style: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        style,
      )}
    >
      {label}
    </span>
  )
}

export function SentimenBadge({ value }: { value: Sentimen }) {
  return <BaseBadge label={value} style={sentimenStyle[value]} />
}

export function LevelBadge({ value }: { value: LevelRisiko }) {
  return <BaseBadge label={value} style={levelStyle[value]} />
}

export function TrendBadge({ value }: { value: Trend }) {
  return <BaseBadge label={value} style={trendStyle[value]} />
}

export function KlasifikasiBadge({ value }: { value: Klasifikasi }) {
  return <BaseBadge label={value} style={klasifikasiStyle[value]} />
}

export function StatusBadge({ value }: { value: StatusPenanganan }) {
  return <BaseBadge label={value} style={statusStyle[value]} />
}
