/**
 * FileUpload Component
 * GHXSTSHIP Entertainment Platform - File upload
 */

'use client'

import * as React from 'react'
import { useRef, useState } from 'react'
import styles from './FileUpload.module.css'

export interface FileUploadProps {
  accept?: string
  multiple?: boolean
  maxSize?: number
  onFileSelect?: (files: File[]) => void
  disabled?: boolean
  className?: string
  label?: string
  error?: string
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  multiple = false,
  maxSize,
  onFileSelect,
  disabled = false,
  className = '',
  label,
  error,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    processFiles(files)
  }

  const processFiles = (files: File[]) => {
    let validFiles = files

    if (maxSize) {
      validFiles = files.filter(file => file.size <= maxSize)
    }

    setSelectedFiles(validFiles)
    onFileSelect?.(validFiles)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files)
      processFiles(files)
    }
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  return (
    <div className={`${styles.container} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      
      <div
        className={`${styles.dropzone} ${dragActive ? styles.active : ''} ${error ? styles.error : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          disabled={disabled}
          className={styles.input}
        />
        <div
          className={styles.dropzone}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={0}
        >
          <span className={styles.icon}>↑</span>
          <span className={styles.text}>
            {selectedFiles.length > 0
              ? `${selectedFiles.length} file(s) selected`
              : 'Click or drag files here'}
          </span>
          {maxSize && (
            <span className={styles.hint}>
              Max size: {formatBytes(maxSize)}
            </span>
          )}
        </div>
      </div>

      {error && <span className={styles.errorText}>{error}</span>}

      {selectedFiles.length > 0 && (
        <div className={styles.fileList}>
          {selectedFiles.map((file, index) => (
            <div key={index} className={styles.fileItem}>
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileSize}>{formatBytes(file.size)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

FileUpload.displayName = 'FileUpload'
