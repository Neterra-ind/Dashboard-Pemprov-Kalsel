export function tanggalNHariLalu(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - (n - 1))
  return d.toISOString().slice(0, 10)
}

const SATU_HARI_MS = 24 * 60 * 60 * 1000
const MAKS_TITIK_TREN = 90

export function hitungPerHariRange<T extends { tanggal: string }>(
  items: T[],
  dari: string,
  sampai: string,
) {
  const map = new Map<string, number>()
  const mulai = new Date(dari)
  const akhir = new Date(sampai)
  const jumlahHari = Math.min(
    Math.max(Math.round((akhir.getTime() - mulai.getTime()) / SATU_HARI_MS) + 1, 1),
    MAKS_TITIK_TREN,
  )
  for (let i = 0; i < jumlahHari; i++) {
    const d = new Date(mulai)
    d.setDate(d.getDate() + i)
    map.set(d.toISOString().slice(0, 10), 0)
  }
  for (const item of items) {
    if (map.has(item.tanggal)) {
      map.set(item.tanggal, (map.get(item.tanggal) ?? 0) + 1)
    }
  }
  return Array.from(map.entries()).map(([tanggal, jumlah]) => ({
    tanggal: tanggal.slice(5),
    jumlah,
  }))
}

export function hitungDistribusi<T, K extends keyof T>(items: T[], key: K) {
  const map = new Map<string, number>()
  for (const item of items) {
    const value = String(item[key])
    map.set(value, (map.get(value) ?? 0) + 1)
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
}

export function topN<T, K extends keyof T>(items: T[], key: K, n = 5) {
  const counts = hitungDistribusi(items, key)
  return counts.sort((a, b) => b.value - a.value).slice(0, n)
}

const LEVEL_URUTAN: Record<string, number> = { Critical: 3, High: 2, Medium: 1, Low: 0 }

export function levelKeAngka(level: string) {
  return LEVEL_URUTAN[level] ?? 0
}

export function rataRata(nilai: number[]) {
  if (nilai.length === 0) return 0
  return Math.round(nilai.reduce((a, b) => a + b, 0) / nilai.length)
}
