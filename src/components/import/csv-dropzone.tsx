"use client"

import { useState, useCallback } from "react"
import { Upload, File, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface CSVDropzoneProps {
  onFileSelect: (file: File) => void
  selectedFile?: File | null
  onClear?: () => void
}

export function CSVDropzone({ onFileSelect, selectedFile, onClear }: CSVDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true)
    }
  }, [])

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (file && isValidFile(file)) {
        onFileSelect(file)
      }
    }
  }, [onFileSelect])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (file && isValidFile(file)) {
        onFileSelect(file)
      }
    }
  }, [onFileSelect])

  const isValidFile = (file: File): boolean => {
    const validTypes = ['.csv', '.txt']
    const fileName = file.name.toLowerCase()
    const isValidType = validTypes.some(type => fileName.endsWith(type)) || 
                       file.type === 'text/csv' || 
                       file.type === 'text/plain'
    
    if (!isValidType) {
      alert('Please select a CSV or TXT file')
      return false
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('File size must be less than 5MB')
      return false
    }

    return true
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (selectedFile) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <File className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            {onClear && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClear}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Remove
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`transition-colors ${isDragOver ? 'border-blue-500 bg-blue-50' : ''}`}>
      <CardContent className="p-8">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors hover:border-gray-400 cursor-pointer"
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('csv-file-input')?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Upload your customer data
          </h3>
          <p className="text-gray-600 mb-4">
            Drag and drop your CSV file here, or click to browse
          </p>
          <div className="text-sm text-gray-500 space-y-1">
            <p>Supported formats: CSV, TXT</p>
            <p>Maximum file size: 5MB</p>
          </div>
          
          <input
            id="csv-file-input"
            type="file"
            accept=".csv,.txt,text/csv,text/plain"
            onChange={handleFileInput}
            className="hidden"
          />
          
          <Button className="mt-4" type="button">
            Choose File
          </Button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Tips for best results:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Include column headers in the first row</li>
            <li>• Use standard field names like "Name", "Email", "Phone"</li>
            <li>• Save your spreadsheet as CSV format</li>
            <li>• Remove any empty rows or columns</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}