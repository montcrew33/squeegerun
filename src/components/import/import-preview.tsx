"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Eye, FileText } from "lucide-react"
import { z } from "zod"

interface ImportError {
  row: number
  message: string
  field?: string
}

interface PreviewRow {
  original: Record<string, string>
  mapped: Record<string, string>
  errors: ImportError[]
  isValid: boolean
}

interface ImportPreviewProps {
  previewData: Record<string, string>[]
  mapping: Record<string, string>
  onConfirmImport: (validData: Record<string, string>[]) => void
  onBack: () => void
}

// Validation schema for preview
const previewRowSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  email: z.union([
    z.string().email('Invalid email address'),
    z.string().length(0)
  ]).optional(),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive', 'prospect']).optional(),
  source: z.enum(['referral', 'online', 'walk-in', 'phone', 'other']).optional(),
  notes: z.string().optional(),
  street_address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
})

export function ImportPreview({ 
  previewData, 
  mapping, 
  onConfirmImport, 
  onBack 
}: ImportPreviewProps) {
  const [processedRows, setProcessedRows] = useState<PreviewRow[]>([])
  const [validRows, setValidRows] = useState<Record<string, string>[]>([])
  const [showAllRows, setShowAllRows] = useState(false)

  useEffect(() => {
    processPreviewData()
  }, [previewData, mapping])

  const processPreviewData = () => {
    const processed: PreviewRow[] = []
    const valid: Record<string, string>[] = []

    previewData.forEach((row, index) => {
      // Map the row data according to the column mapping
      const mappedRow: Record<string, string> = {}
      
      Object.entries(mapping).forEach(([csvHeader, fieldName]) => {
        if (fieldName && fieldName !== 'skip') {
          mappedRow[fieldName] = row[csvHeader]?.trim() || ''
        }
      })

      // Skip completely empty rows
      if (!mappedRow.name || !mappedRow.name.trim()) {
        return
      }

      const errors: ImportError[] = []
      let isValid = true

      try {
        // Validate the mapped row
        previewRowSchema.parse(mappedRow)
      } catch (error) {
        isValid = false
        if (error instanceof z.ZodError) {
          error.issues.forEach(err => {
            errors.push({
              row: index + 2, // +2 for header row and 0-based index
              message: err.message,
              field: err.path.join('.')
            })
          })
        }
      }

      const processedRow: PreviewRow = {
        original: row,
        mapped: mappedRow,
        errors,
        isValid
      }

      processed.push(processedRow)
      
      if (isValid) {
        valid.push(mappedRow)
      }
    })

    setProcessedRows(processed)
    setValidRows(valid)
  }

  const getFieldDisplayName = (fieldKey: string): string => {
    const fieldNames: Record<string, string> = {
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      street_address: 'Street Address',
      city: 'City',
      state: 'State',
      postal_code: 'ZIP Code',
      status: 'Status',
      source: 'Source',
      notes: 'Notes'
    }
    return fieldNames[fieldKey] || fieldKey
  }

  const displayRows = showAllRows ? processedRows : processedRows.slice(0, 5)
  const totalRows = processedRows.length
  const validRowsCount = validRows.length
  const errorRowsCount = totalRows - validRowsCount

  const mappedFields = Object.values(mapping).filter(field => field !== 'skip')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Preview Import
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Review your data before importing. Rows with errors will be skipped.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{totalRows}</div>
              <div className="text-sm text-muted-foreground">Total Rows</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{validRowsCount}</div>
              <div className="text-sm text-muted-foreground">Ready to Import</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{errorRowsCount}</div>
              <div className="text-sm text-muted-foreground">With Errors</div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-3 border-b">
            <h4 className="font-medium">Data Preview</h4>
          </div>
          
          {displayRows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    {mappedFields.map(field => (
                      <th key={field} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {getFieldDisplayName(field)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayRows.map((row, index) => (
                    <tr 
                      key={index} 
                      className={row.isValid ? 'bg-white' : 'bg-red-50'}
                    >
                      <td className="px-3 py-2">
                        {row.isValid ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <div className="text-xs text-red-600">
                              {row.errors.map(error => error.message).join(', ')}
                            </div>
                          </div>
                        )}
                      </td>
                      {mappedFields.map(field => (
                        <td key={field} className="px-3 py-2 text-sm text-gray-900">
                          <div className="max-w-32 truncate" title={row.mapped[field] || '-'}>
                            {row.mapped[field] || '-'}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2" />
              <p>No valid data rows found</p>
            </div>
          )}
        </div>

        {/* Show More/Less */}
        {totalRows > 5 && (
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => setShowAllRows(!showAllRows)}
            >
              {showAllRows 
                ? `Show Less (First 5 of ${totalRows} rows)` 
                : `Show All ${totalRows} Rows`
              }
            </Button>
          </div>
        )}

        {/* Error Summary */}
        {errorRowsCount > 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">
                {errorRowsCount} row{errorRowsCount !== 1 ? 's' : ''} will be skipped
              </span>
            </div>
            <p className="text-sm text-yellow-700">
              Rows with validation errors will not be imported. You can fix these issues in your CSV file and try again.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={onBack}>
            Back to Mapping
          </Button>
          
          <div className="flex items-center gap-3">
            {validRowsCount > 0 ? (
              <>
                <span className="text-sm text-green-700">
                  Ready to import {validRowsCount} customer{validRowsCount !== 1 ? 's' : ''}
                </span>
                <Button onClick={() => onConfirmImport(validRows)}>
                  Import {validRowsCount} Customer{validRowsCount !== 1 ? 's' : ''}
                </Button>
              </>
            ) : (
              <div className="text-sm text-red-600">
                No valid rows to import
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}