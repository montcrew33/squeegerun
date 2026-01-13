"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle, FileUp, MapPin, Eye, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CSVDropzone } from "@/components/import/csv-dropzone"
import { ColumnMapper } from "@/components/import/column-mapper"
import { ImportPreview } from "@/components/import/import-preview"
import { parseCSV, type CSVParseResult } from "@/lib/utils/csv-parser"
import { importCustomersAction } from "@/lib/actions/customers"

type ImportStep = 'upload' | 'mapping' | 'preview' | 'importing' | 'complete'

interface ImportResult {
  success: number
  failed: number
  errors: Array<{
    row: number
    message: string
    data?: any
  }>
  total: number
}

export default function ImportPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<CSVParseResult | null>(null)
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const steps = [
    { id: 'upload', title: 'Upload CSV', icon: FileUp },
    { id: 'mapping', title: 'Map Columns', icon: MapPin },
    { id: 'preview', title: 'Preview Data', icon: Eye },
    { id: 'complete', title: 'Import Complete', icon: CheckCircle },
  ]

  const getStepNumber = (stepId: string): number => {
    return steps.findIndex(step => step.id === stepId) + 1
  }

  const getCurrentStepNumber = (): number => {
    if (currentStep === 'importing') return 4
    return getStepNumber(currentStep)
  }

  const getProgressPercentage = (): number => {
    const stepNumber = getCurrentStepNumber()
    return (stepNumber / 4) * 100
  }

  const handleFileSelect = async (file: File) => {
    setError(null)
    setSelectedFile(file)
    
    try {
      const result = await parseCSV(file)
      
      if (result.error) {
        setError(result.error)
        return
      }
      
      if (result.headers.length === 0) {
        setError('No column headers found in the CSV file')
        return
      }

      setCsvData(result)
      setCurrentStep('mapping')
    } catch (err) {
      setError('Failed to parse CSV file. Please check the file format.')
      console.error('CSV parsing error:', err)
    }
  }

  const handleMappingComplete = (mapping: Record<string, string>) => {
    setColumnMapping(mapping)
    setCurrentStep('preview')
  }

  const handleConfirmImport = async (validData: Record<string, string>[]) => {
    if (validData.length === 0) {
      setError('No valid data to import')
      return
    }

    setIsImporting(true)
    setCurrentStep('importing')
    setError(null)

    try {
      const result = await importCustomersAction(validData)
      setImportResult(result)
      setCurrentStep('complete')
    } catch (err) {
      setError('Failed to import customers. Please try again.')
      console.error('Import error:', err)
      setCurrentStep('preview')
    } finally {
      setIsImporting(false)
    }
  }

  const handleStartOver = () => {
    setCurrentStep('upload')
    setSelectedFile(null)
    setCsvData(null)
    setColumnMapping({})
    setImportResult(null)
    setError(null)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <div className="space-y-6">
            <CSVDropzone
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              onClear={() => {
                setSelectedFile(null)
                setCsvData(null)
                setError(null)
              }}
            />
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}
          </div>
        )

      case 'mapping':
        return csvData ? (
          <ColumnMapper
            csvHeaders={csvData.headers}
            onMappingComplete={handleMappingComplete}
          />
        ) : null

      case 'preview':
        return csvData ? (
          <ImportPreview
            previewData={csvData.rows}
            mapping={columnMapping}
            onConfirmImport={handleConfirmImport}
            onBack={() => setCurrentStep('mapping')}
          />
        ) : null

      case 'importing':
        return (
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <Users className="h-16 w-16 mx-auto text-blue-500 animate-pulse" />
              <h3 className="text-xl font-semibold">Importing Your Customers...</h3>
              <p className="text-muted-foreground">
                Please wait while we process your data. This may take a few moments.
              </p>
              <Progress value={50} className="w-full max-w-md mx-auto" />
            </CardContent>
          </Card>
        )

      case 'complete':
        return importResult ? (
          <Card>
            <CardContent className="p-8 text-center space-y-6">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Import Complete!</h3>
                <p className="text-muted-foreground">
                  Your customer data has been successfully imported.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {importResult.success}
                  </div>
                  <div className="text-sm text-green-700">Imported</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {importResult.failed}
                  </div>
                  <div className="text-sm text-red-700">Failed</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {importResult.total}
                  </div>
                  <div className="text-sm text-blue-700">Total</div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl mx-auto">
                  <h4 className="font-medium text-yellow-800 mb-2">
                    Rows with errors ({importResult.errors.length}):
                  </h4>
                  <div className="text-sm text-yellow-700 max-h-32 overflow-y-auto space-y-1">
                    {importResult.errors.map((error, index) => (
                      <div key={index}>
                        Row {error.row}: {error.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link href="/customers">
                    View Customers
                  </Link>
                </Button>
                <Button variant="outline" onClick={handleStartOver}>
                  Import More Data
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/customers">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Import Customers</h1>
          <p className="text-muted-foreground">
            Upload a CSV file to bulk import your customer data
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-lg">Import Progress</CardTitle>
            <span className="text-sm text-muted-foreground">
              Step {getCurrentStepNumber()} of 4
            </span>
          </div>
          <Progress value={getProgressPercentage()} className="w-full" />
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const stepNumber = index + 1
              const isActive = stepNumber === getCurrentStepNumber()
              const isCompleted = stepNumber < getCurrentStepNumber()
              const isImporting = currentStep === 'importing' && stepNumber === 4
              
              return (
                <div 
                  key={step.id} 
                  className={`flex flex-col items-center ${
                    isActive ? 'text-blue-600' : 
                    isCompleted ? 'text-green-600' : 
                    'text-gray-400'
                  }`}
                >
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 mb-2
                    ${isActive ? 'border-blue-600 bg-blue-50' : 
                      isCompleted ? 'border-green-600 bg-green-50' : 
                      'border-gray-300 bg-white'}
                    ${isImporting ? 'animate-pulse' : ''}
                  `}>
                    <StepIcon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-center">
                    {step.title}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {renderStepContent()}
    </div>
  )
}