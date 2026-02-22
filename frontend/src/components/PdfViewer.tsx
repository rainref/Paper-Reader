import { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

// Set worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

interface PdfViewerProps {
  url: string
  onPageChange?: (page: number) => void
}

export default function PdfViewer({ url, onPageChange }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null)
  const [pageNum, setPageNum] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const [scale, setScale] = useState(1.5)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    pdfjsLib.getDocument(url).promise.then(pdfDoc => {
      setPdf(pdfDoc)
      setNumPages(pdfDoc.numPages)
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

  const prevPage = () => {
    if (pageNum > 1) {
      setPageNum(pageNum - 1)
      onPageChange?.(pageNum - 1)
    }
  }

  const nextPage = () => {
    if (pageNum < numPages) {
      setPageNum(pageNum + 1)
      onPageChange?.(pageNum + 1)
    }
  }

  const zoomIn = () => setScale(s => Math.min(s + 0.25, 3))
  const zoomOut = () => setScale(s => Math.max(s - 0.25, 0.5))

  if (loading) return <div>Loading PDF...</div>

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <button onClick={prevPage} disabled={pageNum <= 1}>Prev</button>
        <span>{pageNum} / {numPages}</span>
        <button onClick={nextPage} disabled={pageNum >= numPages}>Next</button>
        <button onClick={zoomOut}>-</button>
        <button onClick={zoomIn}>+</button>
      </div>
      <canvas ref={canvasRef} style={{ border: '1px solid #ccc' }} />
    </div>
  )
}
