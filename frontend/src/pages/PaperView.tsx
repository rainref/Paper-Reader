import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { paperApi, Paper } from '../api/paperApi'

export default function PaperView() {
  const { id } = useParams<{ id: string }>()
  const [paper, setPaper] = useState<Paper | null>(null)

  useEffect(() => {
    if (id) {
      paperApi.getPaper(id).then(setPaper)
    }
  }, [id])

  if (!paper) return <div>Loading...</div>

  return (
    <div>
      <h1>{paper.title}</h1>
      <p>{paper.authors}</p>
    </div>
  )
}
