import { useState } from 'react'
import { paperApi } from '../api/paperApi'

interface TranslationPanelProps {
  paperId: string
}

// Icons
const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
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

export default function TranslationPanel({ paperId }: TranslationPanelProps) {
  const [text, setText] = useState('')
  const [translation, setTranslation] = useState('')
  const [loading, setLoading] = useState(false)

  const translate = async (isFull: boolean) => {
    setLoading(true)
    try {
      const { translation: result } = await paperApi.translate(
        paperId,
        isFull ? undefined : text,
        isFull
      )
      setTranslation(result)
    } catch (e) {
      setTranslation(`Error: ${e instanceof Error ? e.message : 'Failed to translate'}`)
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
          backgroundColor: 'var(--color-cta)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <GlobeIcon />
        </div>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-heading)' }}>Translation</h3>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>English to Chinese</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
        <button
          className="btn btn-cta"
          onClick={() => translate(true)}
          disabled={loading}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {loading ? <LoaderIcon /> : 'Translate Full Paper'}
        </button>
      </div>

      {/* Input */}
      <div style={{ padding: 16, borderBottom: '1px solid var(--color-border)' }}>
        <label style={{
          display: 'block',
          fontSize: 14,
          fontWeight: 500,
          marginBottom: 8,
          color: 'var(--color-text)'
        }}>
          Translate selection
        </label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste text to translate..."
          disabled={loading}
          style={{
            width: '100%',
            height: 100,
            padding: 12,
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            resize: 'vertical',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)'
          }}
        />
        <button
          className="btn btn-secondary"
          onClick={() => translate(false)}
          disabled={loading || !text.trim()}
          style={{ width: '100%', marginTop: 12, justifyContent: 'center' }}
        >
          {loading ? <LoaderIcon /> : 'Translate Selection'}
        </button>
      </div>

      {/* Output */}
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        <label style={{
          display: 'block',
          fontSize: 14,
          fontWeight: 500,
          marginBottom: 8,
          color: 'var(--color-text)'
        }}>
          中文翻译
        </label>
        {translation ? (
          <div className="animate-fade-in" style={{
            backgroundColor: 'var(--color-background)',
            padding: 16,
            borderRadius: 'var(--radius-md)',
            fontSize: 14,
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap'
          }}>
            {translation}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: 24,
            color: 'var(--color-text-muted)'
          }}>
            <GlobeIcon />
            <p style={{ marginTop: 12, fontSize: 14 }}>
              Translation will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
