import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { paperApi, Paper } from '../api/paperApi'
import ImportDialog from '../components/ImportDialog'

export default function Library() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)
  const [showImport, setShowImport] = useState(false)

  const loadPapers = () => {
    paperApi.listPapers()
      .then(setPapers)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadPapers()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>My Library</h1>
        <button onClick={() => setShowImport(true)}>+ Import Paper</button>
      </div>

      {papers.length === 0 ? (
        <p>No papers yet. Import your first paper!</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
          {papers.map(paper => (
            <Link
              key={paper.id}
              to={`/paper/${paper.id}`}
              style={{
                border: '1px solid #ccc',
                borderRadius: 8,
                padding: 16,
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <h3 style={{ fontSize: 16, marginBottom: 8 }}>{paper.title}</h3>
              <p style={{ fontSize: 12, color: '#666' }}>{paper.authors}</p>
            </Link>
          ))}
        </div>
      )}

      {showImport && (
        <ImportDialog
          onClose={() => setShowImport(false)}
          onImport={loadPapers}
        />
      )}
    </div>
  )
}
