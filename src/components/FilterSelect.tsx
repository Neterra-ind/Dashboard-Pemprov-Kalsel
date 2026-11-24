export function FilterSelect({
  label,
  value,
  options,
  onChange,
  labelMap,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
  labelMap?: Record<string, string>
}) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-500">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-[var(--color-border-strong)] bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
      >
        <option value="">Semua</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {labelMap?.[opt] ?? opt}
          </option>
        ))}
      </select>
    </label>
  )
}
