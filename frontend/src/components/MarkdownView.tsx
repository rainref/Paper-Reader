import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import { paperApi } from '../api/paperApi'
import 'katex/dist/katex.min.css'

interface MarkdownViewProps {
  paperId: string
}

export default function MarkdownView({ paperId }: MarkdownViewProps) {
  const [markdown, setMarkdown] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [converting, setConverting] = useState(false)
  const [error, setError] = useState<string>('')
  const [selectedText, setSelectedText] = useState('')
  const [translation, setTranslation] = useState(''  )
  const [translating, setTranslating] = useState(false)
  const [totalPages, setTotalPages] = useState<number>(0)

  useEffect(() => {
    loadMarkdown()
  }, [paperId])

  const loadMarkdown = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await paperApi.getMarkdown(paperId)
      setMarkdown(result.markdown)
      setTotalPages(result.total_pages || 0)
    } catch (e) {
      // 如果没有缓存，尝试转换
      if (e instanceof Error && e.message.includes('404')) {
        setConverting(true)
        try {
          const result = await paperApi.getMarkdown(paperId)
          setMarkdown(result.markdown)
          setTotalPages(result.total_pages || 0)
        } catch (e2) {
          setError(`转换失败: ${e2 instanceof Error ? e2.message : '未知错误'}`)
        }
      } else {
        setError(e instanceof Error ? e.message : '加载失败')
      }
    } finally {
      setLoading(false)
      setConverting(false)
    }
  }

  const handleConvert = async () => {
    setConverting(true)
    setError('')
    try {
      await paperApi.convertToMarkdown(paperId)
      const result = await paperApi.getMarkdown(paperId)
      setMarkdown(result.markdown)
    } catch (e) {
      setError(`转换失败: ${e instanceof Error ? e.message : '未知错误'}`)
    } finally {
      setConverting(false)
    }
  }

  const handleTextSelect = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim())
    }
  }

  const handleTranslate = async () => {
    if (!selectedText) return

    setTranslating(true)
    try {
      const result = await paperApi.translate(paperId, selectedText, false)
      setTranslation(result.translation)
    } catch (e) {
      setTranslation(`翻译失败: ${e instanceof Error ? e.message : '未知错误'}`)
    } finally {
      setTranslating(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: 400,
        backgroundColor: 'var(--color-background)'
      }}>
        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <div className="spinner" style={{
            width: 32,
            height: 32,
            border: '3px solid var(--color-border)',
            borderTopColor: 'var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }} />
          <p style={{ marginTop: 16 }}>Loading Markdown...</p>
        </div>
      </div>
    )
  }

  if (converting) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: 400,
        backgroundColor: 'var(--color-background)'
      }}>
        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <div className="spinner" style={{
            width: 32,
            height: 32,
            border: '3px solid var(--color-border)',
            borderTopColor: 'var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }} />
          <p style={{ marginTop: 16 }}>Converting PDF to Markdown...</p>
          {totalPages > 0 && (
            <p style={{ fontSize: 12, marginTop: 8 }}>Total pages: {totalPages}</p>
          )}
          <p style={{ fontSize: 12, marginTop: 8 }}>This may take a few minutes</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: 400,
        backgroundColor: 'var(--color-background)',
        padding: 24
      }}>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>{error}</p>
        <button className="btn btn-primary" onClick={handleConvert}>
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Markdown 内容区域 */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: 24,
          backgroundColor: 'var(--color-background)',
          userSelect: 'text'
        }}
        onMouseUp={handleTextSelect}
      >
        <div style={{
          maxWidth: 800,
          margin: '0 auto',
          backgroundColor: 'var(--color-surface)',
          padding: 32,
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeRaw]}
          >{markdown}</ReactMarkdown>
        </div>
      </div>

      {/* 翻译侧边栏 */}
      {selectedText && (
        <div style={{
          width: 300,
          borderLeft: '1px solid var(--color-border)',
          padding: 16,
          backgroundColor: 'var(--color-surface)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}>
          <h4 style={{ margin: 0, fontSize: 14 }}>Selected Text</h4>
          <p style={{
            fontSize: 13,
            color: 'var(--color-text-muted)',
            wordBreak: 'break-word',
            maxHeight: 100,
            overflow: 'auto'
          }}>
            {selectedText}
          </p>

          <button
            className="btn btn-primary"
            onClick={handleTranslate}
            disabled={translating}
            style={{ width: '100%' }}
          >
            {translating ? 'Translating...' : 'Translate'}
          </button>

          {translation && (
            <>
              <h4 style={{ margin: '16px 0 0 0', fontSize: 14 }}>Translation</h4>
              <p style={{
                fontSize: 13,
                color: 'var(--color-text)',
                wordBreak: 'break-word',
                maxHeight: 200,
                overflow: 'auto'
              }}>
                {translation}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
