import { Camera, FileText, RefreshCw, X } from 'lucide-react'
import { useEffect, useId, useMemo, useRef } from 'react'
import { cn } from '../../lib/cn'
import { formatBytes } from '../../lib/format'

interface Props {
  value: File | null | undefined
  onChange: (file: File | null) => void
  accept?: string
  label?: string
  error?: string
  compact?: boolean
  allowPdf?: boolean
}

export function useObjectUrl(file: File | null | undefined) {
  const url = useMemo(() => (file && file.type.startsWith('image/') ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url)
  }, [url])
  return url
}

export function PhotoUpload({ value, onChange, accept = 'image/jpeg,image/png', label = 'Upload passport photo', error, compact, allowPdf }: Props) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const preview = useObjectUrl(value)
  const box = compact ? 'size-20' : 'h-36 w-28'

  return (
    <div>
      <div className="flex items-center gap-4">
        <label
          htmlFor={id}
          className={cn(
            'group relative grid shrink-0 cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed transition-colors',
            box,
            error ? 'border-red-300 bg-red-50' : 'border-primary-900/15 bg-primary-50/40 hover:border-primary-600 hover:bg-primary-50',
          )}
        >
          {preview ? (
            <img src={preview} alt="Selected" className="size-full object-cover" />
          ) : value ? (
            <FileText className="size-7 text-primary-700" />
          ) : (
            <Camera className="size-6 text-primary-700/60 transition-transform group-hover:scale-110" />
          )}
        </label>
        <div className="min-w-0 text-sm">
          {value ? (
            <>
              <p className="truncate font-medium text-ink">{value.name}</p>
              <p className="text-ink/50">{formatBytes(value.size)}</p>
              <div className="mt-2 flex gap-3">
                <button type="button" onClick={() => input.current?.click()} className="inline-flex items-center gap-1 font-semibold text-primary-700 hover:underline">
                  <RefreshCw className="size-3.5" /> Change
                </button>
                <button type="button" onClick={() => onChange(null)} className="inline-flex items-center gap-1 font-semibold text-red-600 hover:underline">
                  <X className="size-3.5" /> Remove
                </button>
              </div>
            </>
          ) : (
            <>
              <button type="button" onClick={() => input.current?.click()} className="font-semibold text-primary-700 hover:underline">
                {label}
              </button>
              <p className="text-ink/50">{allowPdf ? 'JPG, PNG or PDF' : 'JPG or PNG, plain background'}</p>
            </>
          )}
        </div>
      </div>
      <input
        id={id}
        ref={input}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          onChange(e.target.files?.[0] ?? null)
          e.target.value = ''
        }}
      />
      {error && (
        <p role="alert" className="mt-2 text-[13px] font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
