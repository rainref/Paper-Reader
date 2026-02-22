import { useState, useRef, useEffect } from 'react'
import { paperApi } from '../api/paperApi'

interface AIChatProps {
  paperId: string
}

// Icons
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)

const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8V4H8"/>
    <rect x="8" y="8" width="8" height="8" rx="2"/>
    <path d="M4 14h2"/>
    <path d="M4 18h4"/>
    <path d="M18 14h2"/>
    <path d="M18 18h4"/>
    <path d="M12 18v4"/>
    <path d="M8 22h8"/>
  </svg>
)

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const LoaderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
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

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/>
    <path d="M19 17v4"/>
    <path d="M3 5h4"/>
    <path d="M17 19h4"/>
  </svg>
)

interface Message {
  role: 'user' | 'ai'
  content: string
}

export default function AIChat({ paperId }: AIChatProps) {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const ask = async () => {
    if (!question.trim() || loading) return

    const userMsg = { role: 'user' as const, content: question }
    setMessages(msgs => [...msgs, userMsg])
    setLoading(true)
    setQuestion('')

    try {
      const { answer } = await paperApi.queryAI(paperId, question)
      setMessages(msgs => [...msgs, { role: 'ai', content: answer }])
    } catch (e) {
      setMessages(msgs => [...msgs, { role: 'ai', content: `Error: ${e instanceof Error ? e.message : 'Failed to get response'}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <SparklesIcon />
        </div>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-heading)' }}>AI Assistant</h3>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Ask about this paper</p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--color-text-muted)'
          }}>
            <BotIcon />
            <p style={{ marginTop: 12, fontSize: 14 }}>
              Ask me anything about this paper
            </p>
            <p style={{ fontSize: 12, marginTop: 8 }}>
              "What is this paper about?"<br/>
              "Explain the main method"<br/>
              "What are the key findings?"
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className="animate-fade-in"
                style={{
                  display: 'flex',
                  gap: 10,
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                }}
              >
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: msg.role === 'user' ? 'var(--color-primary)' : 'var(--color-background)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: msg.role === 'user' ? 'white' : 'var(--color-text-muted)'
                }}>
                  {msg.role === 'user' ? <UserIcon /> : <BotIcon />}
                </div>
                <div style={{
                  maxWidth: 'calc(100% - 44px)',
                  backgroundColor: msg.role === 'user' ? 'var(--color-primary)' : 'var(--color-background)',
                  color: msg.role === 'user' ? 'white' : 'var(--color-text)',
                  padding: '12px 16px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  fontSize: 14,
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="animate-fade-in" style={{ display: 'flex', gap: 10 }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-background)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text-muted)'
                }}>
                  <BotIcon />
                </div>
                <div style={{
                  backgroundColor: 'var(--color-background)',
                  padding: '12px 16px',
                  borderRadius: '16px 16px 16px 4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <LoaderIcon />
                  <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        gap: 12
      }}>
        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && ask()}
          placeholder="Ask a question..."
          className="input"
          disabled={loading}
          style={{ flex: 1 }}
        />
        <button
          className="btn btn-primary"
          onClick={ask}
          disabled={loading || !question.trim()}
          style={{ padding: '10px 16px', minWidth: 'auto' }}
          aria-label="Send message"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  )
}
