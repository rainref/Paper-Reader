import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { paperApi, Paper, TocItem } from '../api/paperApi'
import PdfViewer from '../components/PdfViewer'
import MarkdownView from '../components/MarkdownView'
import AIChat from '../components/AIChat'
import TranslationPanel from '../components/TranslationPanel'

type ViewMode = 'pdf' | 'markdown'
type Tab = 'ai' | 'translate' | null

// Icons
const ListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
)

const MessageSquareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
)

const MarkdownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <line x1="10" y1="9" x2="8" y2="9"/>
  </svg>
)

const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

const LoaderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
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

export default function PaperView() {
  const { id } = useParams<{ id: string }>()
  const [paper, setPaper] = useState<Paper | null>(null)
  const [toc, setToc] = useState<TocItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('pdf')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (!id) return

    Promise.all([
      paperApi.getPaper(id),
      paperApi.getToc(id)
    ]).then(([p, t]) => {
      setPaper(p)
      setToc(t.toc || [])
    }).catch(() => {
      setPaper(null)
    }).finally(() => setLoading(false))
  }, [id])

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
          <LoaderIcon />
          <p style={{ color: 'var(--color-text-muted)', marginTop: 16 }}>Loading paper...</p>
        </div>
      </div>
    )
  }

  if (!paper) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-background)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: 16 }}>Paper not found</h2>
          <Link to="/" className="btn btn-primary">
            <HomeIcon />
            Back to Library
          </Link>
        </div>
      </div>
    )
  }

  const pdfUrl = `/api/papers/${id}/pdf`

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--color-background)' }}>
      {/* TOC Sidebar */}
      <aside style={{
        width: 280,
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-text-muted)',
              textDecoration: 'none'
            }}
          >
            <HomeIcon />
          </Link>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontSize: 14,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {paper.title}
            </h3>
            <p style={{
              fontSize: 12,
              color: 'var(--color-text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {paper.authors}
            </p>
          </div>
        </div>

        {/* TOC */}
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
            color: 'var(--color-text-muted)',
            fontSize: 12,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            <ListIcon />
            Table of Contents
          </div>

          {toc.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
              No table of contents available
            </p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {toc.map((item, i) => (
                <li key={i}>
                  <a
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentPage(item.page)
                    }}
                    style={{
                      display: 'block',
                      padding: '8px 12px',
                      marginLeft: (item.level - 1) * 12,
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 13,
                      color: 'var(--color-text)',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      transition: 'all var(--transition)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-background)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Toolbar */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '12px 20px',
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)'
        }}>
          {/* View Mode Toggle */}
          <div style={{ display: 'flex', gap: 4, marginRight: 16 }}>
            <button
              className={`btn ${viewMode === 'pdf' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('pdf')}
              style={{ padding: '8px 16px', minHeight: 40 }}
            >
              <FileTextIcon />
              PDF
            </button>
            <button
              className={`btn ${viewMode === 'markdown' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('markdown')}
              style={{ padding: '8px 16px', minHeight: 40 }}
            >
              <MarkdownIcon />
              Markdown
            </button>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 24, backgroundColor: 'var(--color-border)', margin: '0 8px' }} />

          <button
            className={`btn ${tab === 'ai' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab(tab === 'ai' ? null : 'ai')}
            style={{ padding: '8px 16px', minHeight: 40 }}
          >
            <MessageSquareIcon />
            AI Assistant
          </button>
          <button
            className={`btn ${tab === 'translate' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab(tab === 'translate' ? null : 'translate')}
            style={{ padding: '8px 16px', minHeight: 40 }}
          >
            <GlobeIcon />
            Translate
          </button>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {viewMode === 'pdf' ? (
            <PdfViewer
              key={currentPage}
              url={pdfUrl}
              initialPage={currentPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          ) : (
            <MarkdownView
              paperId={id!}
            />
          )}
        </div>
      </main>

      {/* Side Panel */}
      {tab && id && (
        <aside style={{
          width: 360,
          backgroundColor: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {tab === 'ai' && <AIChat paperId={id} />}
          {tab === 'translate' && <TranslationPanel paperId={id} />}
        </aside>
      )}
    </div>
  )
}
