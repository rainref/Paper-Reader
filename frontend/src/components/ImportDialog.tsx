import { useState } from 'react'
import { paperApi } from '../api/paperApi'

interface ImportDialogProps {
  onClose: () => void
  onImport: () => void
}

// Icons
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
)

const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
)

const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
)

const LoaderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
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

type ImportMode = 'file' | 'url' | 'arxiv'

const modeConfig: { mode: ImportMode; label: string; icon: React.FC; description: string }[] = [
  { mode: 'file', label: 'Upload File', icon: UploadIcon, description: 'Select a PDF from your computer' },
  { mode: 'url', label: 'From URL', icon: LinkIcon, description: 'Import from a web URL' },
  { mode: 'arxiv', label: 'arXiv ID', icon: BookIcon, description: 'Enter an arXiv paper ID' },
]

export default function ImportDialog({ onClose, onImport }: ImportDialogProps) {
  const [mode, setMode] = useState<ImportMode>('file')
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
      setError(e.response?.data?.detail || e.message || 'Failed to import paper')
    } finally {
      setLoading(false)
    }
  }

  const canImport = () => {
    if (loading) return false
    switch (mode) {
      case 'file': return file !== null
      case 'url': return url.trim() !== ''
      case 'arxiv': return arxivId.trim() !== ''
    }
  }

  return (
    <div
      className="animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: 20
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: 480,
        boxShadow: 'var(--shadow-lg)',
        animation: 'slideUp 200ms ease'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid var(--color-border)'
        }}>
          <h2 style={{ fontSize: 18, fontFamily: 'var(--font-heading)' }}>Import Paper</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              color: 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <XIcon />
          </button>
        </div>

        {/* Mode Selection */}
        <div style={{ padding: '20px 24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            marginBottom: 24
          }}>
            {modeConfig.map(({ mode: m, label, icon: Icon }) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  padding: 16,
                  backgroundColor: mode === m ? 'var(--color-primary)' : 'var(--color-background)',
                  color: mode === m ? 'white' : 'var(--color-text)',
                  border: `2px solid ${mode === m ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all var(--transition)',
                  minHeight: 88
                }}
              >
                <Icon />
                <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ marginBottom: 16 }}>
            {mode === 'file' && (
              <div>
                <label
                  htmlFor="file-upload"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 32,
                    border: '2px dashed var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all var(--transition)',
                    backgroundColor: file ? 'rgba(37, 99, 235, 0.05)' : 'transparent'
                  }}
                >
                  {file ? (
                    <>
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-success)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 12,
                        color: 'white'
                      }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                      <p style={{ fontWeight: 500, marginBottom: 4 }}>{file.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </>
                  ) : (
                    <>
                      <UploadIcon />
                      <p style={{ fontWeight: 500, marginTop: 12, marginBottom: 4 }}>Click to upload PDF</p>
                      <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>or drag and drop</p>
                    </>
                  )}
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => { setFile(e.target.files?.[0] || null); setError('') }}
                  style={{ display: 'none' }}
                />
              </div>
            )}

            {mode === 'url' && (
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                  PDF URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setError('') }}
                  placeholder="https://example.com/paper.pdf"
                  className="input"
                  autoFocus
                />
              </div>
            )}

            {mode === 'arxiv' && (
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                  arXiv ID
                </label>
                <input
                  type="text"
                  value={arxivId}
                  onChange={(e) => { setArxivId(e.target.value); setError('') }}
                  placeholder="e.g., 2312.12345"
                  className="input"
                  autoFocus
                />
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>
                  Enter the numeric ID from arXiv.org (e.g., 2312.12345)
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--color-error)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-error)',
              fontSize: 14,
              marginBottom: 16
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12,
          padding: '16px 24px',
          borderTop: '1px solid var(--color-border)'
        }}>
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleImport}
            disabled={!canImport()}
            style={{ minWidth: 120 }}
          >
            {loading ? (
              <>
                <LoaderIcon />
                Importing...
              </>
            ) : (
              'Import'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
