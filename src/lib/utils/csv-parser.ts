export interface CSVParseResult {
  headers: string[]
  rows: Record<string, string>[]
  error?: string
}

export async function parseCSV(file: File): Promise<CSVParseResult> {
  try {
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return {
        headers: [],
        rows: [],
        error: 'File size exceeds 5MB limit'
      }
    }

    // Read file content
    const text = await file.text()
    
    // Remove UTF-8 BOM if present
    const cleanText = text.replace(/^\uFEFF/, '')
    
    if (!cleanText.trim()) {
      return {
        headers: [],
        rows: [],
        error: 'File is empty'
      }
    }

    // Auto-detect delimiter
    const delimiter = detectDelimiter(cleanText)
    
    // Parse CSV
    const lines = parseCSVLines(cleanText, delimiter)
    
    if (lines.length === 0) {
      return {
        headers: [],
        rows: [],
        error: 'No data found in file'
      }
    }

    const headers = lines[0]?.map(header => header.trim()) || []
    
    if (headers.length === 0) {
      return {
        headers: [],
        rows: [],
        error: 'No headers found in file'
      }
    }

    // Convert remaining lines to objects
    const rows: Record<string, string>[] = []
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      
      // Skip empty lines or undefined lines
      if (!line || line.every(cell => !cell.trim())) {
        continue
      }
      
      const row: Record<string, string> = {}
      
      for (let j = 0; j < headers.length; j++) {
        const header = headers[j]
        if (header) {
          const value = j < line.length ? line[j]?.trim() || '' : ''
          row[header] = value
        }
      }
      
      rows.push(row)
    }

    return {
      headers,
      rows,
    }
  } catch (error) {
    console.error('CSV parsing error:', error)
    return {
      headers: [],
      rows: [],
      error: 'Failed to parse CSV file. Please check the file format.'
    }
  }
}

function detectDelimiter(text: string): string {
  const sample = text.split('\n').slice(0, 5).join('\n') // Check first 5 lines
  
  const delimiters = [',', ';', '\t']
  const counts = delimiters.map(delimiter => ({
    delimiter,
    count: (sample.match(new RegExp(`\\${delimiter}`, 'g')) || []).length
  }))
  
  // Return delimiter with highest count, default to comma
  const bestMatch = counts.reduce((prev, current) => 
    current.count > prev.count ? current : prev
  )
  
  return bestMatch.count > 0 ? bestMatch.delimiter : ','
}

function parseCSVLines(text: string, delimiter: string): string[][] {
  const lines: string[][] = []
  const rows = text.split('\n')
  
  for (const row of rows) {
    if (!row.trim()) continue
    
    const cells: string[] = []
    let current = ''
    let inQuotes = false
    let i = 0
    
    while (i < row.length) {
      const char = row[i]
      const nextChar = row[i + 1]
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"'
          i += 2
          continue
        } else {
          // Toggle quote state
          inQuotes = !inQuotes
        }
      } else if (char === delimiter && !inQuotes) {
        // End of cell
        cells.push(current)
        current = ''
      } else {
        current += char
      }
      
      i++
    }
    
    // Add last cell
    cells.push(current)
    
    lines.push(cells)
  }
  
  return lines
}

// Common field mappings for auto-detection
export const FIELD_MAPPINGS: Record<string, string[]> = {
  name: ['name', 'customer name', 'full name', 'client name', 'customer', 'client'],
  email: ['email', 'email address', 'e-mail', 'mail'],
  phone: ['phone', 'phone number', 'telephone', 'tel', 'mobile', 'cell'],
  street_address: ['address', 'street address', 'street', 'address line 1', 'addr1', 'location'],
  city: ['city', 'town'],
  state: ['state', 'province', 'region'],
  postal_code: ['zip', 'zip code', 'postal code', 'postcode', 'post code'],
  status: ['status', 'customer status'],
  source: ['source', 'lead source', 'referral', 'how did you hear'],
  notes: ['notes', 'comments', 'remarks', 'description']
}

export function autoMapColumns(csvHeaders: string[]): Record<string, string> {
  const mapping: Record<string, string> = {}
  
  for (const csvHeader of csvHeaders) {
    const normalizedHeader = csvHeader.toLowerCase().trim()
    
    // Find matching field
    for (const [fieldName, variations] of Object.entries(FIELD_MAPPINGS)) {
      if (variations.some(variation => 
        normalizedHeader === variation || 
        normalizedHeader.includes(variation) ||
        variation.includes(normalizedHeader)
      )) {
        mapping[csvHeader] = fieldName
        break
      }
    }
  }
  
  return mapping
}