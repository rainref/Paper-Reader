import { useState } from 'react'
import { paperApi } from '../api/paperApi'

interface ImportDialogProps {
  onClose: () => void
  onImport: () => void
}

export default function ImportDialog({ onClose, onImport }: ImportDialogProps) {
  const [mode, setMode] = useState<'file' | 'url' | 'arxiv'>('file')
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [arxivId, setArxivId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleImport = async () => {
    setLoading(true)
    setError('')
    try {
      await paperApi.importPaper(
        mode === 'file' ? file || undefined : undefined,
        mode === 'url' ? url : undefined,
        mode === 'arxiv' ? arxivId : undefined
      )
      onImport()
      onClose()
    } catch (e: any) {
      setError(e.response?.data?.detail || e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: '#fff', padding: 24, borderRadius: 8, width: 400 }}>
        <h2>Import Paper</h2>

        <div style={{ marginBottom: 16 }}>
          <button onClick={() => setMode('file')}>File</button>
          <button onClick={() => setMode('url')}>URL</button>
          <button onClick={() => setMode('arxiv')}>arXiv</button>
        </div>

        {mode === 'file' && (
          <input type="file" accept=".pdf" onChange={e => setFile(e.target.files?.[0] || null)} />
        )}

        {mode === 'url' && (
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="PDF URL"
            style={{ width: '100%' }}
          />
        )}

        {mode === 'arxiv' && (
          <input
            type="text"
            value={arxivId}
            onChange={e => setArxivId(e.target.value)}
            placeholder="arXiv ID (e.g., 2312.12345)"
            style={{ width: '100%' }}
          />
        )}

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleImport} disabled={loading}>
            {loading ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  )
}
