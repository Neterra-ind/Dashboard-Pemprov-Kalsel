import { useId, useState } from 'react'
import { Send, X } from 'lucide-react'
import { FilterSelect } from '@/components/FilterSelect'
import { daftarOpd } from '@/data/mockData'
import { useDisposisi } from '@/lib/store'
import type { Isu, Opd } from '@/types'

export function DisposisiModal({
  isu,
  onClose,
  onSubmitted,
}: {
  isu: Isu
  onClose: () => void
  onSubmitted: () => void
}) {
  const { tambahDisposisi } = useDisposisi()
  const [opdTujuan, setOpdTujuan] = useState<string>(isu.opd)
  const [catatan, setCatatan] = useState('')
  const catatanId = useId()

  function submit() {
    tambahDisposisi(isu.id, opdTujuan as Opd, catatan.trim() || 'Mohon segera diklarifikasi ke publik.')
    onSubmitted()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-md animate-[slideUp_0.2s_ease-out] rounded-t-[20px] bg-white p-6 shadow-[var(--shadow-pop)] sm:rounded-[20px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">Tindak Lanjuti ke OPD</h3>
            <p className="mt-0.5 text-xs text-slate-500">{isu.namaIsu}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <FilterSelect label="OPD Tujuan" value={opdTujuan} options={daftarOpd} onChange={setOpdTujuan} />

          <label htmlFor={catatanId} className="flex flex-col gap-1.5 text-xs font-medium text-slate-500">
            Catatan Arahan
            <textarea
              id={catatanId}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={3}
              placeholder="Contoh: Mohon segera diklarifikasi ke publik dan laporkan progres penanganan dalam 2x24 jam."
              className="rounded-xl border border-[var(--color-border-strong)] bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--color-border-strong)] px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={submit}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-strong"
          >
            <Send className="h-3.5 w-3.5" />
            Kirim Disposisi
          </button>
        </div>
      </div>
    </div>
  )
}
