import { useState } from 'react'
import { paperApi } from '../api/paperApi'

interface TranslationPanelProps {
  paperId: string
}

export default function TranslationPanel({ paperId }: TranslationPanelProps) {
  const [text, setText] = useState('')
  const [translation, setTranslation] = useState('')
  const [loading, setLoading] = useState(false)

  const translate = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      const { translation: result } = await paperApi.translate(paperId, text, false)
      setTranslation(result)
    } catch (e) {
      setTranslation('Error: ' + e)
    } finally {
      setLoading(false)
    }
  }

  const translateFull = async () => {
    setLoading(true)
    try {
      const { translation: result } = await paperApi.translate(paperId, undefined, true)
      setTranslation(result)
    } catch (e) {
      setTranslation('Error: ' + e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: 300, borderLeft: '1px solid #ccc', padding: 16, height: '100%', overflow: 'auto' }}>
      <h3>翻译 (Translation)</h3>

      <button onClick={translateFull} disabled={loading} style={{ marginBottom: 16 }}>
        Translate Full Paper
      </button>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Enter text to translate..."
        style={{ width: '100%', height: 100, marginBottom: 8 }}
      />

      <button onClick={translate} disabled={loading} style={{ marginBottom: 16 }}>
        Translate
      </button>

      {translation && (
        <div style={{ background: '#f9f9f9', padding: 12, borderRadius: 4 }}>
          <h4>中文翻译:</h4>
          <p>{translation}</p>
        </div>
      )}
    </div>
  )
}
