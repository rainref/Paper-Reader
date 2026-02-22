import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { paperApi, Paper, TocItem } from '../api/paperApi'
import PdfViewer from '../components/PdfViewer'
import AIChat from '../components/AIChat'
import TranslationPanel from '../components/TranslationPanel'

type Tab = 'ai' | 'translate' | null

export default function PaperView() {
  const { id } = useParams<{ id: string }>()
  const [paper, setPaper] = useState<Paper | null>(null)
  const [toc, setToc] = useState<TocItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>(null)

  useEffect(() => {
    if (!id) return

    Promise.all([
      paperApi.getPaper(id),
      paperApi.getToc(id)
    ]).then(([p, t]) => {
      setPaper(p)
      setToc(t.toc)
    }).finally(() => setLoading(false))
  }, [id])

  if (loading || !paper) return <div>Loading...</div>

  const pdfUrl = `/api/papers/${id}/pdf`

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* TOC Sidebar */}
      <div style={{ width: 200, borderRight: '1px solid #ccc', overflow: 'auto', padding: 8 }}>
        <h3>Table of Contents</h3>
        {toc.length === 0 ? (
          <p>No TOC available</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {toc.map((item, i) => (
              <li key={i} style={{ marginLeft: (item.level - 1) * 16 }}>
                {item.title}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* PDF Viewer */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <PdfViewer url={pdfUrl} />
      </div>

      {/* Tab Buttons */}
      <div style={{ position: 'absolute', top: 8, right: 320 }}>
        <button onClick={() => setTab(tab === 'ai' ? null : 'ai')}>AI Chat</button>
        <button onClick={() => setTab(tab === 'translate' ? null : 'translate')}>Translate</button>
      </div>

      {/* Side Panel */}
      {tab === 'ai' && id && <AIChat paperId={id} />}
      {tab === 'translate' && id && <TranslationPanel paperId={id} />}
    </div>
  )
}
