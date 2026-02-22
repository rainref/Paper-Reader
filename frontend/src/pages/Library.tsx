import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { paperApi, Paper } from '../api/paperApi'
import ImportDialog from '../components/ImportDialog'

// Icons as SVG components
const BookOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
)

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
)

export default function Library() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)
  const [showImport, setShowImport] = useState(false)

  const loadPapers = () => {
    paperApi.listPapers()
      .then(setPapers)
      .catch(() => setPapers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadPapers()
  }, [])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-background)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid var(--color-border)',
            borderTopColor: 'var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: 'var(--color-text-muted)' }}>Loading your library...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              backgroundColor: 'var(--color-primary)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <BookOpenIcon />
            </div>
            <h1 style={{ fontSize: 24, fontFamily: 'var(--font-heading)' }}>Paper Reader</h1>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowImport(true)}
            style={{ gap: 8 }}
          >
            <PlusIcon />
            Import Paper
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        {papers.length === 0 ? (
          <div className="animate-fade-in" style={{
            textAlign: 'center',
            padding: '80px 20px',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '2px dashed var(--color-border)'
          }}>
            <div style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>
              <FileTextIcon />
            </div>
            <h2 style={{ fontSize: 20, marginBottom: 8, color: 'var(--color-text)' }}>No papers yet</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>
              Import your first academic paper to get started
            </p>
            <button
              className="btn btn-cta"
              onClick={() => setShowImport(true)}
            >
              <PlusIcon />
              Import Your First Paper
            </button>
          </div>
        ) : (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24
            }}>
              <h2 style={{ fontSize: 20 }}>
                My Library
                <span style={{
                  fontSize: 14,
                  color: 'var(--color-text-muted)',
                  fontWeight: 400,
                  marginLeft: 8
                }}>
                {papers.length} {papers.length === 1 ? 'paper' : 'papers'}
              </span>
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 20
            }}>
              {papers.map((paper, index) => (
                <Link
                  key={paper.id}
                  to={`/paper/${paper.id}`}
                  className="card animate-slide-up"
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  <div style={{
                    width: '100%',
                    height: 120,
                    backgroundColor: 'var(--color-background)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    color: 'var(--color-primary)'
                  }}>
                    <FileTextIcon />
                  </div>
                  <h3 style={{
                    fontSize: 16,
                    fontWeight: 600,
                    marginBottom: 8,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {paper.title || 'Untitled Paper'}
                  </h3>
                  <p style={{
                    fontSize: 14,
                    color: 'var(--color-text-muted)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {paper.authors || 'Unknown authors'}
                  </p>
                  <div style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    color: 'var(--color-text-muted)'
                  }}>
                    <span>PDF</span>
                    <span>{new Date(paper.created_at).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>

      {showImport && (
        <ImportDialog
          onClose={() => setShowImport(false)}
          onImport={loadPapers}
        />
      )}
    </div>
  )
}
