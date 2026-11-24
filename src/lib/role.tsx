import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Opd, Role } from '@/types'
import { daftarOpd } from '@/data/mockData'

interface RoleContextValue {
  role: Role
  setRole: (role: Role) => void
  opdAktif: Opd
  setOpdAktif: (opd: Opd) => void
}

const RoleContext = createContext<RoleContextValue | null>(null)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('Eksekutif')
  const [opdAktif, setOpdAktif] = useState<Opd>(daftarOpd[0])

  const value = useMemo(
    () => ({ role, setRole, opdAktif, setOpdAktif }),
    [role, opdAktif],
  )

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole harus dipakai di dalam RoleProvider')
  return ctx
}
