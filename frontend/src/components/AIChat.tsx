import { useState } from 'react'
import { paperApi } from '../api/paperApi'

interface AIChatProps {
  paperId: string
}

export default function AIChat({ paperId }: AIChatProps) {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([])
  const [loading, setLoading] = useState(false)

  const ask = async () => {
    if (!question.trim()) return

    const userMsg = { role: 'user' as const, content: question }
    setMessages(msgs => [...msgs, userMsg])
    setLoading(true)
    setQuestion('')

    try {
      const { answer } = await paperApi.queryAI(paperId, question)
      setMessages(msgs => [...msgs, { role: 'ai', content: answer }])
    } catch (e) {
      setMessages(msgs => [...msgs, { role: 'ai', content: 'Error: ' + e }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: 300, borderLeft: '1px solid #ccc', padding: 16, height: '100%', overflow: 'auto' }}>
      <h3>AI Assistant</h3>
      <div style={{ marginBottom: 16 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            textAlign: msg.role === 'user' ? 'right' : 'left',
            margin: '8px 0'
          }}>
            <span style={{
              background: msg.role === 'user' ? '#007bff' : '#f0f0f0',
              color: msg.role === 'user' ? '#fff' : '#000',
              padding: '8px 12px',
              borderRadius: 12,
              display: 'inline-block'
            }}>
              {msg.content}
            </span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && ask()}
          placeholder="Ask about this paper..."
          style={{ flex: 1 }}
          disabled={loading}
        />
        <button onClick={ask} disabled={loading}>Send</button>
      </div>
    </div>
  )
}
