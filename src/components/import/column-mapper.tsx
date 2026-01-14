"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { autoMapColumns } from "@/lib/utils/csv-parser"
import { AlertCircle, CheckCircle2, ArrowRight } from "lucide-react"

interface ColumnMapperProps {
  csvHeaders: string[]
  onMappingComplete: (mapping: Record<string, string>) => void
}

const FIELD_OPTIONS = [
  { value: 'skip', label: 'Skip this column', required: false },
  { value: 'name', label: 'Customer Name', required: true },
  { value: 'email', label: 'Email Address', required: false },
  { value: 'phone', label: 'Phone Number', required: false },
  { value: 'street_address', label: 'Street Address', required: false },
  { value: 'city', label: 'City', required: false },
  { value: 'state', label: 'State/Province', required: false },
  { value: 'postal_code', label: 'ZIP/Postal Code', required: false },
  { value: 'status', label: 'Customer Status', required: false },
  { value: 'source', label: 'Lead Source', required: false },
  { value: 'notes', label: 'Notes', required: false },
]

export function ColumnMapper({ csvHeaders, onMappingComplete }: ColumnMapperProps) {
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    // Auto-map columns when component mounts
    const autoMapping = autoMapColumns(csvHeaders)
    
    // Ensure all headers have a default mapping (skip if not auto-mapped)
    const completeMapping: Record<string, string> = {}
    csvHeaders.forEach(header => {
      completeMapping[header] = autoMapping[header] || 'skip'
    })
    
    setMapping(completeMapping)
  }, [csvHeaders])

  const handleMappingChange = (csvHeader: string, fieldValue: string) => {
    setMapping(prev => ({
      ...prev,
      [csvHeader]: fieldValue
    }))
  }

  const validateMapping = (): string[] => {
    const validationErrors: string[] = []
    
    // Check if name field is mapped
    const hasNameMapping = Object.values(mapping).includes('name')
    if (!hasNameMapping) {
      validationErrors.push('Customer Name is required - please map at least one column to Customer Name')
    }

    // Check for duplicate mappings (except skip)
    const mappedFields = Object.values(mapping).filter(value => value !== 'skip')
    const duplicates = mappedFields.filter((field, index) => 
      mappedFields.indexOf(field) !== index
    )
    
    if (duplicates.length > 0) {
      const uniqueDuplicates = [...new Set(duplicates)]
      validationErrors.push(
        `The following fields are mapped multiple times: ${uniqueDuplicates.join(', ')}`
      )
    }

    return validationErrors
  }

  const handleContinue = () => {
    const validationErrors = validateMapping()
    setErrors(validationErrors)
    
    if (validationErrors.length === 0) {
      onMappingComplete(mapping)
    }
  }

  const getFieldLabel = (fieldValue: string): string => {
    const field = FIELD_OPTIONS.find(option => option.value === fieldValue)
    return field ? field.label : 'Unknown Field'
  }

  const isFieldRequired = (fieldValue: string): boolean => {
    const field = FIELD_OPTIONS.find(option => option.value === fieldValue)
    return field?.required || false
  }

  const getMappedField = (csvHeader: string): string => {
    return mapping[csvHeader] || 'skip'
  }

  const hasNameMapping = Object.values(mapping).includes('name')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRight className="h-5 w-5" />
          Map Your Columns
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Match your CSV columns to our customer fields. We've auto-detected some matches for you.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {errors.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="font-medium text-red-800">Please fix these issues:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {csvHeaders.map((csvHeader) => {
            const mappedField = getMappedField(csvHeader)
            const isRequired = mappedField && isFieldRequired(mappedField)
            
            // Debug: Ensure we never pass empty string to Select
            const safeValue = mappedField || 'skip'
            
            return (
              <div key={csvHeader} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {csvHeader}
                    </span>
                    {mappedField && isRequired && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                
                <Select
                  value={safeValue}
                  onValueChange={(value) => handleMappingChange(csvHeader, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose field to map to..." />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <span>{option.label}</span>
                          {option.required && (
                            <Badge variant="destructive" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )
          })}
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Mapping Summary</h4>
          <div className="grid gap-2 text-sm">
            {Object.entries(mapping)
              .filter(([_, fieldValue]) => fieldValue !== 'skip')
              .map(([csvHeader, fieldValue]) => (
                <div key={csvHeader} className="flex items-center justify-between">
                  <span className="text-gray-600">{csvHeader}</span>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                    <span className="font-medium">{getFieldLabel(fieldValue)}</span>
                    {isFieldRequired(fieldValue) && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {hasNameMapping ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm text-green-700">Ready to import</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-yellow-700">Customer Name mapping required</span>
              </>
            )}
          </div>
          
          <Button 
            onClick={handleContinue}
            disabled={!hasNameMapping}
            className="min-w-32"
          >
            Continue to Preview
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}