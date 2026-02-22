import { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

// Set worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

interface PdfViewerProps {
  url: string
  onPageChange?: (page: number) => void
}

// Icons
const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

const ZoomInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="11" y1="8" x2="11" y2="14"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
)

const ZoomOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
)

const LoaderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <line x1="12" y1="2" x2="12" y2="6"/>
    <line x1="12" y1="18" x2="12" y2="22"/>
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
    <line x1="2" y1="12" x2="6" y2="12"/>
    <line x1="18" y1="12" x2="22" y2="12"/>
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
  </svg>
)

export default function PdfViewer({ url, onPageChange }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null)
  const [pageNum, setPageNum] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const [scale, setScale] = useState(1.2)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    pdfjsLib.getDocument(url).promise.then(pdfDoc => {
      setPdf(pdfDoc)
      setNumPages(pdfDoc.numPages)
      setPageNum(1)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [url])

  useEffect(() => {
    if (!pdf || !canvasRef.current) return

    pdf.getPage(pageNum).then(page => {
      const canvas = canvasRef.current!
      const context = canvas.getContext('2d')!
      const viewport = page.getViewport({ scale })

      canvas.height = viewport.height
      canvas.width = viewport.width

      page.render({
        canvasContext: context,
        viewport
      })
    })
  }, [pdf, pageNum, scale])

  const goToPage = (page: number) => {
    if (page >= 1 && page <= numPages) {
      setPageNum(page)
      onPageChange?.(page)
    }
  }

  const zoomIn = () => setScale(s => Math.min(s + 0.2, 3))
  const zoomOut = () => setScale(s => Math.max(s - 0.2, 0.5))

  const scalePercent = Math.round(scale * 100)

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: 400,
        backgroundColor: 'var(--color-background)'
      }}>
        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <LoaderIcon />
          <p style={{ marginTop: 16 }}>Loading PDF...</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '12px 16px',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        flexWrap: 'wrap'
      }}>
        {/* Page Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => goToPage(1)}
            disabled={pageNum <= 1}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', minHeight: 36 }}
            title="First page"
            aria-label="First page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="11 17 6 12 11 7"/>
              <polyline points="18 17 13 12 18 7"/>
            </svg>
          </button>
          <button
            onClick={() => goToPage(pageNum - 1)}
            disabled={pageNum <= 1}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', minHeight: 36 }}
            aria-label="Previous page"
          >
            <ChevronLeftIcon />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="number"
              value={pageNum}
              onChange={(e) => {
                const val = parseInt(e.target.value)
                if (!isNaN(val)) goToPage(val)
              }}
              min={1}
              max={numPages}
              style={{
                width: 50,
                padding: '6px 8px',
                textAlign: 'center',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 14
              }}
            />
            <span style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>/ {numPages}</span>
          </div>

          <button
            onClick={() => goToPage(pageNum + 1)}
            disabled={pageNum >= numPages}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', minHeight: 36 }}
            aria-label="Next page"
          >
            <ChevronRightIcon />
          </button>
          <button
            onClick={() => goToPage(numPages)}
            disabled={pageNum >= numPages}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', minHeight: 36 }}
            title="Last page"
            aria-label="Last page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="13 17 18 12 13 7"/>
              <polyline points="6 17 11 12 6 7"/>
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 24, backgroundColor: 'var(--color-border)', margin: '0 8px' }} />

        {/* Zoom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', minHeight: 36 }}
            aria-label="Zoom out"
          >
            <ZoomOutIcon />
          </button>

          <span style={{
            minWidth: 50,
            textAlign: 'center',
            fontSize: 14,
            color: 'var(--color-text)'
          }}>
            {scalePercent}%
          </span>

          <button
            onClick={zoomIn}
            disabled={scale >= 3}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', minHeight: 36 }}
            aria-label="Zoom in"
          >
            <ZoomInIcon />
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: 'var(--color-background)'
      }}>
        <canvas
          ref={canvasRef}
          style={{
            boxShadow: 'var(--shadow-lg)',
            backgroundColor: 'white'
          }}
        />
      </div>
    </div>
  )
}
