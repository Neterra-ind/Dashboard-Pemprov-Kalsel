/* ============================================================================
   Ekspor .xlsx tanpa dependensi eksternal.
   Sebuah file .xlsx adalah arsip ZIP berisi beberapa bagian XML (Office Open
   XML / SpreadsheetML). Di sini ZIP ditulis dengan metode "stored" (tanpa
   kompresi) + CRC32 yang benar, sehingga Excel / Google Sheets / LibreOffice
   dapat membukanya langsung. Cukup untuk ekspor tabel data.
   ============================================================================ */

type Cell = string | number | null | undefined
export interface SheetData {
  sheetName: string
  headers: string[]
  rows: Cell[][]
}

const enc = new TextEncoder()

// --- CRC32 -----------------------------------------------------------------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

// --- XML helpers ------------------------------------------------------------
function esc(v: string): string {
  return v
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function colName(i: number): string {
  let s = ''
  let n = i
  do {
    s = String.fromCharCode(65 + (n % 26)) + s
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return s
}

function cellXml(ref: string, value: Cell): string {
  if (value === null || value === undefined || value === '') return `<c r="${ref}"/>`
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `<c r="${ref}"><v>${value}</v></c>`
  }
  return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${esc(String(value))}</t></is></c>`
}

function sheetXml({ headers, rows }: SheetData): string {
  const allRows = [headers, ...rows]
  const body = allRows
    .map((row, r) => {
      const cells = row.map((val, c) => cellXml(`${colName(c)}${r + 1}`, val)).join('')
      return `<row r="${r + 1}">${cells}</row>`
    })
    .join('')
  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${body}</sheetData></worksheet>`
  )
}

// --- ZIP (stored) -----------------------------------------------------------
interface ZipEntry {
  name: string
  data: Uint8Array
}

function dosDateTime(): { time: number; date: number } {
  // Tanggal tetap (1 Jan 2020) agar deterministik & bebas dependensi waktu.
  return { time: 0, date: ((2020 - 1980) << 9) | (1 << 5) | 1 }
}

function u16(n: number): number[] {
  return [n & 0xff, (n >>> 8) & 0xff]
}
function u32(n: number): number[] {
  return [n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]
}

function zip(entries: ZipEntry[]): Uint8Array {
  const { time, date } = dosDateTime()
  // Kumpulkan potongan sebagai Uint8Array — JANGAN spread array besar (data
  // sheet bisa ratusan KB → spread ke argumen fungsi memicu stack overflow).
  const pieces: Uint8Array[] = []
  const central: number[] = []
  let offset = 0

  for (const entry of entries) {
    const nameBytes = enc.encode(entry.name)
    const crc = crc32(entry.data)
    const size = entry.data.length

    // Local file header (kecil — aman untuk spread u16/u32)
    const local = Uint8Array.from([
      ...u32(0x04034b50), ...u16(20), ...u16(0), ...u16(0),
      ...u16(time), ...u16(date), ...u32(crc), ...u32(size), ...u32(size),
      ...u16(nameBytes.length), ...u16(0),
    ])
    pieces.push(local, nameBytes, entry.data)

    // Central directory record (per entry ~46 byte, jumlah entry sedikit)
    central.push(
      ...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0), ...u16(0),
      ...u16(time), ...u16(date), ...u32(crc), ...u32(size), ...u32(size),
      ...u16(nameBytes.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0),
      ...u32(0), ...u32(offset),
    )
    for (const byte of nameBytes) central.push(byte)

    offset += local.length + nameBytes.length + size
  }

  const centralArr = Uint8Array.from(central)
  const eocd = Uint8Array.from([
    ...u32(0x06054b50), ...u16(0), ...u16(0),
    ...u16(entries.length), ...u16(entries.length),
    ...u32(centralArr.length), ...u32(offset), ...u16(0),
  ])
  pieces.push(centralArr, eocd)

  let total = 0
  for (const p of pieces) total += p.length
  const out = new Uint8Array(total)
  let pos = 0
  for (const p of pieces) {
    out.set(p, pos)
    pos += p.length
  }
  return out
}

// --- Public API -------------------------------------------------------------
export function buildXlsx(sheet: SheetData): Uint8Array {
  const safeName = (sheet.sheetName || 'Sheet1').slice(0, 31).replace(/[\\/?*[\]:]/g, ' ')

  const contentTypes =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
    `<Default Extension="xml" ContentType="application/xml"/>` +
    `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
    `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
    `</Types>`

  const rels =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
    `</Relationships>`

  const workbook =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
    `<sheets><sheet name="${esc(safeName)}" sheetId="1" r:id="rId1"/></sheets></workbook>`

  const workbookRels =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>` +
    `</Relationships>`

  return zip([
    { name: '[Content_Types].xml', data: enc.encode(contentTypes) },
    { name: '_rels/.rels', data: enc.encode(rels) },
    { name: 'xl/workbook.xml', data: enc.encode(workbook) },
    { name: 'xl/_rels/workbook.xml.rels', data: enc.encode(workbookRels) },
    { name: 'xl/worksheets/sheet1.xml', data: enc.encode(sheetXml(sheet)) },
  ])
}

/** Bangun .xlsx lalu picu unduhan di browser. */
export function downloadXlsx(filename: string, sheet: SheetData): void {
  const bytes = buildXlsx(sheet)
  const blob = new Blob([bytes as BlobPart], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
