import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { paperApi, Paper } from '../api/paperApi'

export default function Library() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    paperApi.listPapers()
      .then(setPapers)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1>My Library</h1>
      {papers.length === 0 ? (
        <p>No papers yet. Import your first paper!</p>
      ) : (
        <ul>
          {papers.map(paper => (
            <li key={paper.id}>
              <Link to={`/paper/${paper.id}`}>{paper.title}</Link>
              <span> - {paper.authors}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
